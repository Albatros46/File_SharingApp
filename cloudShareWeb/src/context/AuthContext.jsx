import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi, TOKEN_KEY } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return
    authApi
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  const handleAuth = useCallback(({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token)
    setUser(user)
    return user
  }, [])

  const login = useCallback((data) => authApi.login(data).then(handleAuth), [handleAuth])
  const register = useCallback((data) => authApi.register(data).then(handleAuth), [handleAuth])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  const refreshUser = useCallback(() => authApi.me().then(setUser), [])
  const setCredits = useCallback((credits) => setUser((u) => (u ? { ...u, credits } : u)), [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser, setCredits }),
    [user, loading, login, register, logout, refreshUser, setCredits],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
