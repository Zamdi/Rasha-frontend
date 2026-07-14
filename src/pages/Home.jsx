import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const HERO_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuDgGElfNBbSdeaGdQMMvL0bdnCO-qOmWspE9L2UzK9pDhqWeEL-n09rHYs9SXiHmjB2LE6lTX2-5x-bgDSkbRHlmFsbFBNrtiD4GNNAEM6CeaZHJwMnYjf6uT3-jsBppDB9YHpqOni9A1FAjQzqxhH7sBTRTSgi5h3y1_DCOHLQc-wo1xNp0qHMBz56LFHvYIkB7jWihSAVRpbAJa6B9zRryqF4mnW5jHq9Vu3HoIed75x_h-EUpwI"
const BENTO_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuARf1pFuG9m96gjPalKL6YFrP4hgKi8b34Su0tOKVPfliOF2hQRpWEWwMcudUu8ThBE_qh4qxV603xPs3oE-vWbbKj7HIxmmDXku3j3X9Y4ZAbm2ugxDtwHEaxJVeyFCI3J5D0BgoePAr8QuqQSRZbQ4zxk7id7BqEFD079rFVmgF5olxFO9CVW9N9MCQOzwv_q5pwxsjQf-wSVBdwUmTOw1OtjGNMwXU47gBkG19w1TKrfhKSuzQw"

