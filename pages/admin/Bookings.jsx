import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useNetwork } from '../../src/context/NetworkContext'
import { adminApi, getErrorMessage, unwrapList } from '../../src/lib/api'
import StatCard from '../../components/admin/StatCard'
import { SkeletonStatCard, SkeletonTable } from '../../components/ui/skeleton-blocks'

const formatTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

const STATUS_TABS = {
  upcoming: {
    title: 'Upcoming bookings',
    empty: 'No upcoming bookings.',
    hint: 'Sessions scheduled for later.',
  },
  active: {
    title: 'Active bookings',
    empty: 'No live charging sessions.',
    hint: 'Sessions that are charging right now.',
  },
  completed: {
    title: 'Completed bookings',
    empty: 'No completed bookings.',
    hint: 'Finished charging sessions.',
  },
  cancelled: {
    title: 'Cancelled bookings',
    empty: 'No cancelled bookings.',
    hint: 'Bookings cancelled by users.',
  },
}

const BookingTable = ({ rows, empty }) => (
  <div className="admin-table-scroll rounded-xl">
    <div className="admin-table-wrap min-w-[720px]">
      <table className="admin-table w-full text-sm">
        <thead>
          <tr>
            <th>Ref</th>
            <th>User</th>
            <th>Mobile</th>
            <th>Station</th>
            <th>Charger</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center text-gray-400 py-8">{empty}</td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row.bookingId}>
              <td className="mono text-xs text-green-700">{row.bookingId}</td>
              <td>{row.user || '—'}</td>
              <td className="mono text-xs">{row.mobile || '—'}</td>
              <td>{row.station || '—'}</td>
              <td className="mono text-xs">{row.charger || '—'}</td>
              <td className="mono text-xs">{row.bookingDate || '—'}</td>
              <td className="mono text-xs">{formatTime(row.startTime)} – {formatTime(row.endTime)}</td>
              <td>
                <span className="admin-badge">{row.status || '—'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const Bookings = () => {
  const { dashboard } = useNetwork()
  const [searchParams] = useSearchParams()
  const statusParam = searchParams.get('status')
  const selectedStatus = STATUS_TABS[statusParam] ? statusParam : 'active'

  const [upcoming, setUpcoming] = useState([])
  const [active, setActive] = useState([])
  const [completed, setCompleted] = useState([])
  const [cancelled, setCancelled] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelledRequest = false
    ;(async () => {
      try {
        const [upcomingRes, activeRes, completedRes, cancelledRes] = await Promise.all([
          adminApi.getUpcomingBookings(),
          adminApi.getActiveBookings(),
          adminApi.getCompletedBookings(),
          adminApi.getCancelledBookings(),
        ])
        if (cancelledRequest) return
        setUpcoming(unwrapList(upcomingRes.data, ['bookings']))
        setActive(unwrapList(activeRes.data, ['bookings']))
        setCompleted(unwrapList(completedRes.data, ['bookings']))
        setCancelled(unwrapList(cancelledRes.data, ['bookings']))
      } catch (err) {
        if (!cancelledRequest) setError(getErrorMessage(err, 'Failed to load bookings'))
      } finally {
        if (!cancelledRequest) setLoading(false)
      }
    })()
    return () => {
      cancelledRequest = true
    }
  }, [])

  const lists = { upcoming, active, completed, cancelled }
  const tab = STATUS_TABS[selectedStatus]
  const rows = lists[selectedStatus]
  const cardClass = (status) =>
    selectedStatus === status ? 'ring-2 ring-green-500/40' : ''

  return (
    <div>
      <p className="text-gray-500 text-sm mb-6">
        Click a card to view the full booking list for that status.
      </p>

      {error && <p className="err-text text-sm mb-4">{error}</p>}

      {loading ? (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <SkeletonTable rows={6} cols={8} />
        </>
      ) : (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/admin/bookings?status=upcoming" className="block">
          <StatCard
            label="Upcoming"
            value={dashboard?.upcomingBookings ?? upcoming.length}
            sub="Scheduled sessions"
            className={cardClass('upcoming')}
          />
        </Link>
        <Link to="/admin/bookings?status=active" className="block">
          <StatCard
            label="Active bookings"
            value={dashboard?.activeBookings ?? active.length}
            sub="Live charging sessions"
            accent
            className={cardClass('active')}
          />
        </Link>
        <Link to="/admin/bookings?status=completed" className="block">
          <StatCard
            label="Completed"
            value={dashboard?.completedBookings ?? completed.length}
            sub="Finished sessions"
            className={cardClass('completed')}
          />
        </Link>
        <Link to="/admin/bookings?status=cancelled" className="block">
          <StatCard
            label="Cancelled"
            value={dashboard?.cancelledBookings ?? cancelled.length}
            sub="Cancelled bookings"
            className={cardClass('cancelled')}
          />
        </Link>
      </div>

      <h2 className="text-gray-900 font-semibold mb-1">{tab.title}</h2>
      <p className="text-gray-500 text-sm mb-4">{tab.hint}</p>
      <BookingTable rows={rows} empty={tab.empty} />
        </>
      )}
    </div>
  )
}

export default Bookings
