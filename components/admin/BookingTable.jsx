const BookingTable = ({ rows, onDelete }) => (
  <div className="admin-table-scroll rounded-xl">
    <div className="admin-table-wrap min-w-[640px]">
      <table className="admin-table w-full text-sm">
      <thead>
        <tr>
          <th>Ref</th>
          <th>Station</th>
          <th>Charger</th>
          <th>Date</th>
          <th>Time</th>
          <th>Customer</th>
          <th>Vehicle</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={8} className="text-center text-gray-400 py-8">
              No bookings yet.
            </td>
          </tr>
        )}
        {rows.map((row) => (
          <tr key={row.id}>
            <td className="mono text-xs text-green-700">{row.ref}</td>
            <td>{row.stationName}</td>
            <td className="text-xs">{row.chargerName}</td>
            <td className="mono text-xs">{row.date}</td>
            <td className="mono text-xs">{row.from} – {row.to}</td>
            <td>{row.customerName}</td>
            <td className="mono text-xs">{row.carno}</td>
            <td className="text-right">
              {row.bookingIndex != null && (
                <button
                  type="button"
                  onClick={() => onDelete(row.stationId, row.chargerId, row.bookingIndex)}
                  className="admin-btn-sm admin-btn-danger"
                >
                  Delete
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  </div>
)

export default BookingTable
