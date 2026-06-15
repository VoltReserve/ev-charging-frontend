import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/network', label: 'Stations & Chargers' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/settings', label: 'Settings' },
]

const Sidebar = ({ open, onClose }) => {
  return (
    <aside className={`admin-sidebar ${open ? 'admin-sidebar-open' : ''}`}>
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <p className="mono text-green-400 text-[10px] tracking-widest uppercase">Admin</p>
          <p className="text-white font-semibold text-sm mt-0.5">EV Network</p>
        </div>
        <button
          type="button"
          className="admin-menu-close lg:hidden text-gray-400 text-xl leading-none p-1"
          onClick={onClose}
          aria-label="Close menu"
        >
          ×
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `admin-nav-link block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'admin-nav-active' : ''
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <NavLink to="/login" onClick={onClose} className="admin-nav-link block px-3 py-2.5 rounded-lg text-sm">
          ← Booking app
        </NavLink>
      </div>
    </aside>
  )
}

export default Sidebar
