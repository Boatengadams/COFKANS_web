import { useState } from 'react'
import { Globe, Clock, DollarSign, Building2, Bell, Shield, Database, HelpCircle, Key, Smartphone, Eye, EyeOff, CheckCircle } from 'lucide-react'

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative flex-shrink-0"
      style={{ width: 44, height: 24 }}
    >
      <div style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked ? '#16A34A' : '#D1D5DB',
        transition: 'background 0.2s',
        position: 'relative',
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3,
          left: checked ? 23 : 3,
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
    </button>
  )
}

export default function Settings() {
  const [tab, setTab] = useState('general')
  const [notifs, setNotifs] = useState({ email: true, inApp: true, lowStock: true, orders: true, approvals: true, employees: false, system: true })
  const [showPass, setShowPass] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const TABS = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Data & Integrations', icon: Database },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ]

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#1F2937' }}>Settings & Configuration</h2>
        <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>Account, security & preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-48 flex-shrink-0 hidden md:block">
          <nav className="space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-colors"
                style={{ background: tab === id ? '#F0FDF4' : 'transparent', color: tab === id ? '#16A34A' : '#6B7280' }}>
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile tab select */}
          <div className="md:hidden mb-4">
            <select className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ border: '1px solid #E5E7EB', background: '#fff' }}
              value={tab} onChange={e => setTab(e.target.value)}>
              {TABS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>

          {tab === 'general' && (
            <div className="bg-white rounded-2xl p-6 space-y-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 className="font-bold text-base border-b pb-4" style={{ color: '#1F2937', borderColor: '#F3F4F6' }}>General Settings</h3>

              {[
                { icon: Globe, label: 'Language', sub: 'Interface language', value: 'English (US)' },
                { icon: Clock, label: 'Timezone', sub: 'Your local timezone', value: 'Africa/Accra (GMT+0)' },
                { icon: DollarSign, label: 'Currency', sub: 'Default currency display', value: 'GHS – Ghana Cedi (GH₵)' },
                { icon: Building2, label: 'Default Branch', sub: 'Branch shown on login', value: 'Head Office' },
              ].map(({ icon: Icon, label, sub, value }) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F0FDF4' }}>
                      <Icon size={16} style={{ color: '#16A34A' }} />
                    </div>
                    <div>
                      <div className="font-medium text-sm" style={{ color: '#1F2937' }}>{label}</div>
                      <div className="text-xs" style={{ color: '#9CA3AF' }}>{sub}</div>
                    </div>
                  </div>
                  <select className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1px solid #E5E7EB', color: '#374151', background: '#F9FAFB' }}>
                    <option>{value}</option>
                  </select>
                </div>
              ))}

              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#16A34A' }}>
                {saved ? <><CheckCircle size={15} /> Saved!</> : 'Save Changes'}
              </button>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="bg-white rounded-2xl p-6 space-y-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 className="font-bold text-base border-b pb-4" style={{ color: '#1F2937', borderColor: '#F3F4F6' }}>Notification Preferences</h3>

              {[
                { key: 'email', label: 'Email Notifications', sub: 'Receive alerts via email' },
                { key: 'inApp', label: 'In-App Notifications', sub: 'Show badge and popups' },
                { key: 'lowStock', label: 'Low Stock Alerts', sub: 'Notify when items fall below minimum' },
                { key: 'orders', label: 'Order Notifications', sub: 'New orders and status changes' },
                { key: 'approvals', label: 'Approval Requests', sub: 'When items need your review' },
                { key: 'employees', label: 'Employee Alerts', sub: 'Leave requests, new hires' },
                { key: 'system', label: 'System Alerts', sub: 'Maintenance and updates' },
              ].map(({ key, label, sub }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm" style={{ color: '#1F2937' }}>{label}</div>
                    <div className="text-xs" style={{ color: '#9CA3AF' }}>{sub}</div>
                  </div>
                  <Toggle checked={notifs[key as keyof typeof notifs]} onChange={() => setNotifs(n => ({ ...n, [key]: !n[key as keyof typeof notifs] }))} />
                </div>
              ))}
            </div>
          )}

          {tab === 'security' && (
            <div className="bg-white rounded-2xl p-6 space-y-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 className="font-bold text-base border-b pb-4" style={{ color: '#1F2937', borderColor: '#F3F4F6' }}>Security Settings</h3>

              <div className="space-y-4">
                <div className="font-semibold text-sm" style={{ color: '#374151' }}>Change Password</div>
                {['Current Password', 'New Password', 'Confirm New Password'].map(p => (
                  <div key={p} className="relative">
                    <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>{p}</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none pr-10"
                        style={{ border: '1px solid #E5E7EB', color: '#1F2937' }} />
                      <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
                <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#16A34A' }}>Update Password</button>
              </div>

              <div className="border-t pt-6" style={{ borderColor: '#F3F4F6' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2" style={{ color: '#374151' }}>
                      <Smartphone size={15} /> Two-Factor Authentication
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Add an extra layer of security to your account</div>
                  </div>
                  <button className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: '#F0FDF4', color: '#10B981', border: '1px solid #10B98130' }}>
                    Enable 2FA
                  </button>
                </div>
              </div>

              <div className="border-t pt-6" style={{ borderColor: '#F3F4F6' }}>
                <div className="font-semibold text-sm mb-3" style={{ color: '#374151' }}>Active Sessions</div>
                {[
                  { device: 'MacBook Pro · Chrome', location: 'Accra, Ghana', time: 'Current session' },
                  { device: 'iPhone 14 · Safari', location: 'Accra, Ghana', time: '2 hours ago' },
                ].map(s => (
                  <div key={s.device} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: '#F9FAFB' }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#1F2937' }}>{s.device}</div>
                      <div className="text-xs" style={{ color: '#9CA3AF' }}>{s.location} · {s.time}</div>
                    </div>
                    {s.time !== 'Current session' && (
                      <button className="text-xs font-medium" style={{ color: '#EF4444' }}>Log Out</button>
                    )}
                    {s.time === 'Current session' && (
                      <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#F0FDF4', color: '#10B981' }}>Active</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'integrations' && (
            <div className="bg-white rounded-2xl p-6 space-y-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 className="font-bold text-base border-b pb-4" style={{ color: '#1F2937', borderColor: '#F3F4F6' }}>Data & Integrations</h3>
              {[
                { name: 'Flutterwave', desc: 'Payment processing integration', status: 'connected' },
                { name: 'SMS Provider', desc: 'Hubtel SMS gateway for alerts', status: 'connected' },
                { name: 'Google Workspace', desc: 'Calendar and Drive sync', status: 'disconnected' },
              ].map(i => (
                <div key={i.name} className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#F9FAFB' }}>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: '#1F2937' }}>{i.name}</div>
                    <div className="text-xs" style={{ color: '#9CA3AF' }}>{i.desc}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{ background: i.status === 'connected' ? '#F0FDF4' : '#F3F4F6', color: i.status === 'connected' ? '#10B981' : '#9CA3AF' }}>
                      {i.status}
                    </span>
                    <button className="text-xs font-medium" style={{ color: i.status === 'connected' ? '#EF4444' : '#0EA5E9' }}>
                      {i.status === 'connected' ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'help' && (
            <div className="bg-white rounded-2xl p-6 space-y-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 className="font-bold text-base border-b pb-4" style={{ color: '#1F2937', borderColor: '#F3F4F6' }}>Help & Support</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Documentation', desc: 'Full user guide and API docs' },
                  { label: 'Video Tutorials', desc: 'Step-by-step video walkthroughs' },
                  { label: 'Contact Support', desc: 'Reach our support team' },
                  { label: 'Changelog', desc: 'Latest features and fixes · v2.4.1' },
                ].map(h => (
                  <button key={h.label} className="text-left p-4 rounded-xl transition-colors"
                    style={{ border: '1px solid #E5E7EB' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <div className="font-semibold text-sm" style={{ color: '#1F2937' }}>{h.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{h.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
