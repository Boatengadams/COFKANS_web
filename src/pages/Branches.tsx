import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Search, Plus, Users, TrendingUp, Package, Wifi, WifiOff, Eye, ArrowUpRight, ArrowDownRight, X, Trash2, Inbox } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useFirebaseAuth as useAuth } from '../app/contexts/FirebaseAuthContext'

// ---------------------------------------------------------------------------
// Design tokens — grounded in West African market ledgers & kente-cloth
// palette rather than default SaaS blue/green. Warm parchment surface,
// gold as the primary accent, forest green for "live", clay for "offline".
// ---------------------------------------------------------------------------
const T = {
  bgPage: '#F6F1E7',
  surface: '#FFFDF8',
  border: '#E6DBC3',
  borderStrong: '#D3C29D',
  ink: '#211D16',
  inkSoft: '#57503F',
  muted: '#948566',
  gold: '#B8872B',
  goldDeep: '#8F6A1E',
  goldSoft: '#F6EAC9',
  forest: '#1E5B45',
  forestSoft: '#E7F1EA',
  clay: '#AE4128',
  claySoft: '#F7E7DE',
  indigo: '#33506E',
  indigoSoft: '#E9EEF3',
}

const FONT_DISPLAY = "'Fraunces', Georgia, 'Times New Roman', serif"
const FONT_BODY = "'Inter', system-ui, -apple-system, sans-serif"
const FONT_MONO = "'JetBrains Mono', 'SF Mono', monospace"

const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');"

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

function rankTone(i: number) {
  if (i === 0) return { fg: T.goldDeep, bg: T.goldSoft, border: T.gold }
  if (i === 1) return { fg: T.inkSoft, bg: '#F2EFE8', border: T.borderStrong }
  if (i === 2) return { fg: '#8A5A3A', bg: '#F3E7DB', border: '#D8B99A' }
  return { fg: T.muted, bg: '#F2EFE8', border: T.border }
}

function useToasts() {
  const [toasts, setToasts] = useState([])
  const push = (message: string, tone = 'default') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t: any) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t: any) => t.filter((x: any) => x.id !== id)), 2800)
  }
  return { toasts, push }
}

