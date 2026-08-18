import { useEffect, useState } from 'react'
import { useNetwork } from '../../src/context/NetworkContext'
import { adminApi, getErrorMessage, unwrapList } from '../../src/lib/api'
import StatCard from '../../components/admin/StatCard'

const Bookings = () => {
  const { stations, dashboard } = useNetwork()
  const [active, setActive] = useState([])
  const [completed, setCompleted] = useState([])
  const [byStation, setByStation] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [activeRes, completedRes, stationRes] = await Promise.all([
          adminApi.getActiveBookings(),
          adminApi.getCompletedBookings(),
          adminApi.getBookingsByStation(),
        ])
        setActive(unwrapList(activeRes.data, ['bookings']))
        setCompleted(unwrapList(completedRes.data, ['bookings']))
        setByStation(unwrapList(stationRes.data, ['stations', 'report']))
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load bookings'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const maxStation = Math.max(...byStation.map((row) => Number(row.bookings || 0)), 1)

  return (
    <div>
      {error && <p className="err-text text-sm mb-4">{error}</p>}
      {loading && <p className="text-gray-400 text-sm mb-4">Loading bookings...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total bookings" value={dashboard?.totalBookings ?? 0} accent />
        <StatCard label="Active" value={dashboard?.activeBookings ?? active.length} />
        <StatCard label="Completed" value={dashboard?.completedBookings ?? completed.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="admin-panel rounded-xl p-5">
          <h2 className="text-gray-900 font-semibold mb-4">Bookings by station</h2>
          {byStation.length === 0 ? (
            <p className="text-gray-400 text-sm">No booking data yet.</p>
          ) : (
            <ul className="space-y-3">
              {byStation.map((row) => {
                const pct = Math.round((Number(row.bookings || 0) / maxStation) * 100)
                return (
                  <li key={row.station}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{row.station}</span>
                      <span className="mono text-xs text-gray-500">{row.bookings}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="admin-panel rounded-xl p-5">
          <h2 className="text-gray-900 font-semibold mb-4">Station status</h2>
          <div className="space-y-2">
            {stations.map((s) => (
              <div key={s.id} className="rounded-lg border border-gray-200 px-4 py-3">
                <p className="font-medium text-sm">{s.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-gray-900 font-semibold mb-1">Active bookings</h2>
        <p className="text-gray-500 text-sm mb-4">Live charging sessions.</p>
        <div className="admin-table-scroll rounded-xl">
          <div className="admin-table-wrap min-w-[480px]">
            <table className="admin-table w-full text-sm">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Station</th>
                  <th>Charger</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {active.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-8">No active bookings.</td>
                  </tr>
                )}
                {active.map((row) => (
                  <tr key={row.bookingId}>
                    <td className="mono text-xs text-green-700">{row.bookingId}</td>
                    <td>{row.station}</td>
                    <td className="mono text-xs">{row.charger}</td>
                    <td>{row.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-gray-900 font-semibold mb-1">Completed bookings</h2>
        <p className="text-gray-500 text-sm mb-4">Finished sessions from the reports API.</p>
        <div className="admin-table-scroll rounded-xl">
          <div className="admin-table-wrap min-w-[560px]">
            <table className="admin-table w-full text-sm">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Station</th>
                  <th>Charger</th>
                  <th>User</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {completed.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-8">No completed bookings.</td>
                  </tr>
                )}
                {completed.map((row) => (
                  <tr key={row.bookingId}>
                    <td className="mono text-xs text-green-700">{row.bookingId}</td>
                    <td>{row.station}</td>
                    <td className="mono text-xs">{row.charger}</td>
                    <td>{row.user}</td>
                    <td className="mono text-xs">{row.bookingDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Bookings
