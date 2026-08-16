import { useState } from 'react'
import { Package, AlertTriangle, TrendingDown, BarChart2, RefreshCcw, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import EditableCell from '../components/EditableCell'

const INIT_LOW_STOCK = [
  { product: 'MCB Breaker 32A', sku: 'MCB-32A-SP', current: 8, minimum: 50, branch: 'Abuakwa', reorder: '20 Aug', priority: 'critical' },
  { product: 'LED Panel 60W', sku: 'LED-P60-WH', current: 14, minimum: 30, branch: 'Adum', reorder: '22 Aug', priority: 'critical' },
  { product: 'Solar Panel 150W', sku: 'SOL-P150', current: 5, minimum: 20, branch: 'Head Office', reorder: '18 Aug', priority: 'critical' },
  { product: 'Smart Switch WiFi', sku: 'SW-WIFI-16A', current: 22, minimum: 40, branch: 'Takoradi', reorder: '25 Aug', priority: 'warning' },
  { product: 'Inverter 1.5KVA', sku: 'INV-1.5K', current: 3, minimum: 10, branch: 'Asuoyeboa', reorder: '19 Aug', priority: 'critical' },
]

const FAST_MOVERS = [
  { name: 'Extension Board 6-way', qty: 520, change: 12 },
  { name: 'Conduit Pipe 20mm', qty: 890, change: 8 },
  { name: 'LED Panel 60W', qty: 320, change: -3 },
  { name: 'MCB Breaker 32A', qty: 430, change: 22 },
  { name: 'Cable 2.5mm Roll', qty: 480, change: 5 },
]

const DEAD_STOCK = [
  { name: 'Fluorescent Tube 36W', lastSale: '90 days ago', value: 810 },
  { name: 'Analog Meter', lastSale: '120 days ago', value: 2400 },
  { name: 'Legacy PVC Conduit', lastSale: '95 days ago', value: 540 },
  { name: 'Incandescent Bulb 60W', lastSale: '180 days ago', value: 320 },
  { name: 'CRT Monitor Cable', lastSale: '200 days ago', value: 180 },
]

const forecastData = Array.from({ length: 20 }, (_, i) => ({
  day: `D${i + 1}`,
  ledPanel: Math.max(0, 320 - i * 15 + Math.random() * 20),
  mcb: Math.max(0, 80 - i * 4 + Math.random() * 8),
  solar: Math.max(0, 50 - i * 2 + Math.random() * 6),
}))

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E4E8EE', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', ...style }}>{children}</div>
)

export default function Inventory() {
  const [lowStock, setLowStock] = useState(INIT_LOW_STOCK)

  const updateRow = (sku: string, field: string, val: string) => {
    setLowStock(prev => prev.map(r => r.sku === sku ? { ...r, [field]: field === 'current' || field === 'minimum' ? Number(val) : val } : r))
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Inventory Management</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>Stock levels, alerts & forecasting · Click to edit inline</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 8, background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>Health: 72%</span>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #E4E8EE', background: '#fff', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
            <Plus size={13} /> Add Product
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Products', value: '274', icon: Package, color: '#16A34A' },
          { label: 'Low Stock', value: '5', icon: AlertTriangle, color: '#D97706' },
          { label: 'Dead Stock', value: '12', icon: TrendingDown, color: '#DC2626' },
          { label: 'Forecast Alerts', value: '8', icon: BarChart2, color: '#7C3AED' },
          { label: 'Turnover Rate', value: '68%', icon: RefreshCcw, color: '#2563EB' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: '1px solid #E4E8EE', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Icon size={15} style={{ color }} />
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Low stock table */}
      <Card style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Low Stock Alerts</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#DC2626', color: '#fff' }}>{lowStock.length}</span>
          </div>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>Click cells to edit</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F3F4F6' }}>
                {['Product', 'SKU', 'In Stock', 'Min', 'Branch', 'Reorder By', 'Priority', 'Action'].map(h => (
                  <th key={h} style={{ textAlign: 'left', paddingBottom: 8, paddingRight: 14, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#9CA3AF', letterSpacing: '0.07em', fontWeight: 600, whiteSpace: 'nowrap' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lowStock.map(item => (
                <tr key={item.sku} style={{ borderBottom: '1px solid #F9FAFB' }}
                  onMouseEnter={e => (e.currentTarget.style.background = item.priority === 'critical' ? 'rgba(220,38,38,0.03)' : '#F9FAFB')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '10px 14px 10px 0' }}>
                    <EditableCell value={item.product} onChange={val => updateRow(item.sku, 'product', val)} style={{ fontSize: 13, fontWeight: 500, color: '#111827' }} />
                  </td>
                  <td style={{ paddingRight: 14 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9CA3AF' }}>{item.sku}</span>
                  </td>
                  <td style={{ paddingRight: 14 }}>
                    <EditableCell value={item.current} onChange={val => updateRow(item.sku, 'current', val)}
                      style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 800, color: item.priority === 'critical' ? '#DC2626' : '#D97706' }} />
                  </td>
                  <td style={{ paddingRight: 14 }}>
                    <EditableCell value={item.minimum} onChange={val => updateRow(item.sku, 'minimum', val)}
                      style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#6B7280' }} />
                  </td>
                  <td style={{ paddingRight: 14 }}>
                    <EditableCell value={item.branch} onChange={val => updateRow(item.sku, 'branch', val)}
                      style={{ fontSize: 12, color: '#6B7280' }} />
                  </td>
                  <td style={{ paddingRight: 14 }}>
                    <EditableCell value={item.reorder} onChange={val => updateRow(item.sku, 'reorder', val)}
                      style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9CA3AF' }} />
                  </td>
                  <td style={{ paddingRight: 14 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 20, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', background: item.priority === 'critical' ? '#FEF2F2' : '#FFFBEB', color: item.priority === 'critical' ? '#B91C1C' : '#B45309' }}>
                      {item.priority}
                    </span>
                  </td>
                  <td>
                    <button style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #E4E8EE', background: '#F9FAFB', fontSize: 10, fontWeight: 600, color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Reorder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Fast movers + dead stock */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Fast-Moving Products</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAST_MOVERS.map((p, i) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, color: '#15803D' }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: '#374151', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ height: 4, borderRadius: 2, background: '#F3F4F6' }}>
                    <div style={{ width: `${(p.qty / 900) * 100}%`, background: '#16A34A', height: '100%', borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: '#16A34A' }}>{p.qty}u</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: p.change > 0 ? '#16A34A' : '#DC2626' }}>
                    {p.change > 0 ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}{Math.abs(p.change)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Dead Stock</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEAD_STOCK.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#B91C1C', marginTop: 2 }}>Last sold: {p.lastSale}</div>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6B7280' }}>GH₵ {p.value.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Forecast chart */}
      <Card style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Stock Forecast – Next 20 Days</div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 16 }}>Predicted stock levels by product</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={forecastData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="day" tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} interval={3} />
            <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v: any) => [`${Math.round(v)} units`]} contentStyle={{ fontFamily: 'JetBrains Mono', fontSize: 11, background: '#1F2937', border: 'none', borderRadius: 8, color: '#fff' }} />
            <Line type="monotone" dataKey="ledPanel" name="LED Panel 60W" stroke="#16A34A" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="mcb" name="MCB 32A" stroke="#DC2626" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="solar" name="Solar Panel 150W" stroke="#D97706" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
