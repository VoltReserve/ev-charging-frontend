import { Link } from 'react-router-dom'
import { useNetwork } from '../../src/context/NetworkContext'
import StatCard from '../../components/admin/StatCard'
import BookingsByStationChart from '../../components/admin/BookingsByStationChart'
import ChargerUtilizationChart from '../../components/admin/ChargerUtilizationChart'
import { SkeletonDashboard } from '../../components/ui/skeleton-blocks'

const Dashboard = () => {
  const { dashboard, loading, error } = useNetwork()

  const stats = dashboard || {}

  if (loading && !dashboard) {
    return <SkeletonDashboard />
  }

  return (
    <div>
      <p className="text-gray-500 text-sm mb-6">
        Live overview of stations, chargers, users, and bookings.
      </p>

      {error && <p className="err-text text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/admin/network" className="block">
          <StatCard label="Stations" value={stats.totalStations ?? 0} sub="All stations" accent />
        </Link>
        <Link to="/admin/network" className="block">
          <StatCard label="Chargers" value={stats.totalChargers ?? 0} sub="All chargers" />
        </Link>
        <Link to="/admin/users" className="block">
          <StatCard label="Users" value={stats.totalUsers ?? 0} sub="Registered users" />
        </Link>
        <Link to="/admin/bookings" className="block">
          <StatCard label="Bookings" value={stats.totalBookings ?? 0} sub="All time" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/admin/bookings?status=upcoming" className="block">
          <StatCard label="Upcoming" value={stats.upcomingBookings ?? 0} sub="Scheduled sessions" />
        </Link>
        <Link to="/admin/bookings?status=active" className="block">
          <StatCard label="Active bookings" value={stats.activeBookings ?? 0} sub="Live charging sessions" accent />
        </Link>
        <Link to="/admin/bookings?status=completed" className="block">
          <StatCard label="Completed" value={stats.completedBookings ?? 0} sub="Finished sessions" />
        </Link>
        <Link to="/admin/bookings?status=cancelled" className="block">
          <StatCard label="Cancelled" value={stats.cancelledBookings ?? 0} sub="Cancelled bookings" />
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BookingsByStationChart />
        <ChargerUtilizationChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/admin/network" className="admin-quick-link rounded-xl p-5">
          <p className="font-semibold text-gray-900">Manage stations &amp; chargers</p>
          <p className="text-gray-500 text-xs mt-1">Add stations, chargers, and set availability</p>
        </Link>
        <Link to="/admin/reports" className="admin-quick-link rounded-xl p-5">
          <p className="font-semibold text-gray-900">View reports</p>
          <p className="text-gray-500 text-xs mt-1">Utilization, users, and exports</p>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
