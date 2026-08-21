/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BookingLayout from '../layout/BookingLayout'
import { useNetwork } from '../src/context/NetworkContext'
import { SkeletonList } from '../components/ui/skeleton-blocks'
import { formatSlotDuration, getBookingWindowNote } from '../utils/schedule'

const GunIcon = ({ type }) => {
  const isDc = type === 'DC'
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${isDc ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1v4M5 5h6l-1 4H6L5 5zM6 9v2a2 2 0 004 0V9"
          stroke={isDc ? '#ea580c' : '#16a34a'}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

const isChargerSelectable = (charger) => charger.status === 'Available'

const SelectCharger = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { getStation, getChargersForStation, loadChargersForStation, loading: networkLoading } = useNetwork()
  const { userDetails, stationId } = location.state ?? {}

  const [selectedId, setSelectedId] = useState(location.state?.chargerId ?? '')
  const [error, setError] = useState('')
  const [loadingChargers, setLoadingChargers] = useState(false)

  const station = getStation(stationId)
  const chargers = getChargersForStation(stationId)
  const selectableChargers = chargers.filter(isChargerSelectable)
  const selectedCharger = chargers.find((c) => c.id === selectedId)

  useEffect(() => {
    // Only redirect once the network data has finished loading and station is still not found
    if (!stationId || (!networkLoading && !station)) {
      navigate('/book/station', { replace: true, state: { userDetails } })
    }
  }, [stationId, station, networkLoading, navigate, userDetails])

  useEffect(() => {
    if (!stationId) return
    setLoadingChargers(true)
    loadChargersForStation(stationId).finally(() => setLoadingChargers(false))
  }, [stationId])

  // Show nothing while the initial station list is still being fetched
  if (networkLoading && !station) {
    return (
      <BookingLayout currentStep={3}>
        <SkeletonList rows={4} />
      </BookingLayout>
    )
  }

  if (!station) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedId) {
      setError('Please select a charger')
      return
    }
    setError('')
    navigate('/book/schedule', { state: { userDetails, stationId, chargerId: selectedId } })
  }

  const handleBack = () => {
    navigate('/book/station', { state: { userDetails, stationId } })
  }

  return (
    <BookingLayout currentStep={3}>
      <div className="mb-5">
        <h2 className="page-title text-lg font-semibold">Charging type</h2>
        <p className="page-sub text-sm mt-1">
          Available chargers at{' '}
          <span className="text-green-600 font-medium">{station.name}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 rounded-xl err-box p-3">
            <p className="err-text text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-2 mb-6">
          {loadingChargers && <SkeletonList rows={3} />}
          {!loadingChargers && chargers.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">No chargers at this station.</p>
          )}

          {!loadingChargers && chargers.map((charger) => {
            const selectable = isChargerSelectable(charger)
            const isSelected = selectedId === charger.id

            if (!selectable) {
              return (
                <div key={charger.id} className="gun-card rounded-xl p-4 block unavail">
                  <div className="flex items-center gap-3">
                    <GunIcon type={charger.type} />
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm font-semibold">{charger.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {charger.power}
                        {charger.slotDuration ? ` · ${formatSlotDuration(charger.slotDuration)}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`mono text-xs px-2 py-1 rounded-lg ${charger.type === 'DC' ? 'tag-dc' : 'tag-ac'}`}>
                        {charger.type}
                      </span>
                      <span className="mono text-xs text-gray-500">{charger.power}</span>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <label
                key={charger.id}
                className={`gun-card rounded-xl p-4 block cursor-pointer${isSelected ? ' selected' : ''}`}
              >
                <input
                  type="radio"
                  name="gun_id"
                  value={charger.id}
                  checked={isSelected}
                  onChange={() => {
                    setSelectedId(charger.id)
                    setError('')
                  }}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <GunIcon type={charger.type} />
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm font-semibold">{charger.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {charger.power}
                      {charger.slotDuration ? ` · ${formatSlotDuration(charger.slotDuration)}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`mono text-xs px-2 py-1 rounded-lg ${charger.type === 'DC' ? 'tag-dc' : 'tag-ac'}`}>
                      {charger.type}
                    </span>
                    <span className="mono text-xs text-gray-500">{charger.power}</span>
                  </div>
                </div>
              </label>
            )
          })}
        </div>

        {selectedCharger && (
          <div className="rounded-xl info-box p-3 mb-5">
            <p className="info-text text-xs mono">
              {getBookingWindowNote(selectedCharger)}
            </p>
          </div>
        )}

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
            disabled={selectableChargers.length === 0}
            className="btn-green flex-1 rounded-xl py-3 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default SelectCharger
