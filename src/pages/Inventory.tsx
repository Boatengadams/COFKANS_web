import React, { useState, useEffect } from 'react'
import { Package, AlertTriangle, TrendingDown, BarChart2, RefreshCcw, Plus, Inbox } from 'lucide-react'
import { collection, query, orderBy, onSnapshot, doc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import EditableCell from '../components/EditableCell'
import { useFirebaseAuth as useAuth } from '../app/contexts/FirebaseAuthContext'

const COLOR = { brand: '#4F3FF0', brandDim: 'rgba(79,63,240,0.10)', ink: '#111827', body: '#374151', muted: '#6B7280', faint: '#9CA3AF', border: '#E4E8EE', line: '#F3F4F6', wash: '#F9FAFB', slate300: '#CBD5E1', up: '#16A34A', upBg: '#F0FDF4', upBorder: 'rgba(22,163,74,0.25)', down: '#DC2626', downBg: '#FEF2F2', downBorder: 'rgba(220,38,38,0.2)', warn: '#D97706', warnBg: '#FFFBEB' }
const FONT_MONO = `'IBM Plex Mono', 'SFMono-Regular', monospace`

function EmptyState({ message }: { message: string }) { return (<div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}><Inbox size={20} style={{ color: COLOR.slate300 }} /><p style={{ fontSize: 12, color: COLOR.faint, margin: 0, maxWidth: 260, lineHeight: 1.5 }}>{message}</p></div>) }

