import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login.jsx'
import UserDetails from '../pages/UserDetails.jsx'
import SelectStation from '../pages/SelectStation.jsx'
import SelectCharger from '../pages/SelectCharger.jsx'
import SelectSchedule from '../pages/SelectSchedule.jsx'
import BookingSuccess from '../pages/BookingSuccess.jsx'
import AdminLayout from '../layout/AdminLayout.jsx'
import Dashboard from '../pages/admin/Dashboard.jsx'
import Network from '../pages/admin/Network.jsx'
import Bookings from '../pages/admin/Bookings.jsx'
import Reports from '../pages/admin/Reports.jsx'
import Settings from '../pages/admin/Settings.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/book/details" element={<UserDetails />} />
        <Route path="/book/station" element={<SelectStation />} />
        <Route path="/book/charger" element={<SelectCharger />} />
        <Route path="/book/schedule" element={<SelectSchedule />} />
        <Route path="/book/success" element={<BookingSuccess />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="network" element={<Network />} />
          <Route path="stations" element={<Navigate to="/admin/network" replace />} />
          <Route path="chargers" element={<Navigate to="/admin/network" replace />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
