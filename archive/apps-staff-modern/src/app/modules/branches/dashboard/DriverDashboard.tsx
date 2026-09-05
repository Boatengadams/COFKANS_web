/**
 * COFKANS ELECTRICALS ERP — Driver Dashboard.
 *
 * A logistics cockpit for a signed-in driver: animated KPIs for the run
 * pipeline, a 7-day delivery-volume chart, an on-time performance ring, and a
 * prioritised run board (in-transit → claimed → available) with one-tap
 * lifecycle actions. Backend-free — all figures derive from the module's
 * transfer service (localStorage). Rendered inside the green ".erp-theme".
 */
import { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  Truck, Package, PackageCheck, MapPin, Clock, CheckCircle2, ArrowRight,
  Boxes, Hand, Gauge, Route, TrendingUp,
} from 'lucide-react';
import { useTransfers } from '../hooks/useTransfers';
import { useBranches } from '../hooks/useBranches';
import { claimTransfer, pickUpTransfer, deliverTransfer } from '../services/transferService';
import { formatDateTime } from '../utils/format';
import { getDemoRole, getDemoUser } from '@/lib/demo-mode';
import {
  PageHeader, Panel, Pill, EmptyState, AnimatedCounter, ProgressRing,
} from '../components/ui/pro';
import type { Transfer, TransferStatus } from '../types/transfer';

const DAY = 86_400_000;
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
const itemUnits = (t: Transfer) => t.items.reduce((s, i) => s + i.quantity, 0);

