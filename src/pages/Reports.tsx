import { useState } from 'react'
import { FileText, Download, Star, Clock, Calendar, Trash2, RefreshCw, BarChart2, Users, Package, TrendingUp, DollarSign, GitBranch } from 'lucide-react'

const TEMPLATES = [
  { id: 1, name: 'Daily Sales Report', desc: 'Detailed breakdown of daily sales across all branches', icon: TrendingUp, color: '#10B981', lastGen: '13 Aug 2024', starred: true },
  { id: 2, name: 'Monthly Revenue Report', desc: 'Comprehensive monthly revenue analysis with comparisons', icon: DollarSign, color: '#16A34A', lastGen: '1 Aug 2024', starred: true },
  { id: 3, name: 'Inventory Report', desc: 'Current stock levels, low stock alerts, and dead stock', icon: Package, color: '#F59E0B', lastGen: '12 Aug 2024', starred: false },
  { id: 4, name: 'Employee Performance', desc: 'Staff ratings, attendance, and department performance', icon: Users, color: '#A855F7', lastGen: '10 Aug 2024', starred: false },
  { id: 5, name: 'Customer Acquisition', desc: 'New customer growth, retention rates, and LTV analysis', icon: Users, color: '#0EA5E9', lastGen: '5 Aug 2024', starred: false },
  { id: 6, name: 'Financial Summary', desc: 'P&L, cash flow, expenses, and profit margin overview', icon: DollarSign, color: '#EF4444', lastGen: '1 Aug 2024', starred: true },
  { id: 7, name: 'Branch Comparison', desc: 'Side-by-side performance metrics for all branches', icon: GitBranch, color: '#10B981', lastGen: '8 Aug 2024', starred: false },
  { id: 8, name: 'Stock Movement Report', desc: 'Inbound/outbound stock movements and transfer history', icon: BarChart2, color: '#6B7280', lastGen: '11 Aug 2024', starred: false },
]

const SCHEDULED = [
  { name: 'Daily Sales Summary', schedule: 'Daily at 11:59 PM', lastRun: '13 Aug 2024', nextRun: '14 Aug 2024' },
  { name: 'Weekly Revenue Digest', schedule: 'Every Sunday 8:00 AM', lastRun: '11 Aug 2024', nextRun: '18 Aug 2024' },
  { name: 'Monthly Financial Report', schedule: '1st of month, 9:00 AM', lastRun: '1 Aug 2024', nextRun: '1 Sep 2024' },
]

const ARCHIVE = [
  { name: 'Monthly Revenue – July 2024', date: '1 Aug 2024', type: 'Revenue', size: '2.4 MB' },
  { name: 'Inventory Report – Week 32', date: '12 Aug 2024', type: 'Inventory', size: '1.1 MB' },
  { name: 'Daily Sales – 12 Aug 2024', date: '12 Aug 2024', type: 'Sales', size: '480 KB' },
  { name: 'Employee Performance Q2 2024', date: '1 Jul 2024', type: 'HR', size: '3.2 MB' },
]

export default function Reports() {
  const [tab, setTab] = useState('templates')
  const [starred, setStarred] = useState<Set<number>>(new Set(TEMPLATES.filter(t => t.starred).map(t => t.id)))
  const [generating, setGenerating] = useState<number | null>(null)

  const handleGenerate = (id: number) => {
    setGenerating(id)
    setTimeout(() => setGenerating(null), 2000)
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {TEMPLATES.map(t => {
            const Icon = t.icon
            const isStarred = starred.has(t.id)
            const isGenerating = generating === t.id
            return (
              <div key={t.id} className="bg-white rounded-2xl p-5 flex flex-col transition-all"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid transparent' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'transparent'
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: t.color + '18' }}>
                    <Icon size={18} style={{ color: t.color }} />
                  </div>
                  <button onClick={() => setStarred(s => { const n = new Set(s); isStarred ? n.delete(t.id) : n.add(t.id); return n })}>
                    <Star size={16} fill={isStarred ? '#F59E0B' : 'none'} style={{ color: isStarred ? '#F59E0B' : '#D1D5DB' }} />
                  </button>
                </div>
                <div className="font-semibold text-sm mb-1" style={{ color: '#1F2937' }}>{t.name}</div>
                <div className="text-xs mb-3 flex-1" style={{ color: '#6B7280' }}>{t.desc}</div>
                <div className="flex items-center gap-1 text-[10px] mb-3" style={{ color: '#9CA3AF' }}>
                  <Clock size={10} />
                  Last generated: {t.lastGen}
                </div>
                <button
                  onClick={() => handleGenerate(t.id)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
                  style={{ background: isGenerating ? '#86EFAC' : '#16A34A' }}
                >
                  {isGenerating ? (
                    <><RefreshCw size={13} className="animate-spin-slow" /> Generating...</>
                  ) : (
                    <><FileText size={13} /> Generate Report</>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'scheduled' && (
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
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
                {SCHEDULED.map(s => (
                  <tr key={s.name} style={{ borderBottom: '1px solid #F9FAFB' }}>
                    <td className="py-4 pr-4 font-medium" style={{ color: '#1F2937' }}>{s.name}</td>
                    <td className="py-4 pr-4 text-xs" style={{ color: '#6B7280', fontFamily: 'JetBrains Mono, monospace' }}>{s.schedule}</td>
                    <td className="py-4 pr-4 text-xs" style={{ color: '#6B7280' }}>{s.lastRun}</td>
                    <td className="py-4 pr-4 text-xs" style={{ color: '#10B981', fontFamily: 'JetBrains Mono, monospace' }}>{s.nextRun}</td>
                    <td className="py-4 flex gap-2">
                      <button className="text-xs font-medium" style={{ color: '#0EA5E9' }}>Edit</button>
                      <button className="text-xs font-medium" style={{ color: '#EF4444' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'archive' && (
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
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
                {ARCHIVE.map(a => (
                  <tr key={a.name} style={{ borderBottom: '1px solid #F9FAFB' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td className="py-3 pr-4 font-medium" style={{ color: '#1F2937' }}>{a.name}</td>
                    <td className="py-3 pr-4 text-xs" style={{ color: '#6B7280' }}>{a.date}</td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-1 rounded-full text-xs" style={{ background: '#F0F9FF', color: '#0EA5E9' }}>{a.type}</span>
                    </td>
                    <td className="py-3 pr-4 text-xs" style={{ color: '#9CA3AF', fontFamily: 'JetBrains Mono, monospace' }}>{a.size}</td>
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
        </div>
      )}
    </div>
  )
}
