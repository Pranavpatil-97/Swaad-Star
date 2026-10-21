import { ProviderError } from './errors.js';

// steps: strings (returned as text) or { error: 'QUOTA' } or { hang: true }
// Steps are used in order; the last one repeats.
export function createMockProvider(
  steps = ['Good experience overall. The food was great.']
) {
  const queue = [...steps];
  const calls = []; // never stores the API key
  return {
    calls,
    async generate({ system, user, model }) {
      calls.push({ system, user, model });
      const step = queue.length > 1 ? queue.shift() : queue[0];
      if (step && typeof step === 'object') {
        if (step.hang) return new Promise(() => {});
        if (step.error) throw new ProviderError(step.error, `mock ${step.error}`);
        return { text: step.text ?? '' };
      }
      return { text: step };
    },
  };
}