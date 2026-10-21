import axios from 'axios'

let accessToken = null // in memory only, never localStorage
export const setAccessToken = (t) => { accessToken = t }

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
})

// Mock is lazy-loaded, so it adds nothing to the real build
if (import.meta.env.VITE_USE_MOCK === 'true') {
  api.defaults.adapter = (config) =>
    import('./mock/index.js').then((m) => m.mockAdapter(config))
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

let refreshing = null

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const isAuthCall = original?.url?.includes('/admin/login') || original?.url?.includes('/admin/refresh')

    if (status === 401 && !original._retry && !isAuthCall) {
      original._retry = true
      try {
        refreshing = refreshing || api.post('/admin/refresh')
        const { data } = await refreshing
        setAccessToken(data.accessToken)
        return api(original)
      } catch {
        setAccessToken(null)
        window.location.href = '/admin/login'
      } finally {
        refreshing = null
      }
    }
    return Promise.reject(error)
  }
)

export default api