function BranchModal({ branch, onClose, onDelete }: { branch: any; onClose: () => void; onDelete: (b: any) => void }) {
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e as any).key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div role="dialog" aria-modal="true" aria-label={`${branch.name} details`}
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(33,29,22,0.5)', backdropFilter: 'blur(3px)' }}
      onClick={e => (e.target === e.currentTarget) && onClose()}>
      <div style={{ width: '100%', maxWidth: 560, background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, boxShadow: '0 24px 60px rgba(33,29,22,0.22)', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 0', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 700, color: T.ink, margin: 0 }}>{branch.name}</h2>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.03em', color: T.muted, marginTop: 4, textTransform: 'uppercase' }}>{branch.region} · {branch.manager}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => onDelete(branch)} aria-label={`Remove ${branch.name}`}
                style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${T.claySoft}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.clay }}>
                <Trash2 size={13} />
              </button>
              <button onClick={onClose} aria-label="Close details" style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${T.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                <X size={14} />
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0 }} role="tablist" aria-label="Branch detail sections">
            {['overview', 'sales trend', 'contacts'].map(t => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} style={{
                padding: '9px 14px', background: 'none', border: 'none',
                borderBottom: `2px solid ${tab === t ? T.gold : 'transparent'}`,
                cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 13, fontWeight: tab === t ? 600 : 500,
                color: tab === t ? T.ink : T.muted, textTransform: 'capitalize'
              }}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: "Today's Sales", value: branch.status === 'offline' ? '—' : `GH₵ ${branch.todaySales?.toLocaleString?.() ?? branch.todaySales ?? '—'}` },
                { label: 'Target', value: `GH₵ ${branch.target?.toLocaleString?.() ?? branch.target ?? '—'}` },
                { label: 'Stock Value', value: `GH₵ ${((branch.stockValue ?? 0) / 1000).toFixed(0)}K` },
                { label: 'Staff', value: branch.staff ?? '—' },
                { label: 'Last Sync', value: branch.lastSync ?? '—' },
                { label: 'Status', value: branch.status === 'active' ? 'Online' : 'Offline', color: branch.status === 'active' ? T.forest : T.clay },
              ].map(({ label, value, color }: any) => (
                <div key={label} style={{ padding: '12px 14px', borderRadius: 7, background: T.bgPage, border: `1px solid ${T.border}` }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase', color: T.muted, marginBottom: 5 }}>{label}</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 15, fontWeight: 700, color: color || T.ink }}>{value}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'sales trend' && (
            branch?.monthly?.every((m: any) => m.v === 0) ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Inbox size={24} style={{ color: T.borderStrong, margin: '0 auto 10px' }} />
                <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: T.muted }}>No sales data yet for this branch</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={branch.monthly} margin={{ top: 4, right: 0, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                  <XAxis dataKey="m" tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: T.muted }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: T.muted }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => [`GH₵ ${v.toLocaleString()}`, 'Sales']} contentStyle={{ fontFamily: 'JetBrains Mono', fontSize: 11, background: T.ink, border: 'none', borderRadius: 6, color: '#fff' }} />
                  <Bar dataKey="v" fill={T.forest} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          )}

          {tab === 'contacts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Address', value: branch.address },
                { label: 'Phone', value: branch.phone },
                { label: 'Hours', value: branch.hours },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '12px 14px', borderRadius: 7, background: T.bgPage, border: `1px solid ${T.border}` }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase', color: T.muted, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 500, color: T.inkSoft }}>{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AddBranchModal({ onClose, onAdd }: { onClose: () => void; onAdd: (d: any) => void }) {
  const [form, setForm] = useState({ name: '', region: 'Greater Accra', manager: '', address: '', phone: '', target: '' })
  const [error, setError] = useState('')
  const nameRef = useRef<any>(null)

  useEffect(() => { if (nameRef.current) (nameRef.current as any).focus() }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e as any).key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const setField = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = (e: any) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Branch name is required'); return }
    if (!form.target || Number(form.target) <= 0) { setError('Enter a daily target greater than 0'); return }
    onAdd({
      name: form.name.trim(),
      region: form.region,
      manager: form.manager.trim() || 'Unassigned',
      address: form.address.trim() || 'Not set',
      phone: form.phone.trim() || 'Not set',
      target: Number(form.target),
    })
  }

  const inputStyle: any = { width: '100%', padding: '9px 12px', borderRadius: 7, border: `1px solid ${T.border}`, fontSize: 13, color: T.ink, outline: 'none', fontFamily: FONT_BODY, boxSizing: 'border-box', background: T.surface }
  const labelStyle: any = { fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 700, color: T.inkSoft, marginBottom: 6, display: 'block' }

  return (
    <div role="dialog" aria-modal="true" aria-label="Add branch"
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(33,29,22,0.5)', backdropFilter: 'blur(3px)' }}
      onClick={e => (e.target === e.currentTarget) && onClose()}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 440, background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, boxShadow: '0 24px 60px rgba(33,29,22,0.22)', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, color: T.ink, margin: 0 }}>Add branch</h2>
          <button type="button" onClick={onClose} aria-label="Close" style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${T.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
            <X size={14} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle} htmlFor="b-name">Branch name</label>
            <input id="b-name" ref={nameRef} style={inputStyle} value={form.name} onChange={setField('name')} placeholder="e.g. Tamale" />
          </div>
          <div>
            <label style={labelStyle} htmlFor="b-region">Region</label>
            <select id="b-region" style={inputStyle} value={form.region} onChange={setField('region')}>
              {['Greater Accra','Ashanti Region','Western Region','Eastern Region','Central Region','Northern Region','Volta Region'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle} htmlFor="b-manager">Manager</label>
            <input id="b-manager" style={inputStyle} value={form.manager} onChange={setField('manager')} placeholder="e.g. Abena Frimpong" />
          </div>
          <div>
            <label style={labelStyle} htmlFor="b-address">Address</label>
            <input id="b-address" style={inputStyle} value={form.address} onChange={setField('address')} placeholder="Street, town" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle} htmlFor="b-phone">Phone</label>
              <input id="b-phone" style={inputStyle} value={form.phone} onChange={setField('phone')} placeholder="+233 ..." />
            </div>
            <div>
              <label style={labelStyle} htmlFor="b-target">Daily target (GH₵)</label>
              <input id="b-target" type="number" min="1" style={inputStyle} value={form.target} onChange={setField('target')} placeholder="5000" />
            </div>
          </div>
          {error && <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: T.clay, background: T.claySoft, border: `1px solid ${T.clay}22`, borderRadius: 7, padding: '8px 12px' }}>{error}</div>}
        </div>
        <div style={{ padding: '14px 24px', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 7, border: `1px solid ${T.border}`, background: T.surface, fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, color: T.inkSoft, cursor: 'pointer' }}>Cancel</button>
          <button type="submit" style={{ padding: '8px 16px', borderRadius: 7, border: 'none', background: T.gold, fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Add branch</button>
        </div>
      </form>
    </div>
  )
}

