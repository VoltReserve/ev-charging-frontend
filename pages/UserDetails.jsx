import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BookingLayout from '../layout/BookingLayout'
import { useAuth } from '../src/context/AuthContext'
import { getErrorMessage, userApi } from '../src/lib/api'

const UserDetails = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginUser, updateUser, user, isUser } = useAuth()

  // location.state?.mobile  — raw 10-digit string from OTP step (new user)
  // location.state?.userDetails — pre-built object on back-navigation
  // user (AuthContext) — full profile for already-logged-in users
  const saved = location.state?.userDetails
  const stateMobile = location.state?.mobile ?? ''  // already plain 10-digit from backend

  const resolvedMobile =
    saved?.mobile?.replace(/\D/g, '').slice(-10) ||
    stateMobile.replace(/\D/g, '').slice(-10) ||
    user?.mobile ||
    ''

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name:      saved?.name      ?? user?.fullName          ?? '',
    carModel:  saved?.carModel  ?? user?.carModel          ?? '',
    carNumber: saved?.carNumber ?? user?.registrationNumber ?? '',
  })

  const updateField = (field) => (e) => {
    let value = e.target.value
    if (field === 'carNumber') value = value.toUpperCase()
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        mobile: resolvedMobile,
        fullName: form.name.trim(),
        carModel: form.carModel.trim(),
        registrationNumber: form.carNumber.trim().toUpperCase(),
      }

      const response = await userApi.completeProfile(payload)
      const data = response.data?.data || response.data
      // Backend returns same full-user shape as verify-otp for consistency
      const returnedUser = data?.user ?? {}

      if (data?.token) {
        loginUser({ token: data.token, user: returnedUser })
      } else if (isUser) {
        updateUser({
          fullName: payload.fullName,
          carModel: payload.carModel,
          registrationNumber: payload.registrationNumber,
        })
      }

      navigate('/book/station', {
        state: {
          userDetails: {
            name: form.name.trim(),
            mobile: `+91 ${resolvedMobile}`,
            carModel: form.carModel.trim(),
            carNumber: form.carNumber.trim().toUpperCase(),
          },
        },
      })
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save details'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BookingLayout currentStep={1}>
      <div className="mb-5">
        <h2 className="page-title text-lg font-semibold">Your details</h2>
        <p className="page-sub text-sm mt-1">Confirm your info before booking</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 rounded-xl err-box p-3">
            <p className="err-text text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Mobile — always read-only */}
          <div>
            <label className="block label-text text-xs mono uppercase tracking-widest mb-2">
              Mobile Number
            </label>
            <div className="inp rounded-xl px-4 py-3 text-sm mono text-gray-400 bg-gray-50 cursor-not-allowed flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                <rect x="1" y="1" width="10" height="10" rx="2" stroke="#9ca3af" strokeWidth="1.2" />
                <path d="M4 5h4M4 7h2" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {resolvedMobile ? `+91 ${resolvedMobile}` : '—'}
            </div>
          </div>

          <div>
            <label className="block label-text text-xs mono uppercase tracking-widest mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={updateField('name')}
              placeholder="Mohammed Althaf"
              className="inp w-full rounded-xl px-4 py-3 text-sm"
              required
            />
          </div>

          <div>
            <label className="block label-text text-xs mono uppercase tracking-widest mb-2">
              Car Model
            </label>
            <input
              type="text"
              value={form.carModel}
              onChange={updateField('carModel')}
              placeholder="e.g. Tata Nexon EV"
              className="inp w-full rounded-xl px-4 py-3 text-sm"
              required
            />
          </div>

          <div>
            <label className="block label-text text-xs mono uppercase tracking-widest mb-2">
              Registration Number
            </label>
            <input
              type="text"
              value={form.carNumber}
              onChange={updateField('carNumber')}
              placeholder="e.g. KL07AB1234"
              className="inp w-full rounded-xl px-4 py-3 text-sm uppercase"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-green w-full mt-6 rounded-xl py-3 text-white text-sm font-semibold flex items-center justify-center gap-2"
        >
          {submitting ? 'Saving...' : 'Continue'}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </BookingLayout>
  )
}

export default UserDetails
