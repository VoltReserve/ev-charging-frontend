import { useMemo } from 'react'
import { useNetwork } from '../../src/context/NetworkContext'
import StatCard from '../../components/admin/StatCard'
import BookingTable from '../../components/admin/BookingTable'

const Bookings = () => {
  const { network, stations, allBookings, deleteBooking } = useNetwork()

  const byStation = useMemo(() => {
    const map = {}
    for (const b of allBookings) {
      map[b.stationName] = (map[b.stationName] ?? 0) + 1
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [allBookings])

  const dcCount = network.reduce(
    (n, s) => n + s.chargers.filter((c) => c.type === 'DC').length,
    0,
  )
  const acCount = network.reduce(
    (n, s) => n + s.chargers.filter((c) => c.type === 'AC').length,
    0,
  )

  const handleDelete = (stationId, chargerId, bookingIndex) => {
    if (window.confirm('Remove this booking?')) {
      deleteBooking(stationId, chargerId, bookingIndex)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total bookings" value={allBookings.length} accent />
        <StatCard label="DC chargers" value={dcCount} />
        <StatCard label="AC chargers" value={acCount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="admin-panel rounded-xl p-5">
          <h2 className="text-gray-900 font-semibold mb-4">Bookings by station</h2>
          {byStation.length === 0 ? (
            <p className="text-gray-400 text-sm">No booking data yet.</p>
          ) : (
            <ul className="space-y-3">
              {byStation.map(([name, count]) => {
                const max = byStation[0][1]
                const pct = max ? Math.round((count / max) * 100) : 0
                return (
                  <li key={name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{name}</span>
                      <span className="mono text-xs text-gray-500">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
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
                <p className="text-xs text-gray-500 mt-0.5 capitalize">{s.status} · {s.guns} chargers</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-gray-900 font-semibold mb-1">All bookings</h2>
        <p className="text-gray-500 text-sm mb-4">
          Demo seed data and live bookings from the app.
        </p>
        <BookingTable rows={allBookings} onDelete={handleDelete} />
      </div>
    </div>
  )
}

export default Bookings
