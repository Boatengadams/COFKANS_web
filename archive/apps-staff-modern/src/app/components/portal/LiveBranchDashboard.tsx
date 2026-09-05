import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Package,
  Phone,
  Search,
  Store,
  Truck,
  WalletCards,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DEMO_MODE } from '@/lib/demo-mode';
import { getBranchBySlug } from '@/lib/branches';
import {
  STATUS_FLOW,
  STATUS_LABEL,
  STATUS_COLOR,
  nextStatus,
  subscribeBranchOrders,
  updateBranchOrderStatus,
  type BranchOrder,
  type BranchOrderStatus,
} from '@/lib/branch-orders';
import { BranchDashboard as DemoBranchDashboard } from '../../modules/branches/dashboard/BranchDashboard';

export function LiveBranchDashboard({ branchSlug }: { branchSlug: string }) {
  // The existing branch module remains the demo/localStorage implementation.
  // Production web uses the Firebase-backed order stream below.
  if (DEMO_MODE) return <DemoBranchDashboard branchId={branchSlug} />;
  return <FirebaseBranchDashboard branchSlug={branchSlug} />;
}

function FirebaseBranchDashboard({ branchSlug }: { branchSlug: string }) {
  const branch = getBranchBySlug(branchSlug);
  const [orders, setOrders] = useState<BranchOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeBranchOrders(
      branchSlug,
      list => { setOrders(list); setLoading(false); },
      error => { console.error(error); toast.error('Could not load branch orders'); setLoading(false); },
    );
    return unsubscribe;
  }, [branchSlug]);

  const grouped = useMemo(() => {
    const result = Object.fromEntries(STATUS_FLOW.map(status => [status, [] as BranchOrder[]])) as Record<BranchOrderStatus, BranchOrder[]>;
    orders.forEach(order => result[order.status]?.push(order));
    return result;
  }, [orders]);

  const revenue = orders
    .filter(order => order.status !== 'cancelled')
    .reduce((sum, order) => sum + (order.total ?? 0), 0);

  const visibleOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return grouped;
    const result = Object.fromEntries(STATUS_FLOW.map(status => [status, [] as BranchOrder[]])) as Record<BranchOrderStatus, BranchOrder[]>;
    orders.forEach(order => {
      const haystack = [
        order.id,
        order.userEmail,
        order.shippingAddress?.fullName,
        order.shippingAddress?.phone,
        order.shippingAddress?.street,
        order.shippingAddress?.city,
      ].filter(Boolean).join(' ').toLowerCase();
      if (haystack.includes(term)) result[order.status]?.push(order);
    });
    return result;
  }, [grouped, orders, search]);

  const openOrders = orders.filter(order => !['completed', 'cancelled'].includes(order.status)).length;
  const pickups = orders.filter(order => order.fulfillmentType === 'pickup').length;
  const deliveries = orders.filter(order => order.fulfillmentType === 'delivery').length;
  const visibleCount = Object.values(visibleOrders).reduce((sum, list) => sum + list.length, 0);

  if (!branch) return <p className="p-8 text-slate-500">Branch not found.</p>;
  if (loading) return <Loading text="Loading live orders…" />;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center lg:p-5">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                <Store className="h-3.5 w-3.5" />
                {branch.city}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Live order stream
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Branch fulfilment board</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              Track pickup and delivery orders from receipt through completion. Use the search to pull up a customer, phone number, address, or order ID.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search orders..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-slate-200 sm:grid-cols-3 lg:grid-cols-6">
          <Stat icon={Clock} label="Open orders" value={openOrders} />
          <Stat icon={Package} label="Ready" value={grouped.ready.length} />
          <Stat icon={CheckCircle2} label="Completed" value={grouped.completed.length} />
          <Stat icon={Store} label="Pickups" value={pickups} />
          <Stat icon={Truck} label="Deliveries" value={deliveries} />
          <Stat icon={WalletCards} label="Revenue" value={`GH₵ ${revenue.toFixed(0)}`} />
        </div>
      </section>

      {search.trim() && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          Showing <span className="font-bold text-slate-950">{visibleCount}</span> matching order{visibleCount === 1 ? '' : 's'} for "{search.trim()}".
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {STATUS_FLOW.map(status => (
          <section key={status} className="min-h-40 rounded-2xl border border-slate-200 bg-white p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <h3 className="text-sm font-bold text-slate-950">{STATUS_LABEL[status]}</h3>
                <p className="text-xs text-slate-500">{laneDescription(status)}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{visibleOrders[status].length}</span>
            </div>
            <div className="space-y-2">
              {visibleOrders[status].map(order => <LiveOrderCard key={order.id} order={order} />)}
              {visibleOrders[status].length === 0 && <EmptyLane />}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function LiveOrderCard({ order }: { order: BranchOrder }) {
  const [busy, setBusy] = useState(false);
  const upcoming = nextStatus(order.status);
  const advance = async () => {
    if (!upcoming) return;
    setBusy(true);
    try {
      await updateBranchOrderStatus(order.id, upcoming);
      toast.success(`Marked ${STATUS_LABEL[upcoming].toLowerCase()}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update order');
    } finally {
      setBusy(false);
    }
  };
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs transition hover:border-slate-300 hover:bg-white">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className={`rounded-full border px-2 py-0.5 font-bold ${STATUS_COLOR[order.status]}`}>{STATUS_LABEL[order.status]}</span>
        <span className="font-mono text-slate-400">#{order.id.slice(0, 6)}</span>
      </div>
      <div className="font-bold text-slate-950">{order.shippingAddress?.fullName ?? order.userEmail ?? 'Customer'}</div>
      <div className="mt-2 space-y-1.5 text-slate-500">
        {order.shippingAddress?.phone && <a href={`tel:${order.shippingAddress.phone}`} className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-slate-950"><Phone className="h-3 w-3" />{order.shippingAddress.phone}</a>}
        {order.shippingAddress?.street && <div className="flex items-start gap-1.5"><MapPin className="mt-0.5 h-3 w-3 shrink-0" /><span>{order.shippingAddress.street}, {order.shippingAddress.city}</span></div>}
        {order.scheduledDate && <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" />{order.scheduledDate}</div>}
        <div className="flex items-center gap-1.5 font-semibold text-slate-700"><Package className="h-3 w-3" />{order.itemCount ?? 0} item(s) · GH₵ {(order.total ?? 0).toFixed(2)}</div>
      </div>
      {upcoming && (
        <button onClick={advance} disabled={busy} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 font-bold text-white hover:bg-slate-800 disabled:opacity-50">
          {busy ? 'Updating…' : <>Move to {STATUS_LABEL[upcoming]} <ArrowRight className="h-3.5 w-3.5" /></>}
        </button>
      )}
    </article>
  );
}

function Loading({ text }: { text: string }) {
  return <div className="flex items-center gap-2 p-8 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />{text}</div>;
}

function Stat({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: number | string }) {
  return (
    <div className="border-r border-t border-slate-200 p-4 first:border-l-0">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 text-xl font-black text-slate-950">{value}</div>
    </div>
  );
}

function EmptyLane() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs font-semibold text-slate-400">
      No orders in this stage
    </div>
  );
}

function laneDescription(status: BranchOrderStatus) {
  switch (status) {
    case 'pending': return 'New customer orders';
    case 'confirmed': return 'Accepted by staff';
    case 'preparing': return 'Being picked or packed';
    case 'ready': return 'Ready for handoff';
    case 'out_for_delivery': return 'With rider or courier';
    case 'completed': return 'Fulfilled successfully';
    case 'cancelled': return 'Stopped or refunded';
    default: return 'Order stage';
  }
}
