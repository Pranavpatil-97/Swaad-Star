import { describe, it, expect } from 'vitest';
import { createCircuitBreaker, getBreaker } from '../../src/services/ai/circuitBreaker.js';

describe('circuit breaker', () => {
  it('opens on trip and closes after the window', () => {
    let t = 0;
    const b = createCircuitBreaker({ seconds: 60, now: () => t });
    expect(b.isOpen()).toBe(false);
    b.trip('quota');
    expect(b.isOpen()).toBe(true);
    expect(b.reason()).toBe('quota');
    t = 59000;
    expect(b.isOpen()).toBe(true);
    t = 61000;
    expect(b.isOpen()).toBe(false);
  });
  it('reset closes it immediately', () => {
    const b = createCircuitBreaker({ seconds: 60, now: () => 0 });
    b.trip();
    b.reset();
    expect(b.isOpen()).toBe(false);
    expect(b.reason()).toBeNull();
  });
  it('shares one breaker per provider name', () => {
    expect(getBreaker('x-test')).toBe(getBreaker('x-test'));
    expect(getBreaker('x-test')).not.toBe(getBreaker('y-test'));
  });
});