export default function Branches() {
  const { user, isLoading: authLoading, hasRole } = useAuth()
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<any | null>(null)
  const [adding, setAdding] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null)
  const { toasts, push } = useToasts()

  const canManage = !!(hasRole && (hasRole('admin') || hasRole('manager') || hasRole('developer') || hasRole('branch_manager')))

  useEffect(() => {
    setError(null)
    const q = query(collection(db, 'branches'), orderBy('name'))
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => {
        const doc = d.data()
        return {
          id: d.id,
          name: doc.name,
          region: doc.region,
          manager: doc.manager,
          address: doc.address,
          phone: doc.phone,
          target: doc.target ?? 0,
          staff: doc.staff ?? 0,
          todaySales: doc.todaySales ?? 0,
          stockValue: doc.stockValue ?? 0,
          status: doc.status ?? 'active',
          lastSync: doc.lastSync ?? '—',
          change: doc.change ?? 0,
          monthly: doc.monthly ?? MONTH_LABELS.map(m => ({ m, v: 0 })),
        }
      })
      setBranches(data)
      setLoading(false)
    }, err => { console.error('Branches listener error', err); setError('Failed to load branches'); setLoading(false) })

    return () => unsub()
  }, [])

  const visible = useMemo(() => {
    return branches.filter(b => {
      const m = (b.name || '').toLowerCase().includes(search.toLowerCase()) || (b.region || '').toLowerCase().includes(search.toLowerCase())
      const f = filter === 'All' || (filter === 'Active' && b.status === 'active') || (filter === 'Offline' && b.status === 'offline')
      return m && f
    }).sort((a, b) => (b.todaySales || 0) - (a.todaySales || 0))
  }, [branches, search, filter])

  const stats = useMemo(() => {
    const active = branches.filter(b => b.status === 'active').length
    const totalStaff = branches.reduce((sum, b) => sum + (b.staff || 0), 0)
    const monthlySales = branches.reduce((sum, b) => sum + ((b.monthly || []).reduce((s: number, m: any) => s + (m.v || 0), 0) || 0), 0)
    return { total: branches.length, active, offline: branches.length - active, totalStaff, monthlySales }
  }, [branches])

  const addBranch = async (data: any) => {
    if (!canManage) { push('Permission denied', 'danger'); return }
    try {
      await addDoc(collection(db, 'branches'), { ...data, status: 'active', staff: data.staff ?? 1, todaySales: 0, stockValue: 0, lastSync: 'just now', hours: 'Mon–Sat 8am–6pm', change: 0, monthly: MONTH_LABELS.map(m => ({ m, v: 0 })), createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      setAdding(false)
      push(`${data.name} added to the network`, 'success')
    } catch (err) {
      console.error('Failed to add branch', err)
      push('Failed to add branch', 'danger')
    }
  }

  const requestDelete = (branch: any) => setConfirmDelete(branch)
  const confirmDeleteBranch = async () => {
    if (!canManage) { push('Permission denied', 'danger'); setConfirmDelete(null); return }
    try {
      await deleteDoc(doc(db, 'branches', confirmDelete.id))
      push(`${confirmDelete.name} removed`, 'danger')
      setConfirmDelete(null)
      setSelected(null)
    } catch (err) {
      console.error('Failed to remove branch', err)
      push('Failed to remove branch', 'danger')
    }
  }

  if (authLoading) return <div className="p-6">Loading authentication…</div>
  if (!user) return <div className="p-6">Sign in to view branches.</div>
  if (!canManage) return (
    <div className="p-6">
      <h2 style={{ fontSize: 20, fontWeight: 700, color: T.ink }}>Branch Network</h2>
      <p style={{ color: T.muted }}>You do not have permission to view or manage branches.</p>
    </div>
  )

  return (
    <div style={{ padding: 24, fontFamily: FONT_BODY, background: T.bgPage, minHeight: '100%' }}>
      <style>{FONT_IMPORT}</style>

      {/* Toasts */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 200, display: 'flex', flexDirection: 'column', gap: 8, width: 280 }}>
        {toasts.map((t: any) => (
          <div key={t.id} role="status" style={{ borderRadius: 8, padding: '10px 14px', fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(33,29,22,0.22)', color: '#fff', background: t.tone === 'success' ? T.forest : t.tone === 'danger' ? T.clay : T.ink }}>
            {t.message}
          </div>
        ))}
      </div>

      {selected && <BranchModal branch={selected} onClose={() => setSelected(null)} onDelete={requestDelete} />}
      {adding && <AddBranchModal onClose={() => setAdding(false)} onAdd={addBranch} />}

      {confirmDelete && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(33,29,22,0.5)' }}
          onClick={e => (e.target === e.currentTarget) && setConfirmDelete(null)}>
          <div style={{ width: '100%', maxWidth: 380, background: T.surface, borderRadius: 10, padding: 22, border: `1px solid ${T.border}`, boxShadow: '0 24px 60px rgba(33,29,22,0.22)' }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 6 }}>Remove {confirmDelete.name}?</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: T.muted, marginBottom: 18 }}>This removes the branch from the network. This can't be undone.</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: '8px 14px', borderRadius: 7, border: `1px solid ${T.border}`, background: T.surface, fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700, color: T.inkSoft, cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDeleteBranch} style={{ padding: '8px 14px', borderRadius: 7, border: 'none', background: T.clay, fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.gold, marginBottom: 6 }}>Ghana · Field Operations</div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 700, color: T.ink, margin: 0, letterSpacing: '-0.01em' }}>Branch Network</h1>
        <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: T.muted, margin: '6px 0 0' }}>Live rankings · {stats.active} of {stats.total} branches online</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Total Branches', value: String(stats.total), color: T.ink },
          { label: 'Active', value: String(stats.active), color: T.forest },
          { label: 'Offline', value: String(stats.offline), color: T.clay },
          { label: 'Total Staff', value: String(stats.totalStaff), color: T.indigo },
          { label: 'Monthly Sales', value: `GH₵ ${(stats.monthlySales / 1000).toFixed(0)}K`, color: T.goldDeep },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: T.surface, borderRadius: 8, padding: '15px 16px', border: `1px solid ${T.border}` }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 21, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.04em', textTransform: 'uppercase', color: T.muted, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.muted, pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            aria-label="Search branches"
            style={{ width: '100%', paddingLeft: 32, paddingRight: search ? 32 : 12, paddingTop: 9, paddingBottom: 9, borderRadius: 7, border: `1px solid ${T.border}`, background: T.surface, fontSize: 13, color: T.ink, outline: 'none', fontFamily: FONT_BODY, boxSizing: 'border-box' }}
            placeholder="Search branches..."
            onFocus={e => (e.target.style.borderColor = T.gold)}
            onBlur={e => (e.target.style.borderColor = T.border)}
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="Clear search"
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: T.muted, cursor: 'pointer', display: 'flex' }}>
              <X size={13} />
            </button>
          )}
        </div>
        {['All', 'Active', 'Offline'].map(f => (
          <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f}
            style={{ padding: '8px 14px', borderRadius: 7, fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, border: '1px solid', cursor: 'pointer', transition: 'all 0.12s', background: filter === f ? T.ink : T.surface, color: filter === f ? '#fff' : T.inkSoft, borderColor: filter === f ? T.ink : T.border }}>
            {f}
          </button>
        ))}
        <button onClick={() => setAdding(true)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 7, border: `1px solid ${T.gold}`, background: T.goldSoft, fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: T.goldDeep, cursor: 'pointer' }}>
          <Plus size={13} /> Add Branch
        </button>
      </div>

      {/* Branch cards */}
      {visible.length === 0 ? (
        <div style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, padding: '48px 20px', textAlign: 'center' }}>
          <Inbox size={26} style={{ color: T.borderStrong, margin: '0 auto 12px' }} />
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 4 }}>No branches match</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: T.muted }}>Try a different search term or filter.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {visible.map((branch, i) => {
            const pct = branch.target > 0 ? Math.min(100, Math.round((branch.todaySales / branch.target) * 100)) : 0
            const barColor = branch.status === 'offline' ? T.clay : pct >= 100 ? T.forest : pct >= 70 ? T.indigo : T.gold
            const rt = rankTone(i)

            return (
              <div key={branch.id}
                style={{ background: T.surface, borderRadius: 9, padding: '18px 20px', border: `1px solid ${i === 0 ? T.gold : T.border}`, borderLeft: `3px solid ${i < 3 ? rt.border : T.border}`, boxShadow: '0 1px 2px rgba(33,29,22,0.04)', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
                onClick={() => setSelected(branch)}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(33,29,22,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 2px rgba(33,29,22,0.04)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: rt.bg, border: `1px solid ${rt.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: rt.fg }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, color: T.ink }}>{branch.name}</div>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.03em', textTransform: 'uppercase', color: T.muted, marginTop: 2 }}>{branch.region}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, background: branch.status === 'active' ? T.forestSoft : T.claySoft, fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', color: branch.status === 'active' ? T.forest : T.clay }}>
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
                    <div key={label} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 7, background: T.bgPage }}>
                      <Icon size={12} style={{ color: T.muted, display: 'block', margin: '0 auto 4px' }} />
                      <div style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: T.ink }}>{value}</div>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.03em', color: T.muted, marginTop: 1 }}>{label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: T.muted }}>Daily target: GH₵ {(branch.target / 1000).toFixed(0)}K</span>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: barColor }}>{pct}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: T.border }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: barColor, transition: 'width 0.3s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {branch.change > 0 ? <ArrowUpRight size={12} style={{ color: T.forest }} /> : <ArrowDownRight size={12} style={{ color: T.clay }} />}
                    <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: branch.change > 0 ? T.forest : T.clay }}>
                      {Math.abs(branch.change)}% vs last month
                    </span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setSelected(branch) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '5px 12px', borderRadius: 6, border: `1px solid ${T.border}`, background: 'transparent', fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, color: T.inkSoft, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = T.bgPage)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Eye size={12} /> Details
                  </button>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  )
}
