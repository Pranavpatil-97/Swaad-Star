const EMOJI_RE = /\p{Extended_Pictographic}/u;
const HASHTAG_RE = /(^|\s)#\w+/;
const LINK_RE = /(https?:\/\/|www\.)\S+/i;
const DEVANAGARI_RE = /[\u0900-\u097F]/;
const LATIN_RE = /[A-Za-z]/;

const STRONG_POSITIVE = [
  'amazing', 'highly recommend', 'loved', 'fantastic', 'outstanding',
  'perfect', 'best ever', 'wonderful', 'excellent',
];
const COMPLAINT_WORDS = [
  'disappointed', 'slow', 'rude', 'dirty', 'cold', 'bad', 'terrible',
  'poor', 'worst', 'unhygienic', 'overpriced', 'complaint',
];
// Food, staff and facility terms that must not be invented
const RISKY_TERMS = [
  'pizza', 'burger', 'biryani', 'paneer', 'naan', 'dessert', 'coffee', 'tea',
  'manager', 'chef', 'waiter', 'owner', 'parking', 'rooftop', 'wifi', 'ac',
  'music', 'buffet', 'discount', 'offer',
];

export const NEED_MORE_INFO = 'NEED_MORE_INFO';

const words = (t) => (t.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []);
const hasPhrase = (text, phrase) =>
  new RegExp(`(^|[^\\p{L}])${phrase}([^\\p{L}]|$)`, 'iu').test(text);

export function checkLength(text) {
  if (text.length < 20) return 'too_short';
  if (text.length > 600) return 'too_long';
  return null;
}

export function checkFormat(text) {
  if (EMOJI_RE.test(text)) return 'emoji';
  if (HASHTAG_RE.test(text)) return 'hashtag';
  if (LINK_RE.test(text)) return 'link';
  return null;
}

export function checkSentiment(text, rating, input) {
  const guest = (input || '').toLowerCase();
  if (rating <= 2) {
    const bad = STRONG_POSITIVE.find((p) => hasPhrase(text, p) && !guest.includes(p));
    if (bad) return 'positive_on_low_rating';
  }
  if (rating === 5) {
    const bad = COMPLAINT_WORDS.find((p) => hasPhrase(text, p) && !guest.includes(p));
    if (bad) return 'complaint_on_5_stars';
  }
  return null;
}

export function checkInvention(text, { feedback = '', businessName = '', topics = [] } = {}) {
  const allowed = new Set([
    ...words(feedback),
    ...words(businessName),
    ...topics.flatMap(words),
  ]);
  const draftWords = words(text);
  const risky = draftWords.find((w) => RISKY_TERMS.includes(w) && !allowed.has(w));
  if (risky) return 'invented_term';

  // Capitalized words that are not at a sentence start
  const caps = text.match(/(?<=[a-z,;] )[A-Z][a-z]+/g) || [];
  const invented = caps.find((w) => !allowed.has(w.toLowerCase()));
  if (invented) return 'invented_name';
  return null;
}

export function checkLanguage(text, language) {
  const dev = DEVANAGARI_RE.test(text);
  const lat = LATIN_RE.test(text);
  if (language === 'hi' || language === 'mr') return dev ? null : 'wrong_script';
  if (language === 'en' || language === 'hinglish') return dev ? 'wrong_script' : lat ? null : 'wrong_script';
  return null;
}

export function validateDraft(text, { rating, language, feedback, topics, businessName }) {
  const t = (text || '').trim();
  if (t === NEED_MORE_INFO) return { ok: false, reason: 'need_more_info' };

  const reason =
    checkLength(t) ||
    checkFormat(t) ||
    checkSentiment(t, rating, feedback) ||
    checkInvention(t, { feedback, businessName, topics }) ||
    checkLanguage(t, language);

  return reason ? { ok: false, reason } : { ok: true };
}