import { useState } from 'react'
import { DollarSign, ShoppingCart, TrendingUp, Users, Target, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import EditableCell from '../components/EditableCell'

const revenueData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  lighting: Math.floor(6000 + Math.random() * 8000),
  tools: Math.floor(3000 + Math.random() * 5000),
  smartHome: Math.floor(2000 + Math.random() * 4000),
  cables: Math.floor(1000 + Math.random() * 3000),
}))

const branchSales = [
  { branch: 'Head Office', revenue: 145000, target: 150000 },
  { branch: 'Asuoyeboa', revenue: 98500, target: 90000 },
  { branch: 'Adum', revenue: 87200, target: 100000 },
  { branch: 'Takoradi', revenue: 54300, target: 60000 },
  { branch: 'Abuakwa', revenue: 0, target: 40000 },
]

const INIT_ORDERS = [
  { id: 'ORD-2024-0981', customer: 'Accra Constructions Ltd', amount: 12450, date: '13 Aug 2024', status: 'completed', branch: 'Head Office' },
  { id: 'ORD-2024-0980', customer: 'Kwesi Adu', amount: 3200, date: '13 Aug 2024', status: 'pending', branch: 'Asuoyeboa' },
  { id: 'ORD-2024-0979', customer: 'SafePower GH', amount: 28700, date: '12 Aug 2024', status: 'completed', branch: 'Head Office' },
  { id: 'ORD-2024-0978', customer: 'Yaa Asantewaa', amount: 1800, date: '12 Aug 2024', status: 'cancelled', branch: 'Adum' },
  { id: 'ORD-2024-0977', customer: 'Nexgen Developers', amount: 54000, date: '11 Aug 2024', status: 'completed', branch: 'Head Office' },
  { id: 'ORD-2024-0976', customer: 'Kofi Boateng', amount: 6400, date: '11 Aug 2024', status: 'pending', branch: 'Takoradi' },
]

const STATUS_S: Record<string, { bg: string; color: string }> = {
  completed: { bg: '#F0FDF4', color: '#15803D' },
  pending: { bg: '#FFFBEB', color: '#B45309' },
  cancelled: { bg: '#FEF2F2', color: '#B91C1C' },
}

const ChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1F2937', borderRadius: 8, padding: '8px 12px', border: 'none' }}>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginBottom: 2 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: '#9CA3AF', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>{p.name}:</span>
          <span style={{ color: '#fff', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: 11 }}>GH₵ {p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E4E8EE', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', ...style }}>{children}</div>
)

