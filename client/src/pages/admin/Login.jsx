import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/Button'
import ErrorBox from '../../components/ErrorBox'

export default function Login() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (status === 'in') return <Navigate to="/admin" replace />

  async function submit(e) {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await login(email.trim(), password)
      navigate('/admin', { replace: true })
    } catch (err) {
      const code = err.response?.data?.error?.code
      if (!err.response) setError('We could not reach the server. Please try again.')
      else if (code === 'RATE_LIMITED') setError('Too many attempts. This account is locked for a while. Please try again later.')
      else setError('Email or password is incorrect.') // never reveal which one
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-3xl">Admin sign in</h1>
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-1 block font-medium">Email</label>
          <input
            id="email" type="email" autoComplete="username" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-11 w-full rounded-md border border-line bg-white px-4"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block font-medium">Password</label>
          <input
            id="password" type="password" autoComplete="current-password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-11 w-full rounded-md border border-line bg-white px-4"
          />
        </div>
        {error && <ErrorBox message={error} />}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </main>
  )
}