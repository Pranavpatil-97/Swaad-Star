import { ProviderError } from './errors.js';
import { createMockProvider } from './mock.js';
import { createGeminiProvider } from './gemini.js';

const registry = {
  mock: () => createMockProvider(),
  gemini: () => createGeminiProvider(),
};

export function getProvider(name) {
  const make = registry[name];
  if (!make) throw new ProviderError('PROVIDER', `unknown provider: ${name}`);
  return make();
}