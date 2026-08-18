import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../src/context/AuthContext'
import { getErrorMessage, userApi } from '../src/lib/api'

const Avatar = ({ name }) => {
  const initials = (name || '?')
    .trim()
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center shrink-0 text-white font-bold text-base select-none">
      {initials}
    </div>
  )
}

const UserProfilePanel = ({ onClose }) => {
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuth()

  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    carModel: user?.carModel ?? '',
    registrationNumber: user?.registrationNumber ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const mobile = user?.mobile ?? ''

  const handleChange = (field) => (e) => {
    let val = e.target.value
    if (field === 'registrationNumber') val = val.toUpperCase()
    setForm((prev) => ({ ...prev, [field]: val }))
    setSuccess(false)
    setError('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const response = await userApi.updateProfile({
        fullName: form.fullName.trim(),
        carModel: form.carModel.trim(),
        registrationNumber: form.registrationNumber.trim().toUpperCase(),
      })
      const returnedUser = response.data?.user ?? response.data?.data?.user
      updateUser(
        returnedUser ?? {
          fullName: form.fullName.trim(),
          carModel: form.carModel.trim(),
          registrationNumber: form.registrationNumber.trim().toUpperCase(),
        },
      )
      setSuccess(true)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save profile'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile-panel-overlay" onClick={onClose}>
      <div
        className="profile-panel card rounded-2xl p-5 w-80 max-w-[92vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Avatar name={form.fullName || user?.fullName} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {form.fullName || 'Your Profile'}
            </p>
            <p className="text-gray-500 text-xs mono mt-0.5">+91 {mobile}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1 shrink-0"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          {/* Phone — read only */}
          <div>
            <label className="block label-text text-xs mono uppercase tracking-widest mb-1.5">
              Mobile
            </label>
            <div className="inp rounded-xl px-4 py-2.5 text-sm mono bg-gray-50 text-gray-400 cursor-not-allowed select-none flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                <rect x="1" y="1" width="10" height="10" rx="2" stroke="#9ca3af" strokeWidth="1.2" />
                <path d="M4 5h4M4 7h2" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              +91 {mobile}
            </div>
          </div>

          <div>
            <label className="block label-text text-xs mono uppercase tracking-widest mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={handleChange('fullName')}
              placeholder="Your name"
              className="inp w-full rounded-xl px-4 py-2.5 text-sm"
              required
            />
          </div>

          <div>
            <label className="block label-text text-xs mono uppercase tracking-widest mb-1.5">
              Car Model
            </label>
            <input
              type="text"
              value={form.carModel}
              onChange={handleChange('carModel')}
              placeholder="e.g. Tata Nexon EV"
              className="inp w-full rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block label-text text-xs mono uppercase tracking-widest mb-1.5">
              Registration Number
            </label>
            <input
              type="text"
              value={form.registrationNumber}
              onChange={handleChange('registrationNumber')}
              placeholder="e.g. KL07AB1234"
              className="inp w-full rounded-xl px-4 py-2.5 text-sm uppercase"
            />
          </div>

          {error && (
            <p className="err-text text-xs">{error}</p>
          )}

          {success && (
            <p className="text-green-600 text-xs mono flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Profile saved
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn-green w-full rounded-xl py-2.5 text-white text-sm font-semibold mt-1"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              logout()
              onClose()
              navigate('/login', { replace: true })
            }}
            className="btn-cancel w-full rounded-xl py-2.5 text-sm font-semibold"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserProfilePanel
