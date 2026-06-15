import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BookingLayout from '../layout/BookingLayout'
import { useNetwork } from '../src/context/NetworkContext'
import {
  buildGoogleCalendarUrl,
  formatConfirmDate,
  formatTimeRange24,
  getMobileDigits,
  getVehicleLabel,
} from '../utils/booking'

const BookingSuccess = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { getStation, getCharger } = useNetwork()

  const {
    userDetails,
    stationId,
    chargerId,
    bookingDate,
    slot,
    bookingRef,
  } = location.state ?? {}

  const station = getStation(stationId)
  const charger = getCharger(stationId, chargerId)
  const mobile = getMobileDigits(userDetails?.mobile ?? '')

  useEffect(() => {
    if (!bookingRef || !station || !charger || !bookingDate || !slot) {
      navigate('/book/schedule', { replace: true, state: { userDetails, stationId, chargerId } })
    }
  }, [bookingRef, station, charger, bookingDate, slot, navigate, userDetails, stationId, chargerId])

  if (!station || !charger || !slot || !bookingRef) return null

  const calendarUrl = buildGoogleCalendarUrl({
    stationName: station.name,
    chargerName: charger.name,
    chargerType: charger.type,
    chargerPower: charger.power,
    dateStr: bookingDate,
    from: slot.from,
    to: slot.to,
  })

  return (
    <BookingLayout currentStep={5}>
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center mx-auto mb-4 fade-in">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M6 14l6 6 10-11" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="page-title text-xl font-semibold mb-1">Booking confirmed!</h2>
        <p className="text-gray-600 text-sm mb-3">Your EV charging slot is reserved</p>
        <div className="inline-block mono text-green-700 text-sm px-4 py-2 rounded-xl bg-green-50 border border-green-200 mb-5">
          {bookingRef}
        </div>

        <div className="card-inner rounded-xl overflow-hidden mb-5 text-left">
          <div className="bg-green-50 border-b border-green-200 px-4 py-2.5">
            <p className="text-green-700 text-xs mono uppercase tracking-widest">Booking summary</p>
          </div>
          <div className="divide-y divide-gray-200 px-4">
            <SummaryRow label="Station" value={station.name} />
            <SummaryRow
              label="Charger"
              value={`${charger.name} (${charger.type} ${charger.power})`}
            />
            <SummaryRow label="Name" value={userDetails?.name || '—'} />
            <SummaryRow label="Vehicle" value={getVehicleLabel(userDetails)} />
            <SummaryRow label="Date" value={formatConfirmDate(bookingDate)} />
            <SummaryRow label="Time" value={formatTimeRange24(slot.from, slot.to)} />
          </div>
        </div>

        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold mb-4"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M1 6h12M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          Add to Google Calendar
        </a>

        {mobile && (
          <p className="text-gray-400 text-xs mono">Confirmation sent to {mobile}</p>
        )}

        <div className="mt-6 pt-5 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/book/details', { state: { userDetails } })}
            className="text-green-700 text-xs mono hover:text-green-600 transition-colors"
          >
            ← Book another slot
          </button>
        </div>
      </div>
    </BookingLayout>
  )
}

const SummaryRow = ({ label, value }) => (
  <div className="flex justify-between py-2.5 gap-4">
    <span className="text-gray-500 text-xs mono">{label}</span>
    <span className="text-gray-900 text-xs text-right">{value}</span>
  </div>
)

export default BookingSuccess
