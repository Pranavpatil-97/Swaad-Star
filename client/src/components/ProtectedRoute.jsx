import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loader from './Loader'

export default function ProtectedRoute() {
  const { status } = useAuth()
  if (status === 'checking') return <Loader label="Checking your session..." />
  if (status === 'out') return <Navigate to="/admin/login" replace />
  return <Outlet />
}