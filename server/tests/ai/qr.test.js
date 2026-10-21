import { describe, it, expect } from 'vitest';
import { qrPng, qrSvg } from '../../src/services/qr.service.js';

describe('qr service', () => {
  it('makes a PNG buffer for a valid https URL', async () => {
    const buf = await qrPng('https://example.com/r/spice-garden');
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect([...buf.subarray(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });
  it('respects the size option', async () => {
    const buf = await qrPng('https://example.com/r/x', { size: 512 });
    expect(buf.readUInt32BE(16)).toBeGreaterThan(480); // PNG width
  });
  it('makes an SVG string', async () => {
    const svg = await qrSvg('https://example.com/r/spice-garden');
    expect(svg).toMatch(/<svg/);
  });
  it('allows http://localhost in development', async () => {
    await expect(qrSvg('http://localhost:3000/r/x')).resolves.toMatch(/<svg/);
  });
  it('rejects invalid and unsafe URLs', async () => {
    for (const bad of ['', 'not a url', 'http://example.com', 'ftp://x.com', 'javascript:alert(1)', null]) {
      await expect(qrPng(bad), String(bad)).rejects.toThrow();
      await expect(qrSvg(bad), String(bad)).rejects.toThrow();
    }
  });
  it('rejects a bad size', async () => {
    await expect(qrPng('https://example.com', { size: 10 })).rejects.toThrow(/size/);
  });
});