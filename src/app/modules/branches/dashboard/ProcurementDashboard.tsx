/**
 * COFKANS ELECTRICALS ERP — Procurement / Supply Dashboard.
 *
 * A company-wide supply-chain cockpit: spend & purchase-order KPIs, a spend-by-
 * category chart, an open purchase-orders pipeline, a supplier scorecard, and a
 * reorder worklist derived from live low-stock lines across every branch (each
 * row can be turned into a stock request). Backend-free — reads the module's
 * inventory + transfer services.
 */
import { useMemo, useState, useEffect } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  Truck, ClipboardList, PackageX, AlertTriangle, Coins, Boxes,
  Building2, ArrowUpFromLine, PackageCheck, Star, Plus, ChevronRight, Trash2, X,
} from 'lucide-react';
import { useBranches } from '../hooks/useBranches';
import { listInventory } from '../services/inventoryService';
import { raiseAlert } from '../services/transferService';
import { stockLevel } from '../utils/inventory';
import { formatCedis } from '../utils/format';
import {
  PageHeader, Panel, Pill, EmptyState, AnimatedCounter, DataTable, type DataColumn,
} from '../components/ui/pro';
import type { ProductInventory } from '../types/product-inventory';
import { store, onStoreChange, type PurchaseOrder, type PurchaseOrderStatus } from '../../../pages/developer-portal/store';

/** Live-updating view of the persisted purchase-order collection. */
function usePurchaseOrders(): PurchaseOrder[] {
  const [pos, setPos] = useState<PurchaseOrder[]>(() => store.getPurchaseOrders());
  useEffect(() => onStoreChange(() => setPos(store.getPurchaseOrders())), []);
  return pos;
}

const PIE_COLORS = ['#0F5132', '#10B981', '#6EE7B7', '#2563EB', '#8B5CF6', '#F59E0B'];

interface FlatItem extends ProductInventory { branchSlug: string; branchName: string }

/** Static supplier roster — replace with a vendors collection when the backend lands. */
const SUPPLIERS = [
  { id: 'sup1', name: 'Accra Cable & Wire Ltd', category: 'Cabling', onTime: 96, openPos: 3, spend: 184_500 },
  { id: 'sup2', name: 'Tema Lighting Imports', category: 'Lighting', onTime: 91, openPos: 2, spend: 132_000 },
  { id: 'sup3', name: 'Kumasi Switchgear Co.', category: 'Switchgear', onTime: 88, openPos: 4, spend: 97_800 },
  { id: 'sup4', name: 'Volta Power Solutions', category: 'Power', onTime: 99, openPos: 1, spend: 76_400 },
  { id: 'sup5', name: 'Ashanti Fixings & Tools', category: 'Accessories', onTime: 84, openPos: 5, spend: 54_200 },
];

type POStatus = 'draft' | 'sent' | 'confirmed' | 'received';
const PO_STYLE: Record<POStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-amber-500/10 text-amber-600',
  confirmed: 'bg-blue-500/10 text-blue-600',
  received: 'bg-emerald-500/10 text-emerald-600',
};

