import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageShell from '../layout/PageShell'
import { useAuth } from '../src/context/AuthContext'
import { adminApi, getErrorMessage } from '../src/lib/api'

const AdminLogin = () => {
  const navigate = useNavigate()
  const { loginAdmin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const response = await adminApi.login({ email, password })
      const payload = response.data?.data || response.data
      loginAdmin({ token: payload.token, admin: payload.admin })
      navigate('/admin')
    } catch (err) {
      setError(getErrorMessage(err, 'Admin login failed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell title="Admin sign in">
      <div className="card rounded-2xl p-6">
        {error && (
          <div className="mb-4 rounded-xl err-box p-3">
            <p className="err-text text-sm">{error}</p>
          </div>
        )}

        <div className="mb-5">
          <h2 className="page-title text-lg font-semibold">Admin panel access</h2>
          <p className="page-sub text-sm mt-1">Sign in with your admin email and password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block label-text text-xs mono uppercase tracking-widest mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="inp w-full rounded-xl px-4 py-3 text-sm"
              required
            />
          </div>
          <div>
            <label className="block label-text text-xs mono uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="inp w-full rounded-xl px-4 py-3 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-green w-full rounded-xl py-3 text-white text-sm font-semibold"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
      <p className="text-center text-gray-400 text-xs mt-4">
        <Link to="/login" className="mono hover:text-green-700 transition-colors">
          User login
        </Link>
      </p>
    </PageShell>
  )
}

export default AdminLogin
