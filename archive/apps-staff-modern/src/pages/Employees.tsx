import React, { useState, useEffect } from 'react'
import { Users, UserCheck, Umbrella, UserPlus, Search, Plus, Star, Inbox } from 'lucide-react'
import { collection, query, orderBy, onSnapshot, doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import EditableCell from '../components/EditableCell'
import { useFirebaseAuth as useAuth } from '../app/contexts/FirebaseAuthContext'

const COLOR = {
  brand: '#4F3FF0', brandDim: 'rgba(79,63,240,0.10)', ink: '#111827', body: '#374151', muted: '#6B7280', faint: '#9CA3AF', border: '#E4E8EE', line: '#F3F4F6', wash: '#F9FAFB', slate200: '#E2E8F0', slate300: '#CBD5E1', up: '#16A34A', upBg: '#F0FDF4', upBorder: 'rgba(22,163,74,0.25)', warn: '#D97706', warnBg: '#FFFBEB',
}
const FONT_MONO = `'IBM Plex Mono', 'SFMono-Regular', monospace`

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
      <Inbox size={20} style={{ color: COLOR.slate300 }} />
      <p style={{ fontSize: 12, color: COLOR.faint, margin: 0, maxWidth: 260, lineHeight: 1.5 }}>{message}</p>
    </div>
  )
}

const RANK_MEDALS = ['🥇', '🥈', '🥉']

