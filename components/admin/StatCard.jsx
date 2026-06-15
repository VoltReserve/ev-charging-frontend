const StatCard = ({ label, value, sub, accent, onClick, className = '' }) => {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`admin-stat-card rounded-xl p-5 text-left w-full ${onClick ? 'hover:border-green-300 transition-colors cursor-pointer' : ''} ${className}`}
    >
      <p className="text-gray-500 text-xs mono uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent ? 'text-green-600' : 'text-gray-900'}`}>
        {value}
      </p>
      {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
    </Tag>
  )
}

export default StatCard
