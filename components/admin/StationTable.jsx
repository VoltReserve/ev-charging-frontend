const statusClass = (status) => {
  if (status === 'open' || status === 'available') return 'admin-badge-green'
  if (status === 'closed') return 'admin-badge-amber'
  return 'admin-badge-red'
}

const StationTable = ({ stations, onEdit, onDelete }) => (
  <div className="admin-table-wrap rounded-xl overflow-hidden">
    <table className="admin-table w-full text-sm">
      <thead>
        <tr>
          <th>Name</th>
          <th>ID</th>
          <th>Status</th>
          <th>Chargers</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {stations.length === 0 && (
          <tr>
            <td colSpan={5} className="text-center text-gray-400 py-8">
              No stations yet. Add one below.
            </td>
          </tr>
        )}
        {stations.map((s) => (
          <tr key={s.id}>
            <td className="font-medium text-gray-900">{s.name}</td>
            <td className="mono text-xs text-gray-500">{s.id}</td>
            <td>
              <span className={`admin-badge ${statusClass(s.status)}`}>{s.status}</span>
            </td>
            <td>{s.guns}</td>
            <td className="text-right space-x-2">
              <button type="button" onClick={() => onEdit(s)} className="admin-btn-sm">
                Edit
              </button>
              <button type="button" onClick={() => onDelete(s.id)} className="admin-btn-sm admin-btn-danger">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default StationTable
