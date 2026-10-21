export function isMeaningful(text) {
  const chars = (text || '').match(/[\p{L}\p{N}]/gu) || [];
  if (chars.length < 3) return false;
  // Gibberish such as "aaaaaa" or "!!!!!!"
  if (new Set(chars.map((c) => c.toLowerCase())).size < 2) return false;
  return true;
}

export function checkSufficiency({ feedback, topics }) {
  const hasText = isMeaningful(feedback);
  const hasTopics = Array.isArray(topics) && topics.length > 0;

  if (!hasText && !hasTopics) return { ok: false, reason: 'need_more_info' };
  return { ok: true, topicOnly: !hasText };
}