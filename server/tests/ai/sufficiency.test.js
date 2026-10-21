import { describe, it, expect } from 'vitest';
import { checkSufficiency } from '../../src/services/ai/sufficiency.js';

describe('sufficiency', () => {
  it('empty and no topics -> need more info', () => {
    expect(checkSufficiency({ feedback: '', topics: [] }).ok).toBe(false);
  });
  it('empty with topics -> allowed, topic-only', () => {
    expect(checkSufficiency({ feedback: '', topics: ['food'] })).toEqual({ ok: true, topicOnly: true });
  });
  it('gibberish counts as empty', () => {
    expect(checkSufficiency({ feedback: '!!!!!!', topics: [] }).ok).toBe(false);
    expect(checkSufficiency({ feedback: 'aaaaaaa', topics: [] }).ok).toBe(false);
  });
  it('normal text is allowed', () => {
    expect(checkSufficiency({ feedback: 'dal was great', topics: [] }).ok).toBe(true);
  });
});