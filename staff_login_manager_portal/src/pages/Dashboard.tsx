import { useState } from 'react'
import { ArrowUpRight, ArrowDownRight, FileText, Package, Users, Tag, AlertCircle } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

/* ─── Data ────────────────────────────────────────────────────── */

const salesData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  sales: Math.floor(10000 + Math.sin(i * 0.35) * 6000 + Math.random() * 3000),
  profit: Math.floor(2800 + Math.sin(i * 0.35) * 2200 + Math.random() * 1200),
}))

const BRANCHES = [
  { name: 'Head Office', sales: 145000, target: 150000, change: 12.4  },
  { name: 'Asuoyeboa',  sales: 98500,  target: 90000,  change: 8.1   },
  { name: 'Adum',        sales: 87200,  target: 100000, change: -2.3  },
  { name: 'Takoradi',    sales: 54300,  target: 60000,  change: 5.0   },
  { name: 'Abuakwa',     sales: 0,      target: 40000,  change: 0,   offline: true },
]

const TOP_STAFF = [
  { name: 'John Mensah',   initials: 'JM', role: 'Sr. Cashier',   sales: 48200 },
  { name: 'Ama Osei',      initials: 'AO', role: 'Branch Manager', sales: 38700 },
  { name: 'Sarah Boateng', initials: 'SB', role: 'Warehouse Lead',  sales: 29100 },
  { name: 'Yaw Darko',     initials: 'YD', role: 'Branch Manager', sales: 21400 },
]

const CATEGORY = [
  { name: 'Lighting',    value: 35, color: '#16A34A' },
  { name: 'Power Tools', value: 25, color: '#94A3B8' },
  { name: 'Smart Home',  value: 20, color: '#CBD5E1' },
  { name: 'Cables',      value: 15, color: '#E2E8F0' },
  { name: 'Other',       value: 5,  color: '#F1F5F9' },
]

const ACTIVITY = [
  { time: '10:45 AM', action: 'Purchase order created',  user: 'John Mensah',    ref: 'PO-0845', icon: FileText },
  { time: '09:30 AM', action: 'Stock transfer approved', user: 'Sarah Boateng',  ref: '50 units', icon: Package },
  { time: '08:15 AM', action: 'New customer registered', user: 'Front Desk HQ',  ref: 'Maria Owusu', icon: Users },
  { time: 'Yesterday', action: 'Inventory count done',   user: 'Warehouse Team', ref: '2,450 items', icon: Package },
  { time: 'Yesterday', action: 'Discount approved',      user: 'K. Asante',      ref: '#2091 · 15%', icon: Tag },
]

/* ─── Sub-components ──────────────────────────────────────────── */

const C = {
  card: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
  } as React.CSSProperties,
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', margin: '0 20px' }} />
}

