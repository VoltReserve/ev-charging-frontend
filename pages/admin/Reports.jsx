import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { adminApi, getErrorMessage, unwrapList } from '../../src/lib/api'
import StatCard from '../../components/admin/StatCard'
import BookingsByStationChart from '../../components/admin/BookingsByStationChart'
import ChargerUtilizationChart from '../../components/admin/ChargerUtilizationChart'
import { DatePicker, startOfMonth, startOfToday, toApiDate } from '../../components/ui/date-picker'
import { SkeletonCard, SkeletonStatCard, SkeletonTable, SkeletonText } from '../../components/ui/skeleton-blocks'

const formatTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fromDate, setFromDate] = useState(() => startOfMonth())
  const [toDate, setToDate] = useState(() => startOfToday())
  const [dateWise, setDateWise] = useState(null)
  const [dateRangeBookings, setDateRangeBookings] = useState([])
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
    setDateRangeBookings(unwrapList(data.dateWise, ['bookings']))
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchReports(toApiDate(fromDate), toApiDate(toDate))
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
  }, [])

  const handleApplyRange = async () => {
    if (fromDate > toDate) {
      setError('From date must be before or equal to the To date')
      return
    }

    setLoading(true)
    setError('')
    try {
      applyReports(await fetchReports(toApiDate(fromDate), toApiDate(toDate)))
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

      <div className="admin-panel rounded-xl p-5 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block label-text text-xs mono uppercase tracking-widest mb-1.5">From</label>
              <DatePicker
                value={fromDate}
                onChange={(date) => date && setFromDate(date)}
                placeholder="Pick start date"
                calendarDisabled={(date) => (toDate ? date > toDate : false)}
              />
            </div>
            <div>
              <label className="block label-text text-xs mono uppercase tracking-widest mb-1.5">To</label>
              <DatePicker
                value={toDate}
                onChange={(date) => date && setToDate(date)}
                placeholder="Pick end date"
                calendarDisabled={(date) => (fromDate ? date < fromDate : false)}
              />
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

      {loading ? (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonStatCard key={index} />
            ))}
          </div>
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonText className="mb-3 h-5 w-40" />
          <SkeletonTable rows={4} cols={4} />
        </>
      ) : (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total bookings" value={totalBookings} accent />
        <StatCard label="In range" value={dateWise?.totalBookings ?? 0} sub={`${format(fromDate, 'dd MMM yyyy')} → ${format(toDate, 'dd MMM yyyy')}`} />
        <StatCard label="Completed" value={dateWise?.completedBookings ?? 0} />
        <StatCard label="Cancelled" value={dateWise?.cancelledBookings ?? 0} />
      </div>

      <div className="mb-8">
        <h2 className="text-gray-900 font-semibold mb-3">Bookings in selected range</h2>
        <SimpleTable
          empty="No bookings found for the selected date range."
          rows={dateRangeBookings}
          columns={[
            { key: 'bookingId', label: 'Ref', mono: true },
            { key: 'bookingDate', label: 'Date', mono: true },
            {
              key: 'startTime',
              label: 'Time',
              mono: true,
              render: (row) => `${formatTime(row.startTime)} – ${formatTime(row.endTime)}`,
            },
            { key: 'station', label: 'Station' },
            { key: 'charger', label: 'Charger', mono: true },
            { key: 'user', label: 'User' },
            { key: 'mobile', label: 'Mobile', mono: true },
            { key: 'status', label: 'Status' },
          ]}
        />
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
        <BookingsByStationChart data={byStation} loading={false} />
        <ChargerUtilizationChart data={utilization} loading={false} />
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
        </>
      )}
    </div>
  )
}

export default Reports
