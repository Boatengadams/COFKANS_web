/**
 * COFKANS ELECTRICALS ERP — General Manager / Executive Dashboard.
 *
 * A company-wide command centre spanning every branch: headline KPIs with
 * animated counters + trend deltas, a revenue-vs-profit composed chart, branch
 * comparison, category performance, sales-target progress rings, an approvals
 * queue (stock alerts + pending transfers) with working actions, and a
 * recent high-value transactions grid.
 *
 * Backend-free: all figures are computed from the module's mock + localStorage
 * service layer. Rendered inside the green ".erp-theme" enterprise surface.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer, ComposedChart, Area, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
  TrendingUp, Wallet, Receipt, Boxes, Coins, Building2, PieChart as PieIcon,
  Target, ShieldCheck, ArrowLeftRight, CheckCircle2, XCircle, Layers,
  ArrowUpRight, ArrowDownRight, Sparkles,
} from 'lucide-react';
import { useBranches } from '../hooks/useBranches';
import { useSales } from '../hooks/useSales';
import { useTransfers, useStockAlerts } from '../hooks/useTransfers';
import { listInventory } from '../services/inventoryService';
import { resolveAlert } from '../services/transferService';
import { formatCedis, formatDateTime } from '../utils/format';
import type { Sale } from '../types/sale';
import type { ProductInventory } from '../types/product-inventory';
import {
  PageHeader, Panel, Pill, EmptyState, DataTable, AnimatedCounter, ProgressRing,
  Skeleton, Sparkline, type DataColumn,
} from '../components/ui/pro';
import { StockMatrix } from './StockMatrix';
import { CustomerGeography } from './CustomerGeography';

/** Assumed blended gross margin for profit estimation. */
const MARGIN = 0.32;
/** Assumed operating-expense ratio (of revenue) for the expenses KPI. */
const OPEX = 0.19;
const DAY = 86_400_000;
const PIE_COLORS = ['#0F5132', '#10B981', '#6EE7B7', '#2563EB', '#8B5CF6', '#F59E0B'];

type PeriodId = 'today' | '7d' | '30d' | '90d';
const PERIODS: { id: PeriodId; label: string; days: number }[] = [
  { id: 'today', label: 'Today', days: 1 },
  { id: '7d', label: '7 Days', days: 7 },
  { id: '30d', label: '30 Days', days: 30 },
  { id: '90d', label: '90 Days', days: 90 },
];

const itemsIn = (s: Sale) => s.items.reduce((n, i) => n + i.quantity, 0);
const revenueOf = (rows: Sale[]) => rows.reduce((sum, s) => sum + s.totals.total, 0);

