import { createContext, useContext, useMemo, useState } from 'react'
import {
  DEFAULT_EV_NETWORK,
  getAllBookingsFlat,
  getBookingsForChargerOnDateFromNetwork,
  getChargerFromNetwork,
  getChargersForStationFromNetwork,
  getStationFromNetwork,
  getStationsFromNetwork,
  slugify,
} from '../../data/evNetwork'

const STORAGE_KEY = 'ev-network-v1'

const loadNetwork = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    /* use default */
  }
  return structuredClone(DEFAULT_EV_NETWORK)
}

const NetworkContext = createContext(null)

export const NetworkProvider = ({ children }) => {
  const [network, setNetwork] = useState(loadNetwork)

  const persist = (next) => {
    setNetwork(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const stations = useMemo(() => getStationsFromNetwork(network), [network])
  const allBookings = useMemo(() => getAllBookingsFlat(network), [network])

  const value = {
    network,
    stations,
    allBookings,

    getStation: (stationId) => getStationFromNetwork(network, stationId),
    getChargersForStation: (stationId) => getChargersForStationFromNetwork(network, stationId),
    getCharger: (stationId, chargerId) => getChargerFromNetwork(network, stationId, chargerId),
    getBookingsForChargerOnDate: (chargerId, dateStr) =>
      getBookingsForChargerOnDateFromNetwork(network, chargerId, dateStr),

    addStation: ({ name, status = 'open', id }) => {
      const stationId = id || slugify(name)
      if (network.some((s) => s.id === stationId)) return false
      persist([...network, { id: stationId, name, status, chargers: [] }])
      return true
    },

    updateStation: (stationId, updates) => {
      persist(
        network.map((s) => (s.id === stationId ? { ...s, ...updates } : s)),
      )
    },

    deleteStation: (stationId) => {
      persist(network.filter((s) => s.id !== stationId))
    },

    addCharger: (stationId, charger) => {
      persist(
        network.map((s) => {
          if (s.id !== stationId) return s
          if (s.chargers.some((c) => c.id === charger.id)) return s
          return {
            ...s,
            chargers: [...s.chargers, { ...charger, bookings: charger.bookings ?? [] }],
          }
        }),
      )
    },

    updateCharger: (stationId, chargerId, updates) => {
      persist(
        network.map((s) => {
          if (s.id !== stationId) return s
          return {
            ...s,
            chargers: s.chargers.map((c) =>
              c.id === chargerId ? { ...c, ...updates } : c,
            ),
          }
        }),
      )
    },

    deleteCharger: (stationId, chargerId) => {
      persist(
        network.map((s) => {
          if (s.id !== stationId) return s
          return { ...s, chargers: s.chargers.filter((c) => c.id !== chargerId) }
        }),
      )
    },

    addBooking: (stationId, chargerId, booking) => {
      persist(
        network.map((s) => {
          if (s.id !== stationId) return s
          return {
            ...s,
            chargers: s.chargers.map((c) => {
              if (c.id !== chargerId) return c
              return { ...c, bookings: [...(c.bookings ?? []), booking] }
            }),
          }
        }),
      )
    },

    deleteBooking: (stationId, chargerId, bookingIndex) => {
      persist(
        network.map((s) => {
          if (s.id !== stationId) return s
          return {
            ...s,
            chargers: s.chargers.map((c) => {
              if (c.id !== chargerId) return c
              return {
                ...c,
                bookings: c.bookings.filter((_, i) => i !== bookingIndex),
              }
            }),
          }
        }),
      )
    },

    resetToDefault: () => {
      const fresh = structuredClone(DEFAULT_EV_NETWORK)
      persist(fresh)
    },
  }

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
}

export const useNetwork = () => {
  const ctx = useContext(NetworkContext)
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider')
  return ctx
}
