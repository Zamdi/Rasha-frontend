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
      <div className="max-w-7xl mx-auto flex justify-between items-center h-20 px-6">
        {/* Logo */}
        <Link to="/" className="font-display font-extrabold text-xl tracking-widest text-secondary-fixed uppercase">
          RASHA
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-secondary-fixed font-bold border-b-2 border-secondary-fixed pb-1 text-xs font-semibold uppercase tracking-wider">
            {t('Home', 'الرئيسية')}
          </Link>
          <a href="#services" className="text-on-surface-variant hover:text-secondary-fixed transition-colors text-xs font-semibold uppercase tracking-wider">
            {t('Services', 'الخدمات')}
          </a>
          <Link to="/book" className="text-on-surface-variant hover:text-secondary-fixed transition-colors text-xs font-semibold uppercase tracking-wider">
            {t('Booking', 'حجز')}
          </Link>
          {customer && (
            <Link to="/loyalty" className="text-on-surface-variant hover:text-secondary-fixed transition-colors text-xs font-semibold uppercase tracking-wider">
              {t('My Card', 'بطاقتي')}
            </Link>
          )}
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
              <Link to="/login" className="hydro-gradient px-6 py-2.5 rounded-full text-xs font-bold text-on-primary hover:shadow-lg transition-all"
                style={{ boxShadow: '0 0 0 rgba(0,241,254,0)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,241,254,0.3)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 rgba(0,241,254,0)'}>
                {t('Sign In', 'تسجيل الدخول')}
              </Link>
            </div>
          )}

          <Link to="/staff" className="text-on-surface-variant hover:text-secondary-fixed transition-colors" title="Staff Portal">
            <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
