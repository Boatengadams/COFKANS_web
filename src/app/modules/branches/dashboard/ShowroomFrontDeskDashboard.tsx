/**
 * Multi-Branch Module — Showroom Front Desk Dashboard.
 *
 * Landing view for the main-showroom front desk. This desk controls central
 * stock: it resolves branch stock alerts (approving one dispatches a transfer),
 * tracks outgoing transfers, and watches showroom stock & sales. Quick links
 * jump to the master catalog (pricing) and reports. Mock data only — no backend.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Store, Bell, Truck, Package, AlertTriangle, TrendingUp, CheckCircle2,
  XCircle, ArrowRight, Boxes, Tag, FileBarChart, MapPin,
} from 'lucide-react';
import { useStockAlerts, useTransfers } from '../hooks/useTransfers';
import { useBranches } from '../hooks/useBranches';
import { useBranchInventory } from '../hooks/useBranchInventory';
import { useBranchSales } from '../hooks/useSales';
import { resolveAlert, createTransfer } from '../services/transferService';
import { branchPath } from '../routes/paths';
import { formatCedis, formatDateTime } from '../utils/format';
import { getDemoRole, getDemoUser } from '../../../../lib/demo-mode';
import type { StockAlert } from '../types/transfer';
import type { Sale } from '../types/sale';

const DAY = 86_400_000;
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
const sumTotals = (sales: Sale[]) => sales.reduce((s, x) => s + x.totals.total, 0);

export function ShowroomFrontDeskDashboard({ branchId }: { branchId: string }) {
  const user = getDemoUser(getDemoRole());
  const createdBy = user?.uid ?? 'showroom-front-desk';

  const alerts = useStockAlerts();
  const transfers = useTransfers();
  const branches = useBranches();
  const inventory = useBranchInventory(branchId);
  const sales = useBranchSales(branchId);

  const branchName = useMemo(() => {
    const map: Record<string, string> = {};
    branches.forEach((b) => { map[b.slug] = b.name; });
    return (slug: string) => map[slug] ?? slug;
  }, [branches]);

  const pendingAlerts = useMemo(() => alerts.filter((a) => a.status === 'pending'), [alerts]);
  const activeTransfers = useMemo(
    () => transfers.filter((t) => t.status !== 'delivered' && t.status !== 'cancelled'),
    [transfers],
  );
  const todaySales = useMemo(() => {
    const today = startOfToday();
    return sales.filter((s) => new Date(s.soldAt).getTime() >= today);
  }, [sales]);

  function approve(alert: StockAlert) {
    resolveAlert(alert.id, 'approved');
    createTransfer({
      fromBranch: branchId,
      toBranch: alert.branchSlug,
      items: [{ productId: alert.productId, sku: alert.sku, name: alert.name, quantity: alert.requestedQty }],
      createdBy,
      alertId: alert.id,
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Showroom Front Desk</p>
            <h1>{branchName(branchId)}</h1>
            <p className="text-muted-foreground">Fulfil branch requests, dispatch stock and manage central pricing.</p>
          </div>
          <div className="flex gap-2">
            <Link to={branchPath(branchId, 'products')} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-white text-sm hover:opacity-90 transition-opacity">
              <Tag className="w-4 h-4" /> Manage prices
            </Link>
            <Link to={branchPath(branchId, 'reports')} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-border text-sm hover:border-primary transition-colors">
              <FileBarChart className="w-4 h-4" /> Reports
            </Link>
          </div>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi icon={<Bell className="w-4 h-4" />} label="Pending requests" value={String(pendingAlerts.length)} tone="accent" />
          <Kpi icon={<Truck className="w-4 h-4" />} label="Active transfers" value={String(activeTransfers.length)} tone="warn" />
          <Kpi icon={<TrendingUp className="w-4 h-4" />} label="Showroom sales today" value={formatCedis(sumTotals(todaySales))} tone="ok" />
          <Kpi icon={<AlertTriangle className="w-4 h-4" />} label="Low stock (showroom)" value={String(inventory.totals.lowStockCount + inventory.totals.outOfStockCount)} />
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Branch stock requests */}
          <section className="bg-card border-2 border-border rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground"><Bell className="w-5 h-5" /><h2 style={{ fontSize: '1rem' }}>Branch stock requests</h2></div>
            <div className="space-y-2">
              {pendingAlerts.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No open requests. All branches are stocked.</p>
              ) : (
                pendingAlerts.map((a) => (
                  <div key={a.id} className="rounded-xl border-2 border-border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate">{a.name}</p>
                        <p className="text-sm text-muted-foreground inline-flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{branchName(a.branchSlug)}</span>
                          <span>·</span>
                          <span>needs {a.requestedQty}</span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => approve(a)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-sm hover:opacity-90 transition-opacity">
                        <CheckCircle2 className="w-4 h-4" /> Approve & dispatch
                      </button>
                      <button onClick={() => resolveAlert(a.id, 'declined')} className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border-2 border-border text-sm text-muted-foreground hover:border-red-400 hover:text-red-600 transition-colors">
                        <XCircle className="w-4 h-4" /> Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Active transfers */}
          <section className="bg-card border-2 border-border rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground"><Truck className="w-5 h-5" /><h2 style={{ fontSize: '1rem' }}>Active transfers</h2></div>
              <Link to={branchPath(branchId, 'transfers')} className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
                All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-2">
              {activeTransfers.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No transfers in progress.</p>
              ) : (
                activeTransfers.slice(0, 6).map((t) => (
                  <div key={t.id} className="rounded-xl border-2 border-border p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate inline-flex items-center gap-1.5">
                        {branchName(t.fromBranch)} <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" /> {branchName(t.toBranch)}
                      </p>
                      <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
                        <Boxes className="w-3.5 h-3.5" />{t.items.reduce((s, i) => s + i.quantity, 0)} units · {formatDateTime(t.createdAt)}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 shrink-0 capitalize">{t.status.replace('_', ' ')}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Showroom inventory snapshot */}
        <section className="bg-card border-2 border-border rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground"><Package className="w-5 h-5" /><h2 style={{ fontSize: '1rem' }}>Showroom stock</h2></div>
            <Link to={branchPath(branchId, 'inventory')} className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
              Open inventory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Mini label="Products" value={inventory.totals.skuCount.toLocaleString()} />
            <Mini label="Units on hand" value={inventory.totals.unitsOnHand.toLocaleString()} />
            <Mini label="Low stock" value={inventory.totals.lowStockCount.toLocaleString()} tone="warn" />
            <Mini label="Out of stock" value={inventory.totals.outOfStockCount.toLocaleString()} tone="danger" />
          </div>
        </section>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- subcomponents */

function Kpi({ icon, label, value, tone }: {
  icon: React.ReactNode; label: string; value: string; tone?: 'ok' | 'warn' | 'accent';
}) {
  const toneClass =
    tone === 'ok' ? 'text-emerald-600' :
    tone === 'warn' ? 'text-amber-600' :
    tone === 'accent' ? 'text-primary' : 'text-foreground';
  return (
    <div className="bg-card border-2 border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-sm">{label}</span></div>
      <p className={`mt-2 ${toneClass}`} style={{ fontSize: '1.5rem', lineHeight: 1.1 }}>{value}</p>
    </div>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: 'warn' | 'danger' }) {
  const toneClass = tone === 'danger' ? 'text-red-600' : tone === 'warn' ? 'text-amber-600' : 'text-foreground';
  return (
    <div className="rounded-xl border-2 border-border p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 ${toneClass}`} style={{ fontSize: '1.25rem', lineHeight: 1.1 }}>{value}</p>
    </div>
  );
}

export default ShowroomFrontDeskDashboard;
