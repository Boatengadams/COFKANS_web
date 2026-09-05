import React, { useState, useEffect } from 'react'
import { DollarSign, ShoppingCart, TrendingUp, Users, Target, Download, ArrowUpRight, ArrowDownRight, Inbox } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import EditableCell from '../components/EditableCell'
import { collection, query, orderBy, onSnapshot, doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useFirebaseAuth as useAuth } from '../app/contexts/FirebaseAuthContext'

const COLOR = { brand: '#4F3FF0', brandDim: 'rgba(79,63,240,0.10)', ink: '#111827', body: '#374151', muted: '#6B7280', faint: '#9CA3AF', border: '#E4E8EE', line: '#F3F4F6', wash: '#F9FAFB', slate300: '#CBD5E1', slate200: '#E2E8F0', up: '#16A34A', upBg: '#F0FDF4', down: '#DC2626', downBg: '#FEF2F2', warn: '#D97706', warnBg: '#FFFBEB' }
const FONT_MONO = `'IBM Plex Mono', 'SFMono-Regular', monospace`

function EmptyState({ message }: { message: string }) { return (<div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}><Inbox size={20} style={{ color: COLOR.slate300 }} /><p style={{ fontSize: 12, color: COLOR.faint, margin: 0, maxWidth: 260, lineHeight: 1.5 }}>{message}</p></div>) }

