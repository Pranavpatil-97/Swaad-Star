import { describe, it, expect } from 'vitest';
import { generateTemplate } from '../../src/services/ai/template.js';
import { validateDraft } from '../../src/services/ai/validator.js';

const LANGS = ['en', 'hi', 'mr', 'hinglish'];
const FEEDBACK = {
  en: 'dal makhani was great, a bit slow to get the bill',
  hinglish: 'dal makhani badhiya thi, bill late aaya',
  hi: 'खाना अच्छा था, बिल देर से आया',
  mr: 'जेवण छान होते, बिल उशिरा आले',
};
const check = (text, rating, language, feedback, topics) =>
  validateDraft(text, { rating, language, feedback, topics, businessName: 'Spice Garden' });

describe('template', () => {
  it('passes the validator for every rating and language (with feedback)', () => {
    for (const language of LANGS) {
      for (let rating = 1; rating <= 5; rating++) {
        const feedback = FEEDBACK[language];
        const text = generateTemplate({ rating, language, topics: [], feedback });
        expect(check(text, rating, language, feedback, []), `${language} ${rating}: ${text}`).toEqual({ ok: true });
      }
    }
  });

  it('passes the validator for topic-only input', () => {
    const topics = ['food', 'service'];
    for (const language of LANGS) {
      for (let rating = 1; rating <= 5; rating++) {
        const text = generateTemplate({ rating, language, topics, feedback: '' });
        expect(check(text, rating, language, '', topics), `${language} ${rating}: ${text}`).toEqual({ ok: true });
      }
    }
  });

  it('varies the wording on regenerate', () => {
    const a = generateTemplate({ rating: 4, language: 'en', feedback: 'good food', attempt: 1 });
    const b = generateTemplate({ rating: 4, language: 'en', feedback: 'good food', attempt: 2 });
    expect(a).not.toBe(b);
  });

  it('spec example: rating 5 mentions only food, staff, service', () => {
    const text = generateTemplate({
      rating: 5, language: 'en', topics: [],
      feedback: 'Food was delicious, staff was friendly, and service was quick.',
    });
    expect(text).toBe('Had a great experience. Food was delicious. Staff was friendly. Service was quick.');
  });

  it('honesty: 1 star never sounds positive', () => {
    const text = generateTemplate({ rating: 1, language: 'en', feedback: 'food was cold, staff was rude' });
    expect(text).toMatch(/^I was disappointed/);
    expect(text).not.toMatch(/great|amazing|loved|recommend|enjoyed/i);
  });

  it('honesty: 3 stars keeps both good and bad points', () => {
    const text = generateTemplate({ rating: 3, language: 'en', feedback: 'dal was great, service was slow' });
    expect(text).toMatch(/great/);
    expect(text).toMatch(/slow/);
  });

  it('throws on a bad rating', () => {
    expect(() => generateTemplate({ rating: 9 })).toThrow(/rating/);
  });
});