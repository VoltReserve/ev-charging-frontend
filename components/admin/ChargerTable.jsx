const statusClass = (status) => {
  if (status === 'available') return 'admin-badge-green'
  if (status === 'closed') return 'admin-badge-amber'
  return 'admin-badge-red'
}

const ChargerTable = ({ rows, onEdit, onDelete }) => (
  <div className="admin-table-wrap rounded-xl overflow-hidden">
    <table className="admin-table w-full text-sm">
      <thead>
        <tr>
          <th>Station</th>
          <th>Charger</th>
          <th>Type</th>
          <th>Power</th>
          <th>Connector</th>
          <th>Status</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={7} className="text-center text-gray-400 py-8">
              No chargers yet.
            </td>
          </tr>
        )}
        {rows.map((row) => (
          <tr key={`${row.stationId}-${row.id}`}>
            <td className="text-gray-600">{row.stationName}</td>
            <td className="font-medium text-gray-900">{row.name}</td>
            <td>
              <span className={`mono text-xs px-2 py-0.5 rounded ${row.type === 'DC' ? 'tag-dc' : 'tag-ac'}`}>
                {row.type}
              </span>
            </td>
            <td className="mono text-xs">{row.power}</td>
            <td className="text-gray-500 text-xs">{row.connector}</td>
            <td>
              <span className={`admin-badge ${statusClass(row.status)}`}>{row.status}</span>
            </td>
            <td className="text-right space-x-2">
              <button type="button" onClick={() => onEdit(row)} className="admin-btn-sm">
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(row.stationId, row.id)}
                className="admin-btn-sm admin-btn-danger"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default ChargerTable
