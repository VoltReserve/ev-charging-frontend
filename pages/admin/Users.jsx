import { useEffect, useMemo, useState } from 'react'
import { adminApi, getErrorMessage, unwrapList } from '../../src/lib/api'
import Modal from '../../components/admin/Modal'
import { SkeletonAvatar, SkeletonForm, SkeletonTable, SkeletonText } from '../../components/ui/skeleton-blocks'

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

const DetailRow = ({ label, value, mono }) => (
  <div className="flex justify-between gap-4 py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-gray-500 text-xs uppercase tracking-widest mono">{label}</span>
    <span className={`text-sm text-gray-900 text-right ${mono ? 'mono text-xs' : ''}`}>{value || '—'}</span>
  </div>
)

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [bookings, setBookings] = useState([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const response = await adminApi.getRegisteredUsers()
        if (cancelled) return
        setUsers(unwrapList(response.data, ['users']))
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load users'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return users
    return users.filter((user) =>
      [user.fullName, user.mobile, user.carModel, user.registrationNumber]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    )
  }, [users, query])

  const openUser = async (user) => {
    setSelected(user)
    setBookings([])
    setDetailError('')
    setDetailLoading(true)
    try {
      const response = await adminApi.getRegisteredUser(user.id)
      const payload = response.data?.data || response.data
      setSelected(payload.user || user)
      setBookings(unwrapList(payload, ['bookings']))
    } catch (err) {
      setDetailError(getErrorMessage(err, 'Failed to load user details'))
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div>
      <p className="text-gray-500 text-sm mb-6">
        All registered users. Select a row to see full profile and booking history.
      </p>

      {error && <p className="err-text text-sm mb-4">{error}</p>}

      <div className="mb-4">
        {loading ? (
          <SkeletonText className="h-11 w-full rounded-xl" />
        ) : (
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, mobile, car, or registration"
            className="inp w-full rounded-xl px-4 py-2.5 text-sm"
          />
        )}
      </div>

      {loading ? (
        <SkeletonTable rows={6} cols={6} />
      ) : (
        <div className="admin-table-scroll rounded-xl">
          <div className="admin-table-wrap min-w-[720px]">
            <table className="admin-table w-full text-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Car model</th>
                  <th>Registration</th>
                  <th>Bookings</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-8">
                      No registered users found.
                    </td>
                  </tr>
                )}
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="cursor-pointer"
                    onClick={() => openUser(user)}
                  >
                    <td className="font-medium">{user.fullName || '—'}</td>
                    <td className="mono text-xs">{user.mobile || '—'}</td>
                    <td>{user.carModel || '—'}</td>
                    <td className="mono text-xs">{user.registrationNumber || '—'}</td>
                    <td className="mono text-xs">{user.totalBookings ?? 0}</td>
                    <td className="mono text-xs">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => {
          setSelected(null)
          setBookings([])
          setDetailError('')
        }}
        title={selected?.fullName || 'User details'}
      >
        {detailError && <p className="err-text text-sm mb-3">{detailError}</p>}
        {detailLoading && (
          <div className="mb-5">
            <div className="mb-4 flex items-center gap-3">
              <SkeletonAvatar className="size-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <SkeletonText className="h-4 w-40" />
                <SkeletonText className="h-3 w-24" />
              </div>
            </div>
            <SkeletonForm fields={4} />
          </div>
        )}

        {selected && !detailLoading && (
          <div className="mb-5">
            <DetailRow label="Full name" value={selected.fullName} />
            <DetailRow label="Mobile" value={selected.mobile} mono />
            <DetailRow label="Car model" value={selected.carModel} />
            <DetailRow label="Registration" value={selected.registrationNumber} mono />
            <DetailRow label="Verified" value={selected.isVerified ? 'Yes' : 'No'} />
            <DetailRow label="Bookings" value={String(selected.totalBookings ?? bookings.length)} mono />
            <DetailRow label="Joined" value={formatDate(selected.createdAt)} mono />
          </div>
        )}

        {!detailLoading && (
          <>
        <h3 className="text-gray-900 font-semibold text-sm mb-2">Bookings</h3>
        {bookings.length === 0 ? (
          <p className="text-gray-400 text-sm">No bookings for this user.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {bookings.map((booking) => (
              <div key={booking.bookingId} className="rounded-lg border border-gray-200 px-3 py-2">
                <p className="mono text-xs text-green-700">{booking.bookingId}</p>
                <p className="text-sm text-gray-900 mt-0.5">
                  {booking.station} · {booking.charger}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {booking.bookingDate} · {formatTime(booking.startTime)} – {formatTime(booking.endTime)} · {booking.status}
                </p>
              </div>
            ))}
          </div>
        )}
          </>
        )}
      </Modal>
    </div>
  )
}

export default Users
