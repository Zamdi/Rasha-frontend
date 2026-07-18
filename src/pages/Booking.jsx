import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp, API } from '../context/AppContext'
import { formatTime } from '../utils/format'

const ALL_SLOTS = ['11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM','12:00 AM']

const today = () => new Date().toISOString().split('T')[0]

export default function Booking() {
  const { t, lang, customer, token, showToast } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    firstName: customer?.first_name || '',
    lastName: customer?.last_name || '',
    phone: (customer?.phone || '').replace('+249', '') || location.state?.phone || '',
    email: customer?.email || '',
    vehicle: '',
    service: location.state?.service || 'full',
    date: today(),
  })
  const [selectedSlot, setSelectedSlot] = useState('')
  const [slots, setSlots] = useState({ available: [], booked: [] })
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (form.date) loadSlots(form.date) }, [form.date])

  const loadSlots = async (date) => {
    setSlotsLoading(true)
    setSelectedSlot('')
    try {
      const res = await fetch(`${API}/api/bookings/slots?date=${date}`)
      const data = await res.json()
      setSlots({ available: data.available || [], booked: data.booked || [] })
    } catch { showToast(t('Could not load slots', 'تعذر تحميل المواعيد'), 'error') }
    finally { setSlotsLoading(false) }
  }

  const goToStep2 = () => {
    if (!form.firstName || !form.lastName || !form.phone || !form.date) {
      showToast(t('Please fill all required fields', 'يرجى ملء الحقول المطلوبة'), 'error'); return
    }
    setStep(2); window.scrollTo(0, 0)
  }

  const goToStep3 = () => {
    if (!selectedSlot) { showToast(t('Please select a time slot', 'اختر موعداً'), 'error'); return }
    setStep(3); window.scrollTo(0, 0)
  }

  const submitBooking = async () => {
    setLoading(true)
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = 'Bearer ' + token
    try {
      const res = await fetch(`${API}/api/bookings`, {
        method: 'POST', headers,
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`,
          phone: '+249' + form.phone,
          email: form.email || undefined,
          vehicle: form.vehicle || undefined,
          service: form.service,
          date: form.date,
          time: selectedSlot,
        }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || t('Booking failed', 'فشل الحجز'), 'error'); return }
      const ref = '#RSH-' + data.booking.booking_uid.replace('BK-', '')
      navigate('/confirmation', { state: { ref, service: form.service, date: form.date, time: selectedSlot, name: `${form.firstName} ${form.lastName}` } })
    } catch { showToast(t('Connection error', 'خطأ في الاتصال'), 'error') }
    finally { setLoading(false) }
  }

  const serviceLabel = form.service === 'full' ? t('Full Wash', 'غسيل كامل') : t('Exterior Only', 'خارجي فقط')

  const StepCircle = ({ n, active }) => (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${active || step > n ? 'hydro-gradient text-white' : 'bg-surface-container-highest border border-outline-variant text-on-surface-variant'}`}>{step > n ? '✓' : n}</div>
  )

  return (
    <div className="pt-16 pb-24 md:pb-10 min-h-screen">
      <div className="max-w-xl mx-auto px-4 md:px-6 py-10">
        <button onClick={() => step > 1 ? setStep(s => s-1) : navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-secondary-fixed transition-colors text-sm mb-6">
          <span className="material-symbols-outlined rtl-flip text-base">arrow_back</span>
          {t('Back', 'رجوع')}
        </button>

        <h1 className="text-3xl font-bold text-on-surface font-display mb-1">{t('Book a Wash', 'احجز غسيل')}</h1>
        <p className="text-on-surface-variant text-sm mb-8">{t("Choose your service, pick a time, and you're done.", 'اختر خدمتك، حدد الوقت.')}</p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          <StepCircle n={1} active={step === 1} />
          <span className={`text-xs font-semibold hidden sm:block ${step === 1 ? 'text-secondary-fixed' : 'text-on-surface-variant'}`}>{t('Details', 'التفاصيل')}</span>
          <div className="flex-1 h-px" style={{background:'var(--color-outline-variant)', opacity:0.4}} />
          <StepCircle n={2} active={step === 2} />
          <span className={`text-xs font-semibold hidden sm:block ${step === 2 ? 'text-secondary-fixed' : 'text-on-surface-variant'}`}>{t('Time Slot', 'الموعد')}</span>
          <div className="flex-1 h-px" style={{background:'var(--color-outline-variant)', opacity:0.4}} />
          <StepCircle n={3} active={step === 3} />
          <span className={`text-xs font-semibold hidden sm:block ${step === 3 ? 'text-secondary-fixed' : 'text-on-surface-variant'}`}>{t('Confirm', 'التأكيد')}</span>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="glass p-6 rounded-2xl space-y-4 animate-fade-in">
            <h3 className="font-bold text-on-surface mb-2">{t('Your Details', 'بياناتك')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">{t('First Name', 'الاسم الأول')} *</label>
                <input className="rasha-input" value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">{t('Last Name', 'اسم العائلة')} *</label>
                <input className="rasha-input" value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">{t('Phone', 'الهاتف')} *</label>
              <div className="flex" dir="ltr">
                <span className="rounded-l-xl px-3 py-3 text-sm text-on-surface-variant flex items-center shrink-0"
                  style={{background:'var(--color-surface-container-high)', border:'1px solid var(--color-outline-variant)', borderRight:'none'}}>+249</span>
                <input type="tel" placeholder="9XX XXX XXXX" className="rasha-input" style={{borderRadius:'0 0.75rem 0.75rem 0'}} value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value.replace(/\D/g,'')}))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">{t('Email (optional)', 'البريد (اختياري)')}</label>
              <input type="email" className="rasha-input" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">{t('Vehicle Info (optional)', 'السيارة (اختياري)')}</label>
              <input className="rasha-input" placeholder={t('e.g. Toyota Camry - White', 'مثال: تويوتا كامري - أبيض')} value={form.vehicle} onChange={e => setForm(f => ({...f, vehicle: e.target.value}))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">{t('Service Type', 'نوع الخدمة')} *</label>
              <select className="rasha-select" value={form.service} onChange={e => setForm(f => ({...f, service: e.target.value}))}>
                <option value="full">{t('Full Wash', 'غسيل كامل')}</option>
                <option value="outside">{t('Exterior Only', 'خارجي فقط')}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">{t('Date', 'التاريخ')} *</label>
              <input type="date" className="rasha-input" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} />
            </div>
            <button onClick={goToStep2} className="btn-primary w-full py-4 rounded-xl">
              {t('Choose Time Slot', 'اختر الموعد')}
              <span className="material-symbols-outlined rtl-flip text-base">arrow_forward</span>
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="glass p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-on-surface">{t('Available Slots', 'المواعيد المتاحة')}</h3>
                <span className="text-xs text-secondary-fixed font-bold">
                  {new Date(form.date + 'T12:00:00').toLocaleDateString(t('en-US', 'ar-EG'), { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              {slotsLoading ? (
                <div className="flex justify-center py-10"><div className="loader" /></div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {ALL_SLOTS.map(slot => {
                    const booked = slots.booked.includes(slot)
                    const selected = selectedSlot === slot
                    return (
                      <button
                        key={slot}
                        disabled={booked}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-1 text-xs font-semibold rounded-xl transition-all ${booked ? 'slot-booked' : selected ? 'slot-selected' : 'slot-available'}`}
                        dir="ltr"
                      >
                        {formatTime(slot, lang)}
                      </button>
                    )
                  })}
                </div>
              )}
              {!slotsLoading && slots.booked.length === ALL_SLOTS.length && (
                <p className="text-center text-on-surface-variant text-sm py-4">{t('No slots available for this date.', 'لا توجد مواعيد متاحة.')}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-glass flex-1 py-4 rounded-xl">{t('Back', 'رجوع')}</button>
              <button onClick={goToStep3} className="btn-primary flex-1 py-4 rounded-xl">{t('Continue', 'متابعة')}</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="glass p-6 rounded-2xl">
              <h3 className="font-bold text-on-surface mb-4">{t('Review & Confirm', 'مراجعة وتأكيد')}</h3>
              <div className="space-y-3 text-sm">
                {[
                  [t('Name','الاسم'), `${form.firstName} ${form.lastName}`, false],
                  [t('Phone','الهاتف'), `+249${form.phone}`, true],
                  [t('Service','الخدمة'), serviceLabel, false],
                  [t('Date','التاريخ'), new Date(form.date + 'T12:00:00').toLocaleDateString(t('en-US','ar-EG'), {year:'numeric',month:'long',day:'numeric'}), false],
                  [t('Time','الوقت'), formatTime(selectedSlot, lang), true],
                  ...(form.vehicle ? [[t('Vehicle','السيارة'), form.vehicle, false]] : []),
                ].map(([label, value, ltr], idx, arr) => (
                  <div key={label} className="flex justify-between py-2"
                    style={{borderBottom: idx < arr.length - 1 ? '1px solid var(--color-outline-variant)' : 'none'}}>
                    <span className="text-on-surface-variant">{label}</span>
                    <span className={`font-semibold ${label === t('Time','الوقت') ? 'text-secondary-fixed' : 'text-on-surface'}`}
                      dir={ltr ? 'ltr' : undefined} style={ltr ? {unicodeBidi:'embed'} : undefined}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-glass flex-1 py-4 rounded-xl">{t('Back', 'رجوع')}</button>
              <button onClick={submitBooking} disabled={loading} className="btn-primary flex-1 py-4 rounded-xl">
                {loading ? <div className="loader" /> : t('Confirm Booking', 'تأكيد الحجز')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
