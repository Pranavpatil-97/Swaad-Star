import { AxiosError } from 'axios'

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const ok = (config, data) => ({ data, status: 200, statusText: 'OK', headers: {}, config })
const fail = (config, status, code, message) => {
  const response = { data: { error: { code, message } }, status, statusText: '', headers: {}, config }
  throw new AxiosError(message, 'ERR_BAD_REQUEST', config, null, response)
}

const businesses = {
  'spice-garden': {
    name: 'Spice Garden',
    slug: 'spice-garden',
    logoUrl: '',
    brandColor: '#C8553D',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=XXXX',
    language: 'en',
    writingStyle: 'casual',
  },
  'no-google': {
    name: 'No Google Cafe',
    slug: 'no-google',
    logoUrl: '',
    brandColor: '#2F4A3A',
    googleReviewUrl: '',
    language: 'en',
    writingStyle: 'polite',
  },
}

export async function mockAdapter(config) {
  const method = config.method.toLowerCase()
  const url = config.url
  const body = config.data ? JSON.parse(config.data) : {}

  await wait(400)

  let m
  if (method === 'get' && (m = url.match(/^\/business\/([\w-]+)$/))) {
    const b = businesses[m[1]]
    return b ? ok(config, b) : fail(config, 404, 'NOT_FOUND', 'Business not found')
  }

  if (method === 'post' && url === '/reviews/generate') {
    const text = body.feedback || ''
    if (text.includes('#network')) throw new AxiosError('Network Error', 'ERR_NETWORK', config)
    if (text.includes('#limit')) fail(config, 429, 'RATE_LIMITED', 'Too many requests')
    if (text.includes('#slow')) await wait(6000)
    if (text.includes('#aidown')) fail(config, 503, 'AI_UNAVAILABLE', 'AI unavailable')
    if (text.trim().split(/\s+/).filter(Boolean).length < 3) {
      return ok(config, { status: 'need_more_info', draft: null, source: null })
    }
    return ok(config, {
      status: 'success',
      draft: `Had a ${body.rating}-star visit. ${text.replace(/#\w+/g, '').trim()}. Overall, my honest experience.`,
      source: text.includes('#template') ? 'template' : 'ai',
    })
  }

  if (method === 'post' && url === '/events') return ok(config, { ok: true })
  if (method === 'post' && url === '/leads') return ok(config, { ok: true })

  return fail(config, 404, 'NOT_FOUND', `No mock for ${method.toUpperCase()} ${url}`)
}