function ChartTip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0A0F1E', borderRadius: 8, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#64748B' }}>{p.name}</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: '#f1f5f9' }}>
            GH₵ {p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── Page ─────────────────────────────────────────────────────── */

export default function Dashboard() {
  const [range, setRange] = useState('Month')

  return (
    <div style={{ padding: '24px 24px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.08em', margin: '0 0 4px', textTransform: 'uppercase' }}>August 13, 2024 · Head Office</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0A0F1E', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            Good morning, Kwame.
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 1, background: 'rgba(0,0,0,0.07)', borderRadius: 8, padding: 2 }}>
          {['Today', 'Week', 'Month', 'Year'].map(r => (
            <button key={r} onClick={() => setRange(r)}
              style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: range === r ? '#fff' : 'transparent', color: range === r ? '#0A0F1E' : '#94A3B8', boxShadow: range === r ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Revenue Hero ─────────────────────────────────────────── */}
      <div style={{ ...C.card }}>
        {/* Hero header */}
        <div style={{ padding: '20px 24px 16px', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 0, alignItems: 'start' }}>
          {/* Primary KPI */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.07em', margin: '0 0 6px', textTransform: 'uppercase' }}>Monthly Revenue</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 38, fontWeight: 700, color: '#0A0F1E', letterSpacing: '-0.04em', lineHeight: 1 }}>
                GH₵ 385,200
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 6, background: '#F0FDF4', color: '#16A34A', fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                <ArrowUpRight size={12} /> +14.2%
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
              <div style={{ flex: 1, maxWidth: 260, height: 4, borderRadius: 2, background: '#F1F5F9', overflow: 'hidden' }}>
                <div style={{ width: '78%', height: '100%', background: '#16A34A', borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap' }}>78% of GH₵ 500K target</span>
            </div>
          </div>

          {/* Secondary KPIs inline */}
          {[
            { label: "Today's Sales", value: 'GH₵ 24,580', change: '+12.4%', up: true },
            { label: 'Net Profit',    value: 'GH₵ 92,400', change: '+4.2%',  up: true },
            { label: 'Orders',        value: '1,248',        change: '+6.3%',  up: true },
          ].map((kpi, i) => (
            <div key={kpi.label} style={{ padding: '0 0 0 28px', borderLeft: '1px solid rgba(0,0,0,0.06)', marginLeft: 28 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.07em', margin: '0 0 5px', textTransform: 'uppercase' }}>{kpi.label}</p>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: '#0A0F1E', letterSpacing: '-0.03em', lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 4 }}>
                <ArrowUpRight size={10} style={{ color: '#16A34A' }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: '#16A34A', fontFamily: 'JetBrains Mono, monospace' }}>{kpi.change}</span>
              </div>
            </div>
          ))}
        </div>

        <Divider />

        {/* Area chart */}
        <div style={{ padding: '16px 16px 8px' }}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16A34A" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#94A3B8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#CBD5E1' }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#CBD5E1' }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="sales"  name="Sales"  stroke="#16A34A" strokeWidth={2} fill="url(#gSales)" dot={false} activeDot={{ r: 3, fill: '#16A34A', strokeWidth: 0 }} />
              <Area type="monotone" dataKey="profit" name="Profit" stroke="#CBD5E1" strokeWidth={1.5} fill="url(#gProfit)" dot={false} activeDot={{ r: 3, fill: '#94A3B8', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, paddingLeft: 8, marginTop: 2 }}>
            {[{ c: '#16A34A', l: 'Revenue' }, { c: '#CBD5E1', l: 'Profit' }].map(({ c, l }) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 20, height: 2, background: c, display: 'inline-block', borderRadius: 1 }} />
                <span style={{ fontSize: 11, color: '#94A3B8' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Lower KPI strip ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Active Staff',      value: '61',         sub: '67 total · 4 on leave',       change: '+3 new',    up: true  },
          { label: 'Inventory Value',   value: 'GH₵ 2.4M',  sub: '274 products catalogued',      change: '5 alerts',  up: false, warn: true },
          { label: 'Pending Approvals', value: '23',         sub: 'Requires action',               change: '8 urgent',  up: false, alert: true },
          { label: 'Avg. Order Value',  value: 'GH₵ 2,840', sub: 'vs GH₵ 2,620 last month',     change: '+8.4%',     up: true  },
        ].map(({ label, value, sub, change, up, warn, alert }) => (
          <div key={label}
            style={{ ...C.card, padding: '16px 18px', cursor: 'default', transition: 'box-shadow 0.2s, transform 0.2s' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.1)'; el.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = C.card.boxShadow as string; el.style.transform = 'none' }}
          >
            <p style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.07em', margin: '0 0 8px', textTransform: 'uppercase' }}>{label}</p>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 26, fontWeight: 700, color: alert ? '#DC2626' : '#0A0F1E', letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</div>
            <p style={{ fontSize: 11, color: '#94A3B8', margin: '5px 0 8px', lineHeight: 1.4 }}>{sub}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 5, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, background: alert ? '#FEF2F2' : warn ? '#FFFBEB' : up ? '#F0FDF4' : '#F8F9FB', color: alert ? '#DC2626' : warn ? '#D97706' : up ? '#16A34A' : '#94A3B8' }}>
              {alert ? <AlertCircle size={9} /> : up ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
              {change}
            </div>
          </div>
        ))}
      </div>

      {/* ── Branch + Staff ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Branch Rankings */}
        <div style={C.card}>
          <div style={{ padding: '18px 20px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.07em', margin: '0 0 3px', textTransform: 'uppercase' }}>Branch Rankings</p>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0A0F1E', margin: 0, letterSpacing: '-0.02em' }}>Monthly performance</h3>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#F0FDF4', color: '#16A34A', letterSpacing: '0.05em' }}>LIVE</span>
            </div>
          </div>
          <Divider />
          <div style={{ padding: '6px 0 6px' }}>
            {BRANCHES.map((b, i) => {
              const pct = b.target > 0 ? Math.min(100, Math.round((b.sales / b.target) * 100)) : 0
              return (
                <div key={b.name}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 20px', transition: 'background 0.1s', cursor: 'default' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8F9FB')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: i === 0 ? '#16A34A' : '#CBD5E1', width: 14, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: (b as any).offline ? '#CBD5E1' : '#0A0F1E', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</span>
                      {(b as any).offline && <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 4, background: '#FEF2F2', color: '#DC2626', flexShrink: 0 }}>OFFLINE</span>}
                    </div>
                    <div style={{ height: 3, borderRadius: 2, background: '#F1F5F9', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: i === 0 ? '#16A34A' : '#CBD5E1', transition: 'width 1s ease' }} />
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: (b as any).offline ? '#E2E8F0' : '#0A0F1E', letterSpacing: '-0.02em' }}>
                      {(b as any).offline ? '—' : `GH₵ ${(b.sales / 1000).toFixed(0)}K`}
                    </div>
                    {!(b as any).offline && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, marginTop: 2 }}>
                        {b.change >= 0 ? <ArrowUpRight size={9} style={{ color: '#16A34A' }} /> : <ArrowDownRight size={9} style={{ color: '#DC2626' }} />}
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 700, color: b.change >= 0 ? '#16A34A' : '#DC2626' }}>{Math.abs(b.change)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right column: Staff + Category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Top Staff */}
          <div style={C.card}>
            <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.07em', margin: '0 0 3px', textTransform: 'uppercase' }}>Top Performers</p>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0A0F1E', margin: 0, letterSpacing: '-0.02em' }}>Staff sales this month</h3>
              </div>
            </div>
            <Divider />
            <div style={{ padding: '4px 0 6px' }}>
              {TOP_STAFF.map((s, i) => (
                <div key={s.name}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 20px', transition: 'background 0.1s', cursor: 'default' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8F9FB')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: i === 0 ? '#16A34A' : '#CBD5E1', width: 14, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg,#16A34A,#15803D)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: i === 0 ? '#fff' : '#94A3B8', flexShrink: 0 }}>
                    {s.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#0A0F1E', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{s.role}</div>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#0A0F1E', letterSpacing: '-0.02em', flexShrink: 0 }}>
                    GH₵ {(s.sales / 1000).toFixed(0)}K
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category mix — compact */}
          <div style={{ ...C.card, padding: '16px 20px 14px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.07em', margin: '0 0 12px', textTransform: 'uppercase' }}>Revenue mix</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Mini donut */}
              <div style={{ flexShrink: 0 }}>
                <ResponsiveContainer width={80} height={80}>
                  <PieChart>
                    <Pie data={CATEGORY} cx="50%" cy="50%" innerRadius={26} outerRadius={38} dataKey="value" paddingAngle={2} strokeWidth={0}>
                      {CATEGORY.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {CATEGORY.map(c => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 2, background: c.color, display: 'inline-block', flexShrink: 0, border: c.color === '#F1F5F9' ? '1px solid #E2E8F0' : 'none' }} />
                      <span style={{ fontSize: 11, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: '#0A0F1E', flexShrink: 0 }}>{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Activity ─────────────────────────────────────────────── */}
      <div style={C.card}>
        <div style={{ padding: '16px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.07em', margin: '0 0 3px', textTransform: 'uppercase' }}>Activity Log</p>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0A0F1E', margin: 0, letterSpacing: '-0.02em' }}>Recent events</h3>
          </div>
          <button style={{ fontSize: 12, fontWeight: 500, color: '#16A34A', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '-0.01em' }}>View all →</button>
        </div>
        <Divider />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {ACTIVITY.map(({ time, action, user, ref, icon: Icon }, i) => (
            <div key={i}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: i < ACTIVITY.length - 2 ? '1px solid rgba(0,0,0,0.04)' : 'none', borderRight: i % 2 === 0 ? '1px solid rgba(0,0,0,0.04)' : 'none', transition: 'background 0.1s', cursor: 'default' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F8F9FB')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: 30, height: 30, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={13} style={{ color: '#94A3B8' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#0A0F1E', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{action}</div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user} · <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>{ref}</span>
                </div>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#CBD5E1', flexShrink: 0, whiteSpace: 'nowrap' }}>{time}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
