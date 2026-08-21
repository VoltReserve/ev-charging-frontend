import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Shield, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { useAuth } from '../../src/context/AuthContext'
import { adminApi, getErrorMessage, unwrapList } from '../../src/lib/api'
import { SkeletonCard } from '../../components/ui/skeleton-blocks'

const emptyForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const initials = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return 'A'
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

const formatJoined = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const Settings = () => {
  const navigate = useNavigate()
  const { admin, logout } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadAdmins = async () => {
    const response = await adminApi.getAdmins()
    setAdmins(unwrapList(response.data, ['admins']))
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await loadAdmins()
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load admins'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setError('')
    setSuccess('')
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Name, email, and password are required')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSaving(true)
    try {
      await adminApi.createAdmin({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      setForm(emptyForm)
      setSuccess('Admin account created successfully')
      await loadAdmins()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create admin account'))
    } finally {
      setSaving(false)
    }
  }

  const signOut = () => {
    logout()
    navigate('/admin-login', { replace: true })
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      <div className="xl:col-span-12">
        <p className="text-sm text-gray-500">
          Manage who can access this panel. New admins sign in from the admin login page.
        </p>
      </div>

      <section className="admin-panel flex flex-col rounded-xl p-5 sm:p-6 xl:col-span-8">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <UserPlus className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Create admin account</h2>
            <p className="mt-1 text-sm text-gray-500">
              Add another operator with full access to stations, bookings, and reports.
            </p>
          </div>
        </div>

        {error && <p className="err-text mb-4 text-sm">{error}</p>}
        {success && <p className="info-text mb-4 text-sm">{success}</p>}

        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-text mono mb-1.5 block text-xs uppercase tracking-widest">Name</label>
            <input
              className="inp w-full rounded-xl px-4 py-2.5 text-sm"
              value={form.name}
              onChange={updateField('name')}
              placeholder="Admin name"
              required
            />
          </div>
          <div>
            <label className="label-text mono mb-1.5 block text-xs uppercase tracking-widest">Email</label>
            <input
              type="email"
              className="inp w-full rounded-xl px-4 py-2.5 text-sm"
              value={form.email}
              onChange={updateField('email')}
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="label-text mono mb-1.5 block text-xs uppercase tracking-widest">Password</label>
            <input
              type="password"
              className="inp w-full rounded-xl px-4 py-2.5 text-sm"
              value={form.password}
              onChange={updateField('password')}
              minLength={6}
              placeholder="At least 6 characters"
              required
            />
          </div>
          <div>
            <label className="label-text mono mb-1.5 block text-xs uppercase tracking-widest">Confirm password</label>
            <input
              type="password"
              className="inp w-full rounded-xl px-4 py-2.5 text-sm"
              value={form.confirmPassword}
              onChange={updateField('confirmPassword')}
              minLength={6}
              placeholder="Repeat password"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-green rounded-xl px-5 py-2.5 text-sm font-semibold"
            >
              {saving ? 'Creating...' : 'Create admin'}
            </button>
          </div>
        </form>
      </section>

      <aside className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
        <section className="admin-panel rounded-xl p-5 sm:p-6">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Signed in as</h2>
              <p className="mt-1 text-xs text-gray-500">Current session</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
              {initials(admin?.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{admin?.name || 'Admin'}</p>
              <p className="mono mt-0.5 truncate text-xs text-gray-500">{admin?.email || '—'}</p>
            </div>
          </div>
        </section>

        <section className="admin-panel flex flex-col justify-between rounded-xl p-5 sm:p-6">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <LogOut className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Session</h2>
              <p className="mt-1 text-sm text-gray-500">Sign out of the admin panel on this device.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="admin-btn-sm admin-btn-danger w-full rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            Sign out
          </button>
        </section>
      </aside>

      <section className="admin-panel rounded-xl p-5 sm:p-6 xl:col-span-12">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Users className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Admin accounts</h2>
              <p className="mt-1 text-sm text-gray-500">People who can access this panel.</p>
            </div>
          </div>
          {!loading && (
            <span className="admin-badge admin-badge-green shrink-0">{admins.length} total</span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : admins.length === 0 ? (
          <p className="text-sm text-gray-400">No admin accounts found.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {admins.map((row) => {
              const isCurrent = admin?.email && row.email === admin.email
              const joined = formatJoined(row.createdAt)
              return (
                <li
                  key={row.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                    {initials(row.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-gray-900">{row.name}</p>
                      {isCurrent && (
                        <span className="admin-badge admin-badge-green shrink-0">You</span>
                      )}
                    </div>
                    <p className="mono mt-0.5 truncate text-xs text-gray-500">{row.email}</p>
                    {joined && (
                      <p className="mt-1 text-[11px] text-gray-400">Joined {joined}</p>
                    )}
                  </div>
                  <Shield className="size-4 shrink-0 text-gray-300" />
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default Settings
