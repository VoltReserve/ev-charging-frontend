import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/admin/Sidebar'
import Topbar from '../components/admin/Topbar'

const AdminLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="admin-shell min-h-screen">
      {menuOpen && (
        <button
          type="button"
          className="admin-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        />
      )}
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="admin-main flex flex-col min-w-0 min-h-screen">
        <Topbar onMenuOpen={() => setMenuOpen(true)} />
        <main className="admin-content flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
