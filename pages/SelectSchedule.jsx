/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BookingLayout from '../layout/BookingLayout'
import { useNetwork } from '../src/context/NetworkContext'
import {
  buildMonthGrid,
  format12,
  formatDayLabel,
  getBookableDates,
  getScheduleInfoBanner,
  toDateStr,
} from '../utils/schedule'
import { getErrorMessage } from '../src/lib/api'
import { SkeletonCard, SkeletonForm, SkeletonList } from '../components/ui/skeleton-blocks'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const SelectSchedule = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { getCharger, getBookingsForChargerOnDate, createBooking, loadChargersForStation } = useNetwork()
  const { userDetails, stationId, chargerId } = location.state ?? {}

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])
  const todayStr = toDateStr(today)
  const bookableDates = useMemo(() => new Set(getBookableDates(3)), [])
  const monthLabel = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const calendar = useMemo(
    () => buildMonthGrid(today, bookableDates, todayStr),
    [today, bookableDates, todayStr],
  )

  const [chargerReady, setChargerReady] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Ensure chargers for this station are loaded before we look one up
  useEffect(() => {
    if (!stationId || !chargerId) return
    loadChargersForStation(stationId).then(() => setChargerReady(true))
  }, [stationId, chargerId])

  const charger = getCharger(stationId, chargerId)

  useEffect(() => {
    if (!chargerReady) return
    if (!stationId || !chargerId || !charger) {
      navigate('/book/charger', { replace: true, state: { userDetails, stationId, chargerId } })
    }
  }, [chargerReady, stationId, chargerId, charger, navigate, userDetails])

  useEffect(() => {
    if (!selectedDate || !stationId || !chargerId) return

    setLoadingSlots(true)
    setSubmitError('')
    getBookingsForChargerOnDate(stationId, chargerId, selectedDate)
      .then((slots) => {
        setAvailableSlots(
          slots.map((slot) => ({
            from: slot.startTime ?? slot.from,
            to: slot.endTime ?? slot.to,
          })),
        )
      })
      .catch((error) => {
        setSubmitError(getErrorMessage(error, 'Failed to load available slots'))
        setAvailableSlots([])
      })
      .finally(() => setLoadingSlots(false))
  }, [selectedDate, stationId, chargerId])

  if (!charger) return (
    <BookingLayout currentStep={4} wide>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonForm fields={4} />
        <SkeletonCard />
      </div>
    </BookingLayout>
  )

  const handleDatePick = (dateStr) => {
    if (!bookableDates.has(dateStr)) return
    setSelectedDate(dateStr)
    setSelectedSlot(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedDate || !selectedSlot) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const booking = await createBooking({
        stationId,
        chargerId,
        bookingDate: selectedDate,
        startTime: selectedSlot.from,
      })
      navigate('/book/success', {
        state: {
          userDetails,
          stationId,
          chargerId,
          bookingDate: selectedDate,
          slot: selectedSlot,
          bookingRef: booking?.bookingId || booking?.ref || 'Booking created',
          bookingMongoId: booking?.id || booking?._id || '',
        },
      })
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Failed to create booking'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    navigate('/book/charger', { state: { userDetails, stationId, chargerId } })
  }

  const canSubmit = Boolean(selectedDate && selectedSlot && !submitting)
  const visibleSlots = selectedDate ? availableSlots : []

  return (
    <BookingLayout currentStep={4} wide>
      <div className="mb-5">
        <h2 className="page-title text-lg font-semibold">Date &amp; time</h2>
        <p className="page-sub text-sm mt-1">Pick a day, then choose an open slot</p>
      </div>

      <div className="rounded-xl info-box p-3 mb-5 flex items-start gap-2">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0">
          <circle cx="7" cy="7" r="6" stroke="#16a34a" strokeWidth="1.2" />
          <path d="M7 5v3M7 9.5v.3" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <p className="info-text text-xs mono">{getScheduleInfoBanner(charger)}</p>
      </div>

      <form onSubmit={handleSubmit}>
        {submitError && (
          <div className="mb-4 rounded-xl err-box p-3">
            <p className="err-text text-sm">{submitError}</p>
          </div>
        )}

        <div className="schedule-layout mb-5">
          <div className="card-inner rounded-xl p-4 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-900 text-sm font-semibold mono">{monthLabel}</span>
              <span className="text-gray-500 text-xs mono">next 3 days</span>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((wd) => (
                <div key={wd} className="cal-day text-gray-400 mono text-[10px] font-semibold cursor-default">
                  {wd}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendar.cells.map((cell) => {
                if (cell.empty) {
                  return <div key={cell.key} className="cal-day empty" />
                }

                const isSelected = selectedDate === cell.dateStr
                let className = 'cal-day'
                if (cell.inWindow) {
                  className += ' in-window'
                  if (cell.isToday) className += ' today'
                  if (isSelected) className += ' selected'
                } else {
                  className += ' disabled'
                }

                return (
                  <button
                    key={cell.key}
                    type="button"
                    disabled={!cell.inWindow}
                    onClick={() => handleDatePick(cell.dateStr)}
                    className={className}
                  >
                    {cell.day}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="card-inner rounded-xl p-4 flex flex-col min-h-[240px] time-pick-col w-full">
            <p className="text-gray-900 text-sm font-semibold mb-1">
              {selectedDate ? formatDayLabel(selectedDate) : 'Select a date'}
            </p>
            <p className="text-gray-500 text-xs mono mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              pick a start time
            </p>

            <div className="time-slots-scroll flex-1 pr-1 space-y-2">
              {!selectedDate && (
                <p className="text-gray-500 text-xs leading-relaxed">Choose a day on the calendar.</p>
              )}
              {selectedDate && loadingSlots && <SkeletonList rows={4} />}
              {selectedDate && !loadingSlots && visibleSlots.length === 0 && (
                <p className="text-gray-500 text-xs leading-relaxed">
                  No open slots — fully booked for this charger.
                </p>
              )}
              {selectedDate &&
                visibleSlots.map((slot) => (
                  <button
                    key={slot.from}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`time-slot${selectedSlot?.from === slot.from ? ' selected' : ''}`}
                  >
                    <span className="time-slot-range">
                      {format12(slot.from)} – {format12(slot.to)}
                    </span>
                  </button>
                ))}
            </div>

            {selectedSlot && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="label-text text-xs mono uppercase tracking-widest mb-1">Your booking</p>
                <p className="text-green-700 text-xs mono leading-snug">
                  {format12(selectedSlot.from)} – {format12(selectedSlot.to)}
                </p>
              </div>
            )}
          </div>

          <div className="card-inner rounded-xl p-4 flex flex-col min-h-[240px]">
            <p className="text-gray-900 text-sm font-semibold mb-1">Already booked</p>
            <p className="text-gray-500 text-xs mono mb-3">This charger · {charger.name}</p>
            <div className="booked-panel-scroll flex-1 pr-1">
              {!selectedDate && (
                <p className="text-gray-500 text-xs">Select a date to see bookings.</p>
              )}
              {selectedDate && (
                <p className="text-gray-500 text-xs">
                  The backend exposes free slots only on this screen. Booked-time details are not part of this user API.
                </p>
              )}
            </div>
          </div>
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
            disabled={!canSubmit}
            className="btn-green flex-1 rounded-xl py-3 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Confirming...' : 'Confirm Booking'}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l4 4 6-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </form>
    </BookingLayout>
  )
}

export default SelectSchedule
