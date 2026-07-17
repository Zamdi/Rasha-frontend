import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ThemeToggle from './ThemeToggle'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const { lang, toggleLang, t, customer, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isStaff = location.pathname.startsWith('/staff')
  if (isStaff) return null

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled
        ? 'backdrop-blur-xl shadow-md'
        : 'bg-transparent'
    }`} style={scrolled ? {background:'var(--navbar-bg)'} : {}}>
      <div className="max-w-7xl mx-auto flex justify-between items-center h-14 px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="font-display font-extrabold text-xl tracking-tight text-secondary-fixed">
          Rasha
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link to="/" className="text-on-surface-variant hover:text-secondary-fixed transition-colors">
            {t('Home', 'الرئيسية')}
          </Link>
          <Link to="/book" className="text-on-surface-variant hover:text-secondary-fixed transition-colors">
            {t('Book a Wash', 'احجز غسيل')}
          </Link>
          {customer && (
            <Link to="/loyalty" className="text-on-surface-variant hover:text-secondary-fixed transition-colors">
              {t('My Card', 'بطاقتي')}
            </Link>
          )}
          <Link to="/contact" className="text-on-surface-variant hover:text-secondary-fixed transition-colors">
            {t('Support', 'الدعم')}
          </Link>
        </div>

        {/* Right actions — ThemeToggle | AR | Sign In */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={toggleLang} className="flex items-center gap-1 text-secondary-fixed text-xs font-bold hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-base">language</span>
            <span>{lang === 'en' ? 'AR' : 'EN'}</span>
          </button>

          {customer ? (
            <div className="flex items-center gap-2">
              <Link to="/loyalty" className="hidden md:block text-xs font-bold text-secondary-fixed border border-secondary-fixed/30 px-3 py-1.5 rounded-full hover:bg-secondary-fixed/10 transition-colors">
                {customer.first_name}
              </Link>
              <button onClick={handleLogout} className="text-xs text-on-surface-variant hover:text-error transition-colors">
                {t('Sign Out', 'خروج')}
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-xs font-bold text-on-surface-variant hover:text-secondary-fixed transition-colors">
              {t('Sign In', 'تسجيل الدخول')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
