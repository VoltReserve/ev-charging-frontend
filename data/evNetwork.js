import { getBookableDates } from '../utils/schedule'

/** Default seed data — loaded on first visit; admin edits persist in localStorage. */
export const DEFAULT_EV_NETWORK = [
  {
    id: 'vismaya',
    name: 'Vismaya',
    status: 'open',
    chargers: [
      {
        id: 'INFCMD001-G1',
        name: 'INFCMD001 — Gun 1',
        connector: 'CCS2',
        power: '60kW',
        type: 'DC',
        status: 'available',
        bookings: [
          { dayOffset: 0, from: '06:00', to: '08:30', carno: 'KL 01 AB 1234' },
          { dayOffset: 0, from: '14:00', to: '16:30', carno: 'KL 07 CD 5678' },
          { dayOffset: 1, from: '10:00', to: '12:30', carno: 'KL 09 EF 9012' },
        ],
      },
      {
        id: 'INFCMD001-G2',
        name: 'INFCMD001 — Gun 2',
        connector: 'CCS2',
        power: '60kW',
        type: 'DC',
        status: 'available',
        bookings: [{ dayOffset: 0, from: '09:00', to: '11:30', carno: 'KL 05 GH 3456' }],
      },
      {
        id: 'INFCMD002',
        name: 'INFCMD002',
        connector: 'Type 2',
        power: '7.4kW',
        type: 'AC',
        status: 'available',
        bookings: [
          { dayOffset: 0, from: '08:00', to: '12:00', carno: 'KL 02 IJ 7890' },
          { dayOffset: 2, from: '13:00', to: '17:00', carno: 'KL 11 KL 2468' },
        ],
      },
      {
        id: 'INFCMD003',
        name: 'INFCMD003',
        connector: 'Type 2',
        power: '7.4kW',
        type: 'AC',
        status: 'available',
        bookings: [],
      },
    ],
  },
  {
    id: 'athulya',
    name: 'Athulya',
    status: 'offline',
    chargers: [
      {
        id: 'ATHCMD001',
        name: 'ATHCMD001 — Gun 1',
        connector: 'CCS2',
        power: '50kW',
        type: 'DC',
        status: 'offline',
        bookings: [],
      },
      {
        id: 'ATHCMD002',
        name: 'ATHCMD002',
        connector: 'Type 2',
        power: '7.4kW',
        type: 'AC',
        status: 'offline',
        bookings: [],
      },
    ],
  },
  {
    id: 'park-center',
    name: 'Park Center',
    status: 'open',
    chargers: [
      {
        id: 'PKCMD001',
        name: 'PKCMD001',
        connector: 'Type 2',
        power: '7.4kW',
        type: 'AC',
        status: 'available',
        bookings: [{ dayOffset: 1, from: '07:00', to: '11:00', carno: 'KL 03 MN 1357' }],
      },
    ],
  },
]

export const STATION_STATUSES = ['open', 'closed', 'offline']
export const CHARGER_STATUSES = ['available', 'closed', 'offline']
export const CHARGER_TYPES = ['DC', 'AC']

const dayOffsetForDate = (dateStr) => {
  const bookable = getBookableDates(3)
  return bookable.indexOf(dateStr)
}

export const getStationsFromNetwork = (network) =>
  network.map(({ id, name, status, chargers }) => ({
    id,
    name,
    status,
    guns: chargers.length,
  }))

export const getStationFromNetwork = (network, stationId) =>
  getStationsFromNetwork(network).find((s) => s.id === stationId)

export const getChargersForStationFromNetwork = (network, stationId) => {
  const station = network.find((s) => s.id === stationId)
  if (!station) return []
  return station.chargers.map((charger) => {
    const { bookings, ...rest } = charger
    void bookings
    return rest
  })
}

export const getChargerFromNetwork = (network, stationId, chargerId) =>
  getChargersForStationFromNetwork(network, stationId).find((c) => c.id === chargerId)

export const isStationSelectable = (station) => station.status === 'open'
export const isChargerSelectable = (charger) => charger.status === 'available'

export const getStationSubtitle = (station) => {
  if (station.status === 'offline') return '—'
  const count = station.guns ?? 0
  if (!count) return '—'
  return `${count} gun${count === 1 ? '' : 's'}`
}

export const getBookingWindowNote = (type) => {
  if (type === 'DC') return '⚡ DC fast charger — 2.5 hour booking window'
  return '🔌 AC charger — 4 hour booking window'
}

export const getBookingsForChargerOnDateFromNetwork = (network, chargerId, dateStr) => {
  const offset = dayOffsetForDate(dateStr)
  if (offset < 0) return []

  for (const station of network) {
    const charger = station.chargers.find((c) => c.id === chargerId)
    if (!charger) continue

    return (charger.bookings ?? []).filter((b) => {
      if (b.date) return b.date === dateStr
      return b.dayOffset === offset
    }).map(({ from, to, carno, ref, customerName }) => ({
      from,
      to,
      carno,
      ref,
      customerName,
    }))
  }

  return []
}

export const getAllBookingsFlat = (network) => {
  const rows = []
  const bookable = getBookableDates(3)

  for (const station of network) {
    for (const charger of station.chargers) {
      ;(charger.bookings ?? []).forEach((booking, bookingIndex) => {
        const date = booking.date ?? bookable[booking.dayOffset] ?? '—'
        rows.push({
          id: booking.ref ?? `${charger.id}-${date}-${booking.from}-${bookingIndex}`,
          ref: booking.ref ?? '—',
          stationId: station.id,
          stationName: station.name,
          chargerId: charger.id,
          chargerName: charger.name,
          bookingIndex,
          date,
          from: booking.from,
          to: booking.to,
          carno: booking.carno ?? '—',
          customerName: booking.customerName ?? '—',
        })
      })
    }
  }

  return rows.sort((a, b) => `${b.date}${b.from}`.localeCompare(`${a.date}${a.from}`))
}

export const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
