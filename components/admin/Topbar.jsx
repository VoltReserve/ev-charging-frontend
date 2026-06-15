import { useLocation } from 'react-router-dom'

const TITLES = {
  '/admin': 'Dashboard',
  '/admin/network': 'Stations & Chargers',
  '/admin/bookings': 'Bookings',
  '/admin/settings': 'Settings',
}

const Topbar = ({ onMenuOpen }) => {
  const { pathname } = useLocation()
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
      <div className="flex items-center gap-2 shrink-0">
        <div className="pulse-dot" />
        <span className="text-green-700 text-xs mono sm:inline">Live</span>
      </div>
    </header>
  )
}

export default Topbar
