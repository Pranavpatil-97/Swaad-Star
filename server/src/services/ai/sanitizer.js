const MAX_LEN = 500;

export function sanitizeFeedback(input) {
  if (typeof input !== 'string') return '';
  let s = input;

  // Markdown links: keep the visible text, drop the URL
  s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  // HTML tags
  s = s.replace(/<[^>]*>/g, ' ');
  // Bare links
  s = s.replace(/(?:https?:\/\/|www\.)\S+/gi, ' ');
  // Newlines and tabs become spaces
  s = s.replace(/[\t\r\n]+/g, ' ');
  // Control characters
  s = s.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  // Zero-width characters (ZWJ/ZWNJ are kept on purpose for Devanagari)
  s = s.replace(/[\u200B\u2060\uFEFF]/g, '');
  // Collapse spaces and trim
  s = s.replace(/ {2,}/g, ' ').trim();
  // Cut to 500 characters without splitting a character
  s = Array.from(s).slice(0, MAX_LEN).join('').trim();

  return s;
}