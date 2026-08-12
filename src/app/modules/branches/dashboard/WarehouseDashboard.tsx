/**
 * COFKANS ELECTRICALS ERP — Warehouse / Stock Control Dashboard.
 *
 * A company-wide stock control centre: animated inventory KPIs, stock-by-branch
 * and stock-health charts, an open stock-requests queue with approve/decline
 * actions, a live transfer pipeline, and a reorder worklist that raises stock
 * alerts. Backend-free — reads the module's inventory + transfer services.
 */
import { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  Warehouse, Boxes, Layers, AlertTriangle, PackageX, ArrowLeftRight,
  Coins, CheckCircle2, XCircle, ArrowUpFromLine, Truck, PackageCheck,
} from 'lucide-react';
import { useBranches } from '../hooks/useBranches';
import { useTransfers, useStockAlerts } from '../hooks/useTransfers';
import { listInventory } from '../services/inventoryService';
import { resolveAlert, raiseAlert } from '../services/transferService';
import { stockLevel } from '../utils/inventory';
import { formatCedis, formatDateTime } from '../utils/format';
import {
  PageHeader, Panel, Pill, EmptyState, AnimatedCounter, DataTable, type DataColumn,
} from '../components/ui/pro';
import type { ProductInventory } from '../types/product-inventory';
import type { Transfer, TransferStatus } from '../types/transfer';

const STATUS_COLORS = { healthy: '#0F5132', low: '#F59E0B', out: '#EF4444' } as const;

interface FlatItem extends ProductInventory { branchSlug: string; branchName: string }

