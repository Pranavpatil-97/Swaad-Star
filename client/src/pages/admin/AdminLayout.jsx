import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/settings', label: 'Business' },
  { to: '/admin/ai', label: 'AI' },
  { to: '/admin/campaigns', label: 'Campaigns' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/account', label: 'Account' },
]

export default function AdminLayout() {
  const { logout } = useAuth()
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <span className="font-display text-xl font-bold">Swaad Star</span>
        <button type="button" onClick={logout} className="min-h-11 cursor-pointer text-charcoal-soft underline">
          Sign out
        </button>
      </header>
      <nav aria-label="Admin" className="flex flex-wrap gap-2 py-4">
        {LINKS.map((l) => (
          <NavLink
            key={l.to} to={l.to} end={l.end}
            className={({ isActive }) =>
              `inline-flex min-h-11 items-center rounded-full px-4 ${isActive ? 'bg-leaf text-white' : 'bg-cream-alt text-charcoal'}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}