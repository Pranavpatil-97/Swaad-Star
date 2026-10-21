import { ProviderError } from './errors.js';

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export function createGeminiProvider({ fetchImpl = globalThis.fetch } = {}) {
  return {
    async generate({ system, user, model, apiKey, timeoutMs = 8000 }) {
      if (!apiKey) throw new ProviderError('AUTH', 'missing api key');
      if (!model) throw new ProviderError('PROVIDER', 'missing model name');

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetchImpl(`${BASE}/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST',
          // The key goes in a header, never in the URL
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: 'user', parts: [{ text: user }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: Number(process.env.AI_MAX_TOKENS) || 150,
            },
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const info = `${body?.error?.message || ''} ${body?.error?.status || ''}`;
          // Only the status goes into the error message, never the body or the key
          if (res.status === 429 || /quota|RESOURCE_EXHAUSTED/i.test(info)) {
            throw new ProviderError('QUOTA', 'gemini quota');
          }
          if (res.status === 401 || res.status === 403 || /API key not valid/i.test(info)) {
            throw new ProviderError('AUTH', `gemini auth ${res.status}`);
          }
          throw new ProviderError('PROVIDER', `gemini http ${res.status}`);
        }

        const data = await res.json();
        const parts = data?.candidates?.[0]?.content?.parts || [];
        const text = parts.map((p) => p.text || '').join('').trim();
        if (!text) throw new ProviderError('PROVIDER', 'empty response');
        return { text };
      } catch (err) {
        if (err instanceof ProviderError) throw err;
        if (err?.name === 'AbortError') throw new ProviderError('TIMEOUT', 'timeout');
        throw new ProviderError('PROVIDER', 'network error');
      } finally {
        clearTimeout(timer);
      }
    },
  };
}