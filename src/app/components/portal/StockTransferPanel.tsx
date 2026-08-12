/**
 * StockTransferPanel — shared by Front Desk and Driver portals.
 *
 * mode='frontdesk' — shows all transfers FROM the showroom, allows recall.
 * mode='driver'    — shows pending (claimable) + this driver's own transfers.
 *
 * In DEMO_MODE reads from localStorage (key: 'cofkans:stock-transfers').
 * In production reads from the `stockTransfers` Firestore collection.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Truck, CheckCircle2, Clock, MapPin, ChevronDown } from 'lucide-react';
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { DEMO_MODE } from '../../../lib/demo-mode';
import { useBranches } from '../../../lib/branches';
import { db } from '../../../lib/firebase';
import { updateStockTransfer } from '../../../lib/totp-client';
import toast from 'react-hot-toast';

type TransferStatus = 'pending' | 'in_transit' | 'delivered';

interface StockTransfer {
  id: string;
  fromBranch: string;
  toBranch: string;
  items: { productId: string; name: string; quantity: number }[];
  status: TransferStatus;
  driverId: string | null;
  createdAt: string;
  deliveredAt?: string;
}

const STORAGE_KEY = 'cofkans:stock-transfers';

function loadFromStorage(): StockTransfer[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveToStorage(list: StockTransfer[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function toIso(value: any): string {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  return new Date(value).toISOString();
}

const STATUS_LABELS: Record<TransferStatus, string> = {
  pending: 'Pending pickup',
  in_transit: 'In transit',
  delivered: 'Delivered',
};
const STATUS_COLORS: Record<TransferStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  in_transit: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  delivered: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
};
const STATUS_ICONS: Record<TransferStatus, any> = {
  pending: Clock,
  in_transit: Truck,
  delivered: CheckCircle2,
};

function BranchName({ slug, branches }: { slug: string; branches: any[] }) {
  const b = branches.find(x => x.slug === slug);
  return <span>{b ? `${b.name} (${b.city})` : slug}</span>;
}

interface Props {
  mode: 'frontdesk' | 'driver';
  driverUid?: string;
}

export function StockTransferPanel({ mode, driverUid }: Props) {
  const branches = useBranches(false);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [filter, setFilter] = useState<TransferStatus | 'all'>('all');

  useEffect(() => {
    if (DEMO_MODE) {
      setTransfers(loadFromStorage());
      return;
    }
    const q = query(collection(db, 'stockTransfers'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setTransfers(snap.docs.map(d => {
        const data = d.data() as any;
        return {
          id: d.id,
          fromBranch: data.fromBranch ?? data.fromBranchSlug ?? '',
          toBranch: data.toBranch ?? data.toBranchSlug ?? '',
          items: Array.isArray(data.items) ? data.items : [],
          status: (data.status ?? 'pending') as TransferStatus,
          driverId: data.driverId ?? null,
          createdAt: toIso(data.createdAt),
          deliveredAt: data.deliveredAt ? toIso(data.deliveredAt) : undefined,
        };
      }));
    });
  }, []);

  const visible = transfers.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (mode === 'driver') {
      return t.driverId === (driverUid ?? null) || t.status === 'pending';
    }
    return true; // front desk sees all
  });

  const updateTransfer = async (id: string, patch: Partial<StockTransfer>) => {
    setTransfers(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...patch } : t);
      if (DEMO_MODE) saveToStorage(next);
      return next;
    });
    if (!DEMO_MODE) {
      try {
        if (patch.status) {
          await updateStockTransfer(id, patch.status as TransferStatus);
        }
      } catch (error) {
        toast.error('Failed to update transfer');
        // Rollback optimistic update
        setTransfers(prev => prev.map(t => t.id === id ? transfers.find(x => x.id === id) || t : t));
      }
    }
  };

  const claimTransfer = (id: string) => {
    if (!driverUid) return;
    void updateTransfer(id, { status: 'in_transit', driverId: driverUid });
  };

  const deliverTransfer = (id: string) => {
    void updateTransfer(id, { status: 'delivered', deliveredAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold">
            {mode === 'frontdesk' ? 'Stock Transfers' : 'Transfer Assignments'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {mode === 'frontdesk'
              ? 'Track all stock movements from the showroom to branches.'
              : 'Unclaimed transfers you can pick up, plus your active deliveries.'}
          </p>
        </div>
        <div className="relative">
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as TransferStatus | 'all')}
            className="pl-3 pr-9 py-2 bg-background border-2 border-border rounded-xl text-sm font-bold focus:outline-none focus:border-primary appearance-none"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in_transit">In transit</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
          <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">
            {mode === 'driver' ? 'No transfers assigned or available to claim.' : 'No transfers yet — create one from the Stock tab.'}
          </p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <div className="space-y-3">
            {visible.map(t => {
              const Icon = STATUS_ICONS[t.status];
              const isMyTransfer = t.driverId === (driverUid ?? null);
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-card border-2 border-border rounded-2xl p-4"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <BranchName slug={t.fromBranch} branches={branches} />
                        <span className="text-muted-foreground font-normal">→</span>
                        <BranchName slug={t.toBranch} branches={branches} />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Ref: {t.id}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 ${STATUS_COLORS[t.status]}`}>
                      <Icon className="w-3 h-3" />
                      {STATUS_LABELS[t.status]}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-1 mb-3">
                    {t.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate flex-1 mr-2">{item.name}</span>
                        <span className="font-bold flex-shrink-0">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions (driver only) */}
                  {mode === 'driver' && t.status === 'pending' && (
                    <button
                      onClick={() => claimTransfer(t.id)}
                      className="w-full py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90"
                    >
                      <Truck className="w-4 h-4 inline mr-1.5" />
                      Claim & pick up
                    </button>
                  )}
                  {mode === 'driver' && t.status === 'in_transit' && isMyTransfer && (
                    <button
                      onClick={() => deliverTransfer(t.id)}
                      className="w-full py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:opacity-90"
                    >
                      <CheckCircle2 className="w-4 h-4 inline mr-1.5" />
                      Mark as delivered
                    </button>
                  )}
                  {t.status === 'delivered' && t.deliveredAt && (
                    <p className="text-[11px] text-muted-foreground">
                      Delivered {new Date(t.deliveredAt).toLocaleString()}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default StockTransferPanel;