export default function Home() {
  const { t } = useApp()
  const navigate = useNavigate()
  const [vehicleType, setVehicleType] = useState('sedan')
  const [heroService, setHeroService] = useState('full')
  const [heroPhone, setHeroPhone] = useState('')

  const handleHeroBook = () => navigate('/book', { state: { service: heroService } })

  return (
    <div className="pb-16 md:pb-0">

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-cover bg-center scale-105 transform" style={{ backgroundImage: `url(${HERO_IMG})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-secondary-container/10 border border-secondary-fixed/20 text-secondary-fixed">
              <span className="material-symbols-outlined fill-icon text-base">auto_awesome</span>
              <span className="text-xs font-bold uppercase tracking-widest">{t('Next-Gen Detailing', 'التقنية الحديثة')}</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-on-surface leading-tight font-display">
              {t('The Ultimate', 'لمعة')}{' '}
              <span className="text-secondary-fixed">{t('Ceramic Shine', 'سيراميك')}</span>
              <br />{t('For Your Drive.', 'لسيارتك.')}
            </h1>
            <p className="text-on-surface-variant text-base max-w-lg">
              {t("Experience Sudan's premier automotive spa. We combine advanced hydro-technology with precision craftsmanship to give your vehicle a showroom finish that lasts.", "استمتع بأفضل تجربة غسيل سيارات في السودان. نجمع بين التقنية المائية المتقدمة والحرفية الدقيقة.")}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/book" className="hydro-gradient px-8 py-4 rounded-xl text-on-primary font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                style={{ boxShadow: '0 8px 32px rgba(0,86,179,0.3)' }}>
                {t('Book Your Session', 'احجز جلستك')}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
              <a href="#services" className="glass px-8 py-4 rounded-xl text-secondary-fixed font-bold text-xs uppercase tracking-wider border border-secondary-fixed/30 hover:bg-secondary-fixed/5 transition-colors">
                {t('Our Services', 'خدماتنا')}
              </a>
            </div>
          </div>

          {/* Right: Quick Booking Glass Card */}
          <div className="hidden lg:block animate-fade-in">
            <div className="glass p-8 rounded-3xl wet-shine inner-glow">
              <h3 className="text-2xl font-bold text-secondary-fixed mb-6 font-display">{t('Quick Booking', 'حجز سريع')}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">{t('Vehicle Type', 'نوع السيارة')}</label>
                    <select className="w-full rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none"
                      style={{ background: '#272a2c', border: '1px solid rgba(66,71,82,0.3)' }}
                      value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
                      <option value="sedan">{t('Sedan / Coupe', 'سيدان / كوبيه')}</option>
                      <option value="suv">{t('SUV / Truck', 'دفع رباعي / شاحنة')}</option>
                      <option value="luxury">{t('Luxury / Exotic', 'فاخرة / نادرة')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">{t('Service Type', 'نوع الخدمة')}</label>
                    <select className="w-full rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none"
                      style={{ background: '#272a2c', border: '1px solid rgba(66,71,82,0.3)' }}
                      value={heroService} onChange={e => setHeroService(e.target.value)}>
                      <option value="full">{t('Full Wash', 'غسيل كامل')}</option>
                      <option value="outside">{t('Exterior Only', 'خارجي فقط')}</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">{t('Phone Number', 'رقم الهاتف')}</label>
                  <div className="flex">
                    <span className="rounded-s-xl px-4 py-3 text-on-surface-variant text-sm flex items-center"
                      style={{ background: '#272a2c', border: '1px solid rgba(66,71,82,0.3)', borderRight: 'none' }}>+249</span>
                    <input type="tel" placeholder="9XXX XXXX" value={heroPhone} onChange={e => setHeroPhone(e.target.value)}
                      className="flex-1 rounded-e-xl px-4 py-3 text-on-surface text-sm focus:outline-none placeholder:text-outline"
                      style={{ background: '#272a2c', border: '1px solid rgba(66,71,82,0.3)' }} />
                  </div>
                </div>
                <div className="pt-4">
                  <button onClick={handleHeroBook}
                    className="w-full py-4 rounded-xl font-extrabold tracking-widest uppercase text-sm hover:opacity-90 transition-opacity"
                    style={{ background: '#00f1fe', color: '#002022' }}>
                    {t('Confirm Appointment', 'تأكيد الموعد')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Bento Grid ── */}
      <section id="services" className="py-12 max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-on-surface font-display">{t('Our Expertise', 'خبرتنا')}</h2>
            <p className="text-on-surface-variant mt-2">{t('Precision detailing for every surface.', 'تفصيل دقيق لكل سطح.')}</p>
          </div>
          <Link to="/book" className="text-secondary-fixed text-xs font-bold flex items-center gap-2 group hover:opacity-80 transition-opacity">
            {t('All Services', 'جميع الخدمات')}
            <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_right_alt</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Large Feature Card */}
          <Link to="/book" state={{ service: 'full' }}
            className="md:col-span-2 lg:row-span-2 relative rounded-3xl overflow-hidden group cursor-pointer block"
            style={{ minHeight: '320px' }}>
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${BENTO_IMG})` }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0b0f10 0%, transparent 60%)' }} />
            <div className="absolute bottom-0 p-8 w-full">
              <span className="bg-secondary-fixed text-on-secondary-fixed text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">
                {t('Signature', 'مميز')}
              </span>
              <h3 className="text-2xl font-bold text-on-surface font-display">{t('Full Exterior Ceramic', 'سيراميك خارجي كامل')}</h3>
              <p className="text-on-surface-variant text-sm mt-1 max-w-sm line-clamp-2">
                {t('Our 9H hardness ceramic coating provides permanent protection and extreme hydrophobicity.', 'طلاء سيراميك بصلابة 9H يوفر حماية دائمة ومقاومة فائقة للماء.')}
              </p>
            </div>
          </Link>

          {/* Hydro Wash */}
          <div className="glass p-8 rounded-3xl flex flex-col justify-between hover:border-secondary-fixed/50 transition-colors">
            <span className="material-symbols-outlined text-secondary-fixed text-4xl">local_car_wash</span>
            <div>
              <h4 className="text-xl font-bold text-on-surface mb-2 font-display">{t('Hydro Wash', 'غسيل هيدرو')}</h4>
              <p className="text-on-surface-variant text-xs">{t('Gentle de-ionized water wash with pH-neutral snow foam.', 'غسيل بماء منزوع الأيونات مع رغوة ثلجية متعادلة الحموضة.')}</p>
            </div>
          </div>

          {/* Deep Interior */}
          <div className="glass p-8 rounded-3xl flex flex-col justify-between hover:border-secondary-fixed/50 transition-colors">
            <span className="material-symbols-outlined text-secondary-fixed text-4xl">airline_seat_recline_extra</span>
            <div>
              <h4 className="text-xl font-bold text-on-surface mb-2 font-display">{t('Deep Interior', 'تنظيف داخلي عميق')}</h4>
              <p className="text-on-surface-variant text-xs">{t('Steam cleaning and leather conditioning for a factory fresh feel.', 'تنظيف بالبخار وترطيب الجلود للحصول على مظهر المصنع الجديد.')}</p>
            </div>
          </div>

          {/* Loyalty Card */}
          <div className="lg:col-span-2 p-8 rounded-3xl flex items-center justify-between"
            style={{ background: 'rgba(0,241,254,0.05)', border: '1px solid rgba(116,245,255,0.2)' }}>
            <div>
              <h4 className="text-xl font-bold text-secondary-fixed mb-2 font-display">{t('Loyalty Rewards', 'مكافآت الولاء')}</h4>
              <p className="text-on-surface-variant text-xs">{t('Wash 5 times, get the 6th Platinum Wash for FREE.', 'اغسل 5 مرات، واحصل على الغسلة السادسة مجاناً.')}</p>
            </div>
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded-full" style={{ border: '4px solid rgba(116,245,255,0.3)' }} />
              <div className="absolute inset-0 rounded-full" style={{ border: '4px solid #74f5ff', clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }} />
              <span className="text-2xl font-bold text-on-surface font-display">5/6</span>
            </div>
          </div>
        </div>
      </section>


      {/* ── Footer ── */}
      <footer className="w-full py-12 border-t border-outline-variant/10" style={{ background: '#0b0f10' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Brand */}
          <div className="space-y-6 max-w-sm">
            <span className="text-xl font-bold text-secondary-fixed-dim tracking-wider uppercase font-display">RASHA</span>
            <p className="text-on-surface-variant text-sm">
              {t("Sudan's leading automotive detailing center. Bringing professional precision and high-gloss finishes to Khartoum and beyond.", 'مركز تفصيل السيارات الرائد في السودان. نقدم دقة احترافية وتشطيبات عالية اللمعة في الخرطوم وما وراءها.')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-secondary-fixed hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors">
                <span className="material-symbols-outlined text-base">public</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-secondary-fixed hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors">
                <span className="material-symbols-outlined text-base">alternate_email</span>
              </a>
            </div>
          </div>
          {/* Links */}
          <div className="grid grid-cols-2 gap-16 mt-10 md:mt-0">
            <div className="space-y-4">
              <h5 className="text-on-surface font-bold text-sm">{t('Quick Links', 'روابط سريعة')}</h5>
              <div className="flex flex-col gap-3">
                {[['/', t('Home','الرئيسية')], ['#services', t('Services','الخدمات')], ['#packages', t('Packages','الباقات')], ['/book', t('Book','احجز')]].map(([href, label]) => (
                  <a key={label} href={href} className="text-on-surface-variant hover:text-secondary-fixed transition-colors text-sm">{label}</a>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="text-on-surface font-bold text-sm">{t('Support', 'الدعم')}</h5>
              <div className="flex flex-col gap-3">
                {[t('Privacy Policy','سياسة الخصوصية'), t('Terms of Service','شروط الخدمة'), t('Careers','وظائف'), t('Contact Support','الدعم')].map(label => (
                  <a key={label} href="#" className="text-on-surface-variant hover:text-secondary-fixed transition-colors text-sm">{label}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 text-center text-on-surface-variant text-xs"
          style={{ borderTop: '1px solid rgba(66,71,82,0.3)' }}>
          © 2025 Rasha Automotive Detailing. {t('All rights reserved.', 'جميع الحقوق محفوظة.')}
        </div>
      </footer>

      {/* WhatsApp FAB (desktop only) */}
      <div className="fixed bottom-24 right-6 z-40 hidden md:block">
        <button className="w-14 h-14 rounded-2xl hydro-gradient text-on-primary flex items-center justify-center shadow-xl hover:scale-110 transition-transform group relative">
          <span className="material-symbols-outlined text-3xl">chat</span>
          <span className="absolute right-16 glass text-on-surface px-3 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
            style={{ border: '1px solid rgba(66,71,82,0.3)' }}>
            WhatsApp Support
          </span>
        </button>
      </div>
    </div>
  )
}
