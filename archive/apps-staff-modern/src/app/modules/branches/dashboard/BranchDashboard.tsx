/**
 * Multi-Branch Module — Branch Dashboard (premium).
 *
 * The per-branch overview shown at /branches/:branchId/dashboard. Reads the
 * module's mock data through its hooks/services (no backend). Built on the
 * shared "Gold City" pro UI kit: a hero header, KPI stat cards with trend
 * deltas + sparklines, a gold revenue chart, and elevated content panels.
 */
import { useMemo } from 'react';
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip,
} from 'recharts';
import {
  TrendingUp, CalendarDays, CalendarRange, Receipt as ReceiptIcon,
  Package, AlertTriangle, Boxes, ArrowLeftRight, ArrowDownLeft, ArrowUpRight,
} from 'lucide-react';
import { useBranch } from '../hooks/useBranches';
import { useBranchSales } from '../hooks/useSales';
import { useBranchInventory } from '../hooks/useBranchInventory';
import { useTransfers } from '../hooks/useTransfers';
import { stockLevel } from '../utils/inventory';
import { formatCedis, formatDate, formatDateTime } from '../utils/format';
import { PageHeader, StatCard, Panel, Pill, EmptyState, Reveal } from '../components/ui/pro';
import type { Sale } from '../types/sale';
import type { TransferStatus } from '../types/transfer';

/* ------------------------------------------------------------------ helpers */

const DAY = 86_400_000;
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };

function sumTotals(sales: Sale[]): number {
  return sales.reduce((s, x) => s + x.totals.total, 0);
}

/** Revenue per day for the last `n` calendar days (oldest → newest). */
function dailyRevenue(sales: Sale[], n: number): { key: string; label: string; revenue: number }[] {
  const today = startOfToday();
  return Array.from({ length: n }, (_, i) => {
    const dayStart = today - (n - 1 - i) * DAY;
    const dayEnd = dayStart + DAY;
    const revenue = sales
      .filter((s) => { const t = new Date(s.soldAt).getTime(); return t >= dayStart && t < dayEnd; })
      .reduce((sum, s) => sum + s.totals.total, 0);
    return {
      // Unique category key (the day itself) — weekday labels repeat across a
      // longer window and would collide as recharts axis keys.
      key: String(dayStart),
      label: new Date(dayStart).toLocaleDateString('en-GH', { weekday: 'short' }),
      revenue: Math.round(revenue),
    };
  });
}

/** Revenue within [now - span*2, now - span) vs [now - span, now); % change. */
function periodDelta(sales: Sale[], span: number): number {
  const now = Date.now();
  const cur = sales.filter((s) => new Date(s.soldAt).getTime() >= now - span);
  const prev = sales.filter((s) => {
    const t = new Date(s.soldAt).getTime();
    return t >= now - span * 2 && t < now - span;
  });
  const c = sumTotals(cur); const p = sumTotals(prev);
  if (p === 0) return c > 0 ? 100 : 0;
  return ((c - p) / p) * 100;
}

/* ------------------------------------------------------------------- screen */

