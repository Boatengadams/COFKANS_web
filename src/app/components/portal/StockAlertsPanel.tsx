/**
 * StockAlertsPanel — Front Desk portal.
 *
 * Branches raise stock-request alerts when they need a product restocked.
 * Front Desk sees all alerts, can approve (which creates a stockTransfer doc)
 * or decline each one.
 *
 * In DEMO_MODE: seeded sample alerts in localStorage.
 * In production: reads from the `stockRequests` Firestore collection.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle2, XCircle, Package, RefreshCw } from 'lucide-react';
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { DEMO_MODE } from '../../../lib/demo-mode';
import { useBranches } from '../../../lib/branches';
import { db } from '../../../lib/firebase';

type AlertStatus = 'pending' | 'approved' | 'declined';

interface StockAlert {
  id: string;
  branchSlug: string;
  branchName: string;
  productName: string;
  quantityRequested: number;
  status: AlertStatus;
  requestedAt: string;
  notes?: string;
}

const ALERTS_KEY = 'cofkans:stock-alerts';
const TRANSFERS_KEY = 'cofkans:stock-transfers';
const SHOWROOM_SLUG = 'kumasi-asuoyeboa';

const SEED_ALERTS: StockAlert[] = [
  { id: 'ALT-001', branchSlug: 'kumasi-adum', branchName: 'Cofkans Adum', productName: 'KANS ENERGY BULB 210lm', quantityRequested: 20, status: 'pending', requestedAt: new Date(Date.now() - 3600000).toISOString(), notes: 'Running very low, needed urgently.' },
  { id: 'ALT-002', branchSlug: 'accra-opera-square', branchName: 'Cofkans Opera Square', productName: '3-POLE CIRCUIT BREAKER 100A', quantityRequested: 5, status: 'pending', requestedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'ALT-003', branchSlug: 'obuasi-bediem', branchName: 'Cofkans Obuasi', productName: 'AVR AUTOMATIC VOLTAGE REGULATOR', quantityRequested: 3, status: 'approved', requestedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'ALT-004', branchSlug: 'kumasi-pampaso', branchName: 'Cofkans Pampaso', productName: 'LED DOWNLIGHT 18W', quantityRequested: 30, status: 'pending', requestedAt: new Date(Date.now() - 1800000).toISOString() },
];

function loadAlerts(): StockAlert[] {
  try { return JSON.parse(localStorage.getItem(ALERTS_KEY) || 'null') ?? SEED_ALERTS; } catch { return SEED_ALERTS; }
}
function saveAlerts(list: StockAlert[]) { localStorage.setItem(ALERTS_KEY, JSON.stringify(list)); }

function loadTransfers() { try { return JSON.parse(localStorage.getItem(TRANSFERS_KEY) || '[]'); } catch { return []; } }
function saveTransfers(list: object[]) { localStorage.setItem(TRANSFERS_KEY, JSON.stringify(list)); }

function toIso(value: any): string {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  return new Date(value).toISOString();
}

const STATUS_COLORS: Record<AlertStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  approved: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  declined: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30',
};
const STATUS_ICONS: Record<AlertStatus, any> = {
  pending: AlertTriangle,
  approved: CheckCircle2,
  declined: XCircle,
};

export function StockAlertsPanel() {
  const branches = useBranches(false);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (DEMO_MODE) {
      setAlerts(loadAlerts());
      return;
    }
    const q = query(collection(db, 'stockRequests'), orderBy('requestedAt', 'desc'));
    return onSnapshot(q, snap => {
      setAlerts(snap.docs.map(d => {
        const data = d.data() as any;
        return {
          id: d.id,
          branchSlug: data.branchSlug ?? data.branchId ?? '',
          branchName: data.branchName ?? data.branchSlug ?? 'Branch',
          productName: data.productName ?? data.name ?? 'Stock item',
          quantityRequested: Number(data.quantityRequested ?? data.quantity ?? 1),
          status: (data.status ?? 'pending') as AlertStatus,
          requestedAt: toIso(data.requestedAt ?? data.createdAt),
          notes: data.notes,
        };
      }));
    });
  }, []);

  const pending = alerts.filter(a => a.status === 'pending').length;

  const approve = async (alert: StockAlert) => {
    setProcessing(alert.id);
    await new Promise(r => setTimeout(r, 400));
    const transfer = {
      fromBranch: SHOWROOM_SLUG,
      toBranch: alert.branchSlug,
      items: [{ productId: alert.id, name: alert.productName, quantity: alert.quantityRequested }],
      status: 'pending',
      driverId: null,
      createdAt: DEMO_MODE ? new Date().toISOString() : serverTimestamp(),
    };
    if (DEMO_MODE) {
      const transfers = loadTransfers();
      transfers.unshift({ id: `TR-${Date.now()}`, ...transfer });
      saveTransfers(transfers.slice(0, 200));
    } else {
      await addDoc(collection(db, 'stockTransfers'), transfer);
      await updateDoc(doc(db, 'stockRequests', alert.id), {
        status: 'approved',
        approvedAt: serverTimestamp(),
      });
    }
    const next = alerts.map(a => a.id === alert.id ? { ...a, status: 'approved' as const } : a);
    setAlerts(next);
    if (DEMO_MODE) saveAlerts(next);
    setProcessing(null);
  };

  const decline = async (id: string) => {
    setProcessing(id);
    await new Promise(r => setTimeout(r, 300));
    if (!DEMO_MODE) {
      await updateDoc(doc(db, 'stockRequests', id), {
        status: 'declined',
        declinedAt: serverTimestamp(),
      });
    }
    const next = alerts.map(a => a.id === id ? { ...a, status: 'declined' as const } : a);
    setAlerts(next);
    if (DEMO_MODE) saveAlerts(next);
    setProcessing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Stock Alerts
            {pending > 0 && (
              <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                {pending}
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            Low-stock requests from all branches. Approve to create a driver transfer.
          </p>
        </div>
        <button
          onClick={() => { if (DEMO_MODE) setAlerts(loadAlerts()); }}
          className="p-2 rounded-xl border-2 border-border hover:bg-muted"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">All branches are well-stocked.</p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <div className="space-y-3">
            {alerts.map(alert => {
              const Icon = STATUS_ICONS[alert.status];
              const branch = branches.find(b => b.slug === alert.branchSlug);
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`bg-card border-2 rounded-2xl p-4 ${STATUS_COLORS[alert.status]}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="font-bold text-sm">
                          {branch?.name ?? alert.branchName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {branch?.city ?? ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                        <span className="font-semibold truncate">{alert.productName}</span>
                        <span className="text-muted-foreground flex-shrink-0">× {alert.quantityRequested}</span>
                      </div>
                      {alert.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">"{alert.notes}"</p>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {new Date(alert.requestedAt).toLocaleString()}
                      </p>
                    </div>

                    {alert.status === 'pending' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => approve(alert)}
                          disabled={processing === alert.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:opacity-90 disabled:opacity-50"
                        >
                          {processing === alert.id ? '…' : 'Approve'}
                        </button>
                        <button
                          onClick={() => decline(alert.id)}
                          disabled={processing === alert.id}
                          className="px-3 py-1.5 rounded-xl bg-muted text-xs font-bold hover:bg-muted/80 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default StockAlertsPanel;
