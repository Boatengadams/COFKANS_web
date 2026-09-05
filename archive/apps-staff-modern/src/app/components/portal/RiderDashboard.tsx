import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Loader2, MapPin, Phone, Package, Calendar, Hand, CheckCircle2, Truck,
  Navigation, Store, RefreshCw,
} from 'lucide-react';
import {
  subscribeRiderQueue, assignRider, markDelivered,
  STATUS_LABEL, statusColor,
  type RiderOrder,
} from '@/lib/branch-orders';
import { getBranchBySlug } from '@/lib/branches';
import toast from 'react-hot-toast';

/**
 * Rider workspace — branch-local last-mile.
 *
 * A rider sees two pools: deliveries available to claim at their branch, and
 * the orders they're already carrying. Claiming flips status to
 * `out_for_delivery`; marking delivered flips it to `completed`. Phone +
 * address tap-throughs make the hand-off fast in the field.
 */
export function RiderDashboard({
  branchSlug,
  riderUid,
  riderName,
}: {
  branchSlug: string;
  riderUid: string;
  riderName: string;
}) {
  const [available, setAvailable] = useState<RiderOrder[]>([]);
  const [mine, setMine] = useState<RiderOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const branch = getBranchBySlug(branchSlug);

  useEffect(() => {
    if (!branchSlug || !riderUid) return;
    const unsub = subscribeRiderQueue(
      branchSlug, riderUid,
      ({ available, mine }) => { setAvailable(available); setMine(mine); setLoading(false); },
      err => { console.error(err); toast.error('Could not load orders'); setLoading(false); },
    );
    return unsub;
  }, [branchSlug, riderUid]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground p-8">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading queue…
      </div>
    );
  }

  const claim = async (o: RiderOrder) => {
    try { await assignRider(o.id, riderUid, riderName); toast.success('Claimed'); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Could not claim'); }
  };

  const deliver = async (o: RiderOrder) => {
    try { await markDelivered(o.id, riderUid); toast.success('Marked delivered'); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Could not update'); }
  };

  const totalKm = mine.length; // placeholder — distance comes when we wire maps
  const carryingValue = mine.reduce((s, o) => s + (o.total ?? 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Today's run</p>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" /> {branch?.name ?? branchSlug}
          </h2>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-border hover:bg-muted text-sm font-bold"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Truck} label="Carrying" value={mine.length} tone="violet" />
        <Stat icon={Hand} label="Available" value={available.length} tone="amber" />
        <Stat icon={Package} label="Stops left" value={totalKm} tone="primary" />
        <Stat icon={CheckCircle2} label="Value (GH₵)" value={carryingValue.toLocaleString()} tone="emerald" />
      </div>

      {/* In progress */}
      <Section title="In progress" icon={Truck} count={mine.length}>
        {mine.length === 0 ? (
          <EmptyState icon={Truck} text="Nothing to deliver right now. Claim from the pool below." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mine.map(o => (
              <OrderCard
                key={o.id}
                order={o}
                actionLabel="Mark delivered"
                actionIcon={<CheckCircle2 className="w-4 h-4" />}
                onAction={() => deliver(o)}
                tone="violet"
              />
            ))}
          </div>
        )}
      </Section>

      {/* Available */}
      <Section title="Available to claim" icon={Hand} count={available.length}>
        {available.length === 0 ? (
          <EmptyState icon={Hand} text="No ready orders right now. Check back soon." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {available.map(o => (
              <OrderCard
                key={o.id}
                order={o}
                actionLabel="Claim"
                actionIcon={<Hand className="w-4 h-4" />}
                onAction={() => claim(o)}
                tone="amber"
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ---------------- pieces ---------------- */

function Section({
  title, icon: Icon, count, children,
}: { title: string; icon: typeof Truck; count: number; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
        <Icon className="w-4 h-4 text-primary" /> {title}
        <span className="text-muted-foreground font-normal">· {count}</span>
      </h3>
      {children}
    </section>
  );
}

function OrderCard({
  order, actionLabel, actionIcon, onAction, tone,
}: {
  order: RiderOrder;
  actionLabel: string;
  actionIcon: React.ReactNode;
  onAction: () => Promise<void> | void;
  tone: 'amber' | 'violet';
}) {
  const [busy, setBusy] = useState(false);
  const phone = order.shippingAddress?.phone;
  const addr = order.shippingAddress;
  const mapQuery = encodeURIComponent([addr?.street, addr?.city].filter(Boolean).join(', '));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-card border-2 border-border rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(order.status)}`}>
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
        <span className="text-muted-foreground font-mono text-xs">#{order.id.slice(0, 6)}</span>
      </div>

      <div className="font-semibold text-sm">{order.shippingAddress?.fullName ?? order.userEmail ?? 'Customer'}</div>

      <div className="text-xs text-muted-foreground space-y-1.5">
        {phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" />
            <a className="text-primary font-semibold" href={`tel:${phone}`}>{phone}</a>
          </div>
        )}
        {addr?.street && (
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{addr.street}{addr.city ? `, ${addr.city}` : ''}</span>
          </div>
        )}
        {order.scheduledDate && (
          <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{order.scheduledDate}</div>
        )}
        {(order.itemCount != null || order.total != null) && (
          <div className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            {order.itemCount != null && <>{order.itemCount} item{order.itemCount === 1 ? '' : 's'}</>}
            {order.total != null && <> · GH₵{order.total.toLocaleString()}</>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        {mapQuery && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border-2 border-border text-xs font-bold hover:bg-muted"
          >
            <Navigation className="w-3.5 h-3.5" /> Navigate
          </a>
        )}
        <button
          onClick={async () => { setBusy(true); try { await onAction(); } finally { setBusy(false); } }}
          disabled={busy}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white text-xs font-bold disabled:opacity-50 ${
            tone === 'violet' ? 'bg-violet-600 hover:bg-violet-500' : 'bg-primary hover:opacity-90'
          }`}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : actionIcon}
          {actionLabel}
        </button>
      </div>
    </motion.div>
  );
}

const TONE: Record<string, string> = {
  primary: 'text-primary bg-primary/10',
  amber: 'text-amber-500 bg-amber-500/10',
  violet: 'text-violet-500 bg-violet-500/10',
  emerald: 'text-emerald-500 bg-emerald-500/10',
};

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Truck; label: string; value: number | string; tone: string }) {
  return (
    <div className="bg-card border-2 border-border rounded-2xl p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${TONE[tone] ?? TONE.primary}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-0.5">{value}</div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof Truck; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center bg-card border-2 border-dashed border-border rounded-2xl">
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