export default function Sales() {
  const { user, hasRole, loading: authLoading } = useAuth()
  const canRead = !!(hasRole && (hasRole('manager') || hasRole('developer')))
  const canWrite = !!(hasRole && (hasRole('manager') || hasRole('developer')))

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    if (!canRead) { setLoading(false); return }
    setLoading(true)
    const q = query(collection(db, 'orders'), orderBy('date', 'desc'))
    const unsub = onSnapshot(q, snap => { const arr:any[] = []; snap.forEach(d => arr.push({ id: d.id, ...(d.data() as any) })); setOrders(arr); setLoading(false) }, err => { console.error(err); setError('Failed to load orders'); setLoading(false) })
    return () => unsub()
  }, [user, hasRole])

  // debounced saves per-order-field to avoid excessive writes
  const saveTimers = React.useRef<Record<string, number>>({})
  const updateOrder = (id: string, field: string, val: any) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, [field]: field === 'amount' ? Number(String(val).replace(/[^0-9.]/g, '')) : val } : o))
    if (!canWrite) return
    const key = `${id}:${field}`
    if (saveTimers.current[key]) clearTimeout(saveTimers.current[key])
    saveTimers.current[key] = window.setTimeout(async () => {
      try {
        await setDoc(doc(db, 'orders', id), { [field]: field === 'amount' ? Number(String(val).replace(/[^0-9.]/g, '')) : val }, { merge: true })
      } catch (err) {
        console.error(err)
        setError('Failed to save order')
      }
      delete saveTimers.current[key]
    }, 800)
  }

  const revenueData = Array.from({ length: 30 }, (_, i) => ({ day: `${i + 1}`, lighting: 0, tools: 0, smartHome: 0, cables: 0 }))
  const branchSales: { branch: string; revenue: number; target: number }[] = []

  if (authLoading || loading) return <div style={{ padding: 24 }}>Loading sales…</div>
  if (!canRead) return <div style={{ padding: 24, color: '#DC2626' }}>Permission denied — sales visible to managers & developers only.</div>
  if (error) return <div style={{ padding: 24, color: '#DC2626' }}>{error}</div>

  const STATUS_S: Record<string, any> = { completed: { bg: '#F0FDF4', color: '#16A34A' }, pending: { bg: '#FFFBEB', color: '#D97706' }, cancelled: { bg: '#FEF2F2', color: '#DC2626' } }

  const KPIS = [ { icon: DollarSign, label: 'Total Revenue', value: 'GH₵ 0' }, { icon: ShoppingCart, label: 'Avg Order Value', value: 'GH₵ 0' }, { icon: Target, label: 'Orders Count', value: String(orders.length) }, { icon: TrendingUp, label: 'Conversion Rate', value: '0%' }, { icon: Users, label: 'Customer LTV', value: 'GH₵ 0' } ]

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: COLOR.ink, margin: 0 }}>Sales & Revenue</h1>
          <p style={{ fontSize: 13, color: COLOR.muted, margin: '4px 0 0' }}>Performance analytics · Click any cell to edit inline</p>
        </div>
        <button disabled={orders.length === 0} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: `1px solid ${COLOR.border}`, background: '#fff', fontSize: 13, fontWeight: 500, color: orders.length === 0 ? COLOR.slate300 : COLOR.body, cursor: orders.length === 0 ? 'not-allowed' : 'pointer' }}>
          <Download size={13} /> Export
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {KPIS.map(k => (
          <div key={k.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: `1px solid ${COLOR.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: COLOR.brandDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><k.icon size={14} style={{ color: COLOR.brand }} /></div>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, fontFamily: FONT_MONO, background: COLOR.wash, color: COLOR.faint }}>No data</span>
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: COLOR.ink }}>{k.value}</div>
            <div style={{ fontSize: 11, color: COLOR.faint, marginTop: 3 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: '20px 20px 12px' }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLOR.ink }}>Revenue Trend – Last 30 Days</div>
          <div style={{ fontSize: 11, color: COLOR.faint, marginTop: 2 }}>Stacked by product category</div>
        </div>
        <div style={{ position: 'relative' }}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-lighting" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLOR.brand} stopOpacity={0.18} /><stop offset="100%" stopColor={COLOR.brand} stopOpacity={0} /></linearGradient>
                <linearGradient id="grad-tools" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLOR.faint} stopOpacity={0.18} /><stop offset="100%" stopColor={COLOR.faint} stopOpacity={0} /></linearGradient>
                <linearGradient id="grad-smartHome" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLOR.slate300} stopOpacity={0.18} /><stop offset="100%" stopColor={COLOR.slate300} stopOpacity={0} /></linearGradient>
                <linearGradient id="grad-cables" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLOR.slate200} stopOpacity={0.18} /><stop offset="100%" stopColor={COLOR.slate200} stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COLOR.line} vertical={false} />
              <XAxis dataKey="day" tick={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fill: COLOR.faint }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fill: COLOR.faint }} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip />
              <Area type="monotone" dataKey="lighting" name="Lighting" stackId="1" stroke={COLOR.brand} strokeWidth={1.5} fill="url(#grad-lighting)" />
              <Area type="monotone" dataKey="tools" name="Power Tools" stackId="1" stroke={COLOR.faint} strokeWidth={1.5} fill="url(#grad-tools)" />
              <Area type="monotone" dataKey="smartHome" name="Smart Home" stackId="1" stroke={COLOR.slate300} strokeWidth={1.5} fill="url(#grad-smartHome)" />
              <Area type="monotone" dataKey="cables" name="Cables" stackId="1" stroke={COLOR.slate200} strokeWidth={1.5} fill="url(#grad-cables)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: COLOR.ink }}>Orders</div><div style={{ fontSize: 11, color: COLOR.faint, marginTop: 1 }}>Click any cell to edit inline</div></div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${COLOR.line}` }}>
                {['Order ID','Customer','Amount (GH₵)','Date','Branch','Status',''].map(h => <th key={h} style={{ textAlign: 'left', paddingBottom: 8, paddingRight: 16, fontFamily: FONT_MONO, fontSize: 9, color: COLOR.faint }}>{h.toUpperCase()}</th>)}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={7}><EmptyState message={'No orders yet. New orders will appear here as they come in.'} /></td></tr>
              ) : orders.map(o => (
                <tr key={o.id} style={{ borderBottom: `1px solid ${COLOR.wash}` }}>
                  <td style={{ padding: '10px 16px 10px 0' }}><span style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLOR.brand, fontWeight: 600 }}>{o.id}</span></td>
                  <td style={{ paddingRight: 16 }}><EditableCell value={o.customer} onChange={val => updateOrder(o.id, 'customer', val)} style={{ fontSize: 13, fontWeight: 500, color: COLOR.ink }} /></td>
                  <td style={{ paddingRight: 16 }}><EditableCell value={String(o.amount||0)} onChange={val => updateOrder(o.id, 'amount', val)} style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: COLOR.ink }} /></td>
                  <td style={{ paddingRight: 16 }}><EditableCell value={o.date} onChange={val => updateOrder(o.id, 'date', val)} style={{ fontSize: 12, fontFamily: FONT_MONO, color: COLOR.muted }} /></td>
                  <td style={{ paddingRight: 16 }}><EditableCell value={o.branch} onChange={val => updateOrder(o.id, 'branch', val)} style={{ fontSize: 12, color: COLOR.muted }} /></td>
                  <td style={{ paddingRight: 16 }}><span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, fontFamily: FONT_MONO, textTransform: 'capitalize', background: (o.status==='completed'? '#F0FDF4' : o.status==='pending'? '#FFFBEB' : '#FEF2F2'), color: (o.status==='completed'? '#16A34A' : o.status==='pending'? '#D97706' : '#DC2626') }}>{o.status}</span></td>
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
