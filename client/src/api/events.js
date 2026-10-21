import api from './client'

export function sendEvent(type, slug, campaign, sessionId) {
  api.post('/events', { type, slug, campaign, sessionId }).catch(() => {})
}