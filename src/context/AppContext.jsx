import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AppContext = createContext(null)

export const API = 'https://rasha-backend.onrender.com'

export function AppProvider({ children }) {
  const [lang, setLang] = useState('en')
  const [toast, setToast] = useState(null)
  const [customer, setCustomer] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rasha_customer')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('rasha_token'))
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
    <AppContext.Provider value={{ lang, toggleLang, t, toast, showToast, customer, token, login, logout, staffToken, setStaffToken, staffRole, staffPermissions, isSuperAdmin, hasPerm }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
