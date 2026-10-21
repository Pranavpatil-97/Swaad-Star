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
const ADMIN = { email: 'pranavpatil0097@gmail.com', password: 'Admin@123' }
let failedLogins = 0
let adminBusiness = { ...businesses['spice-garden'] }

export async function mockAdapter(config) {
  const method = config.method.toLowerCase()
  const url = config.url
  const body =
    config.data instanceof FormData
      ? Object.fromEntries(config.data)
      : config.data
        ? JSON.parse(config.data)
        : {}

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

  // ---- Admin ----
  if (method === 'post' && url === '/admin/login') {
    if (failedLogins >= 5) fail(config, 429, 'RATE_LIMITED', 'Too many attempts')
    if (body.email === ADMIN.email && body.password === ADMIN.password) {
      failedLogins = 0
      sessionStorage.setItem('mock_admin', '1')
      return ok(config, { accessToken: 'mock-token', admin: { email: ADMIN.email } })
    }
    failedLogins += 1
    fail(config, 401, 'UNAUTHORIZED', 'Invalid email or password')
  }

  if (method === 'post' && url === '/admin/refresh') {
    return sessionStorage.getItem('mock_admin') === '1'
      ? ok(config, { accessToken: 'mock-token', admin: { email: ADMIN.email } })
      : fail(config, 401, 'UNAUTHORIZED', 'No session')
  }

  if (method === 'post' && url === '/admin/logout') {
    sessionStorage.removeItem('mock_admin')
    return ok(config, { ok: true })
  }

  if (url.startsWith('/admin/') && config.headers?.get?.('Authorization') !== 'Bearer mock-token') {
    fail(config, 401, 'UNAUTHORIZED', 'Please sign in')
  }

  if (url === '/admin/business' && method === 'get') return ok(config, adminBusiness)

  if (url === '/admin/business' && method === 'put') {
    if (body.slug === 'taken') fail(config, 400, 'VALIDATION_ERROR', 'That link name is already used')
    const file = body.logo instanceof File ? body.logo : null
    const old = adminBusiness.slug
    adminBusiness = {
      ...adminBusiness,
      name: body.name,
      slug: body.slug,
      brandColor: body.brandColor,
      googleReviewUrl: body.googleReviewUrl,
      language: body.language,
      writingStyle: body.writingStyle,
      logoUrl: file ? URL.createObjectURL(file) : adminBusiness.logoUrl,
    }
    delete businesses[old]
    businesses[adminBusiness.slug] = adminBusiness // so the guest page shows your changes
    return ok(config, adminBusiness)
  }

  if (method === 'post' && url === '/events') return ok(config, { ok: true })
  if (method === 'post' && url === '/leads') return ok(config, { ok: true })

  return fail(config, 404, 'NOT_FOUND', `No mock for ${method.toUpperCase()} ${url}`)
}