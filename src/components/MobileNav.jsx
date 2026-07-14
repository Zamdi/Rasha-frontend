import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const items = [
  { to: '/', icon: 'home', en: 'Home', ar: 'الرئيسية' },
  { to: '/book', icon: 'local_car_wash', en: 'Book', ar: 'احجز' },
  { to: '/loyalty', icon: 'loyalty', en: 'Card', ar: 'بطاقتي' },
  { to: '/login', icon: 'person', en: 'Profile', ar: 'حسابي' },
]

export default function MobileNav() {
  const { pathname } = useLocation()
  const { t, customer } = useApp()
  if (pathname.startsWith('/staff')) return null

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 glass-high border-t border-outline-variant/30">
      <div className="flex justify-around items-center px-4 py-2">
        {items.map(item => {
          const active = pathname === item.to
          const to = item.to === '/loyalty' && !customer ? '/login' : item.to
          return (
            <Link
              key={item.to}
              to={to}
              className={`flex flex-col items-center gap-0.5 p-2 transition-colors ${active ? 'text-secondary-fixed' : 'text-on-surface-variant'}`}
            >
              <span className={`material-symbols-outlined text-xl ${active ? 'fill-icon' : ''}`}>{item.icon}</span>
              <span className="text-xs font-semibold">{t(item.en, item.ar)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
