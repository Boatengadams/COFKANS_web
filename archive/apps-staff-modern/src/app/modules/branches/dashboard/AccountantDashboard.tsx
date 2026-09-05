/**
 * COFKANS ELECTRICALS ERP — Accountant / Finance Dashboard.
 *
 * A company-wide finance cockpit: revenue, gross-profit, expense and net KPIs,
 * a revenue-vs-expense trend, a payment-method mix, a VAT summary, an accounts
 * receivable worklist (unpaid / partial sales) and a transactions ledger with
 * CSV export. Backend-free — derived from the module's sales service.
 */
import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, ComposedChart, Area, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
  Wallet, TrendingUp, Coins, Landmark, ReceiptText, PiggyBank,
  CreditCard, FileSpreadsheet, AlertCircle,
} from 'lucide-react';
import { useSales } from '../hooks/useSales';
import { formatCedis, formatDateTime } from '../utils/format';
import {
  PageHeader, Panel, Pill, EmptyState, AnimatedCounter, DataTable, type DataColumn,
} from '../components/ui/pro';
import type { Sale, PaymentMethod } from '../types/sale';

const MARGIN = 0.32;   // blended gross margin
const OPEX = 0.19;     // operating-expense ratio of revenue
const DAY = 86_400_000;
const PIE_COLORS = ['#0F5132', '#10B981', '#6EE7B7', '#2563EB', '#8B5CF6'];
const PM_LABEL: Record<PaymentMethod, string> = {
  cash: 'Cash', 'mobile-money': 'Mobile Money', card: 'Card', 'bank-transfer': 'Bank Transfer', credit: 'Credit',
};

type PeriodId = '7d' | '30d' | '90d' | 'all';
const PERIODS: { id: PeriodId; label: string; days: number }[] = [
  { id: '7d', label: '7 Days', days: 7 },
  { id: '30d', label: '30 Days', days: 30 },
  { id: '90d', label: '90 Days', days: 90 },
  { id: 'all', label: 'All time', days: 3650 },
];

