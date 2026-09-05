/**
 * Multi-Branch Module — Superior Showroom (Manager) Dashboard.
 *
 * A company-wide control view for the manager, spanning every branch. Unlike
 * the single-branch BranchDashboard, this rolls up all branches and offers
 * cross-branch actions. Backend-free: all data comes from the module's mock +
 * localStorage service layer (no Firebase).
 *
 * Sections (tabbed):
 *   - Overview      → Company Statistics + Performance Overview (chart)
 *   - Branches      → All Branch Statistics (per-branch cards)
 *   - Inventory     → Live Inventory (company + per-branch health)
 *   - Transfers     → Transfer Requests (stock alerts + active transfers)
 *   - Pricing       → Price Management (edit prices per branch)
 *
 * Responsive throughout.
 */
import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  Building2, TrendingUp, Boxes, ArrowLeftRight, Tag, Search,
  AlertTriangle, CheckCircle2, XCircle, Package, Wallet, Receipt as ReceiptIcon,
} from 'lucide-react';
import { useBranches } from '../hooks/useBranches';
import { useSales } from '../hooks/useSales';
import { useTransfers, useStockAlerts } from '../hooks/useTransfers';
import { getBranchInventory, listInventory, setInventory } from '../services/inventoryService';
import { resolveAlert } from '../services/transferService';
import { computeInventoryTotals, stockLevel } from '../utils/inventory';
import { formatCedis, formatDate, formatDateTime } from '../utils/format';
import type { StatPeriod } from '../types/branch-statistics';
import type { BranchDetail } from '../types/branch';

type Tab = 'overview' | 'branches' | 'inventory' | 'transfers' | 'pricing';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'branches', label: 'Branches', icon: <Building2 className="w-4 h-4" /> },
  { id: 'inventory', label: 'Inventory', icon: <Boxes className="w-4 h-4" /> },
  { id: 'transfers', label: 'Transfers', icon: <ArrowLeftRight className="w-4 h-4" /> },
  { id: 'pricing', label: 'Pricing', icon: <Tag className="w-4 h-4" /> },
];

const PERIODS: { id: StatPeriod; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: '7 days' },
  { id: 'month', label: '30 days' },
];

function periodStartTs(period: StatPeriod): number {
  const now = new Date();
  const d = new Date(now);
  if (period === 'today') d.setHours(0, 0, 0, 0);
  else if (period === 'week') d.setDate(now.getDate() - 7);
  else d.setMonth(now.getMonth() - 1);
  return d.getTime();
}

interface BranchRollup {
  branch: BranchDetail;
  revenue: number;
  salesCount: number;
  itemsSold: number;
  avgSale: number;
  unitsOnHand: number;
  stockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  skuCount: number;
}

