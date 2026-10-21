import dotenv from 'dotenv';
import { createGeminiProvider } from '../src/services/ai/providers/gemini.js';
import { buildPrompt } from '../src/services/ai/prompt.js';
import { validateDraft } from '../src/services/ai/validator.js';

dotenv.config({ quiet: true });

const business = { name: 'Spice Garden', language: 'en', writingStyle: 'casual' };
const rating = 4;
const topics = [];
const feedback = 'dal makhani was great, a bit slow to get the bill';

let strictReason = null;
for (let round = 1; round <= 2; round++) {
  const { system, user } = buildPrompt({ business, rating, topics, feedback, attempt: 1, strictReason });
  const t0 = Date.now();
  try {
    const { text } = await createGeminiProvider().generate({
      system, user,
      model: process.env.AI_DEFAULT_MODEL,
      apiKey: process.env.GEMINI_API_KEY,
      timeoutMs: 8000,
    });
    const verdict = validateDraft(text, { rating, language: 'en', feedback, topics, businessName: business.name });
    console.log(`--- round ${round} (${Date.now() - t0} ms)`);
    console.log('text:', JSON.stringify(text));
    console.log('verdict:', verdict);
    if (verdict.ok) break;
    strictReason = verdict.reason;
  } catch (e) {
    console.log('ERROR', e.code, e.message);
    break;
  }
}