export function AccountantDashboard() {
  const sales = useSales();
  const [period, setPeriod] = useState<PeriodId>('30d');
  const days = PERIODS.find((p) => p.id === period)!.days;

  const rows = useMemo(() => {
    const cutoff = Date.now() - days * DAY;
    return sales.filter((s) => new Date(s.soldAt).getTime() >= cutoff);
  }, [sales, days]);

  const fin = useMemo(() => {
    const revenue = rows.reduce((s, r) => s + r.totals.total, 0);
    const vat = rows.reduce((s, r) => s + r.totals.tax, 0);
    const profit = revenue * MARGIN;
    const expenses = revenue * OPEX;
    const net = profit - expenses;
    const receivable = rows
      .filter((r) => r.status === 'partial' || r.status === 'unpaid')
      .reduce((s, r) => s + (r.totals.total - r.amountPaid), 0);
    return { revenue, vat, profit, expenses, net, receivable };
  }, [rows]);

  const trend = useMemo(() => {
    const buckets = Math.min(days, 30);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Array.from({ length: buckets }, (_, i) => {
      const ts = today.getTime() - (buckets - 1 - i) * DAY;
      const dayRows = rows.filter((r) => {
        const t = new Date(r.soldAt).getTime();
        return t >= ts && t < ts + DAY;
      });
      const revenue = dayRows.reduce((s, r) => s + r.totals.total, 0);
      return {
        label: new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        revenue: Math.round(revenue),
        expenses: Math.round(revenue * OPEX),
      };
    });
  }, [rows, days]);

  const paymentMix = useMemo(() => {
    const map = new Map<PaymentMethod, number>();
    for (const r of rows) map.set(r.paymentMethod, (map.get(r.paymentMethod) ?? 0) + r.totals.total);
    return [...map.entries()].map(([method, value]) => ({ name: PM_LABEL[method], value: Math.round(value) }));
  }, [rows]);

  const receivables = useMemo(
    () => rows.filter((r) => r.status === 'partial' || r.status === 'unpaid')
      .sort((a, b) => (b.totals.total - b.amountPaid) - (a.totals.total - a.amountPaid)),
    [rows],
  );

  const arCols: DataColumn<Sale>[] = [
    { key: 'ref', header: 'Reference', value: (r) => r.reference },
    { key: 'customer', header: 'Customer', value: (r) => r.customer?.name ?? 'Walk-in' },
    { key: 'date', header: 'Date', value: (r) => r.soldAt, render: (r) => formatDateTime(r.soldAt), sortable: true },
    { key: 'total', header: 'Total', align: 'right', value: (r) => r.totals.total, render: (r) => formatCedis(r.totals.total), sortable: true },
    { key: 'paid', header: 'Paid', align: 'right', value: (r) => r.amountPaid, render: (r) => formatCedis(r.amountPaid) },
    { key: 'due', header: 'Outstanding', align: 'right', value: (r) => r.totals.total - r.amountPaid,
      render: (r) => <span className="text-red-600">{formatCedis(r.totals.total - r.amountPaid)}</span>, sortable: true,
      footer: (rs) => formatCedis(rs.reduce((s, r) => s + (r.totals.total - r.amountPaid), 0)) },
  ];

  const ledgerCols: DataColumn<Sale>[] = [
    { key: 'ref', header: 'Reference', value: (r) => r.reference },
    { key: 'branch', header: 'Branch', value: (r) => r.branchSlug },
    { key: 'date', header: 'Date', value: (r) => r.soldAt, render: (r) => formatDateTime(r.soldAt), sortable: true },
    { key: 'method', header: 'Method', value: (r) => PM_LABEL[r.paymentMethod] },
    { key: 'vat', header: 'VAT', align: 'right', value: (r) => r.totals.tax, render: (r) => formatCedis(r.totals.tax),
      footer: (rs) => formatCedis(rs.reduce((s, r) => s + r.totals.tax, 0)) },
    { key: 'total', header: 'Total', align: 'right', value: (r) => r.totals.total, render: (r) => formatCedis(r.totals.total), sortable: true,
      footer: (rs) => formatCedis(rs.reduce((s, r) => s + r.totals.total, 0)) },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">
        <PageHeader
          icon={<Wallet className="h-6 w-6" strokeWidth={2.5} />}
          eyebrow="Finance · Accounts"
          title="Finance Dashboard"
          subtitle={`${rows.length.toLocaleString()} transactions in period`}
          actions={
            <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-background/60 p-1">
              {PERIODS.map((p) => (
                <button key={p.id} onClick={() => setPeriod(p.id)}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    period === p.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}>{p.label}</button>
              ))}
            </div>
          }
        />

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <Kpi icon={<Coins className="h-4 w-4" />} label="Revenue" value={fin.revenue} tone="ok" />
          <Kpi icon={<TrendingUp className="h-4 w-4" />} label="Gross profit" value={fin.profit} tone="info" />
          <Kpi icon={<ReceiptText className="h-4 w-4" />} label="Expenses" value={fin.expenses} tone="warn" />
          <Kpi icon={<PiggyBank className="h-4 w-4" />} label="Net profit" value={fin.net} tone="ok" />
          <Kpi icon={<Landmark className="h-4 w-4" />} label="VAT collected" value={fin.vat} tone="info" />
          <Kpi icon={<AlertCircle className="h-4 w-4" />} label="Receivables" value={fin.receivable} tone="down" />
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Panel title="Revenue vs expenses" icon={<TrendingUp className="h-4 w-4" />} className="xl:col-span-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs key="defs">
                    <linearGradient id="acRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis key="x" dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} minTickGap={20} />
                  <YAxis key="y" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={54} tickFormatter={(v) => `₵${(v / 1000).toFixed(0)}k`} />
                  <Tooltip key="tip" contentStyle={tooltipStyle} formatter={(v: number) => formatCedis(v)} />
                  <Legend key="legend" wrapperStyle={{ fontSize: 12 }} />
                  <Area key="rev" type="monotone" dataKey="revenue" name="Revenue" stroke="#0F5132" strokeWidth={2} fill="url(#acRev)" />
                  <Line key="exp" type="monotone" dataKey="expenses" name="Expenses" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Payment mix" icon={<CreditCard className="h-4 w-4" />}>
            <div className="h-64 w-full">
              {paymentMix.length === 0 ? <EmptyState label="No payments in period." /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie key="pie" data={paymentMix} dataKey="value" nameKey="name" innerRadius={52} outerRadius={90} paddingAngle={2}>
                      {paymentMix.map((p, i) => <Cell key={p.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip key="tip" contentStyle={tooltipStyle} formatter={(v: number) => formatCedis(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Panel>
        </div>

        {/* Accounts receivable */}
        <Panel title="Accounts receivable" icon={<AlertCircle className="h-4 w-4" />}
          action={<Pill tone={receivables.length ? 'warn' : 'up'}>{receivables.length} open · {formatCedis(fin.receivable)}</Pill>}>
          {receivables.length === 0 ? (
            <EmptyState label="No outstanding balances. All sales settled." />
          ) : (
            <DataTable columns={arCols} rows={receivables} getRowId={(r) => r.id} csvName="accounts-receivable" minWidth={760} maxHeight={420} />
          )}
        </Panel>

        {/* Ledger */}
        <Panel title="Transaction ledger" icon={<FileSpreadsheet className="h-4 w-4" />}
          action={<Pill tone="muted">{rows.length} entries</Pill>}>
          {rows.length === 0 ? (
            <EmptyState label="No transactions in this period." />
          ) : (
            <DataTable columns={ledgerCols} rows={rows.slice(0, 100)} getRowId={(r) => r.id} csvName="ledger" minWidth={760} maxHeight={480} />
          )}
        </Panel>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- subcomponents */

function Kpi({ icon, label, value, tone = 'default' }: {
  icon: React.ReactNode; label: string; value: number;
  tone?: 'ok' | 'warn' | 'info' | 'down' | 'default';
}) {
  const toneClass =
    tone === 'ok' ? 'text-emerald-600' :
    tone === 'warn' ? 'text-amber-600' :
    tone === 'down' ? 'text-red-600' :
    tone === 'info' ? 'text-primary' : 'text-foreground';
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-sm">{label}</span></div>
      <p className={`mt-2 ${toneClass}`} style={{ fontSize: '1.5rem', lineHeight: 1.1 }}>
        <AnimatedCounter value={value} format={(n) => formatCedis(n)} />
      </p>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12, border: '1px solid var(--border)',
  background: 'var(--popover)', color: 'var(--popover-foreground)', fontSize: 12,
} as const;

export default AccountantDashboard;
