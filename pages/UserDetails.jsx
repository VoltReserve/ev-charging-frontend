import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BookingLayout from '../layout/BookingLayout'

const UserDetails = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const saved = location.state?.userDetails
  const loginMobile = location.state?.mobile ?? saved?.mobile?.replace(/^\+91\s?/, '') ?? ''

  const [form, setForm] = useState({
    name: saved?.name ?? '',
    mobile: saved?.mobile ?? (loginMobile ? `+91 ${loginMobile}` : ''),
    carModel: saved?.carModel ?? '',
    carNumber: saved?.carNumber ?? '',
  })

  const updateField = (field) => (e) => {
    let value = e.target.value
    if (field === 'carNumber') value = value.toUpperCase()
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/book/station', { state: { userDetails: form } })
  }

  return (
    <BookingLayout currentStep={1}>
      <div className="mb-5">
        <h2 className="page-title text-lg font-semibold">Your details</h2>
        <p className="page-sub text-sm mt-1">Tell us about you and your vehicle</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block label-text text-xs mono uppercase tracking-widest mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={updateField('name')}
              placeholder="Name"
              className="inp w-full rounded-xl px-4 py-3 text-sm"
              required
            />
          </div>
          <div>
            <label className="block label-text text-xs mono uppercase tracking-widest mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              value={form.mobile}
              onChange={updateField('mobile')}
              placeholder="+91 98765 43210"
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
              Car Number
            </label>
            <input
              type="text"
              value={form.carNumber}
              onChange={updateField('carNumber')}
              placeholder="e.g. KL 01 AB 1234"
              className="inp w-full rounded-xl px-4 py-3 text-sm uppercase"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-green w-full mt-6 rounded-xl py-3 text-white text-sm font-semibold flex items-center justify-center gap-2"
        >
          Continue
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </BookingLayout>
  )
}

export default UserDetails
