/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { adminApi, getErrorMessage, unwrapList, userApi } from '../lib/api'
import { useAuth } from './AuthContext'

const NetworkContext = createContext(null)

export const NetworkProvider = ({ children }) => {
  const { role, isAdmin, isUser } = useAuth()
  const [stations, setStations] = useState([])
  const [chargersByStation, setChargersByStation] = useState({})
  const [adminChargers, setAdminChargers] = useState([])
  const [allBookings, setAllBookings] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const normalizeStation = (station) => ({
    id: String(station._id || station.id || ''),
    name: station.stationName || station.name || 'Unnamed station',
    status: station.status || 'Inactive',
    guns: Number(station.chargersCount ?? station.guns ?? station.chargers?.length ?? 0),
    chargers: station.chargers ?? [],
  })

  const normalizeCharger = (charger) => ({
    id: String(charger._id || charger.id || ''),
    _id: charger._id || charger.id,
    name: charger.chargerCode || charger.name || 'Unnamed charger',
    chargerCode: charger.chargerCode || charger.name || '—',
    type: charger.chargerType || charger.type || '—',
    power: charger.powerRating || charger.power || '—',
    connector: charger.connector || charger.chargerType || '—',
    powerRating: charger.powerRating || charger.power || '—',
    slotDuration: charger.slotDuration ?? null,
    status: charger.status || 'Available',
    stationId: String(
      charger.stationId?._id ||
      charger.stationId?.id ||
      charger.stationId ||
      charger.station?._id ||
      '',
    ),
    stationName:
      charger.stationId?.stationName ||
      charger.stationId?.name ||
      charger.station?.stationName ||
      charger.station?.name ||
      '',
  })

  const normalizeBooking = (booking) => ({
    id: booking._id || booking.id,
    ref: booking.bookingId || booking.ref || '—',
    stationId: booking.stationId?._id || booking.stationId || '',
    stationName: booking.stationId?.stationName || booking.stationName || '—',
    chargerId: booking.chargerId?._id || booking.chargerId || '',
    chargerName:
      booking.chargerId?.chargerCode ||
      booking.chargerName ||
      booking.chargerId?.name ||
      '—',
    date: booking.bookingDate || booking.date || '—',
    from: booking.startTime || booking.from || '—',
    to: booking.endTime || booking.to || '—',
    carno: booking.userId?.registrationNumber || booking.carno || '—',
    customerName: booking.userId?.fullName || booking.customerName || '—',
    status: booking.status || 'Upcoming',
  })

  const network = useMemo(
    () =>
      stations.map((station) => ({
        id: station.id,
        name: station.name,
        status: station.status,
        guns: station.guns || chargersByStation[station.id]?.length || 0,
        chargers:
          chargersByStation[station.id]?.map((charger) => ({
            id: charger.id,
            name: charger.name,
            chargerCode: charger.chargerCode,
            type: charger.type,
            power: charger.power,
            powerRating: charger.powerRating,
            slotDuration: charger.slotDuration,
            status: charger.status,
          })) ?? [],
      })),
    [stations, chargersByStation],
  )

  const refreshPublicStations = async () => {
    const response = await userApi.getStations()
    const rows = unwrapList(response.data, ['stations'])
    const normalized = rows.map(normalizeStation)

    const grouped = {}
    await Promise.all(
      normalized.map(async (station) => {
        if (station.status !== 'Active') {
          grouped[station.id] = []
          return
        }
        try {
          const chargerRes = await userApi.getChargersByStation(station.id)
          grouped[station.id] = unwrapList(chargerRes.data, ['chargers']).map(normalizeCharger)
        } catch {
          grouped[station.id] = []
        }
      }),
    )

    setChargersByStation((prev) => ({ ...prev, ...grouped }))
    setStations(
      normalized.map((station) => ({
        ...station,
        guns: station.guns || grouped[station.id]?.length || 0,
      })),
    )
    return rows
  }

  const refreshAdminStations = async () => {
    const response = await adminApi.getStations()
    const rows = unwrapList(response.data, ['stations'])
    setStations(rows.map(normalizeStation))
    return rows
  }

  const refreshDashboard = async () => {
    if (!isAdmin) return null
    const response = await adminApi.getDashboard()
    setDashboard(response.data?.data || response.data)
    return response.data
  }

  const refreshAdminChargers = async () => {
    if (!isAdmin) return []
    const response = await adminApi.getChargers()
    const rows = unwrapList(response.data, ['chargers'])
    const normalized = rows.map(normalizeCharger)
    setAdminChargers(normalized)
    const grouped = normalized.reduce((acc, charger) => {
      if (!charger.stationId) return acc
      acc[charger.stationId] = [...(acc[charger.stationId] || []), charger]
      return acc
    }, {})
    setChargersByStation(grouped)
    return rows
  }

  const refreshMyBookings = async () => {
    if (!isUser) return []
    const response = await userApi.getMyBookings()
    const rows = unwrapList(response.data, ['bookings'])
    setAllBookings(rows.map(normalizeBooking))
    return rows
  }

  const refreshAdminCompletedBookings = async () => {
    if (!isAdmin) return []
    const response = await adminApi.getCompletedBookings()
    const rows = unwrapList(response.data, ['bookings'])
    setAllBookings(rows.map(normalizeBooking))
    return rows
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        if (role === 'admin') {
          await Promise.all([
            refreshDashboard(),
            refreshAdminStations(),
            refreshAdminChargers(),
            refreshAdminCompletedBookings(),
          ])
        } else {
          await refreshPublicStations()
          if (role === 'user') {
            await refreshMyBookings()
          } else {
            setAllBookings([])
          }
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load data'))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [role])

  const value = {
    network,
    stations,
    allBookings,
    adminChargers,
    dashboard,
    loading,
    error,

    refreshPublicStations,
    refreshAdminStations,
    refreshAdminChargers,
    refreshMyBookings,
    refreshDashboard,

    getStation: (stationId) => stations.find((station) => station.id === stationId),
    getChargersForStation: (stationId) => chargersByStation[stationId] ?? [],
    getCharger: (stationId, chargerId) =>
      (chargersByStation[stationId] ?? []).find((charger) => charger.id === chargerId),
    getBookingsForChargerOnDate: async (stationId, chargerId, dateStr) => {
      const response = await userApi.getAvailableSlots({
        stationId,
        chargerId,
        date: dateStr,
      })
      return response.data?.availableSlots ?? response.data?.data?.availableSlots ?? []
    },
    getStationDetails: async (stationId) => {
      const response = await userApi.getStation(stationId)
      return response.data?.data || response.data
    },
    loadChargersForStation: async (stationId) => {
      const response = await userApi.getChargersByStation(stationId)
      const rows = unwrapList(response.data, ['chargers'])
      const normalized = rows.map(normalizeCharger)
      setChargersByStation((prev) => ({ ...prev, [stationId]: normalized }))
      return normalized
    },
    createBooking: async (payload) => {
      const response = await userApi.createBooking(payload)
      await refreshMyBookings()
      const data = response.data?.data || response.data
      return data?.booking || data
    },
    cancelBooking: async (bookingId) => {
      const response = await userApi.cancelBooking(bookingId)
      await refreshMyBookings()
      return response.data?.data || response.data
    },
    addStation: async ({ name, status }) => {
      await adminApi.createStation({ stationName: name, status })
      await refreshAdminStations()
      return true
    },
    updateStation: async (stationId, updates) => {
      await adminApi.updateStation(stationId, {
        stationName: updates.name,
        status: updates.status,
      })
      await refreshAdminStations()
    },
    updateStationStatus: async (stationId, status) => {
      await adminApi.updateStationStatus(stationId, status)
      await refreshAdminStations()
    },
    addCharger: async (stationId, charger) => {
      await adminApi.createCharger({
        stationId,
        chargerCode: charger.chargerCode,
        chargerType: charger.chargerType,
        powerRating: charger.powerRating,
        slotDuration: Number(charger.slotDuration),
        status: charger.status,
      })
      await refreshAdminChargers()
    },
    updateCharger: async (_stationId, chargerId, updates) => {
      await adminApi.updateCharger(chargerId, {
        chargerCode: updates.chargerCode,
        chargerType: updates.chargerType,
        powerRating: updates.powerRating,
        slotDuration: Number(updates.slotDuration),
      })
      if (updates.status) {
        await adminApi.updateChargerStatus(chargerId, updates.status)
      }
      await refreshAdminChargers()
    },
    updateChargerStatus: async (_stationId, chargerId, status) => {
      await adminApi.updateChargerStatus(chargerId, status)
      await refreshAdminChargers()
    },
    deleteBooking: async (bookingId) => {
      await userApi.cancelBooking(bookingId)
      if (isAdmin) {
        await refreshAdminCompletedBookings()
      } else {
        await refreshMyBookings()
      }
    },
  }

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
}

export const useNetwork = () => {
  const ctx = useContext(NetworkContext)
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider')
  return ctx
}
