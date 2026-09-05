import { useState, useEffect } from 'react'
import { Search, Bell, ChevronRight, User, LogOut, Settings, Menu } from 'lucide-react'

const PAGE_META: Record<string, string> = {
  dashboard: 'Dashboard', branches: 'Branch Management', inventory: 'Inventory & Stock',
  sales: 'Sales & Revenue', employees: 'Employees', approvals: 'Approvals Queue',
  reports: 'Reports', spreadsheet: 'Spreadsheet', settings: 'Settings', help: 'Help & Support',
}

interface Props { page: string; onMenu?: () => void }

export default function TopBar({ page, onMenu }: Props) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <header style={{
      height: 50,
      background: '#fff',
      boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
      display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px',
      position: 'sticky', top: 0, zIndex: 30, flexShrink: 0,
    }}>
      <button className="staff-menu-button" aria-label="Open navigation" onClick={onMenu}><Menu size={20} /></button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94A3B8', minWidth: 0 }}>
        <span>COFKANS</span>
        <ChevronRight size={11} style={{ color: '#CBD5E1', flexShrink: 0 }} />
        <span style={{ color: '#0A0F1E', fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{PAGE_META[page] || page}</span>
      </div>

      <div style={{ flex: 1 }} />

      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#CBD5E1', letterSpacing: '0.04em' }}>
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
      </span>

      <div style={{ width: 1, height: 16, background: '#E4E8EE', flexShrink: 0 }} />

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#CBD5E1', pointerEvents: 'none' }} />
        <input
          placeholder="Search..."
          style={{ paddingLeft: 30, paddingRight: 38, paddingTop: 6, paddingBottom: 6, borderRadius: 7, border: '1px solid #E4E8EE', background: '#F8F9FB', fontSize: 12, color: '#0A0F1E', outline: 'none', width: 180, fontFamily: 'Inter, sans-serif', transition: 'border-color 0.15s, background 0.15s' }}
          onFocus={e => { e.target.style.borderColor = '#16A34A'; e.target.style.background = '#fff' }}
          onBlur={e => { e.target.style.borderColor = '#E4E8EE'; e.target.style.background = '#F8F9FB' }}
        />
        <kbd style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#CBD5E1', background: '#F1F5F9', border: '1px solid #E4E8EE', borderRadius: 4, padding: '1px 4px', fontFamily: 'JetBrains Mono, monospace', pointerEvents: 'none' }}>⌘K</kbd>
      </div>

      <button style={{ position: 'relative', width: 30, height: 30, borderRadius: 7, border: '1px solid #E4E8EE', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', transition: 'all 0.12s' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#F8F9FB'; e.currentTarget.style.borderColor = '#D1D5DB' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#E4E8EE' }}
      >
        <Bell size={13} />
        <span style={{ position: 'absolute', top: 5, right: 5, width: 5, height: 5, borderRadius: '50%', background: '#DC2626', border: '1.5px solid #fff' }} />
      </button>

      {/* Profile */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 8px 4px 4px', borderRadius: 8, border: '1px solid #E4E8EE', background: 'transparent', cursor: 'pointer', transition: 'all 0.12s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F8F9FB'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #16A34A, #15803D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>KA</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#0A0F1E', lineHeight: 1.3, letterSpacing: '-0.01em' }}>Kwame A.</div>
            <div style={{ fontSize: 9, color: '#94A3B8', lineHeight: 1.2 }}>General Manager</div>
          </div>
        </button>

        {profileOpen && (
          <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', width: 188, background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', overflow: 'hidden', zIndex: 50 }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#0A0F1E', letterSpacing: '-0.01em' }}>Kwame Asante</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>kwame@cofkans.com</div>
            </div>
            {[{ icon: User, label: 'View Profile' }, { icon: Settings, label: 'Settings' }, { icon: LogOut, label: 'Sign Out', danger: true }].map(({ icon: Icon, label, danger }) => (
              <button key={label} onClick={() => setProfileOpen(false)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', fontSize: 13, color: (danger as any) ? '#DC2626' : '#374151', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', letterSpacing: '-0.01em' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8F9FB'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Icon size={13} style={{ flexShrink: 0 }} /> {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
