import { useState } from 'react'
import { Search, Plus, Users, TrendingUp, Package, Wifi, WifiOff, Eye, MapPin, ArrowUpRight, ArrowDownRight, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const BRANCHES = [
  { id: 1, name: 'Head Office', region: 'Greater Accra', status: 'active', staff: 28, todaySales: 18450, target: 20000, stockValue: 645200, lastSync: '2 mins ago', address: '14 Liberation Road, Accra', phone: '+233 302 123 456', hours: 'Mon–Sat 8am–6pm', manager: 'Kwame Asante', change: 12.4, rank: 1,
    monthly: [62,75,88,92,98,108,118,128,135,138,141,145].map((v, i) => ({ m: ['J','F','M','A','M','J','J','A','S','O','N','D'][i], v: v * 1000 })) },
  { id: 2, name: 'Asuoyeboa', region: 'Ashanti Region', status: 'active', staff: 12, todaySales: 8450, target: 10000, stockValue: 345600, lastSync: '5 mins ago', address: 'Shop 4, Asuoyeboa Market', phone: '+233 322 789 012', hours: 'Mon–Sat 8am–6pm', manager: 'Ama Osei', change: 8.1, rank: 2,
    monthly: [38,42,50,58,64,70,78,82,85,88,92,98].map((v, i) => ({ m: ['J','F','M','A','M','J','J','A','S','O','N','D'][i], v: v * 1000 })) },
  { id: 3, name: 'Adum', region: 'Ashanti Region', status: 'active', staff: 9, todaySales: 6200, target: 8000, stockValue: 187400, lastSync: '12 mins ago', address: 'Adum Street, Kumasi', phone: '+233 322 345 678', hours: 'Mon–Sat 8am–5:30pm', manager: 'Kofi Mensah', change: -2.3, rank: 3,
    monthly: [45,48,52,60,68,74,78,80,84,86,88,87].map((v, i) => ({ m: ['J','F','M','A','M','J','J','A','S','O','N','D'][i], v: v * 1000 })) },
  { id: 4, name: 'Abuakwa', region: 'Ashanti Region', status: 'offline', staff: 7, todaySales: 0, target: 5000, stockValue: 98300, lastSync: '3 hrs ago', address: 'Market Street, Abuakwa', phone: '+233 322 567 890', hours: 'Mon–Sat 8am–6pm', manager: 'Efua Boateng', change: -100, rank: 4,
    monthly: [10,12,14,18,20,22,24,26,0,0,0,0].map((v, i) => ({ m: ['J','F','M','A','M','J','J','A','S','O','N','D'][i], v: v * 1000 })) },
  { id: 5, name: 'Takoradi', region: 'Western Region', status: 'active', staff: 11, todaySales: 5100, target: 7000, stockValue: 212800, lastSync: '8 mins ago', address: 'Market Circle, Takoradi', phone: '+233 312 901 234', hours: 'Mon–Sat 8am–6pm', manager: 'Yaw Darko', change: 5.0, rank: 5,
    monthly: [22,25,28,32,36,40,42,44,46,48,50,54].map((v, i) => ({ m: ['J','F','M','A','M','J','J','A','S','O','N','D'][i], v: v * 1000 })) },
]

const RANK_MEDALS = ['🥇', '🥈', '🥉']

function BranchModal({ branch, onClose }: { branch: typeof BRANCHES[0]; onClose: () => void }) {
  const [tab, setTab] = useState('overview')

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', maxWidth: 560, background: '#fff', borderRadius: 14, border: '1px solid #E4E8EE', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px 0', borderBottom: '1px solid #E4E8EE', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>{branch.name}</h2>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>{branch.region} · {branch.manager}</div>
            </div>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #E4E8EE', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
              <X size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            {['overview', 'sales trend', 'contacts'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '8px 14px', background: 'none', border: 'none',
                borderBottom: `2px solid ${tab === t ? '#16A34A' : 'transparent'}`,
                cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 600 : 400,
                color: tab === t ? '#16A34A' : '#6B7280', textTransform: 'capitalize'
              }}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: "Today's Sales", value: branch.status === 'offline' ? '—' : `GH₵ ${branch.todaySales.toLocaleString()}` },
                { label: 'Target', value: `GH₵ ${branch.target.toLocaleString()}` },
                { label: 'Stock Value', value: `GH₵ ${(branch.stockValue / 1000).toFixed(0)}K` },
                { label: 'Staff', value: branch.staff },
                { label: 'Last Sync', value: branch.lastSync },
                { label: 'Status', value: branch.status === 'active' ? 'Online' : 'Offline', color: branch.status === 'active' ? '#15803D' : '#B91C1C' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ padding: '12px 14px', borderRadius: 9, background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 700, color: color || '#111827' }}>{value}</div>
                </div>
              ))}
            </div>
          )}
          {tab === 'sales trend' && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={branch.monthly} margin={{ top: 4, right: 0, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="m" tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => [`GH₵ ${v.toLocaleString()}`, 'Sales']} contentStyle={{ fontFamily: 'JetBrains Mono', fontSize: 11, background: '#1F2937', border: 'none', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="v" fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {tab === 'contacts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Address', value: branch.address },
                { label: 'Phone', value: branch.phone },
                { label: 'Hours', value: branch.hours },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '12px 14px', borderRadius: 9, background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Branches() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<typeof BRANCHES[0] | null>(null)

  const visible = BRANCHES.filter(b => {
    const m = b.name.toLowerCase().includes(search.toLowerCase()) || b.region.toLowerCase().includes(search.toLowerCase())
    const f = filter === 'All' || (filter === 'Active' && b.status === 'active') || (filter === 'Offline' && b.status === 'offline')
    return m && f
  }).sort((a, b) => b.todaySales - a.todaySales)

  return (
    <div style={{ padding: 24 }}>
      {selected && <BranchModal branch={selected} onClose={() => setSelected(null)} />}

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Branch Network</h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>Live rankings · {BRANCHES.filter(b => b.status === 'active').length} of {BRANCHES.length} branches online</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Branches', value: '5', color: '#111827' },
          { label: 'Active', value: '4', color: '#15803D' },
          { label: 'Offline', value: '1', color: '#B91C1C' },
          { label: 'Total Staff', value: '67', color: '#1D4ED8' },
          { label: 'Monthly Sales', value: 'GH₵ 385K', color: '#7C3AED' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #E4E8EE', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: '1px solid #E4E8EE', background: '#fff', fontSize: 13, color: '#111827', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
            placeholder="Search branches..."
            onFocus={e => (e.target.style.borderColor = '#16A34A')}
            onBlur={e => (e.target.style.borderColor = '#E4E8EE')}
          />
        </div>
        {['All', 'Active', 'Offline'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: '1px solid', cursor: 'pointer', transition: 'all 0.12s', background: filter === f ? '#16A34A' : '#fff', color: filter === f ? '#fff' : '#6B7280', borderColor: filter === f ? '#16A34A' : '#E4E8EE' }}>
            {f}
          </button>
        ))}
        <button style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #E4E8EE', background: '#fff', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
          <Plus size={13} /> Add Branch
        </button>
      </div>

      {/* Branch cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {visible.map((branch, rank) => {
          const pct = branch.target > 0 ? Math.min(100, Math.round((branch.todaySales / branch.target) * 100)) : 0
          const barColor = branch.status === 'offline' ? '#DC2626' : pct >= 100 ? '#16A34A' : pct >= 70 ? '#2563EB' : '#D97706'

          return (
            <div key={branch.id}
              style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #E4E8EE', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: '#9CA3AF' }}>{rank + 1}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{branch.name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{branch.region}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, background: branch.status === 'active' ? '#F0FDF4' : '#FEF2F2', fontSize: 11, fontWeight: 600, color: branch.status === 'active' ? '#15803D' : '#B91C1C' }}>
                  {branch.status === 'active' ? <Wifi size={10} /> : <WifiOff size={10} />}
                  {branch.status === 'active' ? 'Live' : 'Offline'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                {[
                  { icon: Users, label: 'Staff', value: branch.staff },
                  { icon: TrendingUp, label: 'Today', value: branch.todaySales > 0 ? `GH₵${(branch.todaySales / 1000).toFixed(1)}K` : '—' },
                  { icon: Package, label: 'Stock', value: `GH₵${(branch.stockValue / 1000).toFixed(0)}K` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: '#F9FAFB' }}>
                    <Icon size={12} style={{ color: '#9CA3AF', display: 'block', margin: '0 auto 4px' }} />
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: '#111827' }}>{value}</div>
                    <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 1 }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>Daily target: GH₵ {(branch.target / 1000).toFixed(0)}K</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: barColor }}>{pct}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: '#F3F4F6' }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: barColor }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  {branch.change > 0 ? <ArrowUpRight size={12} style={{ color: '#16A34A' }} /> : <ArrowDownRight size={12} style={{ color: '#DC2626' }} />}
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: branch.change > 0 ? '#16A34A' : '#DC2626' }}>
                    {Math.abs(branch.change)}% vs last month
                  </span>
                </div>
                <button onClick={() => setSelected(branch)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, border: '1px solid #E4E8EE', background: 'transparent', fontSize: 12, color: '#374151', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Eye size={12} /> Details
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