export function ProcurementDashboard() {
  const branches = useBranches();
  const purchaseOrders = usePurchaseOrders();
  const [showPoForm, setShowPoForm] = useState(false);
  const [raised, setRaised] = useState<Set<string>>(new Set());

  // Turn a reorder line into a real (draft) purchase order and notify the stock system.
  const raisePoForLine = (r: FlatItem) => {
    const qty = Math.max(r.reorderLevel ?? 10, 10);
    store.addPurchaseOrder({
      supplier: `${r.category ?? 'General'} supplier`,
      category: r.category ?? 'Reorder',
      branch: r.branchName,
      lines: 1,
      value: qty * r.price,
      status: 'draft',
    });
    raiseAlert({
      branchSlug: r.branchSlug, productId: r.productId, sku: r.sku,
      name: r.name ?? r.sku, requestedQty: qty, raisedBy: 'procurement',
    });
    setRaised((prev) => new Set(prev).add(`${r.branchSlug}-${r.sku}`));
  };

  const items = useMemo<FlatItem[]>(() => {
    const out: FlatItem[] = [];
    for (const b of branches) {
      for (const i of listInventory(b.slug)) out.push({ ...i, branchSlug: b.slug, branchName: b.name });
    }
    return out;
  }, [branches]);

  const reorder = useMemo(
    () => items.filter((i) => stockLevel(i) !== 'ok').sort((a, b) => a.quantity - b.quantity),
    [items],
  );

  const spendByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of SUPPLIERS) map.set(s.category, (map.get(s.category) ?? 0) + s.spend);
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, []);

  const avgOnTime = Math.round(SUPPLIERS.reduce((s, v) => s + v.onTime, 0) / SUPPLIERS.length);

  // Live purchase-order pipeline (persisted store collection).
  const openPos = purchaseOrders.filter((p) => p.status !== 'received').length;
  const totalSpend = purchaseOrders.reduce((s, p) => s + p.value, 0);

  const reorderCols: DataColumn<FlatItem>[] = [
    { key: 'name', header: 'Product', value: (r) => r.name ?? r.sku, render: (r) => <span className="truncate">{r.name ?? r.sku}</span> },
    { key: 'branch', header: 'Branch', value: (r) => r.branchName },
    { key: 'qty', header: 'On hand', align: 'right', value: (r) => r.quantity, sortable: true,
      render: (r) => <Pill tone={stockLevel(r) === 'out' ? 'down' : 'warn'}>{r.quantity}</Pill> },
    { key: 'reorder', header: 'Reorder at', align: 'right', value: (r) => r.reorderLevel ?? 0 },
    { key: 'est', header: 'Est. PO value', align: 'right', value: (r) => Math.max(r.reorderLevel ?? 10, 10) * r.price,
      render: (r) => formatCedis(Math.max(r.reorderLevel ?? 10, 10) * r.price),
      footer: (rs) => formatCedis(rs.reduce((s, r) => s + Math.max(r.reorderLevel ?? 10, 10) * r.price, 0)) },
    { key: 'action', header: '', align: 'right', value: () => '', sortable: false,
      render: (r) => {
        const done = raised.has(`${r.branchSlug}-${r.sku}`);
        return (
          <button disabled={done} onClick={() => raisePoForLine(r)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:cursor-default disabled:border-emerald-500/40 disabled:text-emerald-600 disabled:hover:border-emerald-500/40">
            {done ? <><PackageCheck className="h-3.5 w-3.5" /> PO raised</> : <><ArrowUpFromLine className="h-3.5 w-3.5" /> Raise PO</>}
          </button>
        );
      } },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">
        <PageHeader
          icon={<Truck className="h-6 w-6" strokeWidth={2.5} />}
          eyebrow="Supply · Procurement"
          title="Procurement Dashboard"
          subtitle={`${SUPPLIERS.length} active suppliers · ${reorder.length} lines to reorder`}
        />

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <Kpi icon={<Coins className="h-4 w-4" />} label="PO value" value={totalSpend} money tone="info" />
          <Kpi icon={<ClipboardList className="h-4 w-4" />} label="Open POs" value={openPos} tone="warn" />
          <Kpi icon={<Building2 className="h-4 w-4" />} label="Suppliers" value={SUPPLIERS.length} />
          <Kpi icon={<Star className="h-4 w-4" />} label="Avg on-time" value={avgOnTime} suffix="%" tone="ok" />
          <Kpi icon={<AlertTriangle className="h-4 w-4" />} label="To reorder" value={reorder.length} tone="warn" />
          <Kpi icon={<PackageX className="h-4 w-4" />} label="Out of stock" value={items.filter((i) => stockLevel(i) === 'out').length} tone="down" />
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Panel title="Spend by category" icon={<Boxes className="h-4 w-4" />} className="xl:col-span-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendByCategory} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis key="x" dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis key="y" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={54} tickFormatter={(v) => `₵${(v / 1000).toFixed(0)}k`} />
                  <Tooltip key="tip" contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} formatter={(v: number) => formatCedis(v)} />
                  <Bar key="spend" dataKey="value" name="Spend" fill="#0F5132" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Supplier mix" icon={<Building2 className="h-4 w-4" />}>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie key="pie" data={spendByCategory} dataKey="value" nameKey="name" innerRadius={52} outerRadius={90} paddingAngle={2}>
                    {spendByCategory.map((p, i) => <Cell key={p.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip key="tip" contentStyle={tooltipStyle} formatter={(v: number) => formatCedis(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Panel title="Purchase-order pipeline" icon={<ClipboardList className="h-4 w-4" />}
            action={(
              <button onClick={() => setShowPoForm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1 text-xs text-primary-foreground transition-opacity hover:opacity-90">
                <Plus className="h-3.5 w-3.5" /> New PO
              </button>
            )}>
            {purchaseOrders.length === 0 ? (
              <EmptyState label="No purchase orders yet — raise one to get started." />
            ) : (
              <div className="space-y-2">
                {purchaseOrders.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{p.ref} · {p.supplier}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.category} · {p.lines} lines · {formatCedis(p.value)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs capitalize ${PO_STYLE[p.status]}`}>{p.status}</span>
                      {p.status !== 'received' && (
                        <button title="Advance status" onClick={() => store.advancePurchaseOrder(p.id)}
                          className="rounded-lg border border-border p-1 text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button title="Delete" onClick={() => store.deletePurchaseOrder(p.id)}
                        className="rounded-lg border border-border p-1 text-muted-foreground transition-colors hover:border-red-500 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Supplier scorecard" icon={<Star className="h-4 w-4" />}
            action={<Pill tone="muted">{SUPPLIERS.length}</Pill>}>
            <div className="space-y-2">
              {SUPPLIERS.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{s.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.category} · {s.openPos} open POs · {formatCedis(s.spend)}</p>
                  </div>
                  <Pill tone={s.onTime >= 95 ? 'up' : s.onTime >= 88 ? 'warn' : 'down'}>{s.onTime}% on-time</Pill>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Reorder worklist" icon={<AlertTriangle className="h-4 w-4" />}
          action={<Pill tone={reorder.length ? 'warn' : 'up'}>{reorder.length}</Pill>}>
          {reorder.length === 0 ? (
            <div className="flex items-center gap-2 py-6 text-sm text-emerald-600"><PackageCheck className="h-4 w-4" /> Every stock line is healthy — nothing to reorder.</div>
          ) : (
            <DataTable columns={reorderCols} rows={reorder} getRowId={(r) => `${r.branchSlug}-${r.sku}`} csvName="reorder-worklist" minWidth={820} maxHeight={460} />
          )}
        </Panel>
      </div>

      {showPoForm && <PoForm branches={branches.map((b) => b.name)} onClose={() => setShowPoForm(false)} />}
    </div>
  );
}

/* --------------------------------------------------------------- subcomponents */

function PoForm({ branches, onClose }: { branches: string[]; onClose: () => void }) {
  const [supplier, setSupplier] = useState('');
  const [category, setCategory] = useState('Cables & Wiring');
  const [lines, setLines] = useState('1');
  const [value, setValue] = useState('');
  const [branch, setBranch] = useState(branches[0] ?? '');
  const [status, setStatus] = useState<PurchaseOrderStatus>('draft');

  const save = () => {
    if (!supplier.trim() || !value) return;
    store.addPurchaseOrder({
      supplier: supplier.trim(), category, branch,
      lines: Math.max(1, parseInt(lines, 10) || 1),
      value: Math.max(0, parseFloat(value) || 0),
      status,
    });
    onClose();
  };

  const field = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary';

  return (
    <div className="fixed inset-0 z-[9600] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 style={{ fontSize: '1.15rem' }}>New purchase order</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <label className="block"><span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Supplier</span>
            <input className={field} value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="e.g. Nexans Ghana" /></label>
          <label className="block"><span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Category</span>
            <input className={field} value={category} onChange={(e) => setCategory(e.target.value)} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Lines</span>
              <input className={field} type="number" min={1} value={lines} onChange={(e) => setLines(e.target.value)} /></label>
            <label className="block"><span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Value (₵)</span>
              <input className={field} type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" /></label>
          </div>
          <label className="block"><span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Branch</span>
            <select className={field} value={branch} onChange={(e) => setBranch(e.target.value)}>
              {branches.map((b) => <option key={b} value={b}>{b}</option>)}
            </select></label>
          <label className="block"><span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Status</span>
            <select className={field} value={status} onChange={(e) => setStatus(e.target.value as PurchaseOrderStatus)}>
              {(['draft', 'sent', 'confirmed', 'received'] as PurchaseOrderStatus[]).map((s) => <option key={s} value={s}>{s}</option>)}
            </select></label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">Cancel</button>
          <button onClick={save} disabled={!supplier.trim() || !value}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60">
            <Plus className="h-4 w-4" /> Create PO
          </button>
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, tone = 'default', money = false, suffix }: {
  icon: React.ReactNode; label: string; value: number; money?: boolean; suffix?: string;
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
        <AnimatedCounter value={value} format={money ? (n) => formatCedis(n) : undefined} />{suffix}
      </p>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12, border: '1px solid var(--border)',
  background: 'var(--popover)', color: 'var(--popover-foreground)', fontSize: 12,
} as const;

export default ProcurementDashboard;
