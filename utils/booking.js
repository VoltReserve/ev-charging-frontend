export const generateBookingRef = () => {
  const hex = Math.random().toString(16).slice(2, 10).toUpperCase()
  return `EV-${hex}`
}

export const formatConfirmDate = (dateStr) => {
  const d = new Date(`${dateStr}T12:00:00`)
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const formatTimeRange24 = (from, to) => `${from} – ${to}`

export const getMobileDigits = (mobile) => mobile.replace(/\D/g, '').slice(-10)

export const getVehicleLabel = (userDetails) => {
  const model = userDetails?.carModel?.trim() || '—'
  const number = userDetails?.carNumber?.trim() || '—'
  return `${model} · ${number}`
}

export const buildGoogleCalendarUrl = ({ stationName, chargerName, chargerType, chargerPower, dateStr, from, to }) => {
  const compactDate = dateStr.replace(/-/g, '')
  const start = `${compactDate}T${from.replace(':', '')}00`
  const end = `${compactDate}T${to.replace(':', '')}00`
  const text = encodeURIComponent(`EV Charging — ${stationName}`)
  const details = encodeURIComponent(`${chargerName} · ${chargerType} ${chargerPower}`)
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}`
}