export function BranchDashboard({ branchId }: { branchId: string }) {
  const branch = useBranch(branchId);
  const sales = useBranchSales(branchId);
  const inventory = useBranchInventory(branchId);
  const allTransfers = useTransfers();

  const now = Date.now();
  const todaySales = useMemo(() => sales.filter((s) => new Date(s.soldAt).getTime() >= startOfToday()), [sales]);
  const weekSales = useMemo(() => sales.filter((s) => new Date(s.soldAt).getTime() >= now - 7 * DAY), [sales, now]);
  const monthSales = useMemo(() => sales.filter((s) => new Date(s.soldAt).getTime() >= now - 30 * DAY), [sales, now]);

  const week = useMemo(() => dailyRevenue(sales, 7), [sales]);
  const weekSpark = useMemo(() => week.map((d) => d.revenue), [week]);
  const monthSpark = useMemo(() => dailyRevenue(sales, 30).map((d) => d.revenue), [sales]);

  const deltas = useMemo(() => ({
    today: periodDelta(sales, DAY),
    week: periodDelta(sales, 7 * DAY),
    month: periodDelta(sales, 30 * DAY),
  }), [sales]);

  const recentSales = useMemo(
    () => [...sales].sort((a, b) => b.soldAt.localeCompare(a.soldAt)).slice(0, 6),
    [sales],
  );

  const lowStock = useMemo(
    () => inventory.items.filter((i) => stockLevel(i) !== 'ok').sort((a, b) => a.quantity - b.quantity).slice(0, 6),
    [inventory.items],
  );

  const transfers = useMemo(
    () => allTransfers
      .filter((t) => t.fromBranch === branchId || t.toBranch === branchId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6),
    [allTransfers, branchId],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <PageHeader
        icon={<Boxes className="h-6 w-6" />}
        eyebrow="Branch dashboard"
        title={branch?.name ?? branchId}
        subtitle={branch ? `${branch.city} · ${branch.region}` : undefined}
        actions={
          branch && (
            <Pill tone={branch.status === 'open' ? 'up' : branch.status === 'maintenance' ? 'warn' : 'muted'}>
              <span className="h-2 w-2 rounded-full bg-current" /> {branch.status}
            </Pill>
          )
        }
      />

      {/* Sales KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          index={0} icon={<TrendingUp className="h-5 w-5" />} label="Today's Sales"
          value={formatCedis(sumTotals(todaySales))} sub={`${todaySales.length} order${todaySales.length === 1 ? '' : 's'}`}
          delta={deltas.today} spark={weekSpark}
        />
        <StatCard
          index={1} icon={<CalendarDays className="h-5 w-5" />} label="Weekly Sales"
          value={formatCedis(sumTotals(weekSales))} sub={`${weekSales.length} order${weekSales.length === 1 ? '' : 's'} · last 7 days`}
          delta={deltas.week} spark={weekSpark}
        />
        <StatCard
          index={2} icon={<CalendarRange className="h-5 w-5" />} label="Monthly Sales"
          value={formatCedis(sumTotals(monthSales))} sub={`${monthSales.length} order${monthSales.length === 1 ? '' : 's'} · last 30 days`}
          delta={deltas.month} spark={monthSpark}
        />
      </section>

      {/* Revenue chart */}
      <Panel title="Revenue — last 7 days" icon={<TrendingUp className="h-5 w-5" />}
        action={<span className="text-sm text-muted-foreground">{formatCedis(sumTotals(weekSales))}</span>} index={3}>
        {/* Gradient defined in a standalone hidden svg — keeping <defs> out of
            the chart avoids colliding with recharts' own internal (keyless)
            defs, which triggers a duplicate-key warning. */}
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <defs>
            <linearGradient id="revBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--true-gold)" stopOpacity={0.95} />
              <stop offset="100%" stopColor="var(--true-gold)" stopOpacity={0.45} />
            </linearGradient>
          </defs>
        </svg>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={week} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              {/* Explicit unique keys on every direct child: recharts clones the
                  chart's children into its <Surface> and, when a child has no
                  key, some versions emit an empty-string key — two such children
                  collide and trigger the duplicate-key warning. */}
              <XAxis key="x" dataKey="key" axisLine={false} tickLine={false}
                tickFormatter={(_v, i) => week[i]?.label ?? ''}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
              <YAxis key="y" hide />
              <Tooltip
                key="tip"
                cursor={{ fill: 'var(--muted)' }}
                contentStyle={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 12, color: 'var(--foreground)',
                }}
                formatter={(v: number) => [formatCedis(v), 'Revenue']}
              />
              <Bar key="bar" dataKey="revenue" radius={[8, 8, 0, 0]} fill="url(#revBar)" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Inventory summary strip */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile index={4} icon={<Boxes className="h-4 w-4" />} label="Products" value={inventory.totals.skuCount.toLocaleString()} />
        <StatTile index={5} icon={<Package className="h-4 w-4" />} label="Units on hand" value={inventory.totals.unitsOnHand.toLocaleString()} />
        <StatTile index={6} icon={<AlertTriangle className="h-4 w-4" />} label="Low stock" value={inventory.totals.lowStockCount.toLocaleString()} tone="warn" />
        <StatTile index={7} icon={<AlertTriangle className="h-4 w-4" />} label="Out of stock" value={inventory.totals.outOfStockCount.toLocaleString()} tone="danger" />
      </section>

      {/* Two-column content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Recent Sales" icon={<TrendingUp className="h-5 w-5" />} index={8}>
          {recentSales.length === 0 ? <EmptyState label="No sales yet" /> : (
            <ul className="divide-y divide-border">
              {recentSales.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate">{s.reference}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {s.items.length} item{s.items.length === 1 ? '' : 's'} · {s.paymentMethod} · {formatDateTime(s.soldAt)}
                    </p>
                  </div>
                  <span className="shrink-0">{formatCedis(s.totals.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Low Stock" icon={<AlertTriangle className="h-5 w-5" />} index={9}>
          {lowStock.length === 0 ? <EmptyState label="Everything is well stocked" /> : (
            <ul className="divide-y divide-border">
              {lowStock.map((i) => {
                const level = stockLevel(i);
                return (
                  <li key={i.sku} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate">{i.name ?? i.sku}</p>
                      <p className="truncate text-sm text-muted-foreground">{i.sku} · reorder at {i.reorderLevel ?? 0}</p>
                    </div>
                    <Pill tone={level === 'out' ? 'down' : 'warn'}>
                      {i.quantity} {level === 'out' ? 'out' : 'left'}
                    </Pill>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Current Inventory" icon={<Package className="h-5 w-5" />} index={10}
          action={<span className="text-sm text-muted-foreground">Value {formatCedis(inventory.totals.stockValue)}</span>}>
          {inventory.items.length === 0 ? <EmptyState label="No inventory" /> : (
            <ul className="divide-y divide-border">
              {[...inventory.items]
                .sort((a, b) => b.quantity * b.price - a.quantity * a.price)
                .slice(0, 6)
                .map((i) => (
                  <li key={i.sku} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate">{i.name ?? i.sku}</p>
                      <p className="truncate text-sm text-muted-foreground">{i.category ?? i.sku} · {formatCedis(i.price)}</p>
                    </div>
                    <span className="shrink-0 text-muted-foreground">{i.quantity} in stock</span>
                  </li>
                ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent Receipts" icon={<ReceiptIcon className="h-5 w-5" />} index={11}>
          {recentSales.length === 0 ? <EmptyState label="No receipts yet" /> : (
            <ul className="divide-y divide-border">
              {recentSales.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate">Receipt {s.reference}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {s.customer?.name ?? 'Walk-in'} · {formatDate(s.soldAt)}
                    </p>
                  </div>
                  <Pill>{s.status}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Transfers */}
      <Panel title="Transfers" icon={<ArrowLeftRight className="h-5 w-5" />} index={12}>
        {transfers.length === 0 ? <EmptyState label="No transfers involving this branch" /> : (
          <ul className="divide-y divide-border">
            {transfers.map((t) => {
              const outgoing = t.fromBranch === branchId;
              const units = t.items.reduce((n, it) => n + it.quantity, 0);
              return (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`shrink-0 rounded-lg p-2 ${outgoing ? 'bg-sky-500/10 text-sky-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                      {outgoing ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate">{outgoing ? `To ${t.toBranch}` : `From ${t.fromBranch}`}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {t.items.length} line{t.items.length === 1 ? '' : 's'} · {units} unit{units === 1 ? '' : 's'} · {formatDate(t.createdAt)}
                      </p>
                    </div>
                  </div>
                  <TransferBadge status={t.status} />
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

/* --------------------------------------------------------------- subcomponents */

function StatTile({ icon, label, value, tone, index = 0 }: {
  icon: React.ReactNode; label: string; value: string; tone?: 'warn' | 'danger'; index?: number;
}) {
  const toneClass = tone === 'danger' ? 'text-red-600' : tone === 'warn' ? 'text-amber-600' : 'text-foreground';
  return (
    <Reveal index={index}>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}<span className="text-sm">{label}</span>
        </div>
        <p className={`mt-2 ${toneClass}`} style={{ fontSize: '1.5rem', lineHeight: 1.1 }}>{value}</p>
      </div>
    </Reveal>
  );
}

function TransferBadge({ status }: { status: TransferStatus }) {
  const tone: Record<TransferStatus, 'warn' | 'info' | 'gold' | 'up' | 'muted'> = {
    pending: 'warn', claimed: 'info', in_transit: 'gold', delivered: 'up', cancelled: 'muted',
  };
  return <Pill tone={tone[status]}>{status.replace('_', ' ')}</Pill>;
}

export default BranchDashboard;
