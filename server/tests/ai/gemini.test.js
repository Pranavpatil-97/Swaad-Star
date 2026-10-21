import { describe, it, expect } from 'vitest';
import { createGeminiProvider } from '../../src/services/ai/providers/gemini.js';

const ok = (text) => ({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) });
const fail = (status, message = '') => ({ ok: false, status, json: async () => ({ error: { message } }) });
const args = { system: 's', user: 'u', model: 'test-model', apiKey: 'SECRET-KEY', timeoutMs: 50 };
const run = (fetchImpl, over = {}) => createGeminiProvider({ fetchImpl }).generate({ ...args, ...over });
const codeOf = async (p) => p.then(() => null, (e) => e.code);

describe('gemini adapter', () => {
  it('returns text and sends the key in a header, not the URL', async () => {
    let seen;
    const out = await run(async (url, opts) => { seen = { url, opts }; return ok(' Hello there '); });
    expect(out).toEqual({ text: 'Hello there' });
    expect(seen.url).toContain('test-model:generateContent');
    expect(seen.url).not.toContain('SECRET-KEY');
    expect(seen.opts.headers['x-goog-api-key']).toBe('SECRET-KEY');
    expect(JSON.parse(seen.opts.body).generationConfig.temperature).toBe(0.4);
  });
  it('maps 429 and quota messages to QUOTA', async () => {
    expect(await codeOf(run(async () => fail(429)))).toBe('QUOTA');
    expect(await codeOf(run(async () => fail(500, 'You exceeded your current quota')))).toBe('QUOTA');
  });
  it('maps 401, 403 and invalid key to AUTH', async () => {
    expect(await codeOf(run(async () => fail(401)))).toBe('AUTH');
    expect(await codeOf(run(async () => fail(403)))).toBe('AUTH');
    expect(await codeOf(run(async () => fail(400, 'API key not valid')))).toBe('AUTH');
  });
  it('maps other http errors and network errors to PROVIDER', async () => {
    expect(await codeOf(run(async () => fail(500)))).toBe('PROVIDER');
    expect(await codeOf(run(async () => { throw new Error('socket'); }))).toBe('PROVIDER');
  });
  it('maps a hanging request to TIMEOUT', async () => {
    const hang = (url, { signal }) => new Promise((_, reject) => {
      signal.addEventListener('abort', () => { const e = new Error('x'); e.name = 'AbortError'; reject(e); });
    });
    expect(await codeOf(run(hang, { timeoutMs: 20 }))).toBe('TIMEOUT');
  });
  it('treats an empty answer as PROVIDER', async () => {
    expect(await codeOf(run(async () => ok('')))).toBe('PROVIDER');
  });
  it('needs a model and a key', async () => {
    expect(await codeOf(run(async () => ok('x'), { model: '' }))).toBe('PROVIDER');
    expect(await codeOf(run(async () => ok('x'), { apiKey: '' }))).toBe('AUTH');
  });
  it('never puts the key in an error message', async () => {
    const err = await run(async () => fail(403)).catch((e) => e);
    expect(err.message).not.toContain('SECRET-KEY');
  });
});