import { Link } from 'react-router-dom'
import { useNetwork } from '../../src/context/NetworkContext'
import StatCard from '../../components/admin/StatCard'

const Dashboard = () => {
  const { stations, network, allBookings } = useNetwork()

  const openStations = stations.filter((s) => s.status === 'open').length
  const totalChargers = network.reduce((n, s) => n + s.chargers.length, 0)
  const availableChargers = network.reduce(
    (n, s) => n + s.chargers.filter((c) => c.status === 'available').length,
    0,
  )

  return (
    <div>
      <p className="text-gray-500 text-sm mb-6">
        Overview of your EV charging network. Changes sync to the booking app instantly.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/admin/network" className="block">
          <StatCard label="Stations" value={stations.length} sub={`${openStations} open`} accent />
        </Link>
        <Link to="/admin/network" className="block">
          <StatCard label="Chargers" value={totalChargers} sub={`${availableChargers} available`} />
        </Link>
        <Link to="/admin/bookings" className="block">
          <StatCard label="Bookings" value={allBookings.length} sub="View all reservations" />
        </Link>
        <StatCard label="Network" value="Live" sub="Synced to booking flow" accent />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/admin/network" className="admin-quick-link rounded-xl p-5">
          <p className="font-semibold text-gray-900">Manage stations &amp; chargers</p>
          <p className="text-gray-500 text-xs mt-1">Add stations, guns, set availability</p>
        </Link>
        <Link to="/admin/bookings" className="admin-quick-link rounded-xl p-5">
          <p className="font-semibold text-gray-900">View bookings</p>
          <p className="text-gray-500 text-xs mt-1">Reports and reservation list</p>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
