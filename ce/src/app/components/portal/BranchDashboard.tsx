import { useEffect, useMemo, useState } from 'react';
import { Package, Truck, Store, Phone, MapPin, Calendar, Loader2 } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import {
  subscribeBranchOrders,
  setOrderStatus,
  assignRider,
  STATUS_LABEL,
  STATUS_COLOR,
  type BranchOrder,
  type OrderStatus,
} from '../../../lib/branch-orders';
import type { StaffAccount } from '../../../lib/staff';
import { useStaffRole } from '../../hooks/useStaffRole';
import toast from 'react-hot-toast';

const COLUMNS: OrderStatus[] = ['processing', 'packed', 'ready', 'shipped', 'delivered'];

interface Props { branchSlug: string }

export function BranchDashboard({ branchSlug }: Props) {
  const { staff } = useStaffRole();
  const [orders, setOrders] = useState<BranchOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [riders, setRiders] = useState<StaffAccount[]>([]);

  useEffect(() => {
    const unsub = subscribeBranchOrders(branchSlug, list => {
      setOrders(list);
      setLoading(false);
    }, err => {
      console.error(err);
      toast.error('Could not load orders');
      setLoading(false);
    });
    return unsub;
  }, [branchSlug]);

  // Load riders assigned to this branch (for the assign dropdown)
  useEffect(() => {
    (async () => {
      try {
        const q = query(
          collection(db, 'staffAccounts'),
          where('role', '==', 'rider'),
          where('branchSlug', '==', branchSlug),
        );
        const snap = await getDocs(q);
        setRiders(snap.docs.map(d => d.data() as StaffAccount));
      } catch { /* ok if rules deny */ }
    })();
  }, [branchSlug]);

  const grouped = useMemo(() => {
    const g: Record<OrderStatus, BranchOrder[]> = {
      processing: [], packed: [], ready: [], shipped: [], delivered: [], cancelled: [],
    };
    orders.forEach(o => g[o.status]?.push(o));
    return g;
  }, [orders]);

  const todayRevenue = useMemo(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    return orders
      .filter(o => o.status !== 'cancelled' && (o.createdAt?.toMillis?.() ?? 0) >= start.getTime())
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-zinc-400 p-8">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading orders…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <a
          href={`/home/portal/branch/${branchSlug}/settings`}
          className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >Branch settings →</a>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Open today" value={grouped.processing.length + grouped.packed.length + grouped.ready.length} />
        <StatCard label="Out for delivery" value={grouped.shipped.length} />
        <StatCard label="Delivered today" value={grouped.delivered.length} />
        <StatCard label="Revenue today" value={`GH₵ ${todayRevenue.toFixed(0)}`} />
      </div>

      {/* Order columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {COLUMNS.map(col => (
          <div key={col} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">{STATUS_LABEL[col]}</h3>
              <span className="text-xs text-zinc-500">{grouped[col].length}</span>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {grouped[col].length === 0 ? (
                <p className="text-xs text-zinc-600 italic py-4 text-center">Empty</p>
              ) : (
                grouped[col].map(o => (
                  <OrderCard key={o.id} order={o} riders={riders} actorUid={staff?.uid ?? ''} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
      <div className="text-xs uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function OrderCard({ order, riders, actorUid }: { order: BranchOrder; riders: StaffAccount[]; actorUid: string }) {
  const [busy, setBusy] = useState(false);

  const advance = async (next: OrderStatus) => {
    setBusy(true);
    try {
      await setOrderStatus(order.id, next, actorUid);
      toast.success(`Marked ${STATUS_LABEL[next].toLowerCase()}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally { setBusy(false); }
  };

  const assignToRider = async (rider: StaffAccount) => {
    setBusy(true);
    try {
      await assignRider(order.id, rider.uid, rider.displayName ?? rider.email);
      toast.success(`Assigned to ${rider.displayName ?? rider.email}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally { setBusy(false); }
  };

  const Icon = order.fulfillmentType === 'pickup' ? Store : Truck;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs space-y-2">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLOR[order.status]}`}>
          <Icon className="w-3 h-3" />
          {order.fulfillmentType === 'pickup' ? 'PICKUP' : 'DELIVERY'}
        </span>
        <span className="text-zinc-500 font-mono">#{order.id.slice(0, 6)}</span>
      </div>

      <div className="font-semibold text-sm truncate">{order.shippingAddress?.fullName ?? order.userEmail}</div>

      <div className="text-zinc-400 space-y-0.5">
        {order.shippingAddress?.phone && (
          <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{order.shippingAddress.phone}</div>
        )}
        {order.fulfillmentType === 'delivery' && order.shippingAddress?.street && (
          <div className="flex items-start gap-1.5"><MapPin className="w-3 h-3 mt-0.5" /><span className="line-clamp-2">{order.shippingAddress.street}, {order.shippingAddress.city}</span></div>
        )}
        {order.scheduledDate && (
          <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{order.scheduledDate}</div>
        )}
        <div className="flex items-center gap-1.5"><Package className="w-3 h-3" />{order.items?.length ?? 0} item(s) · GH₵ {order.total?.toFixed(2) ?? '0.00'}</div>
      </div>

      {order.driverName && (
        <div className="text-violet-400 text-[11px]">Rider: {order.driverName}</div>
      )}

      {/* Action buttons by current status */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {order.status === 'processing' && (
          <ActionBtn onClick={() => advance('packed')} disabled={busy}>Pack</ActionBtn>
        )}
        {order.status === 'packed' && (
          <ActionBtn onClick={() => advance('ready')} disabled={busy}>Mark ready</ActionBtn>
        )}
        {order.status === 'ready' && order.fulfillmentType === 'pickup' && (
          <ActionBtn onClick={() => advance('delivered')} disabled={busy}>Customer picked up</ActionBtn>
        )}
        {order.status === 'ready' && order.fulfillmentType === 'delivery' && (
          riders.length === 0
            ? <span className="text-[11px] text-zinc-500 italic">Waiting for rider self-claim…</span>
            : (
              <select
                disabled={busy}
                onChange={e => {
                  const r = riders.find(x => x.uid === e.target.value);
                  if (r) assignToRider(r);
                }}
                defaultValue=""
                className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-[11px]"
              >
                <option value="" disabled>Assign rider…</option>
                {riders.map(r => <option key={r.uid} value={r.uid}>{r.displayName ?? r.email}</option>)}
              </select>
            )
        )}
      </div>
    </div>
  );
}

function ActionBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-2.5 py-1 rounded bg-primary text-white text-[11px] font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
    >{children}</button>
  );
}
