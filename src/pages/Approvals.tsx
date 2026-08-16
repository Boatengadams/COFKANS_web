import { useState } from 'react'
import { CheckCircle, XCircle, MessageCircle, Clock, AlertTriangle, FileText, Tag, RotateCcw, ArrowLeftRight, CreditCard, X, ChevronDown } from 'lucide-react'

const APPROVAL_ITEMS = [
  {
    id: 'PO-2024-0845', type: 'Purchase Order', requestedBy: 'John Mensah', branch: 'Head Office',
    amount: 45200, date: '13 Aug 2024, 10:45 AM', priority: 'urgent',
    description: 'Bulk purchase of LED panels and cable rolls for Q3 restocking',
    icon: FileText, color: '#0EA5E9',
  },
  {
    id: 'DISC-2024-0112', type: 'Discount Request', requestedBy: 'Ama Osei', branch: 'Asuoyeboa',
    amount: 6800, date: '13 Aug 2024, 09:15 AM', priority: 'normal',
    description: '15% discount for bulk order from Accra Constructions Ltd',
    icon: Tag, color: '#A855F7',
  },
  {
    id: 'RET-2024-0088', type: 'Return Request', requestedBy: 'Sarah Boateng', branch: 'Adum',
    amount: 3200, date: '13 Aug 2024, 08:30 AM', priority: 'normal',
    description: 'Faulty inverter return from SafePower GH · 2 units',
    icon: RotateCcw, color: '#F59E0B',
  },
  {
    id: 'TRF-2024-0231', type: 'Stock Transfer', requestedBy: 'Kofi Mensah', branch: 'Adum → Abuakwa',
    amount: null, date: '12 Aug 2024, 04:00 PM', priority: 'urgent',
    description: 'Transfer 50 units MCB 32A from Adum to replenish Abuakwa critical stock',
    icon: ArrowLeftRight, color: '#10B981',
  },
  {
    id: 'EXP-2024-0067', type: 'Expense Claim', requestedBy: 'Yaw Darko', branch: 'Takoradi',
    amount: 1850, date: '12 Aug 2024, 02:20 PM', priority: 'normal',
    description: 'Fuel and maintenance for delivery vehicle WR-3214-19',
    icon: CreditCard, color: '#6B7280',
  },
  {
    id: 'PO-2024-0844', type: 'Purchase Order', requestedBy: 'Efua Boateng', branch: 'Abuakwa',
    amount: 12800, date: '11 Aug 2024, 11:00 AM', priority: 'normal',
    description: 'Emergency restock of solar panels and extension boards',
    icon: FileText, color: '#0EA5E9',
  },
]

const SUMMARY = [
  { label: 'Pending', value: 23, color: '#F59E0B', bg: '#FFFBEB' },
  { label: 'Approved Today', value: 14, color: '#10B981', bg: '#F0FDF4' },
  { label: 'Rejected Today', value: 3, color: '#EF4444', bg: '#FFF5F5' },
  { label: 'High Priority', value: 8, color: '#EF4444', bg: '#FFF5F5' },
]