export function ExecutiveDashboard() {
  const branches = useBranches();
  const sales = useSales();
  const transfers = useTransfers();
  const alerts = useStockAlerts();

  const [period, setPeriod] = useState<PeriodId>('30d');
  const [booting, setBooting] = useState(true);

  // Brief skeleton pass so the executive view feels like it's assembling data.
  useEffect(() => {
    setBooting(true);
    const t = setTimeout(() => setBooting(false), 550);
    return () => clearTimeout(t);
  }, [period]);

  const cfg = PERIODS.find((p) => p.id === period)!;
  const [from, to] = useMemo(() => {
    const now = Date.now();
    if (period === 'today') { const d = new Date(); d.setHours(0, 0, 0, 0); return [d.getTime(), now]; }
    return [now - cfg.days * DAY, now];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const inRange = (s: Sale, a: number, b: number) => {
    const t = new Date(s.soldAt).getTime();
    return t >= a && t <= b;
  };

  const rows = useMemo(() => sales.filter((s) => inRange(s, from, to)), [sales, from, to]);
  const prevRows = useMemo(() => sales.filter((s) => inRange(s, from - (to - from), from)), [sales, from, to]);

  // Company-wide inventory (all branches).
  const inventory = useMemo<ProductInventory[]>(
    () => branches.flatMap((b) => listInventory(b.slug)),
    [branches],
  );
  const inventoryValue = useMemo(
    () => inventory.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [inventory],
  );

  const revenue = revenueOf(rows);
  const prevRevenue = revenueOf(prevRows);
  const profit = revenue * MARGIN;
  const expenses = revenue * OPEX;
  const delta = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : cur ? 100 : 0);

  /* ---- chart series ---- */

  const trend = useMemo(() => {
    const byMonth = to - from > 92 * DAY;
    const map = new Map<string, { label: string; revenue: number; profit: number; sort: number }>();
    for (const s of rows) {
      const dt = new Date(s.soldAt);
      const key = byMonth
        ? `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
        : dt.toISOString().slice(0, 10);
      const label = dt.toLocaleDateString(undefined, byMonth ? { month: 'short' } : { month: 'short', day: 'numeric' });
      const cur = map.get(key) ?? { label, revenue: 0, profit: 0, sort: dt.getTime() };
      cur.revenue += s.totals.total;
      cur.profit += s.totals.total * MARGIN;
      map.set(key, cur);
    }
    return [...map.values()].sort((a, b) => a.sort - b.sort);
  }, [rows, from, to]);

  const nameOf = (slug: string) => branches.find((b) => b.slug === slug)?.name ?? slug;

  const byBranch = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of rows) map.set(s.branchSlug, (map.get(s.branchSlug) ?? 0) + s.totals.total);
    return branches
      .map((b) => ({ slug: b.slug, name: b.name, revenue: map.get(b.slug) ?? 0 }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [rows, branches]);

  // sku → category, then revenue by category.
  const byCategory = useMemo(() => {
    const cat = new Map<string, string>();
    for (const i of inventory) if (i.category) cat.set(i.sku, i.category);
    const map = new Map<string, number>();
    for (const s of rows) {
      for (const i of s.items) {
        const c = cat.get(i.sku) ?? 'Other';
        map.set(c, (map.get(c) ?? 0) + i.lineTotal);
      }
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [rows, inventory]);

  // Sales targets: deterministic monthly target per branch, scaled to the period.
  const targets = useMemo(() => {
    const scale = cfg.days / 30;
    return byBranch.slice(0, 4).map((b, i) => {
      const target = (60_000 + i * 12_000) * scale;
      return { ...b, target, pct: target ? Math.min(140, (b.revenue / target) * 100) : 0 };
    });
  }, [byBranch, cfg.days]);

  const pendingAlerts = alerts.filter((a) => a.status === 'pending');
  const pendingTransfers = transfers.filter((t) => t.status === 'pending' || t.status === 'claimed');

  const fastMoving = useMemo(() => {
    const map = new Map<string, { name: string; qty: number }>();
    for (const s of rows) for (const i of s.items) {
      const cur = map.get(i.sku) ?? { name: i.name, qty: 0 };
      cur.qty += i.quantity; map.set(i.sku, cur);
    }
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [rows]);

  const columns = useMemo<DataColumn<Sale>[]>(() => [
    { key: 'reference', header: 'Reference', value: (s) => s.reference,
      render: (s) => <span className="font-medium">{s.reference}</span> },
    { key: 'branch', header: 'Branch', value: (s) => nameOf(s.branchSlug),
      render: (s) => <span className="text-muted-foreground">{nameOf(s.branchSlug)}</span> },
    { key: 'date', header: 'Date', value: (s) => new Date(s.soldAt).getTime(),
      render: (s) => <span className="text-muted-foreground">{formatDateTime(s.soldAt)}</span> },
    { key: 'items', header: 'Items', align: 'right', value: (s) => itemsIn(s) },
    { key: 'payment', header: 'Payment', value: (s) => s.paymentMethod,
      render: (s) => <span className="capitalize">{s.paymentMethod.replace(/-/g, ' ')}</span> },
    { key: 'total', header: 'Total', align: 'right', value: (s) => s.totals.total,
      render: (s) => <span className="font-medium">{formatCedis(s.totals.total)}</span> },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [branches]);

  const topSales = useMemo(
    () => [...rows].sort((a, b) => b.totals.total - a.totals.total).slice(0, 25),
    [rows],
  );

  const kpis = [
    { icon: <Wallet className="h-5 w-5" />, label: 'Revenue', value: revenue, money: true,
      delta: delta(revenue, prevRevenue), spark: trend.map((t) => t.revenue) },
    { icon: <Coins className="h-5 w-5" />, label: `Gross Profit · ${Math.round(MARGIN * 100)}%`, value: profit, money: true,
      delta: delta(profit, prevRevenue * MARGIN), spark: trend.map((t) => t.profit) },
    { icon: <Receipt className="h-5 w-5" />, label: 'Operating Expenses', value: expenses, money: true,
      delta: -delta(expenses, prevRevenue * OPEX), spark: trend.map((t) => t.revenue * OPEX) },
    { icon: <Boxes className="h-5 w-5" />, label: 'Inventory Value', value: inventoryValue, money: true, delta: 0 },
    { icon: <ShieldCheck className="h-5 w-5" />, label: 'Pending Approvals', value: pendingAlerts.length + pendingTransfers.length, money: false, delta: 0 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <PageHeader
          icon={<Sparkles className="h-6 w-6" strokeWidth={2.5} />}
          eyebrow="General Manager"
          title="Executive Dashboard"
          subtitle={<span>Company-wide performance across {branches.length} branches · {cfg.label}</span>}
          actions={
            <div className="flex flex-wrap gap-1.5 rounded-2xl border border-border bg-background/60 p-1">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`rounded-xl px-3 py-1.5 text-sm transition-colors ${
                    period === p.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          }
        />

        {/* -------------------------------------------------- KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {booting
            ? PERIODS.concat(PERIODS).slice(0, 5).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
            : kpis.map((k, i) => {
                const up = k.delta >= 0;
                return (
                  <div key={k.label}
                    className="erp-card erp-card-hover group relative h-full overflow-hidden p-5">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative flex items-start justify-between gap-3">
                      <span className="rounded-2xl bg-primary/10 p-2.5 text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover:ring-primary/25">{k.icon}</span>
                      {!!k.delta && (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          up ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(k.delta).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <p className="relative mt-4 text-sm text-muted-foreground">{k.label}</p>
                    <p className="relative mt-1 tabular-nums" style={{ fontSize: '1.75rem', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
                      <AnimatedCounter
                        value={k.value}
                        format={(n) => (k.money ? formatCedis(n) : Math.round(n).toLocaleString())}
                      />
                    </p>
                    {k.spark && k.spark.length > 1 && (
                      <div className="relative mt-3 -mb-1"><Sparkline data={k.spark} tone={up ? 'up' : 'down'} /></div>
                    )}
                  </div>
                );
              })}
        </div>

        {/* -------------------------------------------------- Revenue vs Profit + Category */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Revenue vs. profit" icon={<TrendingUp className="h-4 w-4" />}
            action={<Pill tone="muted">{cfg.label}</Pill>} className="lg:col-span-2" index={0}>
            {booting ? <Skeleton className="h-72" /> : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trend} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                    <defs key="defs">
                      <linearGradient id="ex-rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis key="x" dataKey="label" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                    <YAxis key="y" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false}
                      width={70} tickFormatter={(v) => formatCedis(Number(v))} />
                    <Tooltip key="tip" formatter={(v: number) => formatCedis(v)} contentStyle={tooltipStyle} />
                    <Legend key="legend" iconType="circle" formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                    <Area key="rev" type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={2.5}
                      fill="url(#ex-rev)" isAnimationActive={false} dot={false} />
                    <Line key="profit" type="monotone" dataKey="profit" name="Profit" stroke="#0F5132" strokeWidth={2.5}
                      strokeDasharray="5 4" isAnimationActive={false} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          <Panel title="Category performance" icon={<PieIcon className="h-4 w-4" />} index={1}>
            {booting ? <Skeleton className="h-72" /> : byCategory.length === 0 ? (
              <EmptyState label="No category data for this period." />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie key="pie" data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%"
                      innerRadius={54} outerRadius={88} paddingAngle={2} isAnimationActive={false}>
                      {byCategory.map((e, i) => <Cell key={e.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip key="tip" formatter={(v: number) => formatCedis(v)} contentStyle={tooltipStyle} />
                    <Legend key="legend" verticalAlign="bottom" iconType="circle"
                      formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        </div>

        {/* -------------------------------------------------- Branch comparison + targets */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Branch comparison" icon={<Building2 className="h-4 w-4" />} className="lg:col-span-2" index={0}>
            {booting ? <Skeleton className="h-72" /> : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byBranch} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                    <defs key="defs">
                      <linearGradient id="ex-branch" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0F5132" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis key="x" type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false}
                      tickFormatter={(v) => formatCedis(Number(v))} />
                    <YAxis key="y" type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                    <Tooltip key="tip" formatter={(v: number) => formatCedis(v)} contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
                    <Bar key="bar" dataKey="revenue" name="Revenue" radius={[0, 8, 8, 0]} fill="url(#ex-branch)" isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          <Panel title="Sales targets" icon={<Target className="h-4 w-4" />} index={1}>
            {booting ? <Skeleton className="h-72" /> : targets.length === 0 ? (
              <EmptyState label="No branch sales yet." />
            ) : (
              <div className="space-y-4">
                {targets.map((t) => (
                  <div key={t.slug} className="flex items-center gap-4">
                    <ProgressRing value={t.pct} size={60} stroke={7}
                      label={<span className="text-xs font-semibold">{Math.round(t.pct)}%</span>} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCedis(t.revenue)} <span className="opacity-60">/ {formatCedis(t.target)}</span>
                      </p>
                    </div>
                    <Pill tone={t.pct >= 100 ? 'up' : t.pct >= 70 ? 'gold' : 'warn'}>
                      {t.pct >= 100 ? 'On target' : t.pct >= 70 ? 'On track' : 'Behind'}
                    </Pill>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* -------------------------------------------------- Approvals + fast movers */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Approvals queue" icon={<ShieldCheck className="h-4 w-4" />}
            action={<Pill tone={pendingAlerts.length ? 'warn' : 'up'}>{pendingAlerts.length + pendingTransfers.length} pending</Pill>}
            className="lg:col-span-2" index={0}>
            {pendingAlerts.length === 0 && pendingTransfers.length === 0 ? (
              <EmptyState label="All caught up — no items awaiting approval." />
            ) : (
              <div className="space-y-2">
                {pendingAlerts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="rounded-lg bg-amber-500/10 p-2 text-amber-600"><Layers className="h-4 w-4" /></span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{a.name} · ×{a.requestedQty}</p>
                        <p className="truncate text-xs text-muted-foreground">Restock request · {nameOf(a.branchSlug)}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button onClick={() => resolveAlert(a.id, 'approved')}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button onClick={() => resolveAlert(a.id, 'declined')}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-red-400 hover:text-red-600">
                        <XCircle className="h-3.5 w-3.5" /> Decline
                      </button>
                    </div>
                  </div>
                ))}
                {pendingTransfers.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="rounded-lg bg-primary/10 p-2 text-primary"><ArrowLeftRight className="h-4 w-4" /></span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {t.items.reduce((n, i) => n + i.quantity, 0)} units · {nameOf(t.fromBranch)} → {nameOf(t.toBranch)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">Transfer · {t.items.length} line{t.items.length === 1 ? '' : 's'}</p>
                      </div>
                    </div>
                    <Pill tone={t.status === 'pending' ? 'warn' : 'info'}>{t.status.replace('_', ' ')}</Pill>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Fast-moving products" icon={<TrendingUp className="h-4 w-4" />} index={1}>
            {fastMoving.length === 0 ? <EmptyState label="No sales in this period." /> : (
              <ol className="space-y-2">
                {fastMoving.map((p, i) => (
                  <li key={p.name} className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                    <Pill tone="gold">{p.qty} sold</Pill>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        {/* -------------------------------------------------- Customer geography */}
        {booting ? <Skeleton className="h-64 rounded-2xl" /> : <CustomerGeography />}

        {/* -------------------------------------------------- Live stock matrix */}
        <StockMatrix />

        {/* -------------------------------------------------- Top transactions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Receipt className="h-4 w-4 text-primary" />
            <h3 style={{ fontSize: '1.05rem', lineHeight: 1.2 }}>Top transactions</h3>
          </div>
          {booting ? <Skeleton className="h-64 rounded-2xl" /> : (
            <DataTable
              columns={columns}
              rows={topSales}
              getRowId={(s) => s.id}
              csvName={`cofkans-executive-${period}-${new Date().toISOString().slice(0, 10)}`}
              emptyLabel="No transactions in this period."
            />
          )}
        </div>
      </div>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'var(--card)',
  color: 'var(--foreground)',
  fontSize: 12,
} as const;

export default ExecutiveDashboard;
