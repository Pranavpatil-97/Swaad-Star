const SESSION_KEY = 'swaad_session'

function makeId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  return 'anon-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// Anonymous id, sessionStorage only (no cookies, no personal data)
export function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      id = makeId()
      sessionStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return makeId()
  }
}

// Returns true only the first time per session for a given name
export function markOnce(name) {
  try {
    const key = 'swaad_once_' + name
    if (sessionStorage.getItem(key)) return false
    sessionStorage.setItem(key, '1')
    return true
  } catch {
    return true
  }
}