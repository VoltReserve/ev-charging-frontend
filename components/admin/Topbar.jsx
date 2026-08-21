import { useLocation, useNavigate } from 'react-router-dom'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useAuth } from '../../src/context/AuthContext'

const TITLES = {
  '/admin': 'Dashboard',
  '/admin/network': 'Stations & Chargers',
  '/admin/users': 'Users',
  '/admin/bookings': 'Bookings',
  '/admin/reports': 'Reports',
  '/admin/settings': 'Settings',
}

const Topbar = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { admin, logout } = useAuth()
  const title = TITLES[pathname] ?? 'Admin'

  return (
    <header className="admin-topbar flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger />
        <h1 className="truncate text-base font-semibold text-gray-900 sm:text-lg">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden max-w-[160px] truncate text-xs text-gray-500 sm:inline">
          {admin?.email || admin?.name || 'Admin'}
        </span>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/admin-login', { replace: true })
          }}
          className="admin-btn-sm"
        >
          Log out
        </button>
      </div>
    </header>
  )
}

export default Topbar
