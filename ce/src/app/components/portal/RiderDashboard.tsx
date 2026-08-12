import { useEffect, useState } from 'react';
import { Loader2, MapPin, Phone, Package, Calendar, Hand, CheckCircle2, Truck } from 'lucide-react';
import {
  subscribeRiderQueue, assignRider, markDelivered,
  STATUS_LABEL, STATUS_COLOR,
  type BranchOrder,
} from '../../../lib/branch-orders';
import { useStaffRole } from '../../hooks/useStaffRole';
import { getBranchBySlug } from '../../../lib/branches';
import toast from 'react-hot-toast';

export function RiderDashboard() {
  const { staff } = useStaffRole();
  const [available, setAvailable] = useState<BranchOrder[]>([]);
  const [mine, setMine] = useState<BranchOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!staff?.branchSlug || !staff.uid) return;
    const unsub = subscribeRiderQueue(staff.branchSlug, staff.uid, ({ available, mine }) => {
      setAvailable(available);
      setMine(mine);
      setLoading(false);
    }, err => {
      console.error(err);
      toast.error('Could not load orders');
      setLoading(false);
    });
    return unsub;
  }, [staff?.branchSlug, staff?.uid]);

  if (!staff) return null;
  const branch = staff.branchSlug ? getBranchBySlug(staff.branchSlug) : undefined;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-zinc-400 p-8">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading queue…
      </div>
    );
  }

  const claim = async (o: BranchOrder) => {
    try {
      await assignRider(o.id, staff.uid, staff.displayName ?? staff.email);
      toast.success('Claimed');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not claim');
    }
  };

  const deliver = async (o: BranchOrder) => {
    try {
      await markDelivered(o.id, staff.uid);
      toast.success('Marked delivered');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl">My deliveries</h2>
          <p className="text-xs text-zinc-500">Branch: {branch?.name ?? '—'}</p>
        </div>
        <div className="text-right text-xs">
          <div className="text-zinc-500">Active</div>
          <div className="text-2xl font-bold">{mine.length}</div>
        </div>
      </header>

      <section>
        <h3 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2"><Truck className="w-4 h-4" /> In progress</h3>
        {mine.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">Nothing to deliver right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mine.map(o => (
              <OrderCard key={o.id} order={o} actionLabel="Mark delivered" actionIcon={<CheckCircle2 className="w-4 h-4" />} onAction={() => deliver(o)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2"><Hand className="w-4 h-4" /> Available to claim</h3>
        {available.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No ready orders right now. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {available.map(o => (
              <OrderCard key={o.id} order={o} actionLabel="Claim" actionIcon={<Hand className="w-4 h-4" />} onAction={() => claim(o)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function OrderCard({ order, actionLabel, actionIcon, onAction }: {
  order: BranchOrder;
  actionLabel: string;
  actionIcon: React.ReactNode;
  onAction: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLOR[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
        <span className="text-zinc-500 font-mono text-xs">#{order.id.slice(0, 6)}</span>
      </div>
      <div className="font-semibold">{order.shippingAddress?.fullName ?? order.userEmail}</div>
      <div className="text-zinc-400 text-xs space-y-1">
        {order.shippingAddress?.phone && (
          <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> <a className="underline" href={`tel:${order.shippingAddress.phone}`}>{order.shippingAddress.phone}</a></div>
        )}
        {order.shippingAddress?.street && (
          <div className="flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 mt-0.5" />{order.shippingAddress.street}, {order.shippingAddress.city}</div>
        )}
        {order.scheduledDate && <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{order.scheduledDate}</div>}
        <div className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" />{order.items?.length ?? 0} item(s) · GH₵ {order.total?.toFixed(2) ?? '0.00'}</div>
      </div>
      <button
        onClick={async () => { setBusy(true); try { await onAction(); } finally { setBusy(false); } }}
        disabled={busy}
        className="w-full mt-2 px-3 py-2 bg-primary text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : actionIcon}
        {actionLabel}
      </button>
    </div>
  );
}
