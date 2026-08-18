import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BookingLayout from '../layout/BookingLayout'
import { useAuth } from '../src/context/AuthContext'
import { useNetwork } from '../src/context/NetworkContext'
import { getErrorMessage } from '../src/lib/api'
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
  const { user, isUser } = useAuth()
  const { getStation, getCharger, cancelBooking } = useNetwork()

  const {
    userDetails,
    stationId,
    chargerId,
    bookingDate,
    slot,
    bookingRef,
    bookingMongoId,
  } = location.state ?? {}

  const station = getStation(stationId)
  const charger = getCharger(stationId, chargerId)
  const mobile = getMobileDigits(userDetails?.mobile ?? '')

  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [cancelError, setCancelError] = useState('')

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

  const goToNextBooking = () => {
    if (isUser && user?.fullName) {
      navigate('/book/station', {
        state: {
          userDetails: {
            name: user.fullName,
            mobile: user.mobile ? `+91 ${user.mobile}` : (userDetails?.mobile ?? ''),
            carModel: user.carModel ?? userDetails?.carModel ?? '',
            carNumber: user.registrationNumber ?? userDetails?.carNumber ?? '',
          },
        },
      })
      return
    }
    navigate('/book/details', { state: { userDetails } })
  }

  const handleCancel = async () => {
    if (!bookingMongoId || cancelled || cancelling) return
    if (!window.confirm('Cancel this booking? This cannot be undone.')) return

    setCancelling(true)
    setCancelError('')
    try {
      await cancelBooking(bookingMongoId)
      setCancelled(true)
    } catch (error) {
      setCancelError(getErrorMessage(error, 'Failed to cancel booking'))
    } finally {
      setCancelling(false)
    }
  }

  return (
    <BookingLayout currentStep={5}>
      <div className="text-center py-4">
        {cancelled ? (
          <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-400 flex items-center justify-center mx-auto mb-4 fade-in">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M8 8l12 12M20 8L8 20" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center mx-auto mb-4 fade-in">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 14l6 6 10-11" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        <h2 className="page-title text-xl font-semibold mb-1">
          {cancelled ? 'Booking cancelled' : 'Booking confirmed!'}
        </h2>
        <p className="text-gray-600 text-sm mb-3">
          {cancelled ? 'This charging slot is no longer reserved' : 'Your EV charging slot is reserved'}
        </p>
        <div className={`inline-block mono text-sm px-4 py-2 rounded-xl mb-5 ${
          cancelled
            ? 'text-red-600 bg-red-50 border border-red-200'
            : 'text-green-700 bg-green-50 border border-green-200'
        }`}>
          {bookingRef}
        </div>

        <div className="card-inner rounded-xl overflow-hidden mb-5 text-left">
          <div className={`border-b px-4 py-2.5 ${cancelled ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <p className={`text-xs mono uppercase tracking-widest ${cancelled ? 'text-red-600' : 'text-green-700'}`}>
              Booking summary
            </p>
          </div>
          <div className="divide-y divide-gray-200 px-4">
            <SummaryRow label="Status" value={cancelled ? 'Cancelled' : 'Upcoming'} />
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

        {cancelError && (
          <div className="mb-4 rounded-xl err-box p-3 text-left">
            <p className="err-text text-sm">{cancelError}</p>
          </div>
        )}

        {!cancelled && (
          <>
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold mb-3"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
                <path d="M1 6h12M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Add to Google Calendar
            </a>

            <div>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling || !bookingMongoId}
                className="btn-cancel inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {cancelling ? 'Cancelling...' : 'Cancel booking'}
              </button>
            </div>
          </>
        )}

        {mobile && !cancelled && (
          <p className="text-gray-400 text-xs mono mt-4">Confirmation sent to {mobile}</p>
        )}

        <div className="mt-6 pt-5 border-t border-gray-200">
          <button
            type="button"
            onClick={goToNextBooking}
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
