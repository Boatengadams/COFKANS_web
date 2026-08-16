import {
  LayoutDashboard, GitBranch, Package, TrendingUp, Users,
  BarChart2, Settings, HelpCircle, CheckSquare, Table2
} from 'lucide-react'
import cofkansLogo from '../../../../imports/cofkans.png'

const NAV_MAIN = [
  { id: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'branches',    label: 'Branches',    icon: GitBranch },
  { id: 'inventory',   label: 'Inventory',   icon: Package },
  { id: 'sales',       label: 'Sales',       icon: TrendingUp },
  { id: 'employees',   label: 'Employees',   icon: Users },
  { id: 'approvals',   label: 'Approvals',   icon: CheckSquare },
  { id: 'reports',     label: 'Reports',     icon: BarChart2 },
  { id: 'spreadsheet', label: 'Spreadsheet', icon: Table2 },
]

const NAV_BOTTOM = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help',     label: 'Help',     icon: HelpCircle },
]

interface Props { active: string; onNav: (id: string) => void }

function NavItem({ id, label, icon: Icon, badge, active, onNav }: { id: string; label: string; icon: any; badge?: number; active: boolean; onNav: (id: string) => void }) {
  return (
    <button
      onClick={() => onNav(id)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
        textAlign: 'left', marginBottom: 1, position: 'relative',
        background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget.style.background = 'rgba(255,255,255,0.04)') }}
      onMouseLeave={e => { if (!active) (e.currentTarget.style.background = 'transparent') }}
    >
      {active && (
        <span style={{
          position: 'absolute', left: 0, top: '15%', bottom: '15%',
          width: 2, borderRadius: '0 2px 2px 0', background: '#4ADE80',
        }} />
      )}
      <Icon
        size={14}
        strokeWidth={active ? 2.2 : 1.8}
        style={{ color: active ? '#e2e8f0' : 'rgba(255,255,255,0.35)', flexShrink: 0 }}
      />
      <span style={{
        fontSize: 13, lineHeight: 1,
        fontWeight: active ? 500 : 400,
        color: active ? '#f1f5f9' : 'rgba(255,255,255,0.45)',
        flex: 1,
        letterSpacing: '-0.01em',
      }}>
        {label}
      </span>
      {badge && (
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '1px 5px', borderRadius: 20,
          background: 'rgba(220,38,38,0.85)', color: '#fff',
          fontFamily: 'JetBrains Mono, monospace', flexShrink: 0, lineHeight: 1.5,
        }}>
          {badge}
        </span>
      )}
    </button>
  )
}

export default function Sidebar({ active, onNav }: Props) {
  return (
    <aside style={{
      width: 216,
      flexShrink: 0,
      background: '#0D1117',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(255,255,255,0.04)',
    }}>
      {/* Logo */}
      <div style={{ padding: '16px 14px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <img src={typeof cofkansLogo === 'string' ? cofkansLogo : (cofkansLogo as { uri: string }).uri} alt="Cofkans" style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'contain', background: '#050914', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9', letterSpacing: '0.01em', lineHeight: 1.2 }}>COFKANS</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.07em', marginTop: 1 }}>ELECTRICALS ERP</div>
          </div>
        </div>
      </div>

      {/* Branch pill */}
      <div style={{ padding: '10px 10px 4px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 10px', borderRadius: 7,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block', flexShrink: 0, boxShadow: '0 0 4px #4ADE80' }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#cbd5e1', lineHeight: 1.2 }}>Current workspace</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', marginTop: 1 }}>live status unavailable</div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 8px 0' }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', padding: '6px 10px 5px', marginTop: 2 }}>WORKSPACE</div>
        {NAV_MAIN.map(item => (
          <NavItem key={item.id} {...item} active={active === item.id} onNav={onNav} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div style={{ padding: '8px 8px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {NAV_BOTTOM.map(item => (
          <NavItem key={item.id} {...item} active={active === item.id} onNav={onNav} />
        ))}
      </div>

      {/* User */}
      <div style={{ padding: '8px 10px 14px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9, padding: '6px 8px', borderRadius: 7,
          transition: 'background 0.1s', cursor: 'pointer',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #16A34A, #15803D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            KA
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>Signed-in staff</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em', marginTop: 1 }}>ACCOUNT</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
