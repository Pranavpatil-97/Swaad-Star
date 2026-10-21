export function createCircuitBreaker({ seconds, now = Date.now } = {}) {
  const ms = (seconds ?? (Number(process.env.AI_BREAKER_SECONDS) || 60)) * 1000;
  let openUntil = 0;
  let lastReason = null;
  return {
    isOpen: () => now() < openUntil,
    trip(reason = 'quota') {
      openUntil = now() + ms;
      lastReason = reason;
    },
    reset() {
      openUntil = 0;
      lastReason = null;
    },
    reason: () => lastReason,
  };
}

// One shared breaker per provider name (in memory)
const shared = new Map();
export function getBreaker(providerName) {
  if (!shared.has(providerName)) shared.set(providerName, createCircuitBreaker());
  return shared.get(providerName);
}