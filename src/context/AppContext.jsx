import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AppContext = createContext(null)

export const API = 'https://rasha-backend.onrender.com'

export function AppProvider({ children }) {
  const [lang, setLang] = useState('en')
  const [toast, setToast] = useState(null)
  const [theme, setThemeState] = useState(() => localStorage.getItem('rasha_theme') || 'dark')

  // Apply theme class on mount and change
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
    }
    localStorage.setItem('rasha_theme', theme)
  }, [theme])

  const toggleTheme = () => setThemeState(t => t === 'dark' ? 'light' : 'dark')
  const isDark = theme === 'dark'
  const [customer, setCustomer] = useState(() => {
    const tok = localStorage.getItem('rasha_token')
    if (!tok) return null
    try { return JSON.parse(localStorage.getItem('rasha_customer')) } catch { return null }
  })
  const [token, setToken] = useState(() => {
    const tok = localStorage.getItem('rasha_token')
    if (!tok) return null
    // Check if JWT is expired without making a network call
    try {
      const payload = JSON.parse(atob(tok.split('.')[1]))
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('rasha_token')
        localStorage.removeItem('rasha_customer')
        return null
      }
    } catch {}
    return tok
  })
  const [staffToken, setStaffTokenState] = useState(() => localStorage.getItem('rasha_staff_token'))
  const [staffRole, setStaffRoleState] = useState(() => localStorage.getItem('rasha_staff_role') || 'staff')
  const [staffPermissions, setStaffPermissionsState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rasha_staff_perms') || '{}') } catch { return {} }
  })

  const toggleLang = () => {
    const next = lang === 'en' ? 'ar' : 'en'
    setLang(next)
    document.documentElement.lang = next
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
  }

  const t = (en, ar) => lang === 'ar' ? ar : en

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() })
  }, [])

  const login = (tok, cust) => {
    setToken(tok)
    setCustomer(cust)
    localStorage.setItem('rasha_token', tok)
    localStorage.setItem('rasha_customer', JSON.stringify(cust))
  }

  const logout = () => {
    setToken(null)
    setCustomer(null)
    localStorage.removeItem('rasha_token')
    localStorage.removeItem('rasha_customer')
  }

  const setStaffToken = (tok, role = 'staff', permissions = {}) => {
    setStaffTokenState(tok)
    setStaffRoleState(role)
    setStaffPermissionsState(permissions)
    if (tok) {
      localStorage.setItem('rasha_staff_token', tok)
      localStorage.setItem('rasha_staff_role', role)
      localStorage.setItem('rasha_staff_perms', JSON.stringify(permissions))
    } else {
      localStorage.removeItem('rasha_staff_token')
      localStorage.removeItem('rasha_staff_role')
      localStorage.removeItem('rasha_staff_perms')
    }
  }

  const isSuperAdmin = staffRole === 'super_admin'
  const hasPerm = (perm) => isSuperAdmin || !!staffPermissions[perm]

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(id)
  }, [toast])

  return (
    <AppContext.Provider value={{ lang, toggleLang, t, toast, showToast, customer, token, login, logout, staffToken, setStaffToken, staffRole, staffPermissions, isSuperAdmin, hasPerm, theme, toggleTheme, isDark }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
