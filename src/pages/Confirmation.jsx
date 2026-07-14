import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Confirmation() {
  const { t } = useApp()
  const { state } = useLocation()
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!state) { navigate('/'); return }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    let particles = []
    let alive = true

    class P {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = canvas.height + 10
        this.size = Math.random() * 3 + 1
        this.vy = -(Math.random() * 3 + 2)
        this.vx = Math.random() * 2 - 1
        this.color = Math.random() > 0.5 ? '#00f1fe' : '#74f5ff'
        this.opacity = 1
      }
      update() { this.y += this.vy; this.x += this.vx; this.opacity -= 0.007 }
      draw() { ctx.globalAlpha = this.opacity; ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill() }
    }

    const anim = () => {
      if (!alive) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (particles.length < 80 && Math.random() > 0.7) particles.push(new P())
      particles = particles.filter(p => { p.update(); p.draw(); return p.opacity > 0 })
      requestAnimationFrame(anim)
    }
    anim()
    const t2 = setTimeout(() => { alive = false; canvas.style.opacity = '0' }, 5000)
    return () => { alive = false; clearTimeout(t2) }
  }, [])

  if (!state) return null
  const { ref, service, date, time, name } = state
  const svcLabel = service === 'full' ? t('Full Wash (Inside & Outside)', 'غسيل كامل') : t('Exterior Only', 'خارجي فقط')

  return (
    <div className="relative pt-16 min-h-screen flex items-center justify-center">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[200] transition-opacity duration-1000" />
      <div className="relative z-10 w-full max-w-xl mx-auto px-4 py-12 flex flex-col items-center animate-fade-in">
        {/* Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-secondary-container/20 rounded-full blur-3xl" />
          <div className="relative w-24 h-24 rounded-full border-4 border-secondary-fixed flex items-center justify-center bg-surface-container/60 backdrop-blur-xl cyan-glow">
            <span className="material-symbols-outlined fill-icon text-secondary-fixed text-6xl">check_circle</span>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-on-surface text-center mb-2 font-display">{t('Booking Confirmed!', 'تم تأكيد الحجز!')}</h1>
        <p className="text-on-surface-variant text-center mb-8 text-sm">{t("We'll see you soon. Check your email for confirmation.", 'نراك قريباً. تحقق من بريدك الإلكتروني.')}</p>

        {/* Summary card */}
        <div className="glass w-full rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-start border-b border-outline-variant/20 pb-4 mb-4">
            <div>
              <span className="text-xs font-bold text-secondary-fixed uppercase tracking-wider mb-1 block">{t('Service', 'الخدمة')}</span>
              <h2 className="text-xl font-bold text-on-surface font-display">{svcLabel}</h2>
            </div>
            <div className="text-end">
              <span className="text-xs font-bold text-secondary-fixed uppercase tracking-wider mb-1 block">{t('Reference', 'المرجع')}</span>
              <span className="text-xl font-bold text-on-surface font-display">{ref}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['calendar_month', t('Date','التاريخ'), new Date(date+'T12:00:00').toLocaleDateString(t('en-US','ar-SA'),{year:'numeric',month:'long',day:'numeric'})],
              ['schedule', t('Time','الوقت'), time],
              ['person', t('Name','الاسم'), name],
            ].map(([icon,label,value]) => (
              <div key={label} className={`flex items-center gap-3 ${label===t('Name','الاسم')?'col-span-2':''}`}>
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center border border-outline-variant/30 shrink-0">
                  <span className="material-symbols-outlined text-secondary-fixed text-base">{icon}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-xs">{label}</span>
                  <span className="text-on-surface font-semibold">{value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-secondary-container/5 border border-secondary-container/10 flex items-start gap-2">
            <span className="material-symbols-outlined text-secondary-fixed text-sm mt-0.5">info</span>
            <p className="text-xs text-on-surface-variant">{t('Please arrive 10 minutes early. We\'re excited to serve you!', 'يُرجى الحضور قبل 10 دقائق. يسعدنا خدمتك!')}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link to="/" className="btn-glass flex-1 py-4 rounded-xl">
            <span className="material-symbols-outlined text-base">home</span>
            {t('Return Home', 'العودة للرئيسية')}
          </Link>
          <Link to="/book" className="btn-primary flex-1 py-4 rounded-xl">
            <span className="material-symbols-outlined text-base">add</span>
            {t('Book Again', 'احجز مرة أخرى')}
          </Link>
        </div>
      </div>
    </div>
  )
}
