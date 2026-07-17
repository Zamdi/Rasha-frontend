import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, API } from '../context/AppContext'
import jsQR from 'jsqr'

const INVENTORY = [
  { name_en: 'Car Shampoo', name_ar: 'شامبو السيارة', pct: 15, color: 'bg-error' },
  { name_en: 'Microfiber Towels', name_ar: 'مناشف مايكروفايبر', pct: 60, color: 'bg-secondary-fixed' },
  { name_en: 'Glass Cleaner', name_ar: 'منظف زجاج', pct: 80, color: 'bg-primary-fixed-dim' },
  { name_en: 'Tire Shine', name_ar: 'لامع إطارات', pct: 35, color: 'bg-yellow-400' },
]

const MODAL_BLANK = { firstName: '', lastName: '', email: '', phone: '', password: '' }

export default function StaffDashboard() {
  const { t, staffToken, setStaffToken, showToast, lang, toggleLang, isSuperAdmin } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [messages, setMessages] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [allCustomers, setAllCustomers] = useState([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [staffList, setStaffList] = useState([])
  const [staffLoading, setStaffLoading] = useState(false)
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [staffModalMode, setStaffModalMode] = useState('add')
  const [staffModalData, setStaffModalData] = useState({ id: null, username: '', password: '', displayName: '', permissions: {} })
  const [cooldownInfo, setCooldownInfo] = useState(null) // { nextScanAt, canForce }
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
        const msgs = data.messages || []
        setMessages(msgs)
        setUnreadCount(msgs.filter(m => !m.is_read).length)
      }
    } catch {}
  }

  const loadAllCustomers = async (search = '') => {
    setCustomersLoading(true)
    try {
      const url = search ? `${API}/api/admin/customers?search=${encodeURIComponent(search)}` : `${API}/api/admin/customers`
      const res = await fetch(url, { headers: hdrs })
      if (res.ok) { const data = await res.json(); setAllCustomers(data.customers || []) }
    } catch {}
    finally { setCustomersLoading(false) }
  }

  const loadStaff = async () => {
    setStaffLoading(true)
    try {
      const res = await fetch(`${API}/api/admin/staff`, { headers: hdrs })
      if (res.ok) { const data = await res.json(); setStaffList(data.staff || []) }
    } catch {}
    finally { setStaffLoading(false) }
  }

  // Poll unread count every 30 seconds while on dashboard
  useEffect(() => {
    if (!staffToken) return
    loadMessages() // load count on mount
    const interval = setInterval(loadMessages, 30000)
    return () => clearInterval(interval)
  }, [staffToken])

  useEffect(() => {
    if (activeTab === 'customers') loadAllCustomers(customerSearch)
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

  const markWash = async (forceRescan = false) => {
    if (!customer) return
    setCooldownInfo(null)
    try {
      const res = await fetch(`${API}/api/admin/customers/${customer.customer_uid}/mark-wash`, {
        method: 'POST', headers: hdrs,
        body: JSON.stringify(forceRescan ? { forceRescan: true } : {})
      })
      const data = await res.json()
      if (res.status === 429) {
        // QR cooldown active
        setCooldownInfo({ nextScanAt: data.nextScanAt, canForce: data.canForce, hoursSince: data.hoursSince })
        showToast(data.error, 'error')
        return
      }
      if (!res.ok) { showToast(data.error || t('Error', 'خطأ'), 'error'); return }
      showToast(data.message)
      if (data.earnedFreeWash) showToast(`🎉 ${t('Free wash ready! Mark wash again to redeem.', 'غسيل مجاني جاهز! اضغط مجدداً للاستخدام.')}`)
      if (data.usedFreeWash)  showToast(`✅ ${t('Free wash redeemed. Stamps reset.', 'تم استخدام الغسيل المجاني. تمت إعادة الطوابع.')}`)
      setCustomer(c => ({ ...c, stamps: data.stampsNow, total_washes: data.totalWashes,
        free_washes_used: data.usedFreeWash ? (c.free_washes_used ?? 0) + 1 : c.free_washes_used }))
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

  const deleteCustomer = async (cust) => {
    const c = cust || customer
    if (!c) return
    if (!confirm(t(`Delete ${c.first_name} ${c.last_name}? This cannot be undone.`, `حذف ${c.first_name} ${c.last_name}؟ لا يمكن التراجع.`))) return
    try {
      const res = await fetch(`${API}/api/admin/customers/${c.customer_uid}`, { method: 'DELETE', headers: hdrs })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || t('Error', 'خطأ'), 'error'); return }
      showToast(t('Customer deleted', 'تم حذف العميل'))
      if (customer?.customer_uid === c.customer_uid) { setCustomer(null); setUidInput('') }
      loadData()
      if (activeTab === 'customers') loadAllCustomers(customerSearch)
    } catch { showToast(t('Error', 'خطأ'), 'error') }
  }

  const openAddModal = () => {
    setModalMode('add')
    setModalForm(MODAL_BLANK)
    setShowModal(true)
  }

  const openEditModal = (cust) => {
    setModalMode('edit')
    const c = cust || customer
    if (!c) return
    setModalForm({
      firstName: c.first_name || '',
      lastName: c.last_name || '',
      email: c.email || '',
      phone: (c.phone || '').replace('+249', ''),
      password: '',
      uid: c.customer_uid,
    })
    if (cust) setCustomer(cust)
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
        const editUid = modalForm.uid || customer?.customer_uid
        const body = {
          firstName: modalForm.firstName, lastName: modalForm.lastName,
          email: modalForm.email, phone: '+249' + modalForm.phone,
        }
        if (modalForm.password) body.password = modalForm.password
        const res = await fetch(`${API}/api/admin/customers/${editUid}`, {
          method: 'PATCH', headers: hdrs, body: JSON.stringify(body)
        })
        const data = await res.json()
        if (!res.ok) { showToast(data.error || t('Error', 'خطأ'), 'error'); setModalLoading(false); return }
        showToast(t('Customer updated!', 'تم تحديث العميل!'))
        if (customer && customer.customer_uid === editUid) {
          setCustomer(c => ({ ...c, first_name: modalForm.firstName, last_name: modalForm.lastName, email: modalForm.email, phone: '+249' + modalForm.phone }))
        }
      }
      setShowModal(false)
      loadData()
      if (activeTab === 'customers') loadAllCustomers(customerSearch)
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

  const scanAnimRef = useRef(null)
  const canvasRef   = useRef(document.createElement('canvas')) // persistent off-screen canvas

  const toggleScanner = async () => {
    if (scannerOn) { stopScanner(); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      setScannerOn(true)
    } catch (err) {
      const msg = err.name === 'NotAllowedError'
        ? t('Camera permission denied. Please allow camera access in your browser settings.', 'تم رفض إذن الكاميرا. يرجى السماح بالوصول من إعدادات المتصفح.')
        : t('Could not open camera.', 'تعذر فتح الكاميرا.')
      showToast(msg, 'error')
    }
  }

  // Callback ref — fires when video element mounts after scannerOn=true
  const setVideoRef = (el) => {
    videoRef.current = el
    if (el && streamRef.current) {
      el.srcObject = streamRef.current
      el.setAttribute('playsinline', '')
      el.muted = true
      el.play().catch(() => {})
      // Wait for video to be ready before starting scan loop
      el.addEventListener('playing', () => startQRLoop(el), { once: true })
      // Fallback: also try after short delay
      setTimeout(() => { if (streamRef.current && !scanAnimRef.current) startQRLoop(el) }, 1000)
    }
  }

  const startQRLoop = (videoEl) => {
    if (scanAnimRef.current) return // already running
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    const tick = () => {
      if (!streamRef.current || !videoEl) return

      if (videoEl.readyState >= 2 && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
        canvas.width  = videoEl.videoWidth
        canvas.height = videoEl.videoHeight
        ctx.drawImage(videoEl, 0, 0)

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          if (jsQR) {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth'
            })
            if (code && code.data) {
              const uid = code.data.trim().toUpperCase()
              stopScanner()
              setUidInput(uid)
              lookup(uid)
              return
            }
          }
        } catch {}
      }

      scanAnimRef.current = requestAnimationFrame(tick)
    }

    scanAnimRef.current = requestAnimationFrame(tick)
  }

  const stopScanner = () => {
    if (scanAnimRef.current) { cancelAnimationFrame(scanAnimRef.current); scanAnimRef.current = null }
    streamRef.current?.getTracks().forEach(tr => tr.stop())
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
            <button
              onClick={toggleLang}
              className="glass px-3 py-2 rounded-xl text-secondary-fixed text-xs font-bold flex items-center gap-1 hover:border-secondary-fixed/50 transition-all"
            >
              <span className="material-symbols-outlined text-base">language</span>
              <span>{lang === 'en' ? 'AR' : 'EN'}</span>
            </button>
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
          {activeTab === 'dashboard' && (
            <button onClick={openAddModal} className="hydro-gradient px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity cyan-glow">
              <span className="material-symbols-outlined text-base">person_add</span>
              {t('Add Customer', 'إضافة عميل')}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: '#1d2022', border: '1px solid rgba(66,71,82,0.4)' }}>
          {[
            ['dashboard', 'dashboard', t('Dashboard', 'اللوحة'), null, true],
            ['customers', 'group', t('Customers', 'العملاء'), null, true],
            ['messages', 'mail', t('Messages', 'الرسائل'), unreadCount, true],
            ['staff', 'manage_accounts', t('Staff', 'الموظفون'), null, isSuperAdmin],
          ].filter(([,,,,show]) => show).map(([tab, icon, label, badge]) => (
            <button key={tab}
              onClick={() => {
                setActiveTab(tab)
                if (tab === 'messages') { loadMessages(); setUnreadCount(0) }
                if (tab === 'customers') loadAllCustomers('')
                if (tab === 'staff') loadStaff()
              }}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'hydro-gradient text-white' : 'text-on-surface-variant hover:text-on-surface'}`}>
              <span className="material-symbols-outlined text-base">{icon}</span>
              <span className="hidden sm:block">{label}</span>
              {badge > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-white font-extrabold px-1"
                  style={{ background: '#e53935', fontSize: '10px', boxShadow: '0 0 0 2px #1d2022', lineHeight: 1 }}>
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-4 animate-fade-in">
            {/* Search + Add bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none">search</span>
                <input
                  type="text"
                  placeholder={t('Search by name, phone, email or ID...', 'ابحث بالاسم أو الهاتف أو البريد أو الرمز...')}
                  value={customerSearch}
                  onChange={e => {
                    setCustomerSearch(e.target.value)
                    clearTimeout(searchTimeout.current)
                    searchTimeout.current = setTimeout(() => loadAllCustomers(e.target.value), 400)
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-on-surface text-sm focus:outline-none"
                  style={{ background: '#1d2022', border: '1px solid rgba(66,71,82,0.4)' }}
                  onFocus={e => e.target.style.borderColor = '#74f5ff'}
                  onBlur={e => e.target.style.borderColor = 'rgba(66,71,82,0.4)'}
                />
              </div>
              <button onClick={openAddModal} className="hydro-gradient px-5 py-3 rounded-xl text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0 cyan-glow">
                <span className="material-symbols-outlined text-base">person_add</span>
                {t('Add Customer', 'إضافة عميل')}
              </button>
            </div>

            {/* Customers table */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center">
                <h3 className="font-bold text-on-surface">
                  {t('All Customers', 'جميع العملاء')}
                  {!customersLoading && <span className="ms-2 text-xs text-on-surface-variant font-normal">({allCustomers.length})</span>}
                </h3>
                <button onClick={() => loadAllCustomers(customerSearch)} className="text-secondary-fixed text-xs flex items-center gap-1 hover:underline">
                  <span className="material-symbols-outlined text-base">refresh</span>{t('Refresh', 'تحديث')}
                </button>
              </div>

              {customersLoading ? (
                <div className="flex justify-center py-12"><div className="loader" /></div>
              ) : allCustomers.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-3 block">group_off</span>
                  <p className="text-on-surface-variant text-sm">{t('No customers found', 'لا يوجد عملاء')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead style={{ background: 'rgba(39,42,44,0.4)' }}>
                      <tr>
                        {[t('Customer','العميل'), t('ID','الرمز'), t('Phone','الهاتف'), t('Stamps','الطوابع'), t('Washes','الغسيلات'), t('Status','الحالة'), t('Joined','الانضمام'), ''].map(h => (
                          <th key={h} className="px-4 py-3 text-xs text-on-surface-variant uppercase font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {allCustomers.map(c => (
                        <tr key={c.id} className="hover:bg-surface-variant/5 transition-colors group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full hydro-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {c.first_name?.[0]}{c.last_name?.[0]}
                              </div>
                              <div dir="ltr" style={{unicodeBidi:'embed'}}>
                                <p className="font-semibold text-on-surface text-sm">{c.first_name} {c.last_name}</p>
                                <p className="text-xs text-on-surface-variant">{c.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-secondary-fixed">{c.customer_uid}</td>
                          <td className="px-4 py-3 text-xs text-on-surface-variant" dir="ltr" style={{unicodeBidi:'embed'}}>{c.phone}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <span className="text-secondary-fixed font-bold">{c.stamps}</span>
                              <span className="text-on-surface-variant text-xs">/5</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-on-surface-variant text-xs">{c.total_washes ?? 0}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-error/10 text-error border border-error/20'}`}>
                              {c.is_active ? t('Active', 'نشط') : t('Suspended', 'موقوف')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">
                            {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {/* Quick lookup in dashboard */}
                              <button title={t('View in Dashboard', 'عرض في اللوحة')}
                                onClick={() => {
                                  setUidInput(c.customer_uid)
                                  setActiveTab('dashboard')
                                  setTimeout(() => lookup(c.customer_uid), 100)
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-fixed hover:bg-secondary-fixed/10 transition-colors">
                                <span className="material-symbols-outlined text-base">open_in_new</span>
                              </button>
                              {/* Edit */}
                              <button title={t('Edit', 'تعديل')}
                                onClick={() => openEditModal(c)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-fixed hover:bg-secondary-fixed/10 transition-colors">
                                <span className="material-symbols-outlined text-base">edit</span>
                              </button>
                              {/* Delete */}
                              <button title={t('Delete', 'حذف')}
                                onClick={async () => {
                                  if (!confirm(t(`Delete ${c.first_name} ${c.last_name}?`, `حذف ${c.first_name}؟`))) return
                                  try {
                                    const res = await fetch(`${API}/api/admin/customers/${c.customer_uid}`, { method: 'DELETE', headers: hdrs })
                                    const data = await res.json()
                                    if (!res.ok) { showToast(data.error || t('Error','خطأ'), 'error'); return }
                                    showToast(data.message || t('Customer deleted','تم حذف العميل'))
                                    loadAllCustomers(customerSearch)
                                    loadData()
                                  } catch { showToast(t('Error','خطأ'), 'error') }
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error/10 transition-colors">
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

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
                        setUnreadCount(c => Math.max(0, c - 1))
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
                <div className="p-4 relative">
                  <video
                    ref={setVideoRef}
                    autoPlay muted playsInline
                    className="w-full rounded-xl max-h-64 object-cover bg-black"
                    style={{ minHeight: '200px' }}
                  />
                  {/* Scanning overlay */}
                  <div className="absolute inset-4 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-secondary-fixed rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-secondary-fixed rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-secondary-fixed rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-secondary-fixed rounded-br-lg" />
                    </div>
                  </div>
                  <p className="text-xs text-secondary-fixed text-center mt-2 font-semibold">
                    {t('Point camera at customer QR code', 'وجّه الكاميرا نحو رمز QR للعميل')}
                  </p>
                </div>
              )}
              {/* Hidden canvas for QR decoding — off-screen, created in useRef */}
              <div className="p-4 flex gap-3">
                <input value={uidInput} onChange={e => setUidInput(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && lookup()} placeholder="RW-00001" className="rasha-input flex-1 uppercase" />
                <button onClick={() => lookup()} className="btn-primary px-6 py-3 rounded-xl shrink-0">{t('Look Up', 'بحث')}</button>
              </div>
              {/* Customer result */}
              {customer && (
                <div className="p-5 border-t border-outline-variant/20 animate-fade-in space-y-5">
                  {/* Customer info header */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl hydro-gradient flex items-center justify-center text-white text-xl font-bold shrink-0">
                        {customer.first_name?.[0]}{customer.last_name?.[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface text-lg font-display">{customer.first_name} {customer.last_name}</h4>
                        <p className="text-sm text-on-surface-variant" dir="ltr" style={{unicodeBidi:'embed'}}>{customer.phone}</p>
                        <p className="text-xs text-secondary-fixed font-bold mt-0.5">{customer.customer_uid}</p>
                        <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-bold ${customer.is_active ? 'bg-green-500/10 text-green-400' : 'bg-error/10 text-error'}`}>
                          {customer.is_active ? t('Active', 'نشط') : t('Suspended', 'موقوف')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(customer)}
                        className="glass px-4 py-2 rounded-xl text-secondary-fixed text-xs font-bold hover:bg-secondary-fixed/5 transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">edit</span>
                        {t('Edit', 'تعديل')}
                      </button>
                      <button onClick={deleteCustomer}
                        className="glass px-4 py-2 rounded-xl text-error text-xs font-bold hover:bg-error/5 transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">delete</span>
                        {t('Delete', 'حذف')}
                      </button>
                    </div>
                  </div>

                  {/* Stamps visual */}
                  <div className="rounded-xl p-4" style={{ background: '#272a2c', border: '1px solid rgba(66,71,82,0.3)' }}>
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{t('Loyalty Stamps', 'طوابع الولاء')}</p>
                      <span className="text-secondary-fixed font-extrabold text-lg font-display">{customer.stamps}/5</span>
                    </div>
                    {/* 5 stamp dots */}
                    <div className="flex gap-2 mb-4">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div key={i} className={`flex-1 h-3 rounded-full transition-all ${i < customer.stamps ? 'bg-secondary-fixed' : 'bg-surface-variant'}`}
                          style={i < customer.stamps ? { boxShadow: '0 0 6px rgba(116,245,255,0.5)' } : {}} />
                      ))}
                    </div>
                    {customer.stamps >= 5 && (
                      <div className="text-center text-xs text-secondary-fixed font-bold mb-3 p-2 rounded-lg"
                        style={{ background: 'rgba(116,245,255,0.08)', border: '1px solid rgba(116,245,255,0.2)' }}>
                        🎉 {t('Free Wash Ready! Customer has earned a complimentary wash.', 'غسيل مجاني! استحق العميل غسيلاً مجانياً.')}
                      </div>
                    )}
                    {/* Cooldown warning */}
                    {cooldownInfo && (
                      <div className="p-3 rounded-xl mb-2 text-center" style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.3)' }}>
                        <p className="text-error text-xs font-semibold mb-1">
                          {t('QR already scanned today', 'تم مسح QR اليوم مسبقاً')}
                        </p>
                        <p className="text-on-surface-variant text-xs">
                          {t('Next scan available:', 'المسح التالي متاح:')} {cooldownInfo.nextScanAt ? new Date(cooldownInfo.nextScanAt).toLocaleTimeString(t('en-US','ar-SA'),{hour:'2-digit',minute:'2-digit'}) : '—'}
                        </p>
                        {cooldownInfo.canForce && isSuperAdmin && (
                          <button onClick={() => { setCooldownInfo(null); markWash(true) }}
                            className="mt-2 px-4 py-1.5 rounded-lg text-xs font-bold text-white hydro-gradient hover:opacity-90 transition-opacity">
                            {t('Force Rescan (Admin Override)', 'تجاوز القيد (صلاحية المشرف)')}
                          </button>
                        )}
                      </div>
                    )}
                    {/* Stamp action buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={markWash}
                        className={`py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity ${customer.stamps >= 5 ? 'cyan-glow' : 'hydro-gradient cyan-glow'}`}
                        style={customer.stamps >= 5 ? { background: 'linear-gradient(135deg,#00a86b,#00c17a)' } : {}}>
                        <span className="material-symbols-outlined fill-icon text-base">{customer.stamps >= 5 ? 'redeem' : 'add_circle'}</span>
                        {customer.stamps >= 5 ? t('Redeem Free Wash', 'استخدام الغسيل المجاني') : t('Add Stamp', 'إضافة طابع')}
                      </button>
                      <button
                        onClick={async () => {
                          if (customer.stamps <= 0) { showToast(t('Already at 0 stamps', 'لا يوجد طوابع للإزالة'), 'error'); return }
                          try {
                            const newVal = customer.stamps - 1
                            const res = await fetch(`${API}/api/admin/customers/${customer.customer_uid}/stamps`, {
                              method: 'PATCH', headers: hdrs,
                              body: JSON.stringify({ newValue: newVal, reason: 'Manual stamp removal by staff' })
                            })
                            const data = await res.json()
                            if (!res.ok) { showToast(data.error || t('Error', 'خطأ'), 'error'); return }
                            setCustomer(c => ({ ...c, stamps: newVal }))
                            showToast(t('Stamp removed', 'تم إزالة الطابع'))
                          } catch { showToast(t('Error', 'خطأ'), 'error') }
                        }}
                        disabled={customer.stamps <= 0}
                        className="glass py-3 rounded-xl text-error font-bold text-sm flex items-center justify-center gap-2 hover:bg-error/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        <span className="material-symbols-outlined text-base">remove_circle</span>
                        {t('Remove Stamp', 'إزالة طابع')}
                      </button>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      [t('Total Washes', 'إجمالي الغسيلات'), customer.total_washes ?? 0],
                      [t('Free Used', 'مجاني مستخدم'), customer.free_washes_used ?? 0],
                      [t('Bookings', 'الحجوزات'), customer.booking_count ?? 0],
                    ].map(([label, val]) => (
                      <div key={label} className="rounded-xl py-3 px-2" style={{ background: '#272a2c', border: '1px solid rgba(66,71,82,0.3)' }}>
                        <p className="text-secondary-fixed font-bold text-xl font-display">{val}</p>
                        <p className="text-on-surface-variant text-xs mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Suspend / Restore */}
                  <button onClick={toggleAccess}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${customer.is_active ? 'glass text-error hover:bg-error/5' : 'glass text-secondary-fixed hover:bg-secondary-fixed/5'}`}>
                    <span className="material-symbols-outlined text-base">{customer.is_active ? 'block' : 'check_circle'}</span>
                    {customer.is_active ? t('Suspend Account', 'إيقاف الحساب') : t('Restore Account', 'تفعيل الحساب')}
                  </button>
                </div>
              )}
            </div>

            {/* Bookings table */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-outline-variant/20">
                <h3 className="font-bold text-on-surface">{t('Recent Bookings', 'الحجوزات الأخيرة')}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
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
                          <p className="text-sm text-on-surface font-semibold">{b.customer_name||'-'}</p>
                          <p className="text-xs text-on-surface-variant" style={{direction:'ltr',textAlign:'start',unicodeBidi:'embed'}}>{b.customer_phone||''}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant whitespace-nowrap">{b.service_type==='full'?t('Full','كامل'):t('Exterior','خارجي')}</td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">
                          <p>{new Date(b.booking_date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</p>
                          <p style={{direction:'ltr',unicodeBidi:'embed'}}>{b.booking_time}</p>
                        </td>
                        <td className="px-4 py-3 text-start">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                            b.status==='confirmed'?'bg-secondary-container/20 text-secondary-fixed border border-secondary-container/30':
                            b.status==='completed'?'bg-green-500/10 text-green-400 border border-green-500/20':
                            'bg-error-container/20 text-error border border-error/20'
                          }`}>{b.status === 'confirmed' ? t('Confirmed','مؤكد') : b.status === 'completed' ? t('Completed','مكتمل') : t('Cancelled','ملغى')}</span>
                        </td>
                        <td className="px-4 py-3 text-start">
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
                        <p className="text-xs text-on-surface-variant">{c.customer_uid} · {c.stamps}/5 {t('stamps', 'طوابع')}</p>
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
      {/* Staff Management Tab — super_admin only */}
      {activeTab === 'staff' && isSuperAdmin && (
        <div className="space-y-4 animate-fade-in max-w-7xl mx-auto px-4 md:px-6 pb-10">
          <div className="flex justify-between items-center pt-2">
            <div>
              <h3 className="font-bold text-on-surface font-display text-lg">{t('Staff Management', 'إدارة الموظفين')}</h3>
              <p className="text-on-surface-variant text-xs mt-0.5">{t('Add staff members and control their permissions.', 'أضف موظفين وتحكم في صلاحياتهم.')}</p>
            </div>
            <button onClick={() => { setStaffModalMode('add'); setStaffModalData({id:null,username:'',password:'',displayName:'',permissions:{}}); setShowStaffModal(true) }}
              className="hydro-gradient px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity cyan-glow">
              <span className="material-symbols-outlined text-base">person_add</span>
              {t('Add Staff', 'إضافة موظف')}
            </button>
          </div>
          {staffLoading ? <div className="flex justify-center py-12"><div className="loader"/></div> : (
            <div className="space-y-3">
              {staffList.map(s => (
                <div key={s.id} className="glass p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                      style={{background: s.role==='super_admin'?'linear-gradient(135deg,#f59e0b,#d97706)':'linear-gradient(135deg,#0056b3,#004491)'}}>
                      {s.role==='super_admin'?'★':(s.display_name||s.username)[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-on-surface">{s.display_name||s.username}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${s.role==='super_admin'?'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20':'bg-secondary-fixed/10 text-secondary-fixed border border-secondary-fixed/20'}`}>
                          {s.role==='super_admin'?t('Super Admin','مشرف رئيسي'):t('Staff','موظف')}
                        </span>
                        {!s.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-error/10 text-error border border-error/20 font-bold">{t('Inactive','معطّل')}</span>}
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">@{s.username}</p>
                      {s.role==='staff' && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(typeof s.permissions==='string'?JSON.parse(s.permissions||'{}'):(s.permissions||{})).filter(([,v])=>v).map(([k])=>(
                            <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/30 capitalize">
                              {k.replace(/_/g,' ')}
                            </span>
                          ))}
                          {!Object.values(typeof s.permissions==='string'?JSON.parse(s.permissions||'{}'):(s.permissions||{})).some(Boolean)&&(
                            <span className="text-xs text-outline italic">{t('No permissions assigned','لا توجد صلاحيات')}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {s.role!=='super_admin' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={()=>{
                        setStaffModalMode('edit')
                        const perms = typeof s.permissions==='string'?JSON.parse(s.permissions||'{}'):(s.permissions||{})
                        setStaffModalData({id:s.id,username:s.username,password:'',displayName:s.display_name||'',permissions:perms})
                        setShowStaffModal(true)
                      }} className="glass px-4 py-2 rounded-xl text-secondary-fixed text-xs font-bold hover:bg-secondary-fixed/5 transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">edit</span>{t('Edit','تعديل')}
                      </button>
                      <button onClick={async()=>{
                        if(!confirm(t(`Remove ${s.display_name||s.username}?`,`إزالة ${s.display_name||s.username}؟`)))return
                        const res=await fetch(`${API}/api/admin/staff/${s.id}`,{method:'DELETE',headers:hdrs})
                        if(res.ok){showToast(t('Staff removed','تم حذف الموظف'));loadStaff()}
                        else showToast(t('Error','خطأ'),'error')
                      }} className="glass px-4 py-2 rounded-xl text-error text-xs font-bold hover:bg-error/5 transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">delete</span>{t('Remove','إزالة')}
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {staffList.length===0&&!staffLoading&&(
                <div className="glass rounded-2xl p-12 text-center">
                  <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-3 block">group_off</span>
                  <p className="text-on-surface-variant text-sm">{t('No staff members yet.','لا يوجد موظفون بعد.')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 animate-fade-in overflow-y-auto max-h-[90vh]" style={{ background: '#1d2022', border: '1px solid rgba(116,245,255,0.15)' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-on-surface text-lg font-display">
                {staffModalMode === 'add' ? t('Add Staff Member', 'إضافة موظف') : t('Edit Staff Member', 'تعديل موظف')}
              </h3>
              <button onClick={() => setShowStaffModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 block">{t('Display Name', 'الاسم المعروض')}</label>
                <input className="w-full px-3 py-2.5 rounded-lg text-on-surface text-sm focus:outline-none" style={{ background:'#272a2c', border:'1px solid #424752' }}
                  value={staffModalData.displayName} onChange={e=>setStaffModalData(d=>({...d,displayName:e.target.value}))}
                  onFocus={e=>e.target.style.borderColor='#74f5ff'} onBlur={e=>e.target.style.borderColor='#424752'} />
              </div>
              {staffModalMode === 'add' && (
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 block">{t('Username', 'اسم المستخدم')} *</label>
                  <input className="w-full px-3 py-2.5 rounded-lg text-on-surface text-sm focus:outline-none" style={{ background:'#272a2c', border:'1px solid #424752' }}
                    value={staffModalData.username} onChange={e=>setStaffModalData(d=>({...d,username:e.target.value}))}
                    onFocus={e=>e.target.style.borderColor='#74f5ff'} onBlur={e=>e.target.style.borderColor='#424752'} />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
                  {t('Password', 'كلمة المرور')} {staffModalMode==='edit'?t('(leave blank to keep)','(اتركه للإبقاء)'):'*'}
                </label>
                <input type="password" className="w-full px-3 py-2.5 rounded-lg text-on-surface text-sm focus:outline-none" style={{ background:'#272a2c', border:'1px solid #424752' }}
                  value={staffModalData.password} onChange={e=>setStaffModalData(d=>({...d,password:e.target.value}))}
                  onFocus={e=>e.target.style.borderColor='#74f5ff'} onBlur={e=>e.target.style.borderColor='#424752'} />
              </div>
              {/* Permissions */}
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3 block">{t('Permissions', 'الصلاحيات')}</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    ['mark_wash',        t('Mark Wash / Add Stamp',       'تسجيل الغسيل / إضافة طابع')],
                    ['view_customers',   t('View Customers',               'عرض العملاء')],
                    ['edit_customers',   t('Add / Edit Customers',         'إضافة / تعديل العملاء')],
                    ['delete_customers', t('Delete Customers',             'حذف العملاء')],
                    ['view_bookings',    t('View Bookings',                'عرض الحجوزات')],
                    ['cancel_bookings',  t('Cancel Bookings',              'إلغاء الحجوزات')],
                    ['view_messages',    t('View Support Messages',         'عرض رسائل الدعم')],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-surface-container transition-colors"
                      style={{ background: staffModalData.permissions[key] ? 'rgba(0,86,179,0.1)' : '#272a2c', border: `1px solid ${staffModalData.permissions[key] ? 'rgba(116,245,255,0.3)' : '#424752'}` }}>
                      <input type="checkbox" checked={!!staffModalData.permissions[key]}
                        onChange={e=>setStaffModalData(d=>({...d,permissions:{...d.permissions,[key]:e.target.checked}}))}
                        style={{ accentColor:'#00f1fe', width:'16px', height:'16px' }} />
                      <span className={`text-sm font-semibold ${staffModalData.permissions[key]?'text-secondary-fixed':'text-on-surface-variant'}`}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={()=>setShowStaffModal(false)} className="flex-1 py-3 rounded-xl text-on-surface-variant font-bold text-sm" style={{background:'#272a2c',border:'1px solid #424752'}}>
                  {t('Cancel','إلغاء')}
                </button>
                <button
                  onClick={async () => {
                    const { id, username, password, displayName, permissions } = staffModalData
                    if (staffModalMode==='add' && (!username||!password)) { showToast(t('Username and password required','اسم المستخدم وكلمة المرور مطلوبان'),'error'); return }
                    try {
                      let res
                      if (staffModalMode==='add') {
                        res = await fetch(`${API}/api/admin/staff`,{method:'POST',headers:hdrs,body:JSON.stringify({username:username.trim().toLowerCase(),password,displayName,permissions})})
                      } else {
                        res = await fetch(`${API}/api/admin/staff/${id}`,{method:'PATCH',headers:hdrs,body:JSON.stringify({displayName,password:password||undefined,permissions})})
                      }
                      const data = await res.json()
                      if(!res.ok){showToast(data.error||t('Error','خطأ'),'error');return}
                      showToast(staffModalMode==='add'?t('Staff member added!','تم إضافة الموظف!'):t('Staff member updated!','تم تحديث الموظف!'))
                      setShowStaffModal(false)
                      loadStaff()
                    } catch { showToast(t('Error','خطأ'),'error') }
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm hydro-gradient text-white flex items-center justify-center gap-2 hover:opacity-90">
                  {staffModalMode==='add'?t('Add Staff Member','إضافة موظف'):t('Save Changes','حفظ التغييرات')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
