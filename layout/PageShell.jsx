import { useState } from 'react'
import { useAuth } from '../src/context/AuthContext'
import UserProfilePanel from '../components/UserProfilePanel'

const PageShell = ({ title, children, showSteps = false, stepsSlot, wide = false }) => {
  const { user, isUser } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  const initials = (user?.fullName || '')
    .trim()
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="fixed inset-0 opacity-[0.35] bg-grid pointer-events-none"
        aria-hidden="true"
      />

      <div className={`relative w-full fade-in ${wide ? 'max-w-4xl' : 'max-w-lg'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-100 border border-green-200 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <p className="mono text-green-600 text-xs tracking-widest uppercase">EV Charging</p>
            <h1 className="text-gray-900 text-base font-semibold leading-tight">{title}</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="pulse-dot" />
              <span className="text-green-700 text-xs mono">Live</span>
            </div>

            {isUser && (
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="profile-avatar-btn w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold shrink-0 hover:bg-green-700 transition-colors"
                title={user?.fullName || 'My profile'}
                aria-label="Open profile"
              >
                {initials}
              </button>
            )}
          </div>
        </div>

        {showSteps && stepsSlot}

        {children}

        <p className="text-center text-gray-400 text-xs mono mt-4">Kochi Smart EV Network · 2026</p>
      </div>

      {profileOpen && <UserProfilePanel onClose={() => setProfileOpen(false)} />}
    </div>
  )
}

export default PageShell
