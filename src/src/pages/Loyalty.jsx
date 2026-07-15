import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useApp, API } from '../context/AppContext'

export default function Loyalty() {
  const { t, token, customer, showToast } = useApp()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [history, setHistory] = useState([])
  const [nextBooking, setNextBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    loadAll()
  }, [token])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [loyRes, histRes, bkRes] = await Promise.all([
        fetch(`${API}/api/loyalty`, { headers: { Authorization: 'Bearer ' + token } }),
        fetch(`${API}/api/loyalty/history`, { headers: { Authorization: 'Bearer ' + token } }),
        fetch(`${API}/api/bookings/my`, { headers: { Authorization: 'Bearer ' + token } }),
      ])
      if (!loyRes.ok) { navigate('/login'); return }
      const loy = await loyRes.json()
      const hist = await histRes.json()
      const bk = await bkRes.json()
      setData(loy)
      setHistory(hist.visits || [])
      const today = new Date().toISOString().split('T')[0]
      const upcoming = (bk.bookings || []).filter(b => b.status === 'confirmed' && b.booking_date >= today)
      setNextBooking(upcoming[0] || null)
    } catch { showToast(t('Failed to load', 'فشل التحميل'), 'error') }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <div className="loader" />
    </div>
  )

  const { stamps = 0, totalWashes = 0, freeWashesUsed = 0, name = '', customerId = '', memberSince } = data || {}

  return (
    <div className="pt-16 pb-24 md:pb-10">
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-10">
        {/* Welcome */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-secondary-fixed font-display">
            {t('Welcome back,', 'أهلاً,')} {name.split(' ')[0]}
          </h1>
          <p className="text-on-surface-variant mt-1">{t('Track your stamps and redeem your rewards.', 'تابع طوابعك واستبدل مكافآتك.')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stamp Card */}
            <div className="glass p-6 rounded-2xl wet-shine inner-glow animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-on-surface font-display">{t('Splash Stamp Card', 'بطاقة الطوابع')}</h2>
                  <p className="text-on-surface-variant text-sm mt-1">{t('5 stamps = 1 FREE wash', '5 طوابع = غسيل مجاني')}</p>
                </div>
                <div className="text-end">
                  <span className="text-2xl font-extrabold text-secondary-fixed font-display">{stamps}/5</span>
                  <p className="text-xs text-secondary-fixed uppercase tracking-widest">{t('Progress', 'التقدم')}</p>
                </div>
              </div>
              {/* Stamps grid */}
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className={`aspect-square rounded-xl flex items-center justify-center ${i < stamps ? 'stamp-filled glass' : 'stamp-empty'}`}>
                    <span className={`material-symbols-outlined text-3xl ${i < stamps ? 'fill-icon text-secondary-fixed' : 'text-outline-variant/50'}`}
                      style={i < stamps ? { filter: 'drop-shadow(0 0 6px rgba(0,241,254,0.5))' } : {}}>
                      water_drop
                    </span>
                  </div>
                ))}
              </div>
              {stamps >= 5 && (
                <div className="mt-4 p-3 rounded-xl bg-secondary-fixed/10 border border-secondary-fixed/30 text-center">
                  <p className="text-secondary-fixed font-bold text-sm">🎉 {t("You've earned a FREE wash! Show this to staff.", 'لقد ربحت غسيلاً مجانياً! أرِ هذا للموظفين.')}</p>
                </div>
              )}
              <div className="mt-4 text-sm text-on-surface-variant flex gap-4 flex-wrap">
                <span><span className="text-on-surface font-bold">{totalWashes}</span> {t('total washes', 'غسيل إجمالي')}</span>
                <span>·</span>
                <span><span className="text-on-surface font-bold">{freeWashesUsed}</span> {t('free washes used', 'غسيل مجاني مستخدم')}</span>
              </div>
            </div>

            {/* History */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-outline-variant/20">
                <h3 className="font-bold text-on-surface">{t('Recent Activity', 'النشاط الأخير')}</h3>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {history.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant text-sm">{t('No washes yet. Book your first wash!', 'لا توجد غسيلات بعد.')}</div>
                ) : history.slice(0, 10).map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${v.is_free_wash ? 'bg-secondary-fixed/20 border border-secondary-fixed/40' : 'bg-surface-container-high'}`}>
                        <span className={`material-symbols-outlined text-base ${v.is_free_wash ? 'fill-icon text-secondary-fixed' : 'text-on-surface-variant'}`}>water_drop</span>
                      </div>
                      <div>
                        <p className="text-sm text-on-surface font-semibold">
                          {v.is_free_wash ? `${t('Free Wash', 'غسيل مجاني')} 🎉` : t('Wash', 'غسيل')}
                        </p>
                        <p className="text-xs text-on-surface-variant">{new Date(v.visited_at).toLocaleDateString(t('en-US','ar-SA'),{year:'numeric',month:'short',day:'numeric'})}</p>
                      </div>
                    </div>
                    <span className="text-xs text-secondary-fixed font-bold">{v.stamps_before} → {v.stamps_after}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Member Pass */}
            <div className="glass p-6 rounded-2xl text-center">
              <p className="text-xs font-bold text-secondary-fixed uppercase tracking-widest mb-4">{t('Member Pass', 'بطاقة العضوية')}</p>
              <div className="bg-white p-3 rounded-xl mb-4 mx-auto" style={{ width: 160, height: 160 }}>
                <QRCodeSVG value={customerId} size={136} level="H" />
              </div>
              <h4 className="font-bold text-on-surface font-display">{name.toUpperCase()}</h4>
              <p className="text-xs text-secondary-fixed mt-1 font-bold">{customerId}</p>
              {memberSince && <p className="text-xs text-on-surface-variant mt-1">{t('Member since', 'عضو منذ')} {new Date(memberSince).toLocaleDateString(t('en-US','ar-SA'),{year:'numeric',month:'long'})}</p>}
              <Link to="/book" className="btn-primary mt-4 w-full py-3 rounded-xl text-xs uppercase tracking-widest">
                {t('Book a Wash', 'احجز غسيل')}
              </Link>
            </div>

            {/* Next booking */}
            {nextBooking && (
              <div className="glass p-4 rounded-2xl">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-3">{t('Next Booking', 'الحجز القادم')}</p>
                <div className="flex items-center gap-3">
                  <div className="bg-secondary-fixed/10 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-secondary-fixed text-base">calendar_month</span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface text-sm">
                      {nextBooking.service_type === 'full' ? t('Full Wash', 'غسيل كامل') : t('Exterior Only', 'خارجي فقط')}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {new Date(nextBooking.booking_date + 'T12:00:00').toLocaleDateString(t('en-US','ar-SA'),{month:'short',day:'numeric'})} · {nextBooking.booking_time}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
