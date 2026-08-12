/**
 * Multi-Branch Module — Report Center / Business Analytics (UI only, mock data).
 *
 * A business-grade analytics workspace: period + branch scope filters, headline
 * KPIs with trend deltas, a set of statistical charts (revenue trend, sales by
 * branch, payment mix, top products) and an Excel-style, sortable + exportable
 * transactions grid.
 *
 * Backend-free: everything is computed from the mock/localStorage sales data.
 */
import { useMemo, useState } from 'react';
import {
  Calendar, Layers, TrendingUp, Wallet, ShoppingBag, Receipt, BarChart3,
  PieChart as PieIcon, Building2, Package,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { useSales } from '../hooks/useSales';
import { useBranches } from '../hooks/useBranches';
import { formatCedis, formatDate, formatDateTime } from '../utils/format';
import type { Sale } from '../types/sale';
import {
  PageHeader, StatCard, Panel, Pill, EmptyState, DataTable, type DataColumn,
} from '../components/ui/pro';

type PeriodId = 'daily' | 'weekly' | 'monthly' | 'six-months' | 'yearly' | 'custom';

const PERIODS: { id: PeriodId; label: string }[] = [
  { id: 'daily', label: 'Today' },
  { id: 'weekly', label: '7 Days' },
  { id: 'monthly', label: '30 Days' },
  { id: 'six-months', label: '6 Months' },
  { id: 'yearly', label: '12 Months' },
  { id: 'custom', label: 'Custom' },
];

/** Chart palette — violet-led, on brand. */
const PIE_COLORS = ['#7C3AED', '#A855F7', '#6366F1', '#9333EA', '#C084FC', '#4F46E5'];

/** [from, to] millisecond bounds for a period. */
function rangeFor(period: PeriodId, customFrom: string, customTo: string): [number, number] {
  const now = Date.now();
  const d = new Date();
  switch (period) {
    case 'daily': d.setHours(0, 0, 0, 0); return [d.getTime(), now];
    case 'weekly': d.setDate(d.getDate() - 7); return [d.getTime(), now];
    case 'monthly': d.setMonth(d.getMonth() - 1); return [d.getTime(), now];
    case 'six-months': d.setMonth(d.getMonth() - 6); return [d.getTime(), now];
    case 'yearly': d.setFullYear(d.getFullYear() - 1); return [d.getTime(), now];
    case 'custom': {
      const f = customFrom ? new Date(customFrom).getTime() : 0;
      const t = customTo ? new Date(customTo + 'T23:59:59').getTime() : now;
      return [f, t];
    }
  }
}

const DAY = 86_400_000;
const itemsIn = (s: Sale) => s.items.reduce((n, i) => n + i.quantity, 0);
const sumRevenue = (rows: Sale[]) => rows.reduce((sum, s) => sum + s.totals.total, 0);

/** Percentage change vs. the immediately-preceding window of equal length. */
function periodDelta(all: Sale[], slugs: string[], from: number, to: number): number {
  const span = to - from;
  const inRange = (s: Sale, a: number, b: number) => {
    const t = new Date(s.soldAt).getTime();
    return slugs.includes(s.branchSlug) && t >= a && t <= b;
  };
  const cur = sumRevenue(all.filter((s) => inRange(s, from, to)));
  const prev = sumRevenue(all.filter((s) => inRange(s, from - span, from)));
  if (!prev) return cur ? 100 : 0;
  return ((cur - prev) / prev) * 100;
}

export function ReportCenter() {
  const sales = useSales();
  const branches = useBranches();

  const [period, setPeriod] = useState<PeriodId>('monthly');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [selected, setSelected] = useState<string[]>([]); // empty = all (merged company-wide)

  const [from, to] = useMemo(
    () => rangeFor(period, customFrom, customTo),
    [period, customFrom, customTo],
  );

  const scopeSlugs = selected.length ? selected : branches.map((b) => b.slug);
  const merged = selected.length !== 1;
  const nameOf = (slug: string) => branches.find((b) => b.slug === slug)?.name ?? slug;

  const rows = useMemo<Sale[]>(() => {
    return sales.filter((s) => {
      const t = new Date(s.soldAt).getTime();
      return scopeSlugs.includes(s.branchSlug) && t >= from && t <= to;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sales, from, to, scopeSlugs.join(',')]);

  const totals = useMemo(() => {
    const revenue = sumRevenue(rows);
    const items = rows.reduce((n, s) => n + itemsIn(s), 0);
    return { revenue, salesCount: rows.length, items, avg: rows.length ? revenue / rows.length : 0 };
  }, [rows]);

  const revenueDelta = useMemo(
    () => periodDelta(sales, scopeSlugs, from, to),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sales, scopeSlugs.join(','), from, to],
  );

  /* -------------------------------------------------- chart series */

  // Revenue trend — bucket by month for long ranges, by day otherwise.
  const trend = useMemo(() => {
    const byMonth = to - from > 92 * DAY;
    const map = new Map<string, { label: string; revenue: number; sales: number; sort: number }>();
    for (const s of rows) {
      const dt = new Date(s.soldAt);
      const key = byMonth
        ? `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
        : dt.toISOString().slice(0, 10);
      const label = byMonth
        ? dt.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
        : dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const cur = map.get(key) ?? { label, revenue: 0, sales: 0, sort: dt.getTime() };
      cur.revenue += s.totals.total;
      cur.sales += 1;
      map.set(key, cur);
    }
    return [...map.values()].sort((a, b) => a.sort - b.sort);
  }, [rows, from, to]);

  // Sales by branch.
  const byBranch = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of rows) map.set(s.branchSlug, (map.get(s.branchSlug) ?? 0) + s.totals.total);
    return [...map.entries()]
      .map(([slug, revenue]) => ({ slug, name: nameOf(slug), revenue }))
      .sort((a, b) => b.revenue - a.revenue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, branches]);

  // Payment-method mix.
  const byPayment = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of rows) map.set(s.paymentMethod, (map.get(s.paymentMethod) ?? 0) + s.totals.total);
    return [...map.entries()].map(([method, value]) => ({
      name: method.replace(/-/g, ' '),
      value,
    }));
  }, [rows]);

  // Top products by revenue.
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; qty: number }>();
    for (const s of rows) {
      for (const i of s.items) {
        const cur = map.get(i.sku) ?? { name: i.name, revenue: 0, qty: 0 };
        cur.revenue += i.lineTotal;
        cur.qty += i.quantity;
        map.set(i.sku, cur);
      }
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [rows]);

  /* -------------------------------------------------- table columns */

  const columns = useMemo<DataColumn<Sale>[]>(() => {
    const cols: DataColumn<Sale>[] = [
      {
        key: 'reference', header: 'Reference', value: (s) => s.reference,
        render: (s) => <span className="font-medium">{s.reference}</span>,
        footer: () => 'Total',
      },
    ];
    if (merged) {
      cols.push({ key: 'branch', header: 'Branch', value: (s) => nameOf(s.branchSlug),
        render: (s) => <span className="text-muted-foreground">{nameOf(s.branchSlug)}</span> });
    }
    cols.push(
      { key: 'date', header: 'Date', value: (s) => new Date(s.soldAt).getTime(),
        render: (s) => <span className="text-muted-foreground">{formatDateTime(s.soldAt)}</span> },
      { key: 'items', header: 'Items', align: 'right', value: (s) => itemsIn(s),
        footer: (rs) => rs.reduce((n, s) => n + itemsIn(s), 0).toLocaleString() },
      { key: 'payment', header: 'Payment', value: (s) => s.paymentMethod,
        render: (s) => <span className="capitalize">{s.paymentMethod.replace(/-/g, ' ')}</span> },
      { key: 'status', header: 'Status', value: (s) => s.status,
        render: (s) => <Pill tone={s.status === 'paid' ? 'up' : s.status === 'refunded' || s.status === 'voided' ? 'down' : 'warn'}>{s.status}</Pill> },
      { key: 'total', header: 'Total', align: 'right', value: (s) => s.totals.total,
        render: (s) => <span className="font-medium">{formatCedis(s.totals.total)}</span>,
        footer: (rs) => <span className="text-primary">{formatCedis(sumRevenue(rs))}</span> },
    );
    return cols;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merged, branches]);

  function toggleBranch(slug: string) {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  const periodLabel = PERIODS.find((p) => p.id === period)?.label ?? '';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <PageHeader
          icon={<BarChart3 className="h-6 w-6" strokeWidth={2.5} />}
          eyebrow="Business Analytics"
          title="Reports & Insights"
          subtitle={
            <span>
              {merged ? (selected.length ? `${selected.length} branches merged` : 'All branches · company-wide') : nameOf(scopeSlugs[0])}
              {' · '}{formatDate(new Date(from).toISOString())} → {formatDate(new Date(to).toISOString())}
            </span>
          }
        />

        {/* --------------------------------------------- Filters */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Reporting period" icon={<Calendar className="h-4 w-4" />} index={0}>
            <div className="flex flex-wrap gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`rounded-xl border px-3.5 py-2 text-sm transition-colors ${
                    period === p.id ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {period === 'custom' && (
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <label className="flex-1">
                  <span className="text-sm text-muted-foreground">From</span>
                  <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary" />
                </label>
                <label className="flex-1">
                  <span className="text-sm text-muted-foreground">To</span>
                  <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary" />
                </label>
              </div>
            )}
          </Panel>

          <Panel
            title="Branch scope"
            icon={<Layers className="h-4 w-4" />}
            action={<Pill tone="gold">{selected.length === 0 ? 'All branches' : selected.length === 1 ? '1 branch' : `${selected.length} merged`}</Pill>}
            index={1}
          >
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelected([])}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  selected.length === 0 ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                All branches
              </button>
              {branches.map((b) => (
                <button
                  key={b.slug}
                  onClick={() => toggleBranch(b.slug)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    selected.includes(b.slug) ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </Panel>
        </div>

        {/* --------------------------------------------- KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard index={0} icon={<Wallet className="h-5 w-5" />} label="Total revenue"
            value={formatCedis(totals.revenue)} delta={revenueDelta}
            spark={trend.map((t) => t.revenue)} sub={`${periodLabel} vs. previous`} />
          <StatCard index={1} icon={<Receipt className="h-5 w-5" />} label="Transactions"
            value={totals.salesCount.toLocaleString()} spark={trend.map((t) => t.sales)} sparkTone="gold" />
          <StatCard index={2} icon={<ShoppingBag className="h-5 w-5" />} label="Items sold"
            value={totals.items.toLocaleString()} />
          <StatCard index={3} icon={<TrendingUp className="h-5 w-5" />} label="Average sale"
            value={formatCedis(totals.avg)} />
        </div>

        {rows.length === 0 ? (
          <Panel title="No data" index={0}>
            <EmptyState label="No sales fall within the current period and branch scope." />
          </Panel>
        ) : (
          <>
            {/* --------------------------------------------- Revenue trend */}
            <Panel title="Revenue trend" icon={<TrendingUp className="h-4 w-4" />}
              action={<Pill tone="muted">{periodLabel}</Pill>} index={0}>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                    <defs key="defs">
                      <linearGradient id="rc-rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--true-gold)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--true-gold)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis key="x" dataKey="label" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                    <YAxis key="y" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false}
                      width={70} tickFormatter={(v) => formatCedis(Number(v))} />
                    <Tooltip key="tip" formatter={(v: number) => formatCedis(v)} contentStyle={tooltipStyle} />
                    <Area key="area" type="monotone" dataKey="revenue" name="Revenue" stroke="var(--true-gold)" strokeWidth={2.5}
                      fill="url(#rc-rev)" isAnimationActive={false} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* --------------------------------------------- Branch + payment */}
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="Revenue by branch" icon={<Building2 className="h-4 w-4" />} index={0}>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byBranch} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                      <defs key="defs">
                        <linearGradient id="rc-branch" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#B8860B" />
                          <stop offset="100%" stopColor="var(--true-gold)" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                      <XAxis key="x" type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false}
                        tickFormatter={(v) => formatCedis(Number(v))} />
                      <YAxis key="y" type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                      <Tooltip key="tip" formatter={(v: number) => formatCedis(v)} contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
                      <Bar key="bar" dataKey="revenue" name="Revenue" radius={[0, 8, 8, 0]} fill="url(#rc-branch)" isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title="Payment mix" icon={<PieIcon className="h-4 w-4" />} index={1}>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie key="pie" data={byPayment} dataKey="value" nameKey="name" cx="50%" cy="50%"
                        innerRadius={58} outerRadius={92} paddingAngle={2} isAnimationActive={false}>
                        {byPayment.map((entry, i) => (
                          <Cell key={`pay-${entry.name}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip key="tip" formatter={(v: number) => formatCedis(v)} contentStyle={tooltipStyle} />
                      <Legend key="legend" verticalAlign="bottom" iconType="circle"
                        formatter={(v) => <span className="text-xs capitalize text-muted-foreground">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>

            {/* --------------------------------------------- Top products */}
            <Panel title="Top products by revenue" icon={<Package className="h-4 w-4" />} index={0}>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis key="x" dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false}
                      interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis key="y" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false}
                      width={70} tickFormatter={(v) => formatCedis(Number(v))} />
                    <Tooltip key="tip" formatter={(v: number) => formatCedis(v)} contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
                    <Bar key="bar" dataKey="revenue" name="Revenue" radius={[8, 8, 0, 0]} fill="var(--true-gold)" isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* --------------------------------------------- Transactions grid */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Receipt className="h-4 w-4 text-primary" />
                <h3 style={{ fontSize: '1.05rem', lineHeight: 1.2 }}>Transactions</h3>
              </div>
              <DataTable
                columns={columns}
                rows={rows}
                getRowId={(s) => s.id}
                csvName={`cofkans-report-${period}-${new Date().toISOString().slice(0, 10)}`}
              />
            </div>
          </>
        )}
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

export default ReportCenter;
