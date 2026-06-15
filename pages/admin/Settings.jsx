import { useNetwork } from '../../src/context/NetworkContext'

const Settings = () => {
  const { resetToDefault, network } = useNetwork()

  const handleReset = () => {
    if (
      window.confirm(
        'Reset all stations, chargers and bookings to default seed data? This cannot be undone.',
      )
    ) {
      resetToDefault()
    }
  }

  return (
    <div className="max-w-lg">
      <div className="admin-panel rounded-xl p-5 mb-6">
        <h2 className="text-gray-900 font-semibold mb-2">Data storage</h2>
        <p className="text-gray-500 text-sm mb-4">
          Admin changes are saved in your browser&apos;s localStorage and sync to the public booking
          flow automatically.
        </p>
        <p className="mono text-xs text-gray-400">
          {network.length} station(s) · key: ev-network-v1
        </p>
      </div>

      <div className="admin-panel rounded-xl p-5 border-red-100">
        <h2 className="text-gray-900 font-semibold mb-2">Reset network</h2>
        <p className="text-gray-500 text-sm mb-4">
          Restore the original Vismaya, Athulya and Park Center demo data.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="admin-btn-sm admin-btn-danger px-4 py-2.5 rounded-xl text-sm font-semibold"
        >
          Reset to default
        </button>
      </div>
    </div>
  )
}

export default Settings
