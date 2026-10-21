import { sanitizeFeedback } from './sanitizer.js';
import { checkSufficiency } from './sufficiency.js';
import { buildPrompt } from './prompt.js';
import { validateDraft } from './validator.js';
import { generateTemplate } from './template.js';
import { getProvider } from './providers/index.js';
import { ProviderError } from './providers/errors.js';
import { getBreaker } from './circuitBreaker.js';

const ALLOWED_TOPICS = ['food', 'service', 'staff', 'cleanliness', 'ambience'];
const TOTAL_BUDGET_MS = 11000; // keeps the whole call under about 12 seconds

function guard(input) {
  if (!input || typeof input !== 'object') throw new TypeError('generateReview: input is required');
  const { business, rating, topics = [], feedback = '' } = input;
  if (!business || typeof business !== 'object') throw new TypeError('generateReview: business is required');
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new TypeError('generateReview: rating must be an integer from 1 to 5');
  if (!Array.isArray(topics) || topics.some((t) => !ALLOWED_TOPICS.includes(t))) throw new TypeError('generateReview: topics must be a list of allowed topics');
  if (typeof feedback !== 'string') throw new TypeError('generateReview: feedback must be a string');
}

// Safety net in case a provider ignores its own timeout
function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new ProviderError('TIMEOUT', 'timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function runPipeline(input, deps = {}) {
  const now = deps.now || Date.now;
  const started = now();

  // 1. Guard
  guard(input);
  const { business, rating, topics = [], usage } = input;
  const attempt = Number.isInteger(input.attempt) && input.attempt > 0 ? input.attempt : 1;
  const language = business.language || 'en';
  const providerName = business.aiProvider || 'gemini';

  // 2. Sanitize
  const feedback = sanitizeFeedback(input.feedback ?? '');

  const finish = (status, draft, source, fallbackReason) => ({
    status,
    draft,
    source,
    latencyMs: now() - started,
    fallbackReason,
  });
  const fallback = (reason) =>
    finish('success', generateTemplate({ rating, language, topics, feedback, attempt }), 'template', reason);

  // 3. Sufficiency
  const suff = checkSufficiency({ feedback, topics });
  if (!suff.ok) return finish('need_more_info', null, null, null);

  // 4. Choose path
  const breaker = deps.breaker || getBreaker(providerName);
  if (!business.apiKey) return fallback('no_api_key');
  if (usage && Number.isFinite(usage.dailyCap) && usage.usedToday >= usage.dailyCap) return fallback('quota');
  if (breaker.isOpen()) return fallback('circuit_open');

  let provider;
  try {
    provider = deps.provider || getProvider(providerName);
  } catch {
    return fallback('provider_error');
  }

  const callTimeout = deps.timeoutMs || Number(process.env.AI_TIMEOUT_MS) || 8000;
  const model = business.aiModel || process.env.AI_DEFAULT_MODEL || '';

  // 5 and 6. Call, validate, retry once
  let strictReason = null;
  for (let round = 0; round < 2; round++) {
    const remaining = TOTAL_BUDGET_MS - (now() - started);
    if (remaining < 500) return fallback('timeout');
    const timeoutMs = Math.min(callTimeout, remaining);

    const { system, user } = buildPrompt({ business, rating, topics, feedback, attempt, strictReason });

    let text;
    try {
      const out = await withTimeout(
        provider.generate({ system, user, model, apiKey: business.apiKey, timeoutMs }),
        timeoutMs + 200
      );
      text = String(out?.text ?? '').trim();
    } catch (err) {
      // 7. Provider errors
      if (err?.code === 'QUOTA') {
        breaker.trip('quota');
        return fallback('quota');
      }
      if (err?.code === 'TIMEOUT') return fallback('timeout');
      return fallback('provider_error');
    }

    const verdict = validateDraft(text, { rating, language, feedback, topics, businessName: business.name });
    if (verdict.ok) return finish('success', text, 'ai', null);
    if (verdict.reason === 'need_more_info') return finish('need_more_info', null, null, null);
    strictReason = verdict.reason;
  }

  return fallback('validation_failed');
}