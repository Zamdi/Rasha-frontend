import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, API } from '../context/AppContext'

const INVENTORY = [
  { name_en: 'Car Shampoo', name_ar: 'شامبو السيارة', pct: 15, color: 'bg-error' },
  { name_en: 'Microfiber Towels', name_ar: 'مناشف مايكروفايبر', pct: 60, color: 'bg-secondary-fixed' },
  { name_en: 'Glass Cleaner', name_ar: 'منظف زجاج', pct: 80, color: 'bg-primary-fixed-dim' },
  { name_en: 'Tire Shine', name_ar: 'لامع إطارات', pct: 35, color: 'bg-yellow-400' },
]

const MODAL_BLANK = { firstName: '', lastName: '', email: '', phone: '', password: '' }

export default function StaffDashboard() {
  const { t, staffToken, setStaffToken, showToast } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uidInput, setUidInput] = useState('')
  const [customer, setCustomer] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [scannerOn, setScannerOn] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const searchTimeout = useRef(null)
  // Customer modal
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [modalForm, setModalForm] = useState(MODAL_BLANK)
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    if (!staffToken) { navigate('/staff'); return }
    loadData()
  }, [staffToken])

  const hdrs = { Authorization: 'Bearer ' + staffToken, 'Content-Type': 'application/json' }

  const loadData = async () => {
    setLoading(true)
    try {
      const [sRes, bRes] = await Promise.all([
        fetch(`${API}/api/admin/stats`, { headers: hdrs }),
        fetch(`${API}/api/admin/bookings`, { headers: hdrs }),
      ])
      if (sRes.status === 401) { setStaffToken(null); navigate('/staff'); return }
      const s = await sRes.json()
      const b = await bRes.json()
      setStats(s)
      setBookings(b.bookings || [])
    } catch { showToast(t('Failed to load', 'فشل التحميل'), 'error') }
    finally { setLoading(false) }
  }

  const loadMessages = async () => {
    try {
      const res = await fetch(`${API}/api/messages`, { headers: hdrs })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch {}
  }

  useEffect(() => {
    if (activeTab === 'messages') loadMessages()
  }, [activeTab])

  const lookup = async (uid) => {
    const id = (uid || uidInput).trim().toUpperCase()
    if (!id) { showToast(t('Enter customer ID', 'أدخل رمز العميل'), 'error'); return }
    try {
      const res = await fetch(`${API}/api/admin/customers/${id}`, { headers: hdrs })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || t('Not found', 'غير موجود'), 'error'); setCustomer(null); return }
      setCustomer(data.customer)
    } catch { showToast(t('Error', 'خطأ'), 'error') }
  }

  const markWash = async () => {
    if (!customer) return
    try {
      const res = await fetch(`${API}/api/admin/customers/${customer.customer_uid}/mark-wash`, { method: 'POST', headers: hdrs })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || t('Error', 'خطأ'), 'error'); return }
      showToast(data.message || t('Wash marked!', 'تم تسجيل الغسيل!'))
      if (data.earnedFreeWash) showToast(`🎉 ${t('Customer earned a FREE wash!', 'العميل ربح غسيلاً مجانياً!')}`)
      setCustomer(c => ({ ...c, stamps: data.stampsNow }))
      loadData()
    } catch { showToast(t('Error', 'خطأ'), 'error') }
  }

  const toggleAccess = async () => {
    if (!customer) return
    try {
      const res = await fetch(`${API}/api/admin/customers/${customer.customer_uid}/toggle-access`, { method: 'PATCH', headers: hdrs })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || t('Error', 'خطأ'), 'error'); return }
      showToast(data.message)
      setCustomer(c => ({ ...c, is_active: data.isActive }))
    } catch { showToast(t('Error', 'خطأ'), 'error') }
  }

  const deleteCustomer = async () => {
    if (!customer) return
    if (!confirm(t(`Delete ${customer.first_name} ${customer.last_name}? This cannot be undone.`, `حذف ${customer.first_name} ${customer.last_name}؟ لا يمكن التراجع عن هذا.`))) return
    try {
      const res = await fetch(`${API}/api/admin/customers/${customer.customer_uid}`, { method: 'DELETE', headers: hdrs })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || t('Error', 'خطأ'), 'error'); return }
      showToast(t('Customer deleted', 'تم حذف العميل'))
      setCustomer(null)
      setUidInput('')
      loadData()
    } catch { showToast(t('Error', 'خطأ'), 'error') }
  }

  const openAddModal = () => {
    setModalMode('add')
    setModalForm(MODAL_BLANK)
    setShowModal(true)
  }

  const openEditModal = () => {
    if (!customer) return
    setModalMode('edit')
    setModalForm({
      firstName: customer.first_name || '',
      lastName: customer.last_name || '',
      email: customer.email || '',
      phone: (customer.phone || '').replace('+249', ''),
      password: '',
    })
    setShowModal(true)
  }

  const submitModal = async () => {
    setModalLoading(true)
    try {
      if (modalMode === 'add') {
        const res = await fetch(`${API}/api/admin/customers`, {
          method: 'POST', headers: hdrs,
          body: JSON.stringify({
            firstName: modalForm.firstName, lastName: modalForm.lastName,
            email: modalForm.email, phone: '+249' + modalForm.phone, password: modalForm.password,
          })
        })
        const data = await res.json()
        if (!res.ok) { showToast(data.error || t('Error', 'خطأ'), 'error'); setModalLoading(false); return }
        showToast(t('Customer added!', 'تم إضافة العميل!'))
      } else {
        const body = {
          firstName: modalForm.firstName, lastName: modalForm.lastName,
          email: modalForm.email, phone: '+249' + modalForm.phone,
        }
        if (modalForm.password) body.password = modalForm.password
        const res = await fetch(`${API}/api/admin/customers/${customer.customer_uid}`, {
          method: 'PATCH', headers: hdrs, body: JSON.stringify(body)
        })
        const data = await res.json()
        if (!res.ok) { showToast(data.error || t('Error', 'خطأ'), 'error'); setModalLoading(false); return }
        showToast(t('Customer updated!', 'تم تحديث العميل!'))
        setCustomer(c => ({ ...c, first_name: modalForm.firstName, last_name: modalForm.lastName, email: modalForm.email, phone: '+249' + modalForm.phone }))
      }
      setShowModal(false)
      loadData()
    } catch { showToast(t('Error', 'خطأ'), 'error') }
    finally { setModalLoading(false) }
  }

  const cancelBooking = async (id) => {
    if (!confirm(t('Cancel this booking?', 'إلغاء هذا الحجز؟'))) return
    try {
      await fetch(`${API}/api/admin/bookings/${id}/cancel`, { method: 'PATCH', headers: hdrs })
      showToast(t('Booking cancelled', 'تم إلغاء الحجز'))
      loadData()
    } catch {}
  }

  const handleSearch = (q) => {
    setSearchQuery(q)
    clearTimeout(searchTimeout.current)
    if (q.length < 2) { setSearchResults([]); return }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/admin/customers?search=${encodeURIComponent(q)}`, { headers: hdrs })
        const data = await res.json()
        setSearchResults((data.customers || []).slice(0, 5))
      } catch {}
    }, 400)
  }

  const toggleScanner = async () => {
    if (scannerOn) { stopScanner(); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      setScannerOn(true)
    } catch { showToast(t('Camera access denied', 'لا يمكن الوصول للكاميرا'), 'error') }
  }

  const stopScanner = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setScannerOn(false)

  }

  const staffLogout = () => { stopScanner(); setStaffToken(null); navigate('/') }

  const now = new Date()
  const shiftInfo = `${now.toLocaleDateString(t('en-US','ar-SA'),{weekday:'long',month:'long',day:'numeric'})} · ${now.toLocaleTimeString(t('en-US','ar-SA'),{hour:'2-digit',minute:'2-digit'})}`

  return (
    <div className="min-h-screen bg-background">
      {/* Staff top bar */}
      <header className="fixed top-0 w-full z-50 glass-high border-b border-secondary-container/20 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="font-display font-extrabold text-xl text-secondary-fixed">RASHA</span>
            <span className="hidden md:block h-5 w-px bg-outline-variant/40 mx-1" />
            <span className="hidden md:block text-xs text-on-surface-variant font-semibold uppercase tracking-widest">{t('Staff Portal', 'بوابة الموظفين')}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={loadData} className="glass px-4 py-2 rounded-xl text-secondary-fixed text-xs font-bold flex items-center gap-1 hover:border-secondary-fixed/50 transition-all">
              <span className="material-symbols-outlined text-base">refresh</span>
              <span className="hidden sm:block">{t('Refresh', 'تحديث')}</span>
            </button>
            <button onClick={staffLogout} className="glass px-4 py-2 rounded-xl text-error text-xs font-bold flex items-center gap-1 hover:bg-error/5 transition-all">
              <span className="material-symbols-outlined text-base">logout</span>
              <span className="hidden sm:block">{t('Logout', 'خروج')}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="pt-24 pb-10 max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-secondary-fixed font-display">{t('Operations Overview', 'لوحة العمليات')}</h1>
            <p className="text-on-surface-variant text-sm">{shiftInfo}</p>
          </div>
          <button onClick={openAddModal} className="hydro-gradient px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity cyan-glow">
            <span className="material-symbols-outlined text-base">person_add</span>
            {t('Add Customer', 'إضافة عميل')}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: '#1d2022', border: '1px solid rgba(66,71,82,0.4)' }}>
          {[['dashboard', 'dashboard', t('Dashboard', 'اللوحة')], ['messages', 'mail', t('Messages', 'الرسائل')]].map(([tab, icon, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'hydro-gradient text-white' : 'text-on-surface-variant hover:text-on-surface'}`}>
              <span className="material-symbols-outlined text-base">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="glass rounded-2xl overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center">
              <h3 className="font-bold text-on-surface">{t('Customer Messages', 'رسائل العملاء')}</h3>
              <button onClick={loadMessages} className="text-secondary-fixed text-xs hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-base">refresh</span>{t('Refresh', 'تحديث')}
              </button>
            </div>
            {messages.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-3 block">mark_email_read</span>
                <p className="text-on-surface-variant text-sm">{t('No messages yet', 'لا توجد رسائل بعد')}</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/10">
                {messages.map((msg) => (
                  <div key={msg.id}
                    className={`p-5 transition-colors ${msg.is_read ? 'hover:bg-surface-variant/5' : 'bg-secondary-fixed/5 hover:bg-secondary-fixed/8'}`}
                    onClick={async () => {
                      if (!msg.is_read) {
                        await fetch(`${API}/api/messages/${msg.id}/read`, { method: 'PATCH', headers: hdrs })
                        setMessages(msgs => msgs.map(m => m.id === msg.id ? {...m, is_read: 1} : m))
                      }
                    }}
                    style={{ cursor: msg.is_read ? 'default' : 'pointer' }}
                  >
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        {!msg.is_read && <span className="w-2 h-2 rounded-full bg-secondary-fixed shrink-0" />}
                        <div>
                          <p className={`font-semibold text-sm ${msg.is_read ? 'text-on-surface' : 'text-secondary-fixed'}`}>{msg.name}</p>
                          <p className="text-xs text-on-surface-variant">{msg.email}</p>
                        </div>
                      </div>
                      <div className="text-end shrink-0">
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-surface-container-high text-on-surface-variant">{msg.subject}</span>
                        <p className="text-xs text-on-surface-variant mt-1">{msg.created_at ? new Date(msg.created_at).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{msg.message}</p>
                    {!msg.is_read && <p className="text-xs text-secondary-fixed mt-2">{t('Click to mark as read', 'انقر للتعليم كمقروء')}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (<>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            ['calendar_today', t('Total Customers','إجمالي العملاء'), stats?.totalCustomers],
            ['check_circle', t('Total Bookings','إجمالي الحجوزات'), stats?.totalBookings],
            ['stars', t('Total Washes','إجمالي الغسيلات'), stats?.totalStamps],
            ['redeem', t('Free Washes Given','غسيلات مجانية'), stats?.freeWashesUsed],
          ].map(([icon, label, value]) => (
            <div key={label} className="glass p-4 rounded-xl inner-glow">
              <span className="material-symbols-outlined text-secondary-fixed-dim text-2xl mb-3 block">{icon}</span>
              <p className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">{label}</p>
              <h2 className="text-3xl font-bold text-on-surface mt-1 font-display">{loading ? '—' : (value ?? '—')}</h2>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Scanner + Bookings */}
          <div className="lg:col-span-2 space-y-4">
            {/* QR Scanner / UID lookup */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center">
                <h3 className="font-bold text-on-surface">{t('Scan Customer QR / Enter ID', 'مسح QR العميل / إدخال الرمز')}</h3>
                <button onClick={toggleScanner} className={`hydro-gradient px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity ${scannerOn ? 'bg-error' : ''}`}>
                  <span className="material-symbols-outlined text-sm">{scannerOn ? 'stop' : 'qr_code_scanner'}</span>
                  {scannerOn ? t('Stop', 'إيقاف') : t('Scan QR', 'مسح QR')}
                </button>
              </div>
              {scannerOn && (
                <div className="p-4">
                  <video ref={videoRef} autoPlay muted playsInline className="w-full rounded-xl max-h-56 object-cover bg-black" />
                  <p className="text-xs text-on-surface-variant text-center mt-2">{t('Point camera at customer QR code', 'وجّه الكاميرا نحو رمز QR للعميل')}</p>
                </div>
              )}
              <div className="p-4 flex gap-3">
                <input value={uidInput} onChange={e => setUidInput(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && lookup()} placeholder="RW-00001" className="rasha-input flex-1 uppercase" />
                <button onClick={() => lookup()} className="btn-primary px-6 py-3 rounded-xl shrink-0">{t('Look Up', 'بحث')}</button>
              </div>
              {/* Customer result */}
              {customer && (
                <div className="p-4 border-t border-outline-variant/20 animate-fade-in">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h4 className="font-bold text-on-surface text-lg">{customer.first_name} {customer.last_name}</h4>
                      <p className="text-sm text-on-surface-variant">{customer.phone}</p>
                      <p className="text-xs text-secondary-fixed font-bold mt-1">{customer.customer_uid}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-on-surface-variant">{t('Stamps:', 'طوابع:')}</span>
                        <span className="text-secondary-fixed font-bold text-lg">{customer.stamps}</span>
                        <span className="text-on-surface-variant">/5</span>
                        {customer.stamps >= 5 && <span className="text-xs bg-secondary-fixed/10 text-secondary-fixed px-2 py-0.5 rounded-full border border-secondary-fixed/30">🎉 {t('Free Wash Ready!', 'غسيل مجاني!')}</span>}
                      </div>
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${customer.is_active ? 'bg-green-500/10 text-green-400' : 'bg-error/10 text-error'}`}>
                          {customer.is_active ? t('Active', 'نشط') : t('Suspended', 'موقوف')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={markWash} className="btn-primary px-5 py-3 rounded-xl">
                        <span className="material-symbols-outlined fill-icon text-base">water_drop</span>
                        {t('Mark Wash', 'تسجيل غسيل')}
                      </button>
                      <button onClick={toggleAccess} className={`glass px-5 py-2 rounded-xl text-sm font-bold transition-colors ${customer.is_active ? 'text-error hover:bg-error/5' : 'text-secondary-fixed hover:bg-secondary-fixed/5'}`}>
                        {customer.is_active ? t('Suspend', 'إيقاف') : t('Restore', 'تفعيل')}
                      </button>
                      <button onClick={openEditModal} className="glass px-5 py-2 rounded-xl text-secondary-fixed text-sm font-bold hover:bg-secondary-fixed/5 transition-colors flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-base">edit</span>
                        {t('Edit', 'تعديل')}
                      </button>
                      <button onClick={deleteCustomer} className="glass px-5 py-2 rounded-xl text-error text-sm font-bold hover:bg-error/5 transition-colors flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-base">delete</span>
                        {t('Delete', 'حذف')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bookings table */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-outline-variant/20">
                <h3 className="font-bold text-on-surface">{t('Recent Bookings', 'الحجوزات الأخيرة')}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-container-high/30">
                    <tr>
                      {[t('Ref','المرجع'),t('Customer','العميل'),t('Service','الخدمة'),t('Date/Time','التاريخ'),t('Status','الحالة'),''].map(h=>(
                        <th key={h} className="px-4 py-3 text-xs text-on-surface-variant uppercase font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {loading ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant"><div className="loader mx-auto" /></td></tr>
                    ) : bookings.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant text-sm">{t('No bookings', 'لا توجد حجوزات')}</td></tr>
                    ) : bookings.slice(0, 15).map(b => (
                      <tr key={b.id} className="hover:bg-surface-variant/10 transition-colors">
                        <td className="px-4 py-3 text-xs font-bold text-secondary-fixed whitespace-nowrap">#RSH-{b.booking_uid.replace('BK-','')}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-on-surface font-semibold whitespace-nowrap">{b.customer_name||'-'}</p>
                          <p className="text-xs text-on-surface-variant">{b.customer_phone||''}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant whitespace-nowrap">{b.service_type==='full'?t('Full','كامل'):t('Exterior','خارجي')}</td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">{b.booking_date}<br/>{b.booking_time}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                            b.status==='confirmed'?'bg-secondary-container/20 text-secondary-fixed border border-secondary-container/30':
                            b.status==='completed'?'bg-green-500/10 text-green-400 border border-green-500/20':
                            'bg-error-container/20 text-error border border-error/20'
                          }`}>{b.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          {b.status==='confirmed'&&<button onClick={()=>cancelBooking(b.id)} className="text-error text-xs hover:underline">{t('Cancel','إلغاء')}</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Customer search */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-outline-variant/20">
                <h3 className="font-bold text-on-surface text-sm">{t('Customer Search', 'بحث عن عميل')}</h3>
              </div>
              <div className="p-4 space-y-3">
                <input value={searchQuery} onChange={e=>handleSearch(e.target.value)} className="rasha-input" placeholder={t('Name, phone, email...', 'الاسم، الهاتف...')} />
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map(c => (
                    <button key={c.id} onClick={()=>{ setUidInput(c.customer_uid); setSearchResults([]); setSearchQuery(''); lookup(c.customer_uid); }} className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors text-start">
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{c.first_name} {c.last_name}</p>
                        <p className="text-xs text-on-surface-variant">{c.customer_uid} · {c.stamps}/5 stamps</p>
                      </div>
                      <span className="material-symbols-outlined text-secondary-fixed text-base rtl-flip">chevron_right</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="glass rounded-2xl p-4">
              <h4 className="text-xs font-bold text-secondary-fixed uppercase tracking-widest mb-4 flex justify-between items-center">
                {t('Inventory', 'المخزون')}
                <span className="material-symbols-outlined text-sm">inventory_2</span>
              </h4>
              <div className="space-y-4">
                {INVENTORY.map(item => (
                  <div key={item.name_en}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-on-surface">{t(item.name_en, item.name_ar)}</span>
                      <span className={`font-bold ${item.pct < 20 ? 'text-error' : item.pct < 40 ? 'text-yellow-400' : 'text-secondary-fixed'}`}>{item.pct}%</span>
                    </div>
                    <div className="h-2 bg-surface-variant rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 border border-outline-variant/30 rounded-xl text-on-surface-variant text-xs font-bold hover:bg-surface-variant transition-colors">
                {t('Request Restock', 'طلب تعبئة')}
              </button>
            </div>
          </div>
        </div>
        </>)}
      </div>

      {/* Add/Edit Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 animate-fade-in" style={{ background: '#1d2022', border: '1px solid rgba(116,245,255,0.15)' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-on-surface text-lg font-display">
                {modalMode === 'add' ? t('Add Customer', 'إضافة عميل') : t('Edit Customer', 'تعديل العميل')}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 block">{t('First Name', 'الاسم الأول')} *</label>
                  <input className="w-full px-3 py-2.5 rounded-lg text-on-surface text-sm focus:outline-none" style={{ background: '#272a2c', border: '1px solid #424752' }}
                    value={modalForm.firstName} onChange={e => setModalForm(f => ({...f, firstName: e.target.value}))}
                    onFocus={e => e.target.style.borderColor='#74f5ff'} onBlur={e => e.target.style.borderColor='#424752'} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 block">{t('Last Name', 'اسم العائلة')} *</label>
                  <input className="w-full px-3 py-2.5 rounded-lg text-on-surface text-sm focus:outline-none" style={{ background: '#272a2c', border: '1px solid #424752' }}
                    value={modalForm.lastName} onChange={e => setModalForm(f => ({...f, lastName: e.target.value}))}
                    onFocus={e => e.target.style.borderColor='#74f5ff'} onBlur={e => e.target.style.borderColor='#424752'} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 block">{t('Email', 'البريد الإلكتروني')} *</label>
                <input type="email" className="w-full px-3 py-2.5 rounded-lg text-on-surface text-sm focus:outline-none" style={{ background: '#272a2c', border: '1px solid #424752' }}
                  value={modalForm.email} onChange={e => setModalForm(f => ({...f, email: e.target.value}))}
                  onFocus={e => e.target.style.borderColor='#74f5ff'} onBlur={e => e.target.style.borderColor='#424752'} />
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 block">{t('Phone', 'الهاتف')} *</label>
                <div className="flex">
                  <span className="px-3 py-2.5 text-sm text-on-surface-variant flex items-center shrink-0 rounded-s-lg" style={{ background: '#323537', border: '1px solid #424752', borderRight: 'none' }}>+249</span>
                  <input type="tel" className="flex-1 px-3 py-2.5 rounded-e-lg text-on-surface text-sm focus:outline-none" style={{ background: '#272a2c', border: '1px solid #424752' }}
                    value={modalForm.phone} onChange={e => setModalForm(f => ({...f, phone: e.target.value.replace(/\D/g,'')}))}
                    onFocus={e => e.target.style.borderColor='#74f5ff'} onBlur={e => e.target.style.borderColor='#424752'} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                  {t('Password', 'كلمة المرور')} {modalMode === 'edit' ? t('(leave blank to keep)', '(اتركه لعدم التغيير)') : '*'}
                </label>
                <input type="password" className="w-full px-3 py-2.5 rounded-lg text-on-surface text-sm focus:outline-none" style={{ background: '#272a2c', border: '1px solid #424752' }}
                  value={modalForm.password} onChange={e => setModalForm(f => ({...f, password: e.target.value}))}
                  onFocus={e => e.target.style.borderColor='#74f5ff'} onBlur={e => e.target.style.borderColor='#424752'} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl text-on-surface-variant font-bold text-sm transition-colors hover:bg-surface-variant" style={{ background: '#272a2c', border: '1px solid #424752' }}>
                  {t('Cancel', 'إلغاء')}
                </button>
                <button onClick={submitModal} disabled={modalLoading} className="flex-1 py-3 rounded-xl font-bold text-sm hydro-gradient text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                  {modalLoading ? <div className="loader" /> : (modalMode === 'add' ? t('Add Customer', 'إضافة') : t('Save Changes', 'حفظ'))}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
