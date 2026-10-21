const MESSAGES = {
  VALIDATION_ERROR: 'Something in your answer did not look right. Please check it and try again.',
  NOT_FOUND: 'We could not find that page.',
  RATE_LIMITED: 'You are going a little fast. Please wait a minute and try again.',
  UNAUTHORIZED: 'Please sign in again.',
  AI_UNAVAILABLE: 'Our writing helper is busy right now. Please try again in a moment.',
}

export function friendlyError(err) {
  if (!err?.response) {
    return { kind: 'network', message: 'We could not reach the server. Check your connection and try again.' }
  }
  const code = err.response.data?.error?.code
  return {
    kind: code === 'RATE_LIMITED' ? 'rate' : 'other',
    message: MESSAGES[code] || 'Something went wrong. Please try again.',
  }
}