export function SuperiorShowroomDashboard() {
  const branches = useBranches();
  const sales = useSales();
  const transfers = useTransfers();
  const alerts = useStockAlerts();

  const [tab, setTab] = useState<Tab>('overview');
  const [period, setPeriod] = useState<StatPeriod>('month');

  const rollups = useMemo<BranchRollup[]>(() => {
    const from = periodStartTs(period);
    return branches.map((branch) => {
      const bSales = sales.filter(
        (s) => s.branchSlug === branch.slug && new Date(s.soldAt).getTime() >= from,
      );
      const revenue = bSales.reduce((sum, s) => sum + s.totals.total, 0);
      const itemsSold = bSales.reduce((n, s) => n + s.items.reduce((m, i) => m + i.quantity, 0), 0);
      const inv = getBranchInventory(branch.slug).totals;
      return {
        branch,
        revenue,
        salesCount: bSales.length,
        itemsSold,
        avgSale: bSales.length ? revenue / bSales.length : 0,
        unitsOnHand: inv.unitsOnHand,
        stockValue: inv.stockValue,
        lowStockCount: inv.lowStockCount,
        outOfStockCount: inv.outOfStockCount,
        skuCount: inv.skuCount,
      };
    });
  }, [branches, sales, period]);

  const company = useMemo(() => {
    return rollups.reduce(
      (acc, r) => ({
        revenue: acc.revenue + r.revenue,
        salesCount: acc.salesCount + r.salesCount,
        itemsSold: acc.itemsSold + r.itemsSold,
        stockValue: acc.stockValue + r.stockValue,
        unitsOnHand: acc.unitsOnHand + r.unitsOnHand,
        lowStockCount: acc.lowStockCount + r.lowStockCount,
        outOfStockCount: acc.outOfStockCount + r.outOfStockCount,
      }),
      { revenue: 0, salesCount: 0, itemsSold: 0, stockValue: 0, unitsOnHand: 0, lowStockCount: 0, outOfStockCount: 0 },
    );
  }, [rollups]);

  const pendingAlerts = alerts.filter((a) => a.status === 'pending');
  const activeTransfers = transfers.filter((t) => t.status !== 'delivered' && t.status !== 'cancelled');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Superior Showroom</p>
            <h1>Company Dashboard</h1>
          </div>
          <div className="inline-flex rounded-xl border-2 border-border overflow-hidden self-start">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-2 text-sm transition-colors ${
                  period === p.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </header>

        {/* Tabs */}
        <nav className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const badge = t.id === 'transfers' && pendingAlerts.length > 0 ? pendingAlerts.length : undefined;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 whitespace-nowrap transition-colors ${
                  tab === t.id ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.icon}
                {t.label}
                {badge !== undefined && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {tab === 'overview' && <OverviewTab company={company} rollups={rollups} />}
        {tab === 'branches' && <BranchesTab rollups={rollups} />}
        {tab === 'inventory' && <InventoryTab company={company} rollups={rollups} />}
        {tab === 'transfers' && <TransfersTab alerts={alerts} transfers={transfers} branches={branches} active={activeTransfers} />}
        {tab === 'pricing' && <PricingTab branches={branches} />}
      </div>
    </div>
  );
}

/* ============================================================ Overview tab */

function OverviewTab({ company, rollups }: { company: CompanyStats; rollups: BranchRollup[] }) {
  const chartData = useMemo(
    () => rollups.map((r) => ({ name: r.branch.name.replace(/^COFKANS\s*/i, ''), revenue: Math.round(r.revenue) })),
    [rollups],
  );

  return (
    <div className="space-y-6">
      {/* Company Statistics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={<Wallet className="w-4 h-4" />} label="Total revenue" value={formatCedis(company.revenue)} />
        <Kpi icon={<ReceiptIcon className="w-4 h-4" />} label="Total sales" value={company.salesCount.toLocaleString()} />
        <Kpi icon={<Package className="w-4 h-4" />} label="Items sold" value={company.itemsSold.toLocaleString()} />
        <Kpi icon={<Boxes className="w-4 h-4" />} label="Stock value" value={formatCedis(company.stockValue)} />
      </section>

      {/* Performance Overview */}
      <section className="bg-card border-2 border-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2>Performance overview — revenue by branch</h2>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} width={48} />
              <Tooltip
                cursor={{ fill: 'var(--muted)' }}
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}
                formatter={(v: number) => [formatCedis(v), 'Revenue']}
              />
              <Bar dataKey="revenue" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="bg-card border-2 border-border rounded-2xl p-4">
        <h2 className="mb-3">Top performing branches</h2>
        <div className="divide-y divide-border">
          {[...rollups].sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((r, i) => (
            <div key={r.branch.slug} className="flex items-center gap-3 py-3">
              <span className="w-6 text-muted-foreground">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate">{r.branch.name}</p>
                <p className="text-sm text-muted-foreground">{r.salesCount} sales · {r.itemsSold} items</p>
              </div>
              <span>{formatCedis(r.revenue)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ============================================================ Branches tab */

function BranchesTab({ rollups }: { rollups: BranchRollup[] }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {rollups.map((r) => (
        <div key={r.branch.slug} className="bg-card border-2 border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate">{r.branch.name}</p>
              <p className="text-sm text-muted-foreground truncate">{r.branch.city ?? r.branch.slug}</p>
            </div>
            <StatusPill status={r.branch.status} />
          </div>
          <p style={{ fontSize: '1.5rem', lineHeight: 1.1 }}>{formatCedis(r.revenue)}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <Meta label="Sales" value={r.salesCount.toLocaleString()} />
            <Meta label="Avg. sale" value={formatCedis(r.avgSale)} />
            <Meta label="Items sold" value={r.itemsSold.toLocaleString()} />
            <Meta label="Units on hand" value={r.unitsOnHand.toLocaleString()} />
            <Meta label="Low stock" value={r.lowStockCount.toLocaleString()} tone={r.lowStockCount ? 'warn' : undefined} />
            <Meta label="Out of stock" value={r.outOfStockCount.toLocaleString()} tone={r.outOfStockCount ? 'danger' : undefined} />
          </div>
        </div>
      ))}
    </section>
  );
}

/* ============================================================ Inventory tab */

function InventoryTab({ company, rollups }: { company: CompanyStats; rollups: BranchRollup[] }) {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={<Boxes className="w-4 h-4" />} label="Total stock value" value={formatCedis(company.stockValue)} />
        <Kpi icon={<Package className="w-4 h-4" />} label="Units on hand" value={company.unitsOnHand.toLocaleString()} />
        <Kpi icon={<AlertTriangle className="w-4 h-4" />} label="Low stock" value={company.lowStockCount.toLocaleString()} tone="warn" />
        <Kpi icon={<AlertTriangle className="w-4 h-4" />} label="Out of stock" value={company.outOfStockCount.toLocaleString()} tone="danger" />
      </section>

      <section className="bg-card border-2 border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border"><h2>Live inventory by branch</h2></div>
        {/* desktop table */}
        <table className="w-full text-left hidden md:table">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <Th>Branch</Th>
              <Th className="text-right">Products</Th>
              <Th className="text-right">Units</Th>
              <Th className="text-right">Stock value</Th>
              <Th className="text-right">Low</Th>
              <Th className="text-right">Out</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rollups.map((r) => (
              <tr key={r.branch.slug} className="hover:bg-muted/30">
                <Td>{r.branch.name}</Td>
                <Td className="text-right">{r.skuCount.toLocaleString()}</Td>
                <Td className="text-right">{r.unitsOnHand.toLocaleString()}</Td>
                <Td className="text-right">{formatCedis(r.stockValue)}</Td>
                <Td className="text-right text-amber-600">{r.lowStockCount || '—'}</Td>
                <Td className="text-right text-red-600">{r.outOfStockCount || '—'}</Td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* mobile cards */}
        <div className="md:hidden divide-y divide-border">
          {rollups.map((r) => (
            <div key={r.branch.slug} className="p-4">
              <p>{r.branch.name}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <Meta label="Products" value={r.skuCount.toLocaleString()} />
                <Meta label="Units" value={r.unitsOnHand.toLocaleString()} />
                <Meta label="Value" value={formatCedis(r.stockValue)} />
                <Meta label="Low" value={String(r.lowStockCount)} tone={r.lowStockCount ? 'warn' : undefined} />
                <Meta label="Out" value={String(r.outOfStockCount)} tone={r.outOfStockCount ? 'danger' : undefined} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ============================================================ Transfers tab */

function TransfersTab({
  alerts, transfers, branches, active,
}: {
  alerts: ReturnType<typeof useStockAlerts>;
  transfers: ReturnType<typeof useTransfers>;
  branches: BranchDetail[];
  active: ReturnType<typeof useTransfers>;
}) {
  const nameOf = (slug: string) => branches.find((b) => b.slug === slug)?.name ?? slug;
  const pending = alerts.filter((a) => a.status === 'pending');
  const resolved = alerts.filter((a) => a.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Transfer requests (stock alerts) */}
      <section className="bg-card border-2 border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <h2>Transfer requests</h2>
          <span className="text-muted-foreground">({pending.length} pending)</span>
        </div>
        {pending.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center">No pending requests</p>
        ) : (
          <div className="divide-y divide-border">
            {pending.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate">{a.name} <span className="text-muted-foreground">× {a.requestedQty}</span></p>
                  <p className="text-sm text-muted-foreground">{nameOf(a.branchSlug)} · {formatDate(a.raisedAt)}</p>
                </div>
                <button
                  onClick={() => resolveAlert(a.id, 'approved')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => resolveAlert(a.id, 'declined')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Decline
                </button>
              </div>
            ))}
          </div>
        )}
        {resolved.length > 0 && (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground mb-2">Recently resolved</p>
            <div className="divide-y divide-border">
              {resolved.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="truncate">{a.name} × {a.requestedQty} · {nameOf(a.branchSlug)}</span>
                  <TransferStatusBadge status={a.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Active transfers */}
      <section className="bg-card border-2 border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-primary" />
          <h2>Active transfers</h2>
          <span className="text-muted-foreground">({active.length})</span>
        </div>
        {transfers.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center">No transfers</p>
        ) : (
          <div className="divide-y divide-border">
            {transfers.slice(0, 12).map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate">{nameOf(t.fromBranch)} → {nameOf(t.toBranch)}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.items.length} item{t.items.length === 1 ? '' : 's'} · {formatDateTime(t.createdAt)}
                    {t.driverName ? ` · ${t.driverName}` : ''}
                  </p>
                </div>
                <TransferStatusBadge status={t.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ============================================================ Pricing tab */

function PricingTab({ branches }: { branches: BranchDetail[] }) {
  const [branchSlug, setBranchSlug] = useState(branches[0]?.slug ?? '');
  const [query, setQuery] = useState('');
  const [savedSku, setSavedSku] = useState<string | null>(null);
  const [version, setVersion] = useState(0); // force re-read after a save

  const rows = useMemo(() => {
    if (!branchSlug) return [];
    const q = query.trim().toLowerCase();
    return listInventory(branchSlug)
      .filter((i) => (q ? `${i.name ?? ''} ${i.sku}`.toLowerCase().includes(q) : true))
      .slice(0, 40);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchSlug, query, version]);

  function savePrice(sku: string, price: number) {
    if (!Number.isFinite(price) || price < 0) return;
    setInventory(branchSlug, sku, { price });
    setSavedSku(sku);
    setVersion((v) => v + 1);
  }

  return (
    <div className="space-y-4">
      <section className="bg-card border-2 border-border rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <select
          value={branchSlug}
          onChange={(e) => { setBranchSlug(e.target.value); setSavedSku(null); }}
          className="px-3 py-2.5 rounded-xl bg-background border-2 border-border outline-none focus:border-primary appearance-none"
        >
          {branches.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
        </select>
        <label className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border-2 border-border outline-none focus:border-primary"
          />
        </label>
      </section>

      <section className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">No products found</p>
        ) : (
          rows.map((r) => (
            <PriceRow key={r.sku} sku={r.sku} name={r.name ?? r.sku} current={r.price} saved={savedSku === r.sku} onSave={savePrice} />
          ))
        )}
      </section>
    </div>
  );
}

function PriceRow({
  sku, name, current, saved, onSave,
}: {
  sku: string; name: string; current: number; saved: boolean; onSave: (sku: string, price: number) => void;
}) {
  const [value, setValue] = useState(String(current));
  const changed = Number(value) !== current;

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-4 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate">{name}</p>
        <p className="text-sm text-muted-foreground">{sku} · current {formatCedis(current)}</p>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground text-sm">GH₵</span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-28 px-3 py-2 rounded-xl bg-background border-2 border-border outline-none focus:border-primary text-right"
        />
      </div>
      <button
        onClick={() => onSave(sku, Number(value))}
        disabled={!changed}
        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {saved && !changed ? 'Saved' : 'Save'}
      </button>
    </div>
  );
}

/* ============================================================ shared bits */

interface CompanyStats {
  revenue: number; salesCount: number; itemsSold: number; stockValue: number;
  unitsOnHand: number; lowStockCount: number; outOfStockCount: number;
}

function Kpi({ icon, label, value, tone }: {
  icon: React.ReactNode; label: string; value: string; tone?: 'warn' | 'danger';
}) {
  const toneClass = tone === 'danger' ? 'text-red-600' : tone === 'warn' ? 'text-amber-600' : 'text-foreground';
  return (
    <div className="bg-card border-2 border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-sm">{label}</span></div>
      <p className={`mt-2 ${toneClass}`} style={{ fontSize: '1.5rem', lineHeight: 1.1 }}>{value}</p>
    </div>
  );
}

function Meta({ label, value, tone }: { label: string; value: string; tone?: 'warn' | 'danger' }) {
  const toneClass = tone === 'danger' ? 'text-red-600' : tone === 'warn' ? 'text-amber-600' : 'text-foreground';
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className={toneClass}>{value}</p>
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-sm ${className}`}>{children}</th>;
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function StatusPill({ status }: { status?: string }) {
  const map: Record<string, string> = {
    open: 'bg-emerald-500/10 text-emerald-600',
    closed: 'bg-muted text-muted-foreground',
    maintenance: 'bg-amber-500/10 text-amber-600',
    archived: 'bg-muted text-muted-foreground',
  };
  const s = status ?? 'open';
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm shrink-0 ${map[s] ?? 'bg-muted text-muted-foreground'}`}>{s}</span>;
}

function TransferStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600',
    claimed: 'bg-blue-500/10 text-blue-600',
    in_transit: 'bg-blue-500/10 text-blue-600',
    delivered: 'bg-emerald-500/10 text-emerald-600',
    cancelled: 'bg-muted text-muted-foreground',
    approved: 'bg-emerald-500/10 text-emerald-600',
    declined: 'bg-red-500/10 text-red-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm shrink-0 ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

export default SuperiorShowroomDashboard;