export function WarehouseDashboard() {
  const branches = useBranches();
  const transfers = useTransfers();
  const alerts = useStockAlerts();

  const items = useMemo<FlatItem[]>(() => {
    const out: FlatItem[] = [];
    for (const b of branches) {
      for (const i of listInventory(b.slug)) out.push({ ...i, branchSlug: b.slug, branchName: b.name });
    }
    return out;
  }, [branches]);

  const stats = useMemo(() => {
    let units = 0, value = 0, low = 0, out = 0;
    for (const i of items) {
      units += i.quantity;
      value += i.quantity * i.price;
      const lvl = stockLevel(i);
      if (lvl === 'low') low += 1;
      if (lvl === 'out') out += 1;
    }
    return { skus: items.length, units, value, low, out, healthy: items.length - low - out };
  }, [items]);

  const byBranch = useMemo(() => branches.map((b) => ({
    name: b.name.replace(/^Kumasi\s*/i, '') || b.name,
    units: items.filter((i) => i.branchSlug === b.slug).reduce((s, i) => s + i.quantity, 0),
  })), [branches, items]);

  const health = [
    { name: 'Healthy', key: 'healthy', value: stats.healthy },
    { name: 'Low', key: 'low', value: stats.low },
    { name: 'Out', key: 'out', value: stats.out },
  ];

  const pendingAlerts = useMemo(() => alerts.filter((a) => a.status === 'pending'), [alerts]);
  const activeTransfers = useMemo(
    () => transfers.filter((t) => t.status !== 'delivered' && t.status !== 'cancelled'),
    [transfers],
  );
  const reorder = useMemo(
    () => items.filter((i) => stockLevel(i) !== 'ok').sort((a, b) => a.quantity - b.quantity).slice(0, 12),
    [items],
  );

  const reorderCols: DataColumn<FlatItem>[] = [
    { key: 'name', header: 'Product', value: (r) => r.name ?? r.sku, render: (r) => <span className="truncate">{r.name ?? r.sku}</span> },
    { key: 'branch', header: 'Branch', value: (r) => r.branchName },
    { key: 'qty', header: 'On hand', align: 'right', value: (r) => r.quantity, sortable: true,
      render: (r) => <Pill tone={stockLevel(r) === 'out' ? 'down' : 'warn'}>{r.quantity}</Pill> },
    { key: 'reorder', header: 'Reorder at', align: 'right', value: (r) => r.reorderLevel ?? 0 },
    { key: 'action', header: '', align: 'right', value: () => '', sortable: false,
      render: (r) => (
        <button onClick={() => raiseAlert({
          branchSlug: r.branchSlug, productId: r.productId, sku: r.sku,
          name: r.name ?? r.sku, requestedQty: Math.max(r.reorderLevel ?? 5, 1), raisedBy: 'warehouse',
        })}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
          <ArrowUpFromLine className="h-3.5 w-3.5" /> Restock
        </button>
      ) },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">
        <PageHeader
          icon={<Warehouse className="h-6 w-6" strokeWidth={2.5} />}
          eyebrow="Operations · Warehouse"
          title="Stock Control Centre"
          subtitle={`${branches.length} branches · ${stats.skus.toLocaleString()} stock lines tracked`}
        />

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
          <Kpi icon={<Layers className="h-4 w-4" />} label="Stock lines" value={stats.skus} />
          <Kpi icon={<Boxes className="h-4 w-4" />} label="Units on hand" value={stats.units} tone="info" />
          <Kpi icon={<Coins className="h-4 w-4" />} label="Stock value" value={stats.value} money tone="ok" />
          <Kpi icon={<AlertTriangle className="h-4 w-4" />} label="Low stock" value={stats.low} tone="warn" />
          <Kpi icon={<PackageX className="h-4 w-4" />} label="Out of stock" value={stats.out} tone="down" />
          <Kpi icon={<ArrowLeftRight className="h-4 w-4" />} label="Active transfers" value={activeTransfers.length} tone="info" />
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Panel title="Stock units by branch" icon={<Warehouse className="h-4 w-4" />} className="xl:col-span-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byBranch} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis key="x" dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis key="y" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip key="tip" contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} />
                  <Bar key="units" dataKey="units" name="Units" fill="#0F5132" radius={[6, 6, 0, 0]} maxBarSize={46} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Stock health" icon={<Layers className="h-4 w-4" />}>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie key="pie" data={health} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {health.map((h) => <Cell key={h.key} fill={STATUS_COLORS[h.key as keyof typeof STATUS_COLORS]} />)}
                  </Pie>
                  <Tooltip key="tip" contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              {health.map((h) => (
                <span key={h.key} className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[h.key as keyof typeof STATUS_COLORS] }} />
                  {h.name} · {h.value}
                </span>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Stock requests */}
          <Panel title="Open stock requests" icon={<ArrowUpFromLine className="h-4 w-4" />}
            action={<Pill tone={pendingAlerts.length ? 'warn' : 'up'}>{pendingAlerts.length}</Pill>}>
            {pendingAlerts.length === 0 ? (
              <EmptyState label="No pending stock requests." />
            ) : (
              <div className="space-y-2">
                {pendingAlerts.slice(0, 8).map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{a.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.branchSlug} · qty {a.requestedQty} · {formatDateTime(a.raisedAt)}</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button onClick={() => resolveAlert(a.id, 'approved')}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs text-primary-foreground hover:opacity-90">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button onClick={() => resolveAlert(a.id, 'declined')}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:border-red-500/50 hover:text-red-600">
                        <XCircle className="h-3.5 w-3.5" /> Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Transfer pipeline */}
          <Panel title="Transfer pipeline" icon={<Truck className="h-4 w-4" />}
            action={<Pill tone="info">{activeTransfers.length} active</Pill>}>
            {activeTransfers.length === 0 ? (
              <EmptyState label="No transfers in flight." />
            ) : (
              <div className="space-y-2">
                {activeTransfers.slice(0, 8).map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{branchShort(branches, t.fromBranch)} → {branchShort(branches, t.toBranch)}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {t.items.reduce((s, i) => s + i.quantity, 0)} units · {formatDateTime(t.createdAt)}
                      </p>
                    </div>
                    <TransferBadge status={t.status} />
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* Reorder worklist */}
        <Panel title="Reorder worklist" icon={<AlertTriangle className="h-4 w-4" />}
          action={<Pill tone={reorder.length ? 'warn' : 'up'}>{reorder.length}</Pill>}>
          {reorder.length === 0 ? (
            <div className="flex items-center gap-2 py-6 text-sm text-emerald-600"><PackageCheck className="h-4 w-4" /> All stock lines are healthy.</div>
          ) : (
            <DataTable columns={reorderCols} rows={reorder} getRowId={(r) => `${r.branchSlug}-${r.sku}`} csvName="reorder-worklist" minWidth={720} maxHeight={460} />
          )}
        </Panel>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- subcomponents */

function branchShort(branches: { slug: string; name: string }[], slug: string) {
  const b = branches.find((x) => x.slug === slug);
  return b ? b.name.replace(/^Kumasi\s*/i, '') || b.name : slug;
}

function Kpi({ icon, label, value, tone = 'default', money = false }: {
  icon: React.ReactNode; label: string; value: number; money?: boolean;
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
      <p className={`mt-2 ${toneClass}`} style={{ fontSize: money ? '1.5rem' : '1.9rem', lineHeight: 1.05 }}>
        <AnimatedCounter value={value} format={money ? (n) => formatCedis(n) : undefined} />
      </p>
    </div>
  );
}

const T_STYLE: Record<TransferStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  claimed: 'bg-blue-500/10 text-blue-600',
  in_transit: 'bg-amber-500/10 text-amber-600',
  delivered: 'bg-emerald-500/10 text-emerald-600',
  cancelled: 'bg-red-500/10 text-red-600',
};
const T_LABEL: Record<TransferStatus, string> = {
  pending: 'Pending', claimed: 'Claimed', in_transit: 'In transit', delivered: 'Delivered', cancelled: 'Cancelled',
};
function TransferBadge({ status }: { status: TransferStatus }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs ${T_STYLE[status]}`}>{T_LABEL[status]}</span>;
}

const tooltipStyle = {
  borderRadius: 12, border: '1px solid var(--border)',
  background: 'var(--popover)', color: 'var(--popover-foreground)', fontSize: 12,
} as const;

export default WarehouseDashboard;
