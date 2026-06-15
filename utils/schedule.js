export const DAY_START_MINS = 6 * 60
export const DAY_END_MINS = 22 * 60
export const SLOT_INTERVAL = 30

export const getWindowMins = (type) => (type === 'DC' ? 150 : 240)

export const toDateStr = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const getBookableDates = (count = 3) => {
  const dates = []
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  for (let i = 0; i < count; i++) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    dates.push(toDateStr(day))
  }
  return dates
}

export const timeToMins = (t) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export const minsToTime = (mins) => {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const format12 = (time24) => {
  const [h, m] = time24.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

const overlaps = (start, end, bFrom, bTo) =>
  start < timeToMins(bTo) && end > timeToMins(bFrom)

export const getAvailableSlots = (booked, windowMins) => {
  const slots = []
  let t = DAY_START_MINS

  while (t + windowMins <= DAY_END_MINS) {
    const end = t + windowMins
    const taken = booked.some((b) => overlaps(t, end, b.from, b.to))

    if (taken) {
      t += SLOT_INTERVAL
    } else {
      slots.push({ from: minsToTime(t), to: minsToTime(end) })
      t = end
    }
  }

  return slots
}

export const getScheduleInfoBanner = (type) => {
  const label =
    type === 'DC'
      ? '⚡ DC fast charger — 2.5 hour window'
      : '🔌 AC charger — 4 hour window'
  return `${label} · Slots are back-to-back; booked times are skipped`
}

export const formatDayLabel = (dateStr) => {
  const d = new Date(`${dateStr}T12:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export const buildMonthGrid = (referenceDate, bookableSet, todayStr) => {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []

  for (let i = 0; i < firstDay.getDay(); i++) {
    cells.push({ empty: true, key: `pad-${i}` })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push({
      key: dateStr,
      day,
      dateStr,
      inWindow: bookableSet.has(dateStr),
      isToday: dateStr === todayStr,
    })
  }

  return { year, month, cells }
}
