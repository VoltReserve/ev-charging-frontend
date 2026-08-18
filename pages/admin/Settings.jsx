import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../src/context/AuthContext'

const Settings = () => {
  const navigate = useNavigate()
  const { admin, logout } = useAuth()

  return (
    <div className="max-w-lg">
      <div className="admin-panel rounded-xl p-5 mb-6">
        <h2 className="text-gray-900 font-semibold mb-2">Admin account</h2>
        <p className="text-gray-500 text-sm mb-4">
          Signed in with an admin token. All station, charger, and report APIs use this session.
        </p>
        <p className="text-sm text-gray-900">{admin?.name || 'Admin'}</p>
        <p className="mono text-xs text-gray-400 mt-1">{admin?.email || '—'}</p>
      </div>

      <div className="admin-panel rounded-xl p-5 border-red-100">
        <h2 className="text-gray-900 font-semibold mb-2">Session</h2>
        <p className="text-gray-500 text-sm mb-4">
          Sign out of the admin panel on this device.
        </p>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/admin-login', { replace: true })
          }}
          className="admin-btn-sm admin-btn-danger px-4 py-2.5 rounded-xl text-sm font-semibold"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

export default Settings