function ApprovalModal({ item, onClose, onDecision }: { item: typeof APPROVAL_ITEMS[0]; onClose: () => void; onDecision: (id: string, action: 'approve' | 'reject') => void }) {
  const [note, setNote] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectField, setShowRejectField] = useState(false)
  const Icon = item.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}>
      <div className="w-full max-w-xl rounded-2xl overflow-hidden animate-fade-in" style={{ background: '#fff', border: '1px solid #E4E8EE', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: item.color + '18' }}>
              <Icon size={17} style={{ color: item.color }} />
            </div>
            <div>
              <div className="font-bold" style={{ color: '#1F2937' }}>{item.type}</div>
              <div className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'JetBrains Mono, monospace' }}>{item.id}</div>
            </div>
          </div>
          <button onClick={onClose}><X size={20} style={{ color: '#6B7280' }} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl" style={{ background: '#F9FAFB' }}>
            <p className="text-sm" style={{ color: '#374151' }}>{item.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Requested By', value: item.requestedBy },
              { label: 'Branch', value: item.branch },
              { label: 'Date', value: item.date },
              { label: 'Amount', value: item.amount ? `GH₵ ${item.amount.toLocaleString()}` : 'N/A' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-xs mb-0.5" style={{ color: '#9CA3AF' }}>{label}</div>
                <div className="font-medium" style={{ color: '#1F2937' }}>{value}</div>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6B7280' }}>Note (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ border: '1px solid #E5E7EB', color: '#1F2937' }}
              rows={2}
              placeholder="Add a note..."
            />
          </div>

          {showRejectField && (
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#EF4444' }}>Rejection Reason *</label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                style={{ border: '1px solid #EF4444', color: '#1F2937' }}
                rows={2}
                placeholder="Explain why this is being rejected..."
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onDecision(item.id, 'approve')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white"
              style={{ background: '#10B981' }}
            >
              <CheckCircle size={16} /> Approve
            </button>
            {!showRejectField ? (
              <button
                onClick={() => setShowRejectField(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
                style={{ background: '#FFF5F5', color: '#EF4444', border: '1px solid #EF444430' }}
              >
                <XCircle size={16} /> Reject
              </button>
            ) : (
              <button
                onClick={() => onDecision(item.id, 'reject')}
                disabled={!rejectReason}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white"
                style={{ background: rejectReason ? '#EF4444' : '#FCA5A5' }}
              >
                <XCircle size={16} /> Confirm Reject
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const GROUPS = ['Purchase Order', 'Discount Request', 'Return Request', 'Stock Transfer', 'Expense Claim']

export default function Approvals() {
  const [selected, setSelected] = useState<typeof APPROVAL_ITEMS[0] | null>(null)
  const [decided, setDecided] = useState<Record<string, 'approve' | 'reject'>>({})
  const [activeGroup, setActiveGroup] = useState('All')

  const handleDecision = (id: string, action: 'approve' | 'reject') => {
    setDecided(prev => ({ ...prev, [id]: action }))
    setSelected(null)
  }

  const pending = APPROVAL_ITEMS.filter(i => !decided[i.id])
  const visible = activeGroup === 'All' ? pending : pending.filter(i => i.type === activeGroup)

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {selected && <ApprovalModal item={selected} onClose={() => setSelected(null)} onDecision={handleDecision} />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold" style={{ color: '#1F2937' }}>Approvals Queue</h2>
            <span className="px-2.5 py-0.5 rounded-full text-sm font-bold text-white" style={{ background: '#EF4444' }}>{pending.length}</span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>Pending actions requiring your review</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SUMMARY.map(({ label, value, color, bg }) => (
          <div key={label} className="rounded-2xl px-5 py-4" style={{ background: bg, border: `1px solid ${color}20` }}>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Group filter */}
      <div className="flex gap-2 flex-wrap">
        {['All', ...GROUPS].map(g => (
          <button key={g} onClick={() => setActiveGroup(g)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
            style={{ background: activeGroup === g ? '#1B5E3F' : '#fff', color: activeGroup === g ? '#fff' : '#6B7280', border: `1px solid ${activeGroup === g ? '#1B5E3F' : '#E5E7EB'}` }}>
            {g}
          </button>
        ))}
      </div>

      {/* Approval items */}
      <div className="space-y-3">
        {visible.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#10B981', opacity: 0.4 }} />
            <p className="font-semibold" style={{ color: '#1F2937' }}>All caught up!</p>
            <p className="text-sm mt-1" style={{ color: '#6B7280' }}>No pending approvals in this category.</p>
          </div>
        )}
        {visible.map(item => {
          const Icon = item.icon
          return (
            <div key={item.id} className="bg-white rounded-2xl p-5 flex items-center gap-4 transition-all"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${item.priority === 'urgent' ? '#EF4444' : '#E5E7EB'}` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.color + '18' }}>
                <Icon size={18} style={{ color: item.color }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: '#1F2937' }}>{item.type}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ fontFamily: 'JetBrains Mono, monospace', background: '#F3F4F6', color: '#6B7280' }}>{item.id}</span>
                  {item.priority === 'urgent' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1" style={{ background: '#FFF5F5', color: '#EF4444' }}>
                      <AlertTriangle size={9} /> URGENT
                    </span>
                  )}
                </div>
                <p className="text-xs mb-1 truncate" style={{ color: '#6B7280' }}>{item.description}</p>
                <div className="flex items-center gap-3 text-xs" style={{ color: '#9CA3AF' }}>
                  <span>{item.requestedBy}</span>
                  <span>·</span>
                  <span>{item.branch}</span>
                  <span>·</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{item.date}</span>
                </div>
              </div>

              {item.amount && (
                <div className="text-base font-bold flex-shrink-0 hidden sm:block" style={{ color: '#1F2937', fontFamily: 'JetBrains Mono, monospace' }}>
                  GH₵ {item.amount.toLocaleString()}
                </div>
              )}

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleDecision(item.id, 'approve')}
                  className="p-2 rounded-xl transition-colors"
                  style={{ background: '#F0FDF4', color: '#10B981' }}
                  title="Approve"
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#DCFCE7'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#F0FDF4'}
                >
                  <CheckCircle size={18} />
                </button>
                <button
                  onClick={() => setSelected(item)}
                  className="p-2 rounded-xl transition-colors"
                  style={{ background: '#F9FAFB', color: '#6B7280' }}
                  title="Review"
                >
                  <MessageCircle size={18} />
                </button>
                <button
                  onClick={() => handleDecision(item.id, 'reject')}
                  className="p-2 rounded-xl transition-colors"
                  style={{ background: '#FFF5F5', color: '#EF4444' }}
                  title="Reject"
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FEE2E2'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#FFF5F5'}
                >
                  <XCircle size={18} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* History */}
      {Object.keys(decided).length > 0 && (
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 className="font-bold text-base mb-4" style={{ color: '#1F2937' }}>Recent Decisions</h3>
          <div className="space-y-2">
            {Object.entries(decided).map(([id, action]) => {
              const item = APPROVAL_ITEMS.find(i => i.id === id)!
              return (
                <div key={id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: '#F9FAFB' }}>
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full`} style={{ background: action === 'approve' ? '#10B981' : '#EF4444' }} />
                    <span className="text-sm font-medium" style={{ color: '#1F2937' }}>{item?.type}</span>
                    <span className="text-xs" style={{ color: '#9CA3AF', fontFamily: 'JetBrains Mono, monospace' }}>{id}</span>
                  </div>
                  <span className="text-xs font-semibold capitalize px-2 py-1 rounded-full"
                    style={{ background: action === 'approve' ? '#F0FDF4' : '#FFF5F5', color: action === 'approve' ? '#10B981' : '#EF4444' }}>
                    {action === 'approve' ? '✓ Approved' : '✗ Rejected'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