export default function Sales() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [orders, setOrders] = useState(INIT_ORDERS)

  const updateOrder = (id: string, field: string, val: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, [field]: field === 'amount' ? Number(val.replace(/[^0-9.]/g, '')) : val } : o))
  }

  const filtered = orders.filter(o => statusFilter === 'All' || o.status === statusFilter.toLowerCase())

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Sales & Revenue</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>Performance analytics · Click any cell to edit inline</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #E4E8EE', background: '#fff', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
          <Download size={13} /> Export
        </button>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { icon: DollarSign, label: 'Total Revenue', value: 'GH₵ 385.2K', change: '+14.2%', positive: true, color: '#16A34A' },
          { icon: ShoppingCart, label: 'Avg Order Value', value: 'GH₵ 2,840', change: '+8.1%', positive: true, color: '#2563EB' },
          { icon: Target, label: 'Orders Count', value: '1,248', change: '+6.3%', positive: true, color: '#7C3AED' },
          { icon: TrendingUp, label: 'Conversion Rate', value: '3.8%', change: '-0.4%', positive: false, color: '#D97706' },
          { icon: Users, label: 'Customer LTV', value: 'GH₵ 14,200', change: '+22.7%', positive: true, color: '#16A34A' },
        ].map(({ icon: Icon, label, value, change, positive, color }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: '1px solid #E4E8EE', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={14} style={{ color }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, fontFamily: 'JetBrains Mono, monospace', background: positive ? '#F0FDF4' : '#FEF2F2', color: positive ? '#15803D' : '#B91C1C' }}>
                {positive ? <ArrowUpRight size={9} style={{ display: 'inline', verticalAlign: 'middle' }} /> : <ArrowDownRight size={9} style={{ display: 'inline', verticalAlign: 'middle' }} />}{' '}{change}
              </span>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: '#111827' }}>{value}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Revenue trend */}
      <Card style={{ padding: '20px 20px 12px' }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Revenue Trend – Last 30 Days</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Stacked by product category</div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <defs>
              {[['lighting', '#16A34A'], ['tools', '#2563EB'], ['smartHome', '#7C3AED'], ['cables', '#D97706']].map(([id, color]) => (
                <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="day" tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="lighting" name="Lighting" stackId="1" stroke="#16A34A" strokeWidth={1.5} fill="url(#grad-lighting)" />
            <Area type="monotone" dataKey="tools" name="Power Tools" stackId="1" stroke="#2563EB" strokeWidth={1.5} fill="url(#grad-tools)" />
            <Area type="monotone" dataKey="smartHome" name="Smart Home" stackId="1" stroke="#7C3AED" strokeWidth={1.5} fill="url(#grad-smartHome)" />
            <Area type="monotone" dataKey="cables" name="Cables" stackId="1" stroke="#D97706" strokeWidth={1.5} fill="url(#grad-cables)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Branch targets */}
      <Card style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Branch Sales vs Target</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {branchSales.map((b, i) => {
            const pct = Math.min(100, Math.round((b.revenue / (b.target || 1)) * 100))
            const color = pct >= 100 ? '#16A34A' : pct >= 75 ? '#2563EB' : pct > 0 ? '#D97706' : '#DC2626'
            return (
              <div key={b.branch}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9CA3AF', width: 16 }}>#{i + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{b.branch}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#6B7280' }}>GH₵ {b.revenue.toLocaleString()}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: color + '14', color }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: '#F3F4F6' }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 0.8s ease' }} />
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9CA3AF', marginTop: 3 }}>Target: GH₵ {b.target.toLocaleString()}</div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Orders table */}
      <Card style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Orders</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>Click any cell to edit inline</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['All', 'Completed', 'Pending', 'Cancelled'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{ padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500, border: '1px solid', cursor: 'pointer', transition: 'all 0.12s', background: statusFilter === s ? '#16A34A' : '#fff', color: statusFilter === s ? '#fff' : '#6B7280', borderColor: statusFilter === s ? '#16A34A' : '#E4E8EE' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F3F4F6' }}>
                {['Order ID', 'Customer', 'Amount (GH₵)', 'Date', 'Branch', 'Status', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', paddingBottom: 8, paddingRight: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#9CA3AF', letterSpacing: '0.07em', fontWeight: 600, whiteSpace: 'nowrap' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}
                  style={{ borderBottom: '1px solid #F9FAFB' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '10px 16px 10px 0' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#16A34A', fontWeight: 600 }}>{o.id}</span>
                  </td>
                  <td style={{ paddingRight: 16, whiteSpace: 'nowrap' }}>
                    <EditableCell value={o.customer} onChange={val => updateOrder(o.id, 'customer', val)} style={{ fontSize: 13, fontWeight: 500, color: '#111827' }} />
                  </td>
                  <td style={{ paddingRight: 16 }}>
                    <EditableCell value={o.amount.toLocaleString()} onChange={val => updateOrder(o.id, 'amount', val)} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#111827' }} />
                  </td>
                  <td style={{ paddingRight: 16 }}>
                    <EditableCell value={o.date} onChange={val => updateOrder(o.id, 'date', val)} style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#6B7280' }} />
                  </td>
                  <td style={{ paddingRight: 16 }}>
                    <EditableCell value={o.branch} onChange={val => updateOrder(o.id, 'branch', val)} style={{ fontSize: 12, color: '#6B7280' }} />
                  </td>
                  <td style={{ paddingRight: 16 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, fontFamily: 'JetBrains Mono, monospace', textTransform: 'capitalize', ...STATUS_S[o.status] }}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    <button style={{ fontSize: 12, fontWeight: 500, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}>View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
