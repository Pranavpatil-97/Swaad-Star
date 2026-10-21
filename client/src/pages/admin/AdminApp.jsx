import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../../hooks/useAuth'
import ProtectedRoute from '../../components/ProtectedRoute'
import AdminLayout from './AdminLayout'
import Login from './Login'

function Dashboard() {
  return (
    <section>
      <h1 className="text-3xl">Dashboard</h1>
      <p className="mt-2 text-charcoal-soft">Summary cards and the funnel chart come next.</p>
    </section>
  )
}

function ComingSoon() {
  return <p className="text-charcoal-soft">This page is coming soon.</p>
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="*" element={<ComingSoon />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}