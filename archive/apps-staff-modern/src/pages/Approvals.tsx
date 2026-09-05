import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, MessageCircle, AlertTriangle, FileText, Tag, RotateCcw, ArrowLeftRight, CreditCard, Inbox, Search, Undo2 } from 'lucide-react'
import { collection, query, orderBy, onSnapshot, doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useFirebaseAuth as useAuth } from '../app/contexts/FirebaseAuthContext'

function EmptyState({ message }: { message: string }) { return (<div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}><Inbox size={20} style={{ color: '#CBD5E1' }} /><p style={{ fontSize: 12, color: '#9CA3AF', margin: 0, maxWidth: 260 }}>{message}</p></div>) }

function ApprovalModal({ item, onClose, onDecision, startExpandedReject }: any) {
  const [note, setNote] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectField, setShowRejectField] = useState(!!startExpandedReject)
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) }, [onClose])
  if (!item) return null
  const Icon = (item.icon || FileText)
  const dirty = note.trim() !== '' || rejectReason.trim() !== ''
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }} onClick={() => { if (!dirty) onClose() }}>
      <div style={{ width: '100%', maxWidth: 720, background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width:36,height:36,borderRadius:10,background:(item.color||'#E5E7EB')+'18',display:'flex',alignItems:'center',justifyContent:'center' }}><Icon size={18} style={{ color: item.color||'#6B7280' }} /></div>
            <div>
              <div style={{ fontWeight: 700, color: '#1F2937' }}>{item.type}</div>
              <div style={{ color: '#9CA3AF', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{item.id}</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close"><XCircle size={20} style={{ color: '#6B7280' }} /></button>
        </div>

        <div style={{ padding: 20 }}>
          <div style={{ background: '#F9FAFB', padding: 12, borderRadius: 12 }}><p style={{ margin:0, color:'#374151' }}>{item.description}</p></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            {[['Requested By', item.requestedBy], ['Branch', item.branch], ['Date', item.date], ['Amount', item.amount!=null?`GH₵ ${item.amount.toLocaleString()}`:'N/A']].map(([label,value]) => (
              <div key={String(label)}>
                <div style={{ color: '#9CA3AF', fontSize: 12 }}>{label}</div>
                <div style={{ fontWeight: 600, color: '#1F2937' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ color: '#6B7280', fontSize: 13 }}>Note (optional)</label>
            <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} style={{ width:'100%', padding:8, borderRadius:10, border:'1px solid #E5E7EB', marginTop:6 }} placeholder="Add a note..." />
          </div>

          {showRejectField && <div style={{ marginTop: 12 }}>
            <label style={{ color:'#EF4444', fontSize:13 }}>Rejection Reason *</label>
            <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)} rows={2} style={{ width:'100%', padding:8, borderRadius:10, border:'1px solid #EF4444', marginTop:6 }} placeholder="Explain why this is being rejected..." autoFocus={startExpandedReject} />
          </div>}

          <div style={{ display:'flex', gap:12, marginTop: 12 }}>
            <button onClick={()=>onDecision(item.id,'approve',note,'')} style={{ flex:1, background:'#10B981', color:'#fff', padding:12, borderRadius:10, fontWeight:700 }}><CheckCircle size={16} /> Approve</button>
            {!showRejectField ? <button onClick={()=>setShowRejectField(true)} style={{ flex:1, background:'#FFF5F5', color:'#EF4444', padding:12, borderRadius:10, fontWeight:700 }}>Reject</button> : <button onClick={()=>onDecision(item.id,'reject',note,rejectReason)} disabled={!rejectReason.trim()} style={{ flex:1, background: rejectReason.trim() ? '#EF4444' : '#FCA5A5', color:'#fff', padding:12, borderRadius:10, fontWeight:700 }}><XCircle size={16} /> Confirm Reject</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Approvals() {
  const { user, hasRole, loading: authLoading } = useAuth()
  const canRead = !!(hasRole && (hasRole('manager') || hasRole('developer')))
  const canWrite = !!(hasRole && (hasRole('manager') || hasRole('developer')))

  const [items, setItems] = useState<any[]>([])
  const [selected, setSelected] = useState<any|null>(null)
  const [openAsReject, setOpenAsReject] = useState(false)
  const [decided, setDecided] = useState<Record<string, any>>({})
  const [activeGroup, setActiveGroup] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    if (!canRead) { setLoading(false); return }
    setLoading(true)
    const q = query(collection(db, 'approvals'), orderBy('date', 'desc'))
    const unsub = onSnapshot(q, snap => { const arr:any[] = []; snap.forEach(d => arr.push({ id: d.id, ...(d.data() as any) })); setItems(arr); setLoading(false) }, err => { console.error(err); setError('Failed to load approvals'); setLoading(false) })
    return () => unsub()
  }, [user, hasRole])

  const handleDecision = async (id: string, action: 'approve'|'reject', note: string, reason: string) => {
    setDecided(prev => ({ ...prev, [id]: { action, note, reason, at: Date.now() } }))
    setSelected(null)
    setOpenAsReject(false)
    if (!canWrite) return
    try { await setDoc(doc(db, 'approvals', id), { decision: { action, note, reason, by: user?.uid ?? null, at: Date.now() } }, { merge: true }) } catch (err) { console.error(err); setError('Failed to record decision') }
  }

  const undoDecision = async (id: string) => {
    setDecided(prev => { const next = { ...prev }; delete next[id]; return next })
    if (!canWrite) return
    try { await setDoc(doc(db, 'approvals', id), { decision: null }, { merge: true }) } catch (err) { console.error(err); setError('Failed to undo decision') }
  }

  if (authLoading || loading) return <div style={{ padding: 24 }}>Loading approvals…</div>
  if (!canRead) return <div style={{ padding: 24, color: '#DC2626' }}>Permission denied — approvals visible to managers & developers only.</div>
  if (error) return <div style={{ padding: 24, color: '#DC2626' }}>{error}</div>

  const pending = items.filter(i => !(i.decision))
  const GROUPS = Array.from(new Set(items.map(i=>i.type))).slice(0,5)
  const groupCounts: Record<string, number> = {}
  GROUPS.forEach(g => groupCounts[g] = pending.filter(i=>i.type===g).length)

  const q = search.trim().toLowerCase()
  const groupFiltered = activeGroup === 'All' ? pending : pending.filter(i => i.type === activeGroup)
  const searched = q ? groupFiltered.filter(i => [i.id, i.requestedBy, i.branch, i.description, i.type].some((v:any)=>String(v||'').toLowerCase().includes(q))) : groupFiltered
  const visible = [...searched].sort((a,b)=>(a.priority==='urgent'?0:1)-(b.priority==='urgent'?0:1))

  const decidedEntries = Object.entries(decided).sort(([,a],[,b])=>b.at-a.at)

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {selected && <ApprovalModal item={selected} startExpandedReject={openAsReject} onClose={()=>{setSelected(null);setOpenAsReject(false)}} onDecision={handleDecision} />}

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, margin:0, color:'#1F2937' }}>Approvals Queue</h2>
          <p style={{ color:'#6B7280', margin:4 }}>{pending.length} pending</p>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12 }}>
        <div style={{ background:'#FFFBEB', padding:12, borderRadius:12 }}>Pending: {pending.length}</div>
        <div style={{ background:'#F0FDF4', padding:12, borderRadius:12 }}>Approved: {Object.values(decided).filter((d:any)=>d.action==='approve').length}</div>
        <div style={{ background:'#FFF5F5', padding:12, borderRadius:12 }}>Rejected: {Object.values(decided).filter((d:any)=>d.action==='reject').length}</div>
      </div>

      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        <div style={{ position:'relative', flex:1 }}>
          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF' }} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search ID, requester, description…" style={{ width:'100%', padding:'9px 12px 9px 36px', border:'1px solid #E5E7EB', borderRadius:10 }} />
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={()=>setActiveGroup('All')} style={{ padding:'8px 12px', borderRadius:10 }}>{'All ('+pending.length+')'}</button>
          {GROUPS.slice(0,4).map(g => <button key={g} onClick={()=>setActiveGroup(g)} style={{ padding:'8px 12px', borderRadius:10 }}>{g+' ('+(groupCounts[g]||0)+')'}</button>)}
        </div>
      </div>

      <div style={{ display:'grid', gap:12 }}>
        {visible.length===0 ? <div style={{ background:'#fff', padding:24, borderRadius:12, textAlign:'center' }}><EmptyState message={q ? `Nothing matches "${search}"` : 'No pending approvals in this category.'} /></div> : visible.map(item=> { const Icon = item.icon || FileText; return (
          <div key={item.id} style={{ background:'#fff', padding:16, borderRadius:12, display:'flex', gap:12, alignItems:'center', borderLeft:`4px solid ${item.priority==='urgent'? '#EF4444':'#E5E7EB'}` }}>
            <div style={{ width:40,height:40,borderRadius:8,background:(item.color||'#E5E7EB')+'18',display:'flex',alignItems:'center',justifyContent:'center' }}><Icon size={18} style={{ color:item.color||'#6B7280' }} /></div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                <div style={{ fontWeight:700, color:'#1F2937' }}>{item.type}</div>
                <div style={{ background:'#F3F4F6', padding:'4px 8px', borderRadius:12, fontFamily:'JetBrains Mono, monospace', fontSize:12 }}>{item.id}</div>
                {item.priority==='urgent' && <div style={{ background:'#FFF5F5', color:'#EF4444', padding:'4px 8px', borderRadius:12 }}>URGENT</div>}
              </div>
              <div style={{ color:'#6B7280', marginBottom:6, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.description}</div>
              <div style={{ color:'#9CA3AF', fontSize:13 }}>{item.requestedBy} · {item.branch} · <span style={{ fontFamily:'JetBrains Mono, monospace' }}>{item.date}</span></div>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button onClick={()=> item.priority==='urgent' ? setSelected(item) : handleDecision(item.id,'approve','','')} style={{ background:'#F0FDF4', color:'#10B981', padding:8, borderRadius:10 }} title="Approve"><CheckCircle size={18} /></button>
              <button onClick={()=>setSelected(item)} style={{ background:'#F9FAFB', color:'#6B7280', padding:8, borderRadius:10 }} title="Review"><MessageCircle size={18} /></button>
              <button onClick={()=>{ setSelected(item); setOpenAsReject(true) }} style={{ background:'#FFF5F5', color:'#EF4444', padding:8, borderRadius:10 }} title="Reject"><XCircle size={18} /></button>
            </div>
          </div>
        )})}
      </div>

      {decidedEntries.length>0 && <div style={{ background:'#fff', padding:16, borderRadius:12 }}>
        <h3 style={{ margin:0, fontWeight:700 }}>Recent Decisions</h3>
        <div style={{ marginTop:12, display:'grid', gap:8 }}>
          {decidedEntries.map(([id,decision]) => {
            const item = items.find(i=>i.id===id) || { type: id }
            return (
              <div key={id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:12, borderRadius:10, background:'#F9FAFB' }}>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <div style={{ width:8,height:8,borderRadius:4,background: decision.action==='approve'?'#10B981':'#EF4444' }} />
                  <div style={{ fontWeight:600 }}>{item.type}</div>
                  {decision.reason && <div style={{ color:'#9CA3AF' }}>— {decision.reason}</div>}
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <div style={{ padding:'4px 8px', borderRadius:12, background: decision.action==='approve'?'#F0FDF4':'#FFF5F5', color: decision.action==='approve'?'#10B981':'#EF4444' }}>{decision.action==='approve'?'✓ Approved':'✗ Rejected'}</div>
                  <button onClick={()=>undoDecision(id)} style={{ background:'transparent', border:'none', color:'#6B7280' }}><Undo2 size={12} /> Undo</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>}
    </div>
  )
}
