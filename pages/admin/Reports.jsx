import { useEffect, useState } from 'react'
import { adminApi, getErrorMessage, unwrapList } from '../../src/lib/api'
import StatCard from '../../components/admin/StatCard'

const formatTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

const BarList = ({ rows, nameKey, valueKey }) => {
  if (!rows.length) return <p className="text-gray-400 text-sm">No data yet.</p>
  const max = Math.max(...rows.map((row) => Number(row[valueKey] || 0)), 1)
  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        const value = Number(row[valueKey] || 0)
        const pct = Math.round((value / max) * 100)
        return (
          <li key={row[nameKey]}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{row[nameKey]}</span>
              <span className="mono text-xs text-gray-500">{value}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

const SimpleTable = ({ columns, rows, empty }) => (
  <div className="admin-table-scroll rounded-xl">
    <div className="admin-table-wrap min-w-[480px]">
      <table className="admin-table w-full text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center text-gray-400 py-8">
                {empty}
              </td>
            </tr>
          )}
          {rows.map((row, index) => (
            <tr key={row.bookingId || row.mobile || row.name || index}>
              {columns.map((col) => (
                <td key={col.key} className={col.mono ? 'mono text-xs' : ''}>
                  {col.render ? col.render(row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const Reports = () => {
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = `${today.slice(0, 8)}01`

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [from, setFrom] = useState(monthStart)
  const [to, setTo] = useState(today)
  const [dateWise, setDateWise] = useState(null)
  const [byStation, setByStation] = useState([])
  const [utilization, setUtilization] = useState([])
  const [active, setActive] = useState([])
  const [completed, setCompleted] = useState([])
  const [users, setUsers] = useState([])
  const [totalBookings, setTotalBookings] = useState(0)
  const [exporting, setExporting] = useState('')

  const fetchReports = async (rangeFrom, rangeTo) => {
    const [
      bookingsRes,
      stationRes,
      utilRes,
      activeRes,
      completedRes,
      usersRes,
      dateRes,
    ] = await Promise.all([
      adminApi.getBookingsReport(),
      adminApi.getBookingsByStation(),
      adminApi.getChargerUtilization(),
      adminApi.getActiveBookings(),
      adminApi.getCompletedBookings(),
      adminApi.getUsers(),
      adminApi.getDateWise(rangeFrom, rangeTo),
    ])

    return {
      totalBookings: bookingsRes.data?.totalBookings ?? 0,
      byStation: unwrapList(stationRes.data, ['stations', 'report']),
      utilization: unwrapList(utilRes.data, ['chargers', 'report']),
      active: unwrapList(activeRes.data, ['bookings']),
      completed: unwrapList(completedRes.data, ['bookings']),
      users: unwrapList(usersRes.data, ['users']),
      dateWise: dateRes.data?.data || dateRes.data,
    }
  }

  const applyReports = (data) => {
    setTotalBookings(data.totalBookings)
    setByStation(data.byStation)
    setUtilization(data.utilization)
    setActive(data.active)
    setCompleted(data.completed)
    setUsers(data.users)
    setDateWise(data.dateWise)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchReports(monthStart, today)
        if (cancelled) return
        applyReports(data)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load reports'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [monthStart, today])

  const handleApplyRange = async () => {
    setLoading(true)
    setError('')
    try {
      applyReports(await fetchReports(from, to))
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load reports'))
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (type) => {
    setExporting(type)
    setError('')
    try {
      if (type === 'csv') await adminApi.exportCsv()
      else await adminApi.exportExcel()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to export report'))
    } finally {
      setExporting('')
    }
  }

  return (
    <div>
      <p className="text-gray-500 text-sm mb-6">
        Booking counts, utilization, live sessions, and downloadable reports.
      </p>

      {error && <p className="err-text text-sm mb-4">{error}</p>}
      {loading && <p className="text-gray-400 text-sm mb-4">Loading reports...</p>}

      <div className="admin-panel rounded-xl p-5 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block label-text text-xs mono uppercase tracking-widest mb-1.5">From</label>
              <input type="date" className="inp w-full rounded-xl px-4 py-2.5 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="block label-text text-xs mono uppercase tracking-widest mb-1.5">To</label>
              <input type="date" className="inp w-full rounded-xl px-4 py-2.5 text-sm" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <button
            type="button"
            onClick={handleApplyRange}
            className="btn-green rounded-xl px-5 py-2.5 text-sm font-semibold"
          >
            Apply range
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total bookings" value={totalBookings} accent />
        <StatCard label="In range" value={dateWise?.totalBookings ?? 0} sub={`${from} → ${to}`} />
        <StatCard label="Completed" value={dateWise?.completedBookings ?? 0} />
        <StatCard label="Cancelled" value={dateWise?.cancelledBookings ?? 0} />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          type="button"
          disabled={Boolean(exporting)}
          onClick={() => handleExport('csv')}
          className="btn-ghost rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          {exporting === 'csv' ? 'Downloading...' : 'Download CSV'}
        </button>
        <button
          type="button"
          disabled={Boolean(exporting)}
          onClick={() => handleExport('excel')}
          className="btn-ghost rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          {exporting === 'excel' ? 'Downloading...' : 'Download Excel'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="admin-panel rounded-xl p-5">
          <h2 className="text-gray-900 font-semibold mb-4">Bookings by station</h2>
          <BarList rows={byStation} nameKey="station" valueKey="bookings" />
        </div>
        <div className="admin-panel rounded-xl p-5">
          <h2 className="text-gray-900 font-semibold mb-4">Charger utilization</h2>
          <BarList rows={utilization} nameKey="charger" valueKey="usage" />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-gray-900 font-semibold mb-3">Active bookings</h2>
        <SimpleTable
          empty="No live charging sessions."
          rows={active}
          columns={[
            { key: 'bookingId', label: 'Ref', mono: true },
            { key: 'station', label: 'Station' },
            { key: 'charger', label: 'Charger', mono: true },
            { key: 'user', label: 'User' },
          ]}
        />
      </div>

      <div className="mb-8">
        <h2 className="text-gray-900 font-semibold mb-3">Completed bookings</h2>
        <SimpleTable
          empty="No completed bookings."
          rows={completed}
          columns={[
            { key: 'bookingId', label: 'Ref', mono: true },
            { key: 'station', label: 'Station' },
            { key: 'charger', label: 'Charger', mono: true },
            { key: 'user', label: 'User' },
            { key: 'bookingDate', label: 'Date', mono: true },
            { key: 'startTime', label: 'Time', mono: true, render: (row) => `${formatTime(row.startTime)} – ${formatTime(row.endTime)}` },
          ]}
        />
      </div>

      <div>
        <h2 className="text-gray-900 font-semibold mb-3">Frequent users</h2>
        <SimpleTable
          empty="No user report data."
          rows={users}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'mobile', label: 'Mobile', mono: true },
            { key: 'totalBookings', label: 'Bookings', mono: true },
          ]}
        />
      </div>
    </div>
  )
}

export default Reports
