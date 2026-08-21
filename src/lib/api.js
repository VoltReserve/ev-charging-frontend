import axios from 'axios'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:7000').replace(/\/$/, '')
const SESSION_KEY = 'ev-auth-session-v1'

const getSession = () => {
  try {
    const saved = localStorage.getItem(SESSION_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

const createClient = () =>
  axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

export const api = createClient()
export const adminHttp = createClient()

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    adminHttp.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
    delete adminHttp.defaults.headers.common.Authorization
  }
}

api.interceptors.request.use((config) => {
  const session = getSession()
  if (session?.role === 'user' && session.token) {
    config.headers.Authorization = `Bearer ${session.token}`
  }
  return config
})

adminHttp.interceptors.request.use((config) => {
  const isLogin = String(config.url || '').includes('/api/admin/login')
  if (!isLogin) {
    const session = getSession()
    if (session?.role === 'admin' && session.token) {
      config.headers.Authorization = `Bearer ${session.token}`
    }
  }
  return config
})

export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  )
}

export const unwrapList = (data, keys = []) => {
  if (Array.isArray(data)) return data
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key]
  }
  if (Array.isArray(data?.data)) return data.data
  return []
}

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const downloadAdminFile = async (path, filename) => {
  const response = await adminHttp.get(path, { responseType: 'blob' })
  const type = response.headers['content-type'] || ''
  if (type.includes('application/json')) {
    const text = await response.data.text()
    const json = JSON.parse(text)
    throw new Error(json.message || 'Download failed')
  }
  downloadBlob(response.data, filename)
}

export const userApi = {
  sendOtp: (mobile) => api.post('/api/auth/send-otp', { mobile }),
  verifyOtp: (mobile, otp) => api.post('/api/auth/verify-otp', { mobile, otp }),
  completeProfile: (payload) => api.post('/api/auth/complete-profile', payload),
  getStations: () => api.get('/api/stations'),
  getStation: (id) => api.get(`/api/stations/${id}`),
  getChargersByStation: (stationId) => api.get(`/api/chargers/station/${stationId}`),
  getAvailableSlots: ({ stationId, chargerId, date }) =>
    api.get('/api/bookings/available-slots', {
      params: { stationId, chargerId, date },
    }),
  updateProfile: (payload) => api.put('/api/auth/profile', payload),
  createBooking: (payload) => api.post('/api/bookings', payload),
  getMyBookings: () => api.get('/api/bookings/my-bookings'),
  cancelBooking: (id) => api.put(`/api/bookings/${id}/cancel`),
}

export const adminApi = {
  login: ({ email, password }) => adminHttp.post('/api/admin/login', { email, password }),
  getDashboard: () => adminHttp.get('/api/admin/dashboard'),
  getStations: () => adminHttp.get('/api/admin/stations'),
  createStation: (payload) => adminHttp.post('/api/stations', payload),
  updateStation: (id, payload) => adminHttp.put(`/api/stations/${id}`, payload),
  updateStationStatus: (id, status) => adminHttp.put(`/api/stations/${id}/status`, { status }),
  getChargers: () => adminHttp.get('/api/admin/chargers'),
  getCharger: (id) => adminHttp.get(`/api/chargers/${id}`),
  createCharger: (payload) => adminHttp.post('/api/chargers', payload),
  updateCharger: (id, payload) => adminHttp.put(`/api/chargers/${id}`, payload),
  updateChargerStatus: (id, status) => adminHttp.put(`/api/chargers/${id}/status`, { status }),
  getBookingsReport: () => adminHttp.get('/api/admin/reports/bookings'),
  getBookingsByStation: () => adminHttp.get('/api/admin/reports/bookings-by-station'),
  getChargerUtilization: () => adminHttp.get('/api/admin/reports/charger-utilization'),
  getActiveBookings: () => adminHttp.get('/api/admin/reports/active-bookings'),
  getUpcomingBookings: () => adminHttp.get('/api/admin/reports/upcoming-bookings'),
  getCompletedBookings: () => adminHttp.get('/api/admin/reports/completed-bookings'),
  getCancelledBookings: () => adminHttp.get('/api/admin/reports/cancelled-bookings'),
  getDateWise: (from, to) => adminHttp.get('/api/admin/reports/date-wise', { params: { from, to } }),
  getUsers: () => adminHttp.get('/api/admin/reports/users'),
  getRegisteredUsers: () => adminHttp.get('/api/admin/users'),
  getRegisteredUser: (id) => adminHttp.get(`/api/admin/users/${id}`),
  getAdmins: () => adminHttp.get('/api/admin/admins'),
  createAdmin: (payload) => adminHttp.post('/api/admin/admins', payload),
  exportCsv: () => downloadAdminFile('/api/admin/reports/export/csv', 'bookings_report.csv'),
  exportExcel: () => downloadAdminFile('/api/admin/reports/export/excel', 'Bookings_Report.xlsx'),
}
