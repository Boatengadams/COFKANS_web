import { useState } from 'react'
import { Users, UserCheck, Umbrella, UserPlus, Search, Plus, Star, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import EditableCell from '../components/EditableCell'

const DEPT_PERF = [
  { dept: 'Management', score: 4.6 },
  { dept: 'Front Desk', score: 4.1 },
  { dept: 'Warehouse', score: 4.3 },
  { dept: 'Logistics', score: 3.8 },
  { dept: 'Technicians', score: 4.0 },
]

const DEPT_COLORS = ['#16A34A', '#2563EB', '#7C3AED', '#D97706', '#0891B2']

const INIT_EMPLOYEES = [
  { id: 'EMP-001', name: 'Kwame Asante', role: 'General Manager', dept: 'Management', branch: 'Head Office', status: 'active', joined: '15 Jan 2020', score: 4.9, sales: 385200 },
  { id: 'EMP-002', name: 'Ama Osei', role: 'Branch Manager', dept: 'Management', branch: 'Asuoyeboa', status: 'active', joined: '03 Mar 2021', score: 4.7, sales: 98500 },
  { id: 'EMP-003', name: 'John Mensah', role: 'Senior Cashier', dept: 'Front Desk', branch: 'Head Office', status: 'active', joined: '08 Jun 2022', score: 4.2, sales: 48200 },
  { id: 'EMP-004', name: 'Sarah Boateng', role: 'Warehouse Lead', dept: 'Warehouse', branch: 'Adum', status: 'active', joined: '01 Feb 2021', score: 4.5, sales: 29100 },
  { id: 'EMP-005', name: 'Yaw Darko', role: 'Branch Manager', dept: 'Management', branch: 'Takoradi', status: 'on-leave', joined: '19 Sep 2020', score: 4.1, sales: 54300 },
  { id: 'EMP-006', name: 'Efua Boateng', role: 'Branch Manager', dept: 'Management', branch: 'Abuakwa', status: 'active', joined: '05 Nov 2022', score: 3.8, sales: 0 },
  { id: 'EMP-007', name: 'Kofi Mensah', role: 'Driver', dept: 'Logistics', branch: 'Adum', status: 'active', joined: '22 Apr 2023', score: 4.0, sales: 0 },
  { id: 'EMP-008', name: 'Maria Owusu', role: 'Cashier', dept: 'Front Desk', branch: 'Head Office', status: 'active', joined: '10 Jan 2024', score: 3.9, sales: 21400 },
]

const STATUS_S: Record<string, { bg: string; color: string; label: string }> = {
  'active': { bg: '#F0FDF4', color: '#15803D', label: 'Active' },
  'on-leave': { bg: '#FFFBEB', color: '#B45309', label: 'On Leave' },
  'inactive': { bg: '#F3F4F6', color: '#6B7280', label: 'Inactive' },
}

const RANK_MEDALS = ['🥇', '🥈', '🥉']

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E4E8EE', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', ...style }}>{children}</div>
)

