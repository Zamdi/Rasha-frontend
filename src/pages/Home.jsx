import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const HERO_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuDgGElfNBbSdeaGdQMMvL0bdnCO-qOmWspE9L2UzK9pDhqWeEL-n09rHYs9SXiHmjB2LE6lTX2-5x-bgDSkbRHlmFsbFBNrtiD4GNNAEM6CeaZHJwMnYjf6uT3-jsBppDB9YHpqOni9A1FAjQzqxhH7sBTRTSgi5h3y1_DCOHLQc-wo1xNp0qHMBz56LFHvYIkB7jWihSAVRpbAJa6B9zRryqF4mnW5jHq9Vu3HoIed75x_h-EUpwI"

export default function Home() {
  const { t } = useApp()
  const navigate = useNavigate()
  const [heroService, setHeroService] = useState('full')

  const [heroPhone, setHeroPhone] = useState('')
  const handleHeroBook = () => navigate('/book', { state: { service: heroService, phone: heroPhone } })

  return (
    <div className="pb-16 md:pb-0">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMG})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
          {/* Text */}
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container/10 border border-secondary-fixed/25 text-secondary-fixed">
              <span className="material-symbols-outlined fill-icon text-base">auto_awesome</span>
              <span className="text-xs font-bold uppercase tracking-widest">{t("Sudan's Premier Car Wash", 'أفضل غسيل سيارات في السودان')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-on-surface leading-tight font-display">
              {t('The Ultimate', 'النظافة')}{' '}
              <span className="text-secondary-fixed">{t('Clean Shine', 'المثالية')}</span>
              <br />{t('For Your Car.', 'لسيارتك.')}
            </h1>
            <p className="text-on-surface-variant text-base max-w-lg">
              {t("Experience Khartoum's finest car wash. Professional care, loyalty rewards, and easy online booking.", "استمتع بأفضل خدمة غسيل سيارات في الخرطوم. عناية احترافية ومكافآت ولاء وحجز سهل.")}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/book" className="btn-primary text-sm px-8 py-4 rounded-xl">
                {t('Book Your Wash', 'احجز الآن')}
                <span className="material-symbols-outlined rtl-flip text-base">arrow_forward</span>
              </Link>
              <a href="#services" className="btn-cyan text-sm px-8 py-4 rounded-xl">
                {t('Our Services', 'خدماتنا')}
              </a>
            </div>
            {/* Stats */}
            <div className="flex gap-8 pt-2">
              {[['500+', t('Customers', 'عميل')], ['4.9★', t('Rating', 'التقييم')], ['2', t('Services', 'خدمات')]].map(([v, l]) => (
                <div key={l}>
                  <div className="text-2xl font-extrabold text-secondary-fixed font-display">{v}</div>
                  <div className="text-xs text-on-surface-variant">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Quick Booking Card */}
          <div className="hidden lg:block animate-fade-in">
            <div className="glass p-8 rounded-3xl wet-shine inner-glow">
              <h3 className="text-xl font-bold text-secondary-fixed mb-6 font-display">{t('Quick Booking', 'حجز سريع')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">{t('Service Type', 'نوع الخدمة')}</label>
                  <select className="rasha-select" value={heroService} onChange={e => setHeroService(e.target.value)}>
                    <option value="full">{t('Full Wash', 'غسيل كامل')}</option>
                    <option value="outside">{t('Exterior Only', 'خارجي فقط')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">{t('Phone Number', 'رقم الهاتف')}</label>
                  <div className="flex">
                    <span className="bg-surface-container-high border border-outline-variant/50 border-e-0 rounded-s-xl px-3 py-3 text-sm text-on-surface-variant flex items-center">+249</span>
                    <input type="tel" placeholder="9XX XXX XXXX" className="rasha-input rounded-s-none rounded-e-xl" style={{ borderStartStartRadius: 0, borderEndStartRadius: 0 }} value={heroPhone} onChange={e => setHeroPhone(e.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>
                <button onClick={handleHeroBook} className="w-full py-4 rounded-xl bg-secondary-container text-on-secondary-container font-extrabold text-sm uppercase tracking-widest hover:opacity-90 transition-opacity">
                  {t('Confirm Appointment', 'تأكيد الحجز')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-on-surface font-display">{t('Our Services', 'خدماتنا')}</h2>
          <p className="text-on-surface-variant mt-2">{t('Professional care for every car.', 'عناية احترافية لكل سيارة.')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Wash */}
          <Link to="/book" state={{ service: 'full' }} className="glass p-8 rounded-3xl hover:border-secondary-fixed/40 transition-all group wet-shine block">
            <div className="flex justify-between items-start mb-6">
              <span className="material-symbols-outlined fill-icon text-secondary-fixed text-4xl">local_car_wash</span>
              <span className="bg-secondary-fixed/10 text-secondary-fixed text-xs font-bold px-3 py-1 rounded-full border border-secondary-fixed/30">{t('Full Wash', 'غسيل كامل')}</span>
            </div>
            <h4 className="text-xl font-bold text-on-surface mb-3 font-display">{t('Full Wash', 'غسيل كامل')}</h4>
            <p className="text-on-surface-variant text-sm mb-6">{t('Complete interior and exterior cleaning. Vacuuming, dashboard wipe, window cleaning, exterior wash and rinse.', 'تنظيف كامل للداخل والخارج.')}</p>
            <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
              {[t('Interior vacuuming', 'شفط داخلي'), t('Dashboard & console wipe', 'تلميع لوحة التحكم'), t('Full exterior wash', 'غسيل خارجي كامل'), t('Window & tire shine', 'تلميع الزجاج والإطارات')].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <span className="material-symbols-outlined fill-icon text-secondary-fixed text-base">check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
            <button className="btn-primary w-full py-3 rounded-xl">{t('Book Full Wash', 'احجز غسيل كامل')}</button>
          </Link>

          {/* Exterior Only */}
          <Link to="/book" state={{ service: 'outside' }} className="glass p-8 rounded-3xl hover:border-secondary-fixed/40 transition-all group wet-shine block">
            <div className="flex justify-between items-start mb-6">
              <span className="material-symbols-outlined text-secondary-fixed text-4xl">water_drop</span>
              <span className="bg-surface-container-highest/50 text-on-surface-variant text-xs font-bold px-3 py-1 rounded-full border border-outline-variant">{t('Exterior', 'خارجي')}</span>
            </div>
            <h4 className="text-xl font-bold text-on-surface mb-3 font-display">{t('Exterior Only', 'غسيل خارجي فقط')}</h4>
            <p className="text-on-surface-variant text-sm mb-6">{t('Quick and thorough exterior wash. Perfect for regular maintenance.', 'غسيل خارجي سريع وشامل.')}</p>
            <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
              {[t('Exterior body wash', 'غسيل هيكل السيارة'), t('Rinse & dry', 'شطف وتجفيف'), t('Wheel & tire clean', 'تنظيف العجلات'), t('Window streak-free clean', 'تنظيف الزجاج')].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <span className="material-symbols-outlined fill-icon text-secondary-fixed text-base">check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
            <button className="btn-cyan w-full py-3 rounded-xl">{t('Book Exterior', 'احجز خارجي')}</button>
          </Link>
        </div>

        {/* Loyalty teaser */}
        <div className="mt-6 glass p-6 rounded-3xl border border-secondary-fixed/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-secondary-fixed/10 p-3 rounded-xl border border-secondary-fixed/30">
              <span className="material-symbols-outlined fill-icon text-secondary-fixed text-3xl">loyalty</span>
            </div>
            <div>
              <h4 className="font-bold text-secondary-fixed font-display">{t('Loyalty Rewards', 'مكافآت الولاء')}</h4>
              <p className="text-on-surface-variant text-sm">{t('Wash 5 times, get the 6th wash FREE.', 'اغسل 5 مرات، واحصل على الغسلة السادسة مجاناً.')}</p>
            </div>
          </div>
          <Link to="/register" className="btn-primary px-6 py-3 rounded-xl whitespace-nowrap">
            {t('Join Now', 'انضم الآن')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/10 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="text-xl font-extrabold text-secondary-fixed-dim tracking-widest uppercase mb-3 font-display">RASHA | رشة</div>
            <p className="text-on-surface-variant text-sm max-w-xs">{t("Khartoum's trusted car wash.", 'غسيل السيارات الموثوق في الخرطوم.')}</p>
          </div>
          <div className="flex gap-12 text-sm">
            <div>
              <div className="text-on-surface font-bold mb-3">{t('Quick Links', 'روابط سريعة')}</div>
              <div className="flex flex-col gap-2 text-on-surface-variant">
                {[['/','Home','الرئيسية'],['/book','Book','احجز'],['/login','Sign In','دخول'],['/contact','Contact Support','الدعم'],['/staff','Staff Portal','الموظفون']].map(([to,en,ar])=>(
                  <Link key={to} to={to} className="hover:text-secondary-fixed transition-colors">{t(en,ar)}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8 pt-6 border-t border-outline-variant/10 text-center text-on-surface-variant text-xs">
          © 2025 Rasha Car Wash. {t('All rights reserved.', 'جميع الحقوق محفوظة.')}
        </div>
      </footer>
    </div>
  )
}