export default function Inventory() {
  const { user, hasRole, loading: authLoading } = useAuth()
  const canRead = !!(hasRole && (hasRole('manager') || hasRole('developer')))
  const canWrite = !!(hasRole && (hasRole('manager') || hasRole('developer')))

  const [lowStock, setLowStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    if (!canRead) { setLoading(false); return }
    setLoading(true)
    const q = query(collection(db, 'inventory'), orderBy('product'))
    const unsub = onSnapshot(q, snap => { const arr: any[] = []; snap.forEach(d => arr.push({ sku: d.id, ...(d.data() as any) })); setLowStock(arr); setLoading(false) }, err => { console.error(err); setError('Failed to load inventory'); setLoading(false) })
    return () => unsub()
  }, [user, hasRole])

  // debounced saves per-inventory-field to reduce Firestore writes
  const saveTimers = React.useRef<Record<string, number>>({})
  const updateRow = (sku: string, field: string, val: any) => {
    setLowStock(prev => prev.map(r => r.sku === sku ? { ...r, [field]: field === 'current' || field === 'minimum' ? Number(val) : val } : r))
    if (!canWrite) return
    const key = `${sku}:${field}`
    if (saveTimers.current[key]) clearTimeout(saveTimers.current[key])
    saveTimers.current[key] = window.setTimeout(async () => {
      try { await setDoc(doc(db, 'inventory', sku), { [field]: field === 'current' || field === 'minimum' ? Number(val) : val }, { merge: true }) } catch (err) { console.error(err); setError('Failed to save inventory') }
      delete saveTimers.current[key]
    }, 800)
  }

  if (authLoading || loading) return <div style={{ padding: 24 }}>Loading inventory…</div>
  if (!canRead) return <div style={{ padding: 24, color: '#DC2626' }}>Permission denied — inventory visible to managers & developers only.</div>
  if (error) return <div style={{ padding: 24, color: '#DC2626' }}>{error}</div>

  const summary = [
    { label: 'Total Products', value: '0', icon: Package, color: COLOR.brand },
    { label: 'Low Stock', value: String(lowStock.length), icon: AlertTriangle, color: COLOR.warn },
    { label: 'Dead Stock', value: '0', icon: TrendingDown, color: COLOR.down },
    { label: 'Forecast Alerts', value: '0', icon: BarChart2, color: COLOR.brand },
    { label: 'Turnover Rate', value: '0%', icon: RefreshCcw, color: COLOR.up },
  ]

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: COLOR.ink, margin: 0 }}>Inventory Management</h1>
          <p style={{ fontSize: 13, color: COLOR.muted, margin: '4px 0 0' }}>Stock levels, alerts & forecasting · Click to edit inline</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 8, background: COLOR.wash, color: COLOR.faint, border: `1px solid ${COLOR.border}` }}>Health: No data</span>
          <button disabled={!canWrite} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: `1px solid ${COLOR.border}`, background: '#fff', fontSize: 13, fontWeight: 500, color: COLOR.body, cursor: canWrite ? 'pointer' : 'not-allowed' }}><Plus size={13} /> Add Product</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {summary.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: `1px solid ${COLOR.border}` }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: s.color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}><s.icon size={15} style={{ color: s.color }} /></div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, color: COLOR.ink }}>{s.value}</div>
            <div style={{ fontSize: 11, color: COLOR.faint, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: COLOR.ink }}>Low Stock Alerts</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: lowStock.length>0?COLOR.down:COLOR.wash, color: lowStock.length>0? '#fff' : COLOR.faint }}>{lowStock.length}</span>
          </div>
          <span style={{ fontSize: 11, color: COLOR.faint }}>Click cells to edit</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${COLOR.line}` }}>
                {['Product','SKU','In Stock','Min','Branch','Reorder By','Priority','Action'].map(h => <th key={h} style={{ textAlign: 'left', paddingBottom: 8, paddingRight: 14, fontFamily: FONT_MONO, fontSize: 9, color: COLOR.faint }}>{h.toUpperCase()}</th>)}
              </tr>
            </thead>
            <tbody>
              {lowStock.length === 0 ? (
                <tr><td colSpan={8}><EmptyState message="No low-stock items right now. Alerts will appear here automatically when stock falls below minimum." /></td></tr>
              ) : lowStock.map(item => (
                <tr key={item.sku} style={{ borderBottom: `1px solid ${COLOR.wash}` }}>
                  <td style={{ padding: '10px 14px 10px 0' }}><EditableCell value={item.product} onChange={val => updateRow(item.sku, 'product', val)} style={{ fontSize: 13, fontWeight: 500, color: COLOR.ink }} /></td>
                  <td style={{ paddingRight: 14 }}><span style={{ fontFamily: FONT_MONO, fontSize: 10, color: COLOR.faint }}>{item.sku}</span></td>
                  <td style={{ paddingRight: 14 }}><EditableCell value={item.current} onChange={val => updateRow(item.sku, 'current', val)} style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 800, color: item.priority==='critical'?COLOR.down:COLOR.warn }} /></td>
                  <td style={{ paddingRight: 14 }}><EditableCell value={item.minimum} onChange={val => updateRow(item.sku, 'minimum', val)} style={{ fontFamily: FONT_MONO, fontSize: 12, color: COLOR.muted }} /></td>
                  <td style={{ paddingRight: 14 }}><EditableCell value={item.branch} onChange={val => updateRow(item.sku, 'branch', val)} style={{ fontSize: 12, color: COLOR.muted }} /></td>
                  <td style={{ paddingRight: 14 }}><EditableCell value={item.reorder} onChange={val => updateRow(item.sku, 'reorder', val)} style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLOR.faint }} /></td>
                  <td style={{ paddingRight: 14 }}><span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 20, fontFamily: FONT_MONO, textTransform: 'uppercase', background: item.priority==='critical'?COLOR.downBg:COLOR.warnBg, color: item.priority==='critical'?COLOR.down:COLOR.warn }}>{item.priority}</span></td>
                  <td><button aria-label={`Reorder ${item.product}`} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${COLOR.border}`, background: COLOR.wash, fontSize: 10, fontWeight: 600, color: COLOR.body }}>Reorder</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  async function updateRow(sku: string, field: string, val: any) {
    setLowStock(prev => prev.map(r => r.sku === sku ? { ...r, [field]: field === 'current' || field === 'minimum' ? Number(val) : val } : r))
    if (!canWrite) return
    try { await setDoc(doc(db, 'inventory', sku), { [field]: field === 'current' || field === 'minimum' ? Number(val) : val }, { merge: true }) } catch (err) { console.error(err); setError('Failed to save inventory') }
  }
}
