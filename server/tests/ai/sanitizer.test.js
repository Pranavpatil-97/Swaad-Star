import { describe, it, expect } from 'vitest';
import { sanitizeFeedback } from '../../src/services/ai/sanitizer.js';

describe('sanitizer', () => {
  it('strips HTML', () => {
    expect(sanitizeFeedback('<b>good</b> food')).toBe('good food');
  });
  it('removes links', () => {
    expect(sanitizeFeedback('see [here](http://x.com) now')).toBe('see here now');
    expect(sanitizeFeedback('visit https://spam.com ok')).toBe('visit ok');
  });
  it('removes control and zero-width chars', () => {
    expect(sanitizeFeedback('go\u0000od\u200B food')).toBe('good food');
  });
  it('keeps Devanagari and numbers', () => {
    expect(sanitizeFeedback('खाना बहुत अच्छा था 2 plates')).toBe('खाना बहुत अच्छा था 2 plates');
  });
  it('cuts to 500 chars', () => {
    expect(sanitizeFeedback('a'.repeat(900)).length).toBe(500);
  });
  it('returns empty for non-strings', () => {
    expect(sanitizeFeedback(null)).toBe('');
  });
});