export default function Employees() {
  const { user, hasRole, loading: authLoading } = useAuth()
  const canRead = !!(hasRole && (hasRole('manager') || hasRole('developer')))
  const canWrite = !!(hasRole && (hasRole('manager') || hasRole('developer')))

  const [search, setSearch] = useState('')
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!canRead) { setLoading(false); return }
    setLoading(true)
    const q = query(collection(db, 'employees'), orderBy('name'))
    const unsub = onSnapshot(q, snap => {
      const arr: any[] = []
      snap.forEach(d => arr.push({ id: d.id, ...(d.data() as any) }))
      setEmployees(arr)
      setLoading(false)
    }, err => { console.error(err); setError('Failed to load employees'); setLoading(false) })
    return () => unsub()
  }, [user, hasRole])

  // debounced saves per-employee-field to avoid excessive writes
  const saveTimers = React.useRef<Record<string, number>>({})
  const updateEmp = (id: string, field: string, val: any) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, [field]: field === 'score' || field === 'sales' ? Number(val) : val } : e))
    if (!canWrite) return
    const key = `${id}:${field}`
    if (saveTimers.current[key]) clearTimeout(saveTimers.current[key])
    saveTimers.current[key] = window.setTimeout(async () => {
      try {
        await setDoc(doc(db, 'employees', id), { [field]: field === 'score' || field === 'sales' ? Number(val) : val }, { merge: true })
      } catch (err) { console.error('save employee', err); setError('Failed to save employee') }
      delete saveTimers.current[key]
    }, 800)
  }

  const filtered = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.id?.toLowerCase().includes(search.toLowerCase()) ||
    e.role?.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = employees.filter(e => e.status === 'active').length
  const onLeaveCount = employees.filter(e => e.status === 'on-leave').length

  const SUMMARY = [
    { icon: Users, label: 'Total Staff', value: employees.length, color: COLOR.brand },
    { icon: UserCheck, label: 'Active', value: activeCount, color: COLOR.up },
    { icon: Umbrella, label: 'On Leave', value: onLeaveCount, color: COLOR.warn },
    { icon: UserPlus, label: 'New This Month', value: 0, color: COLOR.up },
  ]

  const sorted = [...employees].sort((a, b) => (b.sales || 0) - (a.sales || 0))
  const leaderboard = sorted.filter(e => (e.sales || 0) > 0).slice(0, 4)
  const maxSales = leaderboard[0]?.sales || 1

  if (authLoading || loading) return <div style={{ padding: 24 }}>Loading employees…</div>
  if (!canRead) return <div style={{ padding: 24, color: '#DC2626' }}>Permission denied — employees visible to managers & developers only.</div>
  if (error) return <div style={{ padding: 24, color: '#DC2626' }}>{error}</div>

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`.row-hover{transition:background .12s}.row-hover:hover{background:${COLOR.wash}}`}</style>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: COLOR.ink, margin: 0 }}>Employee Management</h1>
          <p style={{ fontSize: 13, color: COLOR.muted, margin: '4px 0 0' }}>Staff leaderboard & directory · {employees.length} total</p>
        </div>
        <button disabled={!canWrite} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: `1px solid ${COLOR.border}`, background: '#fff', fontSize: 13, fontWeight: 500, color: COLOR.body, cursor: canWrite ? 'pointer' : 'not-allowed' }}>
          <Plus size={13} /> Add Employee
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {SUMMARY.map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: `1px solid ${COLOR.border}` }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Icon size={15} style={{ color }} />
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, color: COLOR.ink }}>{value}</div>
            <div style={{ fontSize: 11, color: COLOR.faint, marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLOR.ink }}>Staff Sales Leaderboard</div>
            <div style={{ fontSize: 11, color: COLOR.faint, marginTop: 2 }}>Ranked by total sales contribution this month</div>
          </div>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: COLOR.upBg, color: COLOR.up, border: `1px solid ${COLOR.upBorder}` }}>THIS MONTH</span>
        </div>
        {leaderboard.length === 0 ? <EmptyState message="No sales recorded yet. Top performers will show up here once orders start coming in." /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {leaderboard.map((e, i) => {
              const pct = Math.round(((e.sales || 0) / maxSales) * 100)
              return (
                <div key={e.id} style={{ padding: '14px 16px', borderRadius: 10, background: i === 0 ? COLOR.warnBg : COLOR.wash, border: `1px solid ${i === 0 ? '#FDE68A' : COLOR.line}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700 }}>{RANK_MEDALS[i] ? RANK_MEDALS[i] : `#${i+1}`}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Star size={11} fill={COLOR.warn} style={{ color: COLOR.warn }} />
                      <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: COLOR.warn }}>{e.score}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: COLOR.slate200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: COLOR.body }}>{(e.name || '').split(' ').map((n:any)=>n[0]).join('').slice(0,2)}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: COLOR.ink }}>{e.name}</div>
                      <div style={{ fontSize: 10, color: COLOR.faint }}>{e.role}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 17, fontWeight: 700, color: COLOR.ink, marginBottom: 6 }}>GH₵ {( (e.sales||0) / 1000).toFixed(0)}K</div>
                  <div style={{ height: 3, borderRadius: 2, background: COLOR.slate200 }}><div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: COLOR.brand }} /></div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLOR.ink }}>Staff Directory</div>
            <div style={{ fontSize: 11, color: COLOR.faint, marginTop: 1 }}>Click any cell to edit inline</div>
          </div>
          <div>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: COLOR.faint, pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff..." style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, borderRadius: 8, border: `1px solid ${COLOR.border}`, background: COLOR.wash, fontSize: 13, color: COLOR.ink, width: 200 }} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${COLOR.line}` }}>
                {['Employee', 'Role', 'Branch', 'Status', 'Score', 'Sales', 'Joined', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', paddingBottom: 8, paddingRight: 14, fontFamily: FONT_MONO, fontSize: 9, color: COLOR.faint }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState message={employees.length === 0 ? 'No employees added yet.' : 'No staff match your search.'} /></td></tr>
              ) : filtered.map(emp => (
                <tr key={emp.id} className="row-hover" style={{ borderBottom: `1px solid ${COLOR.wash}` }}>
                  <td style={{ padding: '10px 14px 10px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: COLOR.slate200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: COLOR.body }}>{(emp.name||'').split(' ').map((n:any)=>n[0]).join('').slice(0,2)}</div>
                      <div>
                        <EditableCell value={emp.name} onChange={val => updateEmp(emp.id, 'name', val)} style={{ fontSize: 13, fontWeight: 600, color: COLOR.ink }} />
                        <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: COLOR.faint }}>{emp.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ paddingRight: 14 }}><EditableCell value={emp.role} onChange={val => updateEmp(emp.id, 'role', val)} style={{ fontSize: 12, color: COLOR.body }} /></td>
                  <td style={{ paddingRight: 14 }}><EditableCell value={emp.branch} onChange={val => updateEmp(emp.id, 'branch', val)} style={{ fontSize: 12, color: COLOR.muted }} /></td>
                  <td style={{ paddingRight: 14 }}><span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, fontFamily: FONT_MONO, background: emp.status==='active'?COLOR.upBg:emp.status==='on-leave'?COLOR.warnBg:COLOR.line, color: emp.status==='active'?COLOR.up:emp.status==='on-leave'?COLOR.warn:COLOR.muted }}>{emp.status}</span></td>
                  <td style={{ paddingRight: 14 }}><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={11} fill={COLOR.warn} style={{ color: COLOR.warn }} /><EditableCell value={emp.score} onChange={val => updateEmp(emp.id, 'score', val)} style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: COLOR.ink }} /></div></td>
                  <td style={{ paddingRight: 14 }}><span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: emp.sales>0?COLOR.up:COLOR.faint }}>{emp.sales>0?`GH₵ ${(emp.sales/1000).toFixed(0)}K`:'—'}</span></td>
                  <td style={{ paddingRight: 14 }}><EditableCell value={emp.joined} onChange={val => updateEmp(emp.id, 'joined', val)} style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLOR.faint }} /></td>
                  <td><button style={{ fontSize: 12, fontWeight: 500, color: COLOR.brand, background: 'none', border: 'none', cursor: 'pointer' }}>View →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