export function DriverDashboard() {
  const user = getDemoUser(getDemoRole());
  const driverId = user?.uid ?? 'unassigned-driver';
  const driverName = user?.displayName ?? 'Driver';

  const transfers = useTransfers();
  const branches = useBranches();
  const branchName = useMemo(() => {
    const map: Record<string, string> = {};
    branches.forEach((b) => { map[b.slug] = b.name; });
    return (slug: string) => map[slug] ?? slug;
  }, [branches]);

  const { available, mine, inTransit, deliveredToday, mineAll } = useMemo(() => {
    const today = startOfToday();
    const all = transfers.filter((t) => t.driverId === driverId);
    return {
      mineAll: all,
      available: transfers.filter((t) => t.status === 'pending'),
      mine: all.filter((t) => t.status === 'claimed'),
      inTransit: all.filter((t) => t.status === 'in_transit'),
      deliveredToday: all.filter(
        (t) => t.status === 'delivered' && t.deliveredAt && new Date(t.deliveredAt).getTime() >= today,
      ),
    };
  }, [transfers, driverId]);

  // 7-day delivery volume (runs + units) for this driver.
  const weekly = useMemo(() => {
    const today = startOfToday();
    const days = Array.from({ length: 7 }, (_, i) => today - (6 - i) * DAY);
    return days.map((ts) => {
      const label = new Date(ts).toLocaleDateString('en-GB', { weekday: 'short' });
      const runs = mineAll.filter(
        (t) => t.status === 'delivered' && t.deliveredAt &&
          new Date(t.deliveredAt).getTime() >= ts && new Date(t.deliveredAt).getTime() < ts + DAY,
      );
      return { label, runs: runs.length, units: runs.reduce((s, t) => s + itemUnits(t), 0) };
    });
  }, [mineAll]);

  const deliveredTotal = useMemo(() => mineAll.filter((t) => t.status === 'delivered').length, [mineAll]);
  const unitsToday = deliveredToday.reduce((s, t) => s + itemUnits(t), 0);
  // Deterministic on-time score (demo): scales with completed volume.
  const onTime = Math.min(99, 88 + (deliveredTotal % 12));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <PageHeader
          icon={<Truck className="h-6 w-6" strokeWidth={2.5} />}
          eyebrow="Logistics · Driver"
          title={`Welcome back, ${driverName}`}
          subtitle="Your stock transfer runs across every branch."
        />

        {/* KPIs */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi icon={<Hand className="h-4 w-4" />} label="Available to claim" value={available.length} tone="info" />
          <Kpi icon={<Package className="h-4 w-4" />} label="Claimed" value={mine.length} tone="default" />
          <Kpi icon={<Truck className="h-4 w-4" />} label="In transit" value={inTransit.length} tone="warn" />
          <Kpi icon={<PackageCheck className="h-4 w-4" />} label="Delivered today" value={deliveredToday.length} tone="ok" sub={`${unitsToday} units`} />
        </section>

        {/* Performance row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel title="Delivery volume · 7 days" icon={<TrendingUp className="h-4 w-4" />} className="lg:col-span-2">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis key="x" dataKey="label" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis key="y" allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip key="tip" contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} />
                  <Bar key="runs" dataKey="runs" name="Runs" fill="#0F5132" radius={[6, 6, 0, 0]} maxBarSize={34} />
                  <Bar key="units" dataKey="units" name="Units" fill="#6EE7B7" radius={[6, 6, 0, 0]} maxBarSize={34} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Performance" icon={<Gauge className="h-4 w-4" />}>
            <div className="flex flex-col items-center gap-4 py-2">
              <ProgressRing value={onTime} label={`${onTime}%`} sublabel="On-time" />
              <div className="grid w-full grid-cols-2 gap-3">
                <MiniStat icon={<Route className="h-4 w-4" />} label="Total delivered" value={deliveredTotal} />
                <MiniStat icon={<Boxes className="h-4 w-4" />} label="Units today" value={unitsToday} />
              </div>
            </div>
          </Panel>
        </div>

        {/* In transit — highest priority */}
        {inTransit.length > 0 && (
          <Panel title="On the road" icon={<Truck className="h-4 w-4" />} action={<Pill tone="warn">{inTransit.length} active</Pill>}>
            <div className="space-y-2">
              {inTransit.map((t) => (
                <RunRow key={t.id} t={t} branchName={branchName}
                  action={{ label: 'Mark delivered', icon: <CheckCircle2 className="h-4 w-4" />, onClick: () => deliverTransfer(t.id) }} />
              ))}
            </div>
          </Panel>
        )}

        {/* Claimed — ready for pickup */}
        {mine.length > 0 && (
          <Panel title="Ready for pickup" icon={<Package className="h-4 w-4" />}>
            <div className="space-y-2">
              {mine.map((t) => (
                <RunRow key={t.id} t={t} branchName={branchName}
                  action={{ label: 'Picked up', icon: <ArrowRight className="h-4 w-4" />, onClick: () => pickUpTransfer(t.id) }} />
              ))}
            </div>
          </Panel>
        )}

        {/* Available to claim */}
        <Panel title="Available runs" icon={<Hand className="h-4 w-4" />} action={<Pill tone="info">{available.length} waiting</Pill>}>
          {available.length === 0 ? (
            <EmptyState label="No runs waiting to be claimed." />
          ) : (
            <div className="space-y-2">
              {available.map((t) => (
                <RunRow key={t.id} t={t} branchName={branchName}
                  action={{ label: 'Claim run', icon: <Hand className="h-4 w-4" />, onClick: () => claimTransfer(t.id, driverId, driverName) }} />
              ))}
            </div>
          )}
        </Panel>

        {/* Delivered today */}
        {deliveredToday.length > 0 && (
          <Panel title="Delivered today" icon={<PackageCheck className="h-4 w-4" />} action={<Pill tone="up">{deliveredToday.length}</Pill>}>
            <div className="space-y-2">
              {deliveredToday.map((t) => (
                <RunRow key={t.id} t={t} branchName={branchName} done />
              ))}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- subcomponents */

function Kpi({ icon, label, value, tone = 'default', sub }: {
  icon: React.ReactNode; label: string; value: number; sub?: string;
  tone?: 'ok' | 'warn' | 'info' | 'default';
}) {
  const toneClass =
    tone === 'ok' ? 'text-emerald-600' :
    tone === 'warn' ? 'text-amber-600' :
    tone === 'info' ? 'text-primary' : 'text-foreground';
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-sm">{label}</span></div>
      <p className={`mt-2 ${toneClass}`} style={{ fontSize: '1.9rem', lineHeight: 1.05 }}>
        <AnimatedCounter value={value} />
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3 text-center">
      <div className="flex items-center justify-center gap-1.5 text-muted-foreground">{icon}</div>
      <p className="mt-1" style={{ fontSize: '1.25rem', lineHeight: 1.1 }}><AnimatedCounter value={value} /></p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function RunRow({ t, branchName, action, done }: {
  t: Transfer;
  branchName: (slug: string) => string;
  action?: { label: string; icon: React.ReactNode; onClick: () => void };
  done?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/60 p-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{branchName(t.fromBranch)}</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{branchName(t.toBranch)}</span>
          <StatusBadge status={t.status} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Boxes className="h-3.5 w-3.5" />{itemUnits(t)} units · {t.items.length} items</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatDateTime(t.createdAt)}</span>
        </div>
      </div>
      {action && !done && (
        <button onClick={action.onClick}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90">
          {action.icon}{action.label}
        </button>
      )}
      {done && (
        <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-emerald-600">
          <CheckCircle2 className="h-4 w-4" /> Delivered
        </span>
      )}
    </div>
  );
}

const STATUS_STYLE: Record<TransferStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  claimed: 'bg-blue-500/10 text-blue-600',
  in_transit: 'bg-amber-500/10 text-amber-600',
  delivered: 'bg-emerald-500/10 text-emerald-600',
  cancelled: 'bg-red-500/10 text-red-600',
};
const STATUS_LABEL: Record<TransferStatus, string> = {
  pending: 'Pending', claimed: 'Claimed', in_transit: 'In transit', delivered: 'Delivered', cancelled: 'Cancelled',
};
function StatusBadge({ status }: { status: TransferStatus }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</span>;
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'var(--popover)',
  color: 'var(--popover-foreground)',
  fontSize: 12,
} as const;

export default DriverDashboard;
