import { describe, it, expect } from 'vitest';
import { validateDraft, checkLength, checkFormat, checkSentiment, checkInvention, checkLanguage } from '../../src/services/ai/validator.js';

const base = { rating: 4, language: 'en', feedback: 'dal makhani was great', topics: ['food'], businessName: 'Spice Garden' };

describe('validator rules', () => {
  it('rejects too short and too long', () => {
    expect(checkLength('Good food.')).toBe('too_short');
    expect(checkLength('a'.repeat(601))).toBe('too_long');
    expect(checkLength('The dal makhani was great here.')).toBeNull();
  });
  it('rejects emoji, hashtag, link', () => {
    expect(checkFormat('Great food 😀 really')).toBe('emoji');
    expect(checkFormat('Great food #yum really')).toBe('hashtag');
    expect(checkFormat('See http://x.com for food')).toBe('link');
  });
  it('rejects strong positive on 1 star unless guest wrote it', () => {
    expect(checkSentiment('The food was amazing.', 1, 'food was cold')).toBe('positive_on_low_rating');
    expect(checkSentiment('The food was amazing.', 1, 'not amazing at all')).toBeNull();
  });
  it('rejects added complaints on 5 stars', () => {
    expect(checkSentiment('Great food but slow service.', 5, 'great food')).toBe('complaint_on_5_stars');
  });
  it('flags invented dish', () => {
    expect(checkInvention('The dal makhani and pizza were great.', { feedback: 'dal makhani was great' })).toBe('invented_term');
  });
  it('flags wrong script', () => {
    expect(checkLanguage('खाना अच्छा था', 'en')).toBe('wrong_script');
    expect(checkLanguage('The food was good', 'hi')).toBe('wrong_script');
    expect(checkLanguage('Khana accha tha', 'hinglish')).toBeNull();
  });
  it('accepts a good draft', () => {
    expect(validateDraft('The dal makhani was great at Spice Garden.', base).ok).toBe(true);
  });
  it('treats NEED_MORE_INFO as its own result', () => {
    expect(validateDraft('NEED_MORE_INFO', base)).toEqual({ ok: false, reason: 'need_more_info' });
  });
});