export default function Employees() {
  const [search, setSearch] = useState('')
  const [employees, setEmployees] = useState(INIT_EMPLOYEES)

  const updateEmp = (id: string, field: string, val: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, [field]: field === 'score' || field === 'sales' ? Number(val) : val } : e))
  }

  const sorted = [...employees].sort((a, b) => b.sales - a.sales)
  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.id.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Employee Management</h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>Staff leaderboard & directory · {employees.length} total</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #E4E8EE', background: '#fff', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
          <Plus size={13} /> Add Employee
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { icon: Users, label: 'Total Staff', value: 67, color: '#16A34A' },
          { icon: UserCheck, label: 'Active', value: 61, color: '#2563EB' },
          { icon: Umbrella, label: 'On Leave', value: 4, color: '#D97706' },
          { icon: UserPlus, label: 'New This Month', value: 3, color: '#7C3AED' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: '1px solid #E4E8EE', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Icon size={15} style={{ color }} />
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Sales Leaderboard */}
      <Card style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Staff Sales Leaderboard</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Ranked by total sales contribution this month</div>
          </div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>THIS MONTH</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {sorted.filter(e => e.sales > 0).slice(0, 4).map((e, i) => {
            const pct = Math.round((e.sales / sorted[0].sales) * 100)
            const barColor = i === 0 ? '#D97706' : i === 1 ? '#6B7280' : i === 2 ? '#92400E' : '#2563EB'
            return (
              <div key={e.id} style={{ padding: '14px 16px', borderRadius: 10, background: i === 0 ? '#FFFBEB' : '#F9FAFB', border: `1px solid ${i === 0 ? '#FDE68A' : '#F3F4F6'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: i === 0 ? '#111827' : '#9CA3AF' }}>#{i + 1}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Star size={11} fill="#D97706" style={{ color: '#D97706' }} />
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: '#D97706' }}>{e.score}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#374151', flexShrink: 0 }}>
                    {e.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{e.name}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>{e.role}</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 6 }}>GH₵ {(e.sales / 1000).toFixed(0)}K</div>
                <div style={{ height: 3, borderRadius: 2, background: '#E5E7EB' }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: barColor }} />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Staff table */}
      <Card style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Staff Directory</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>Click any cell to edit inline</div>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, borderRadius: 8, border: '1px solid #E4E8EE', background: '#F9FAFB', fontSize: 13, color: '#111827', outline: 'none', width: 200, fontFamily: 'Inter, sans-serif' }}
              placeholder="Search staff..."
              onFocus={e => (e.target.style.borderColor = '#16A34A')}
              onBlur={e => (e.target.style.borderColor = '#E4E8EE')}
            />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F3F4F6' }}>
                {['Employee', 'Role', 'Branch', 'Status', 'Score', 'Sales', 'Joined', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', paddingBottom: 8, paddingRight: 14, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#9CA3AF', letterSpacing: '0.07em', fontWeight: 600, whiteSpace: 'nowrap' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => {
                const s = STATUS_S[emp.status]
                return (
                  <tr key={emp.id} style={{ borderBottom: '1px solid #F9FAFB' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '10px 14px 10px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <EditableCell value={emp.name} onChange={val => updateEmp(emp.id, 'name', val)} style={{ fontSize: 13, fontWeight: 600, color: '#111827' }} />
                          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#9CA3AF' }}>{emp.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ paddingRight: 14 }}>
                      <EditableCell value={emp.role} onChange={val => updateEmp(emp.id, 'role', val)} style={{ fontSize: 12, color: '#374151' }} />
                    </td>
                    <td style={{ paddingRight: 14 }}>
                      <EditableCell value={emp.branch} onChange={val => updateEmp(emp.id, 'branch', val)} style={{ fontSize: 12, color: '#6B7280' }} />
                    </td>
                    <td style={{ paddingRight: 14 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, fontFamily: 'JetBrains Mono, monospace', ...s }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ paddingRight: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={11} fill="#D97706" style={{ color: '#D97706' }} />
                        <EditableCell value={emp.score} onChange={val => updateEmp(emp.id, 'score', val)} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: '#111827' }} />
                      </div>
                    </td>
                    <td style={{ paddingRight: 14 }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: emp.sales > 0 ? '#16A34A' : '#9CA3AF' }}>
                        {emp.sales > 0 ? `GH₵ ${(emp.sales / 1000).toFixed(0)}K` : '—'}
                      </span>
                    </td>
                    <td style={{ paddingRight: 14 }}>
                      <EditableCell value={emp.joined} onChange={val => updateEmp(emp.id, 'joined', val)} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9CA3AF' }} />
                    </td>
                    <td>
                      <button style={{ fontSize: 12, fontWeight: 500, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}>View →</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dept chart */}
      <Card style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Department Performance</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={DEPT_PERF} layout="vertical" margin={{ left: 12, right: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
            <XAxis type="number" domain={[0, 5]} tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="dept" tick={{ fontFamily: 'Inter', fontSize: 12, fill: '#374151' }} tickLine={false} axisLine={false} width={90} />
            <Tooltip formatter={(v: any) => [`${v}/5`, 'Avg Score']} contentStyle={{ fontFamily: 'JetBrains Mono', fontSize: 11, background: '#1F2937', border: 'none', borderRadius: 8, color: '#fff' }} />
            <Bar dataKey="score" radius={[0, 6, 6, 0]}>
              {DEPT_PERF.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
