import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../src/context/AuthContext'

const TITLES = {
  '/admin': 'Dashboard',
  '/admin/network': 'Stations & Chargers',
  '/admin/bookings': 'Bookings',
  '/admin/reports': 'Reports',
  '/admin/settings': 'Settings',
}

const Topbar = ({ onMenuOpen }) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { admin, logout } = useAuth()
  const title = TITLES[pathname] ?? 'Admin'

  return (
    <header className="admin-topbar px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuOpen}
          className="admin-menu-btn lg:hidden shrink-0"
          aria-label="Open menu"
        >
          <span />
          <span />
          <span />
        </button>
        <h1 className="text-gray-900 text-base sm:text-lg font-semibold truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden sm:inline text-gray-500 text-xs truncate max-w-[160px]">
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
