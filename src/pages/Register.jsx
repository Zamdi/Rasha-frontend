import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp, API } from '../context/AppContext'
import OtpInput from '../components/OtpInput'

export default function Register() {
  const { t, login, showToast } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', password:'' })
  const [showPw, setShowPw] = useState(false)
  const [step, setStep] = useState('form') // 'form' | 'otp'
  const [otp, setOtp] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const submit = async () => {
    if (!form.firstName||!form.lastName||!form.email||!form.phone||!form.password) {
      showToast(t('Please fill all fields','يرجى ملء جميع الحقول'),'error'); return
    }
    if (form.password.length < 8) { showToast(t('Password must be at least 8 characters','كلمة المرور 8 أحرف على الأقل'),'error'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ firstName:form.firstName, lastName:form.lastName, email:form.email, phone:'+249'+form.phone, password:form.password })
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error||t('Error','خطأ'),'error'); return }
      setMaskedEmail(data.maskedEmail)
      setStep('otp')
    } catch { showToast(t('Connection error','خطأ في الاتصال'),'error') }
    finally { setLoading(false) }
  }

  const verify = async () => {
    if (otp.length < 4) { showToast(t('Enter the full code','أدخل الرمز كاملاً'),'error'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/verify-register`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ firstName:form.firstName, lastName:form.lastName, email:form.email, phone:'+249'+form.phone, password:form.password, otp })
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error||t('Error','خطأ'),'error'); return }
      login(data.token, data.customer)
      showToast(t('Account created!','تم إنشاء حسابك!'))
      navigate('/loyalty')
    } catch { showToast(t('Error','خطأ'),'error') }
    finally { setLoading(false) }
  }

  const resend = async () => {
    await fetch(`${API}/api/auth/resend-otp`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:form.email,purpose:'register'})})
    showToast(t('Code resent','تم إعادة إرسال الرمز'))
  }

  return (
    <div className="pt-16 pb-24 md:pb-10 min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-on-surface font-display">{t('Create Account','إنشاء حساب')}</h1>
          <p className="text-on-surface-variant text-sm mt-1">{t('Join Rasha loyalty program and earn free washes.','انضم لبرنامج ولاء رشة.')}</p>
        </div>

        {step === 'form' ? (
          <div className="glass p-6 rounded-2xl space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">{t('First Name','الاسم الأول')}</label>
                <input className="rasha-input" value={form.firstName} onChange={e=>set('firstName',e.target.value)}/>
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">{t('Last Name','اسم العائلة')}</label>
                <input className="rasha-input" value={form.lastName} onChange={e=>set('lastName',e.target.value)}/>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">{t('Email','البريد الإلكتروني')}</label>
              <input type="email" className="rasha-input" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)}/>
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">{t('Phone','الهاتف')}</label>
              <div className="flex">
                <span className="bg-surface-container-high border border-outline-variant/50 border-e-0 rounded-s-xl px-3 py-3 text-sm text-on-surface-variant flex items-center shrink-0">+249</span>
                <input type="tel" placeholder="9XX XXX XXXX" className="rasha-input rounded-s-none" value={form.phone} onChange={e=>set('phone',e.target.value.replace(/\D/g,''))}/>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">{t('Password','كلمة المرور')}</label>
              <div className="relative">
                <input type={showPw?'text':'password'} placeholder={t('Min 8 characters','8 أحرف على الأقل')} className="rasha-input pe-12" value={form.password} onChange={e=>set('password',e.target.value)}/>
                <button type="button" onClick={()=>setShowPw(p=>!p)} className="absolute end-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-secondary-fixed transition-colors">
                  <span className="material-symbols-outlined text-xl">{showPw?'visibility_off':'visibility'}</span>
                </button>
              </div>
            </div>
            <button onClick={submit} disabled={loading} className="btn-primary w-full py-4 rounded-xl">
              {loading ? <div className="loader"/> : t('Create Account','إنشاء الحساب')}
            </button>
            <p className="text-center text-sm text-on-surface-variant">
              {t('Already have an account?','لديك حساب بالفعل؟')}{' '}
              <Link to="/login" className="text-secondary-fixed hover:underline">{t('Sign In','تسجيل الدخول')}</Link>
            </p>
          </div>
        ) : (
          <div className="glass p-6 rounded-2xl space-y-6 animate-fade-in">
            <div>
              <h3 className="font-bold text-on-surface mb-1">{t('Verify Your Email','تحقق من بريدك الإلكتروني')}</h3>
              <p className="text-on-surface-variant text-sm">{t(`We sent a code to ${maskedEmail}`, `تم إرسال رمز إلى ${maskedEmail}`)}</p>
            </div>
            <OtpInput value={otp} onChange={setOtp} />
            <button onClick={verify} disabled={loading} className="btn-primary w-full py-4 rounded-xl">
              {loading ? <div className="loader"/> : t('Verify & Create Account','تحقق وأنشئ الحساب')}
            </button>
            <button onClick={resend} className="w-full text-secondary-fixed text-sm hover:underline">{t('Resend Code','إعادة إرسال الرمز')}</button>
          </div>
        )}
      </div>
    </div>
  )
}
