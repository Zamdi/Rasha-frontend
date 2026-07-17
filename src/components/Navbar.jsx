import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { lang, toggleLang, t, customer, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const isStaff = location.pathname.startsWith('/staff')
  if (isStaff) return null

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className="fixed top-0 w-full z-50 glass-high border-b border-secondary-container/20 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="font-display font-extrabold text-2xl tracking-tight text-secondary-fixed">
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

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 text-secondary-fixed text-xs font-bold hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-base">language</span>
            <span>{lang === 'en' ? 'AR' : 'EN'}</span>
          </button>

          {customer ? (
            <div className="flex items-center gap-2">
              <Link to="/loyalty" className="glass px-4 py-2 rounded-full text-xs font-bold text-secondary-fixed hover:border-secondary-fixed/50 transition-all hidden md:block">
                {customer.first_name}
              </Link>
              <button onClick={handleLogout} className="text-on-surface-variant text-xs hover:text-error transition-colors">
                {t('Sign Out', 'خروج')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="glass px-4 py-2 rounded-full text-xs font-bold text-on-surface hover:border-secondary-fixed/50 transition-all">
                {t('Sign In', 'تسجيل الدخول')}
              </Link>
              <Link to="/register" className="hydro-gradient px-4 py-2 rounded-full text-xs font-bold text-white hover:opacity-90 transition-opacity hidden md:block">
                {t('Register', 'إنشاء حساب')}
              </Link>
            </div>
          )}

        </div>
      </div>
    </nav>
  )
}
