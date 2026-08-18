/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { setAuthToken } from '../lib/api'

const STORAGE_KEY = 'ev-auth-session-v1'

const AuthContext = createContext(null)

const loadSession = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(loadSession)

  useEffect(() => {
    setAuthToken(session?.token ?? null)
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [session])

  const value = useMemo(
    () => ({
      session,
      token: session?.token ?? null,
      role: session?.role ?? null,
      user: session?.user ?? null,
      admin: session?.admin ?? null,
      isUser: session?.role === 'user',
      isAdmin: session?.role === 'admin',
      loginUser: ({ token, user }) => setSession({ token, user, role: 'user' }),
      loginAdmin: ({ token, admin }) => setSession({ token, admin, role: 'admin' }),
      updateUser: (updatedUser) =>
        setSession((prev) => prev ? { ...prev, user: { ...prev.user, ...updatedUser } } : prev),
      logout: () => setSession(null),
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
