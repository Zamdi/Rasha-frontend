import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const BG_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuARf1pFuG9m96gjPalKL6YFrP4hgKi8b34Su0tOKVPfliOF2hQRpWEWwMcudUu8ThBE_qh4qxV603xPs3oE-vWbbKj7HIxmmDXku3j3X9Y4ZAbm2ugxDtwHEaxJVeyFCI3J5D0BgoePAr8QuqQSRZbQ4zxk7id7BqEFD079rFVmgF5olxFO9CVW9N9MCQOzwv_q5pwxsjQf-wSVBdwUmTOw1OtjGNMwXU47gBkG19w1TKrfhKSuzQw"

const Section = ({ icon, title, children }) => (
  <div className="rounded-xl p-6 md:p-8" style={{ background: '#1d2022', border: '1px solid rgba(66,71,82,0.3)' }}>
    <h2 className="text-xl font-bold text-on-surface font-display mb-4 flex items-center gap-3">
      <span className="material-symbols-outlined text-secondary-fixed text-2xl">{icon}</span>
      {title}
    </h2>
    {children}
  </div>
)

export default function Privacy() {
  const { t } = useApp()

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0" style={{ background: '#101415' }}>
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 md:px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold font-display text-on-surface mb-3">
            {t('Privacy Policy', 'سياسة الخصوصية')}
          </h1>
          <p className="text-on-surface-variant text-sm">
            {t('Last updated: May 2024. Your trust is our priority. We are committed to protecting your personal data through advanced security and transparency.',
              'آخر تحديث: مايو 2024. ثقتك أولويتنا. نلتزم بحماية بياناتك الشخصية من خلال الأمان المتقدم والشفافية.')}
          </p>
        </div>

        <div className="space-y-4">
          {/* 1. Introduction — full width */}
          <Section icon="shield" title={t('1. Introduction', '1. المقدمة')}>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              {t('At Rasha, we value your privacy above all. This policy outlines how we handle your information when you use our premium automotive detailing services. We ensure that every interaction remains confidential and secure.',
                'في رشة، نقدّر خصوصيتك فوق كل شيء. تحدد هذه السياسة كيفية تعاملنا مع معلوماتك عند استخدام خدمات التفصيل المتميزة لدينا. نضمن أن تظل كل تفاعل سرياً وآمناً.')}
            </p>
          </Section>

          {/* 2 & 3 side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section icon="sync" title={t('2. Information We Collect', '2. المعلومات التي نجمعها')}>
              <ul className="space-y-3">
                {[
                  t('Phone Number (Sudan +249)', 'رقم الهاتف (السودان +249)'),
                  t('Booking & Service History', 'سجل الحجوزات والخدمات'),
                  t('Loyalty Progress & Rewards', 'تقدم الولاء والمكافآت'),
                  t('Vehicle Model & Detailing Preferences', 'نموذج السيارة وتفضيلات التفصيل'),
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined fill-icon text-secondary-fixed-dim text-base">radio_button_checked</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section icon="shield_person" title={t('3. Data Usage', '3. استخدام البيانات')}>
              <p className="text-on-surface-variant text-sm mb-3">
                {t('We use your data strictly to provide the Hydro-Premium experience:', 'نستخدم بياناتك حصراً لتوفير تجربة هيدرو بريميوم:')}
              </p>
              <ul className="space-y-2">
                {[
                  t('Facilitating seamless carwash bookings', 'تسهيل حجوزات غسيل السيارات'),
                  t('Managing your exclusive loyalty status', 'إدارة حالة الولاء الحصرية الخاصة بك'),
                  t('Personalizing detailing recommendations', 'تخصيص توصيات التفصيل'),
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-on-surface-variant text-sm italic">
                    <span className="text-secondary-fixed-dim">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          {/* 4. Security — full width with watermark number */}
          <div className="rounded-xl p-6 md:p-8 relative overflow-hidden"
            style={{ background: '#1d2022', border: '1px solid rgba(66,71,82,0.3)' }}>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[120px] font-extrabold text-on-surface-variant/5 pointer-events-none select-none font-display">4</div>
            <h2 className="text-xl font-bold text-on-surface font-display mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary-fixed text-2xl">lock</span>
              {t('4. Security', '4. الأمان')}
            </h2>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-2xl">
              {t('We employ professional-grade encryption protocols to safeguard your records. Your data is stored on secure servers with restricted access, ensuring that your Sudanese carwash history and loyalty progress are protected against any unauthorized entry.',
                'نستخدم بروتوكولات تشفير احترافية لحماية سجلاتك. يتم تخزين بياناتك على خوادم آمنة بوصول مقيد، مما يضمن حماية سجل غسيل سيارتك في السودان وتقدم الولاء ضد أي دخول غير مصرح به.')}
            </p>
          </div>

          {/* 5. Contact Us */}
          <div className="rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            style={{ background: '#1d2022', border: '1px solid rgba(66,71,82,0.3)' }}>
            <div>
              <h2 className="text-xl font-bold text-on-surface font-display mb-2 flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary-fixed text-2xl">location_on</span>
                {t('5. Contact Us', '5. تواصل معنا')}
              </h2>
              <p className="text-on-surface-variant text-sm">
                {t("Have questions about your data? Our dedicated support team is here to help.", 'هل لديك أسئلة حول بياناتك؟ فريق الدعم المخصص لدينا هنا للمساعدة.')}
              </p>
            </div>
            <Link to="/contact"
              className="flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl whitespace-nowrap transition-all shrink-0"
              style={{ background: '#272a2c', border: '1px solid rgba(66,71,82,0.5)', color: '#e0e3e5' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#74f5ff'; e.currentTarget.style.color = '#74f5ff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(66,71,82,0.5)'; e.currentTarget.style.color = '#e0e3e5' }}>
              {t('Contact Support', 'تواصل مع الدعم')}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Background footer image */}
      <div className="relative w-full h-48 overflow-hidden" style={{ marginTop: '-1px' }}>
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${BG_IMG})` }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #101415 0%, transparent 40%, #0b0f10 100%)' }} />
      </div>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-outline-variant/10" style={{ background: '#0b0f10' }}>
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-xl font-extrabold text-on-surface tracking-wide font-display">Rasha</span>
            <p className="text-on-surface-variant text-xs mt-1">© 2025 Rasha Carwash Sudan. {t('All rights reserved.', 'جميع الحقوق محفوظة.')}</p>
          </div>
          <nav className="flex gap-6">
            {/* Privacy Policy not shown here since we're on that page */}
            <Link to="/terms" className="text-on-surface-variant hover:text-secondary-fixed transition-colors text-xs">{t('Terms of Service', 'شروط الخدمة')}</Link>
            <Link to="/contact" className="text-on-surface-variant hover:text-secondary-fixed transition-colors text-xs">{t('Contact Support', 'الدعم')}</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
