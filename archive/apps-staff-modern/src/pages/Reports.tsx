import React, { useEffect, useState } from 'react'
import { FileText, Download, Star, Clock, Trash2, RefreshCw, BarChart2, Users, Package, TrendingUp, DollarSign, GitBranch } from 'lucide-react'
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useFirebaseAuth as useAuth } from '../app/contexts/FirebaseAuthContext'
import toast from 'react-hot-toast'

type Template = { id?: string; name: string; desc?: string; icon?: any; color?: string; lastGen?: string; starred?: boolean }

export default function Reports() {
  const { user, isLoading: authLoading, hasRole } = useAuth()
  const [tab, setTab] = useState('templates')

  const [templates, setTemplates] = useState<Template[]>([])
  const [scheduled, setScheduled] = useState<any[]>([])
  const [archive, setArchive] = useState<any[]>([])

  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [loadingScheduled, setLoadingScheduled] = useState(true)
  const [loadingArchive, setLoadingArchive] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Permission: only managers/developers/admins can generate or edit reports
  const canManage = !!(hasRole && (hasRole('admin') || hasRole('manager') || hasRole('developer') || hasRole('branch_manager')))

  useEffect(() => {
    setError(null)

    const tplQ = query(collection(db, 'reportTemplates'), orderBy('name'))
    const unsubTpl = onSnapshot(tplQ, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setTemplates(data as Template[])
      setLoadingTemplates(false)
    }, err => { console.error('Templates listener error', err); setError('Failed to load templates'); setLoadingTemplates(false) })

    const schQ = query(collection(db, 'scheduledReports'), orderBy('name'))
    const unsubSch = onSnapshot(schQ, snap => {
      setScheduled(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoadingScheduled(false)
    }, err => { console.error('Scheduled listener error', err); setError('Failed to load scheduled reports'); setLoadingScheduled(false) })

    const archQ = query(collection(db, 'reports'), orderBy('createdAt', 'desc'))
    const unsubArch = onSnapshot(archQ, snap => {
      setArchive(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoadingArchive(false)
    }, err => { console.error('Archive listener error', err); setError('Failed to load report archive'); setLoadingArchive(false) })

    return () => { unsubTpl(); unsubSch(); unsubArch(); }
  }, [])

  const handleGenerate = async (template: Template) => {
    if (!canManage) {
      toast.error('Permission denied')
      return
    }
    try {
      const payload = {
        title: template.name,
        templateId: template.id || null,
        status: 'pending',
        summary: template.desc || '',
        generatedBy: user?.uid || null,
        createdAt: serverTimestamp(),
      }
      await addDoc(collection(db, 'reports'), payload)
      toast.success('Report generation requested — it will appear in the Archive when ready')
    } catch (err) {
      console.error('Failed to request report generation', err)
      toast.error('Failed to request report generation')
    }
  }

  if (authLoading) return <div className="p-6">Loading authentication…</div>
  if (!user) return <div className="p-6">Sign in to view reports.</div>

  // Permission denied view
  if (!canManage) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold" style={{ color: '#1F2937' }}>Reports & Analytics</h2>
        <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>You do not have permission to view or manage reports.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#1F2937' }}>Reports & Analytics</h2>
          <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>Generate, schedule, and export reports</p>
        </div>
        <div className="flex items-center gap-2">
          {['PDF', 'Excel', 'CSV'].map(fmt => (
            <button key={fmt} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
              style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}>
              <Download size={13} /> {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex border-b" style={{ borderColor: '#E5E7EB' }}>
        {[
          { id: 'templates', label: 'Report Templates' },
          { id: 'scheduled', label: 'Scheduled Reports' },
          { id: 'archive', label: 'Report Archive' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-5 py-3 text-sm font-medium"
            style={{ borderBottom: tab === t.id ? '2px solid #16A34A' : '2px solid transparent', color: tab === t.id ? '#16A34A' : '#6B7280' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'templates' && (
        <div>
          {loadingTemplates ? (
            <div className="p-6 bg-white rounded-2xl">Loading templates…</div>
          ) : templates.length === 0 ? (
            <div className="p-6 bg-white rounded-2xl">No templates found. Create templates in Firestore collection <code>reportTemplates</code>.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {templates.map((t: any) => {
                const Icon = t.icon ? (TrendingUp as any) : TrendingUp
                const isStarred = !!t.starred
                return (
                  <div key={t.id} className="bg-white rounded-2xl p-5 flex flex-col transition-all"
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid transparent' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: (t.color || '#10B981') + '18' }}>
                        <Icon size={18} style={{ color: t.color || '#10B981' }} />
                      </div>
                      <button onClick={() => {
                        // local star toggle only — persisted templates should manage starred state server-side
                        // optimistic UI update
                        toast('Star toggled locally');
                      }}>
                        <Star size={16} fill={isStarred ? '#F59E0B' : 'none'} style={{ color: isStarred ? '#F59E0B' : '#D1D5DB' }} />
                      </button>
                    </div>
                    <div className="font-semibold text-sm mb-1" style={{ color: '#1F2937' }}>{t.name}</div>
                    <div className="text-xs mb-3 flex-1" style={{ color: '#6B7280' }}>{t.desc}</div>
                    <div className="flex items-center gap-1 text-[10px] mb-3" style={{ color: '#9CA3AF' }}>
                      <Clock size={10} />
                      Last generated: {t.lastGen || '—'}
                    </div>
                    <button
                      onClick={() => handleGenerate(t)}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
                      style={{ background: '#16A34A' }}
                    >
                      <FileText size={13} /> Generate Report
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'scheduled' && (
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {loadingScheduled ? (
            <div>Loading scheduled reports…</div>
          ) : scheduled.length === 0 ? (
            <div>No scheduled reports. Use collection <code>scheduledReports</code>.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                    {['Report Name', 'Schedule', 'Last Run', 'Next Run', 'Actions'].map(h => (
                      <th key={h} className="text-left pb-3 pr-4 text-xs font-semibold" style={{ color: '#9CA3AF' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scheduled.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                      <td className="py-4 pr-4 font-medium" style={{ color: '#1F2937' }}>{s.name}</td>
                      <td className="py-4 pr-4 text-xs" style={{ color: '#6B7280', fontFamily: 'JetBrains Mono, monospace' }}>{s.schedule}</td>
                      <td className="py-4 pr-4 text-xs" style={{ color: '#6B7280' }}>{s.lastRun || '—'}</td>
                      <td className="py-4 pr-4 text-xs" style={{ color: '#10B981', fontFamily: 'JetBrains Mono, monospace' }}>{s.nextRun || '—'}</td>
                      <td className="py-4 flex gap-2">
                        <button className="text-xs font-medium" style={{ color: '#0EA5E9' }}>Edit</button>
                        <button className="text-xs font-medium" style={{ color: '#EF4444' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'archive' && (
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {loadingArchive ? (
            <div>Loading archive…</div>
          ) : archive.length === 0 ? (
            <div>No archived reports found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                    {['Report Name', 'Generated', 'Type', 'Size', 'Actions'].map(h => (
                      <th key={h} className="text-left pb-3 pr-4 text-xs font-semibold" style={{ color: '#9CA3AF' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {archive.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #F9FAFB' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <td className="py-3 pr-4 font-medium" style={{ color: '#1F2937' }}>{a.title || a.name}</td>
                      <td className="py-3 pr-4 text-xs" style={{ color: '#6B7280' }}>{a.createdAt?.toDate ? a.createdAt.toDate().toLocaleString() : (a.createdAt || '—')}</td>
                      <td className="py-3 pr-4"><span className="px-2 py-1 rounded-full text-xs" style={{ background: '#F0F9FF', color: '#0EA5E9' }}>{a.type || a.status}</span></td>
                      <td className="py-3 pr-4 text-xs" style={{ color: '#9CA3AF', fontFamily: 'JetBrains Mono, monospace' }}>{a.size || '—'}</td>
                      <td className="py-3 flex gap-3">
                        <button className="flex items-center gap-1 text-xs font-medium" style={{ color: '#10B981' }}>
                          <Download size={12} /> Download
                        </button>
                        <button className="text-xs" style={{ color: '#EF4444' }}><Trash2 size={12} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {error && <div className="text-red-600">{error}</div>}
    </div>
  )
}
