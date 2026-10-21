import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { setAccessToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('checking') // checking | in | out
  const [admin, setAdmin] = useState(null)

  // Restore the session on page load using the httpOnly refresh cookie
  useEffect(() => {
    let cancelled = false
    api
      .post('/admin/refresh')
      .then(({ data }) => {
        if (cancelled) return
        setAccessToken(data.accessToken)
        setAdmin(data.admin || null)
        setStatus('in')
      })
      .catch(() => !cancelled && setStatus('out'))
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/admin/login', { email, password })
    setAccessToken(data.accessToken)
    setAdmin(data.admin)
    setStatus('in')
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/admin/logout') } catch { /* ignore */ }
    setAccessToken(null)
    setAdmin(null)
    setStatus('out')
  }, [])

  const value = useMemo(() => ({ status, admin, login, logout }), [status, admin, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)