import { TrendingUp, TrendingDown, AlertTriangle, Target, Zap } from 'lucide-react'

const KPIs = [
  { label: "Today's Sales", value: 'GH₵ 24,580', change: '+12.4%', up: true },
  { label: 'This Week',     value: 'GH₵ 138,400', change: '+8.3%',  up: true },
  { label: 'This Month',    value: 'GH₵ 385,200', change: '+14.2%', up: true },
  { label: 'Net Profit',    value: 'GH₵ 92,400',  change: '+4.2%',  up: true },
  { label: 'Approvals',     value: '23 pending',   change: '8 urgent', up: false, alert: true },
  { label: 'Low Stock',     value: '5 items',      change: 'Action needed', up: false, alert: true },
]

export default function RevenueTicker() {
  return (
    <div style={{
      height: 44,
      background: '#fff',
      borderBottom: '1px solid #E4E8EE',
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      overflowX: 'auto',
    }}>
      {/* Live badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', borderRight: '1px solid #E4E8EE', height: '100%', flexShrink: 0, background: '#F9FAFB' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, color: '#16A34A', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>LIVE</span>
      </div>

      {/* KPI items */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', overflowX: 'auto' }}>
        {KPIs.map((kpi, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', borderRight: '1px solid #F3F4F6', height: '100%', flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 10, color: '#9CA3AF', letterSpacing: '0.04em', lineHeight: 1 }}>{kpi.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: kpi.alert ? '#D97706' : '#111827', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.3, marginTop: 1 }}>
                {kpi.value}
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
              fontFamily: 'JetBrains Mono, monospace',
              background: kpi.alert ? '#FFFBEB' : kpi.up ? '#F0FDF4' : '#FEF2F2',
              color: kpi.alert ? '#D97706' : kpi.up ? '#15803D' : '#B91C1C',
              whiteSpace: 'nowrap',
            }}>
              {kpi.up && !kpi.alert ? '↑ ' : kpi.alert ? '⚠ ' : '↓ '}{kpi.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
