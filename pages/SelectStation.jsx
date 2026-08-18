import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BookingLayout from '../layout/BookingLayout'
import { useAuth } from '../src/context/AuthContext'
import { useNetwork } from '../src/context/NetworkContext'

const StatusBadge = ({ status }) => {
  if (status === 'Active') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
        <span className="text-green-700 text-xs mono">Open</span>
      </div>
    )
  }

  if (status === 'Inactive') {
    return (
      <span className="text-xs px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 mono">
        Closed
      </span>
    )
  }

  return (
    <span className="text-xs px-2 py-1 rounded-lg bg-red-50 border border-red-200 text-red-600 mono">
      Offline
    </span>
  )
}

const StationIcon = ({ available }) => (
  <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
    {available ? (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M10 2L4 10h5l-1 6 7-8h-5l1-6z" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2l1.5 5h4.5l-3.5 2.5 1.5 5L9 12l-3.5 2.5 1.5-5L3.5 7H8L9 2z" stroke="#9ca3af" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    )}
  </div>
)

const SelectStation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isUser } = useAuth()
  const { stations, loading: networkLoading } = useNetwork()
  const userDetails = location.state?.userDetails

  const [selectedId, setSelectedId] = useState(location.state?.stationId ?? '')
  const [error, setError] = useState('')

  const isStationSelectable = (station) => station.status === 'Active'
  const getStationSubtitle = (station) => {
    const count = station.guns ?? 0
    return `${count} charger${count === 1 ? '' : 's'}`
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedId) {
      setError('Please select a station')
      return
    }
    setError('')
    navigate('/book/charger', { state: { userDetails, stationId: selectedId } })
  }

  const handleBack = () => {
    // Existing logged-in users have no Step 1 in their flow — go back to login
    if (isUser) {
      navigate('/login')
    } else {
      navigate('/book/details', { state: { userDetails } })
    }
  }

  return (
    <BookingLayout currentStep={2}>
      <div className="mb-5">
        <h2 className="page-title text-lg font-semibold">Select station</h2>
        <p className="page-sub text-sm mt-1">Choose a charging station near you</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 rounded-xl err-box p-3">
            <p className="err-text text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {networkLoading && stations.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-6">Loading stations...</p>
          )}
          {!networkLoading && stations.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-6">No stations available.</p>
          )}
          {stations.map((station) => {
            const selectable = isStationSelectable(station)
            const isSelected = selectedId === station.id

            if (!selectable) {
              return (
                <div
                  key={station.id}
                  className="station-card rounded-xl p-4 block unavail"
                >
                  <div className="flex items-center gap-3">
                    <StationIcon available={false} />
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm font-semibold">{station.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{getStationSubtitle(station)}</p>
                    </div>
                    <StatusBadge status={station.status} />
                  </div>
                </div>
              )
            }

            return (
              <label
                key={station.id}
                className={`station-card rounded-xl p-4 block cursor-pointer${isSelected ? ' selected' : ''}`}
              >
                <input
                  type="radio"
                  name="station"
                  value={station.id}
                  checked={isSelected}
                  onChange={() => {
                    setSelectedId(station.id)
                    setError('')
                  }}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <StationIcon available />
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm font-semibold">{station.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{getStationSubtitle(station)}</p>
                  </div>
                  <StatusBadge status={station.status} />
                </div>
              </label>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="btn-ghost rounded-xl py-3 px-5 text-sm font-semibold flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 7H3M7 3L3 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <button
            type="submit"
            className="btn-green flex-1 rounded-xl py-3 text-white text-sm font-semibold flex items-center justify-center gap-2"
          >
            Continue
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </form>
    </BookingLayout>
  )
}

export default SelectStation
