import StationManager from '../../components/admin/StationManager'

const Network = () => {
  return (
    <div>
      <p className="text-gray-500 text-sm mb-6">
        Add stations and their chargers. Expand a station to manage its guns.
      </p>
      <StationManager />
    </div>
  )
}

export default Network
