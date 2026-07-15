import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp, API } from '../context/AppContext'
import OtpInput from '../components/OtpInput'

export default function Login() {
  const { t, login, showToast } = useApp()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [step, setStep] = useState('form')
  const [otp, setOtp] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!identifier||!password) { showToast(t('Please fill all fields','يرجى ملء جميع الحقول'),'error'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({identifier,password})})
      const data = await res.json()
      if (!res.ok) { showToast(data.error||t('Invalid credentials','بيانات غير صحيحة'),'error'); return }
      setLoginEmail(data.email)
      setMaskedEmail(data.maskedEmail)
      setStep('otp')
    } catch { showToast(t('Connection error','خطأ في الاتصال'),'error') }
    finally { setLoading(false) }
  }

  const verify = async () => {
    if (otp.length < 6) { showToast(t('Enter the full code','أدخل الرمز كاملاً'),'error'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/verify-login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:loginEmail,otp})})
      const data = await res.json()
      if (!res.ok) { showToast(data.error||t('Error','خطأ'),'error'); return }
      login(data.token, data.customer)
      showToast(t('Welcome back!','مرحباً بك!'))
      navigate('/loyalty')
    } catch { showToast(t('Error','خطأ'),'error') }
    finally { setLoading(false) }
  }

  const resend = async () => {
    await fetch(`${API}/api/auth/resend-otp`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:loginEmail,purpose:'login'})})
    showToast(t('Code resent','تم إعادة إرسال الرمز'))
  }

  return (
    <div className="pt-16 pb-24 md:pb-10 min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-on-surface font-display">{t('Welcome Back','مرحباً بك')}</h1>
          <p className="text-on-surface-variant text-sm mt-1">{t('Sign in to access your loyalty card.','سجل دخولك للوصول لبطاقة ولائك.')}</p>
        </div>

        {step === 'form' ? (
          <div className="glass p-6 rounded-2xl space-y-4 animate-fade-in">
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">{t('Email or Phone','البريد أو الهاتف')}</label>
              <input className="rasha-input" placeholder="email@example.com" value={identifier} onChange={e=>setIdentifier(e.target.value)}/>
            </div>
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">{t('Password','كلمة المرور')}</label>
              <div className="relative">
                <input type={showPw?'text':'password'} className="rasha-input pe-12" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/>
                <button type="button" onClick={()=>setShowPw(p=>!p)} className="absolute end-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-secondary-fixed transition-colors">
                  <span className="material-symbols-outlined text-xl">{showPw?'visibility_off':'visibility'}</span>
                </button>
              </div>
            </div>
            <button onClick={submit} disabled={loading} className="btn-primary w-full py-4 rounded-xl">
              {loading ? <div className="loader"/> : t('Sign In','تسجيل الدخول')}
            </button>
            <p className="text-center text-sm text-on-surface-variant">
              {t("Don't have an account?",'ليس لديك حساب؟')}{' '}
              <Link to="/register" className="text-secondary-fixed hover:underline">{t('Register','إنشاء حساب')}</Link>
            </p>
          </div>
        ) : (
          <div className="glass p-6 rounded-2xl space-y-6 animate-fade-in">
            <div>
              <h3 className="font-bold text-on-surface mb-1">{t('Enter Verification Code','أدخل رمز التحقق')}</h3>
              <p className="text-on-surface-variant text-sm">{t(`Code sent to ${maskedEmail}`,`تم الإرسال إلى ${maskedEmail}`)}</p>
            </div>
            <OtpInput value={otp} onChange={setOtp}/>
            <button onClick={verify} disabled={loading} className="btn-primary w-full py-4 rounded-xl">
              {loading ? <div className="loader"/> : t('Verify & Sign In','تحقق وسجل الدخول')}
            </button>
            <button onClick={resend} className="w-full text-secondary-fixed text-sm hover:underline">{t('Resend Code','إعادة إرسال الرمز')}</button>
          </div>
        )}
      </div>
    </div>
  )
}
