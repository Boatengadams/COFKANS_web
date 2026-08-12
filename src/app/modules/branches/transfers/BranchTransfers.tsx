/**
 * Multi-Branch Module — Transfer Request workflow (UI only, mock/localStorage).
 *
 * The full lifecycle, backend-free:
 *   1. Branch creates a request        → raiseAlert (status: pending)
 *   2. Showroom receives the request   → shown in the approvals queue
 *   3. Manager approves                → resolveAlert('approved') + createTransfer
 *   4. Receiving branch confirms       → deliverTransfer (status: delivered)
 *
 * Actions are gated by the permission system:
 *   - alert.raise    → branch front desk (create request)
 *   - alert.resolve  → showroom front desk / manager (approve / decline)
 *   - transfer.receive → receiving branch (confirm delivery)
 */
import { useMemo, useState } from 'react';
import {
  Plus, Send, CheckCircle2, XCircle, Truck, PackageCheck, Search, ArrowRight,
} from 'lucide-react';
import { PermissionProvider, usePermissions } from '../permissions';
import { useBranch, useBranches } from '../hooks/useBranches';
import { useBranchInventory } from '../hooks/useBranchInventory';
import { useStockAlerts, useTransfers } from '../hooks/useTransfers';
import {
  raiseAlert, resolveAlert, createTransfer, deliverTransfer,
} from '../services/transferService';
import { SHOWROOM_SLUG } from '../mock/branches.mock';
import { formatDate, formatDateTime } from '../utils/format';
import { getDemoRole, getDemoUser } from '../../../../lib/demo-mode';
import type { StockAlert, Transfer } from '../types/transfer';

export function BranchTransfers({ branchId }: { branchId: string }) {
  return (
    <PermissionProvider>
      <TransfersInner branchId={branchId} />
    </PermissionProvider>
  );
}

function TransfersInner({ branchId }: { branchId: string }) {
  const { can } = usePermissions();
  const branch = useBranch(branchId);
  const branches = useBranches();
  const alerts = useStockAlerts();
  const transfers = useTransfers();

  const canRequest = can('alert.raise');
  const canApprove = can('alert.resolve');
  const canReceive = can('transfer.receive');

  const nameOf = (slug: string) => branches.find((b) => b.slug === slug)?.name ?? slug;

  // Requests this branch raised.
  const myRequests = useMemo(
    () => alerts.filter((a) => a.branchSlug === branchId),
    [alerts, branchId],
  );
  // Pending requests awaiting approval (showroom/manager view — all branches).
  const pendingApprovals = useMemo(
    () => alerts.filter((a) => a.status === 'pending'),
    [alerts],
  );
  // Incoming transfers this branch must confirm.
  const incoming = useMemo(
    () => transfers.filter((t) => t.toBranch === branchId && t.status !== 'delivered' && t.status !== 'cancelled'),
    [transfers, branchId],
  );

  function approve(alert: StockAlert) {
    resolveAlert(alert.id, 'approved');
    const user = getDemoUser(getDemoRole());
    createTransfer({
      fromBranch: SHOWROOM_SLUG,
      toBranch: alert.branchSlug,
      items: [{ productId: alert.productId, sku: alert.sku, name: alert.name, quantity: alert.requestedQty }],
      createdBy: user?.uid ?? 'demo-user',
      alertId: alert.id,
      note: `Approved stock request for ${alert.name}`,
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <header className="space-y-1">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Stock Transfers</p>
          <h1>{branch?.name ?? branchId}</h1>
        </header>

        {/* Workflow stage tracker */}
        <StageTracker />

        {/* 1. Branch creates a request */}
        {canRequest && <CreateRequest branchId={branchId} />}

        {/* 3. Manager / Showroom approvals queue */}
        {canApprove && (
          <section className="bg-card border-2 border-border rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-600" />
              <h2>Requests awaiting approval</h2>
              <span className="text-muted-foreground">({pendingApprovals.length})</span>
            </div>
            {pendingApprovals.length === 0 ? (
              <Empty>No requests to review</Empty>
            ) : (
              <div className="divide-y divide-border">
                {pendingApprovals.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{a.name} <span className="text-muted-foreground">× {a.requestedQty}</span></p>
                      <p className="text-sm text-muted-foreground">From {nameOf(a.branchSlug)} · {formatDate(a.raisedAt)}</p>
                    </div>
                    <button onClick={() => approve(a)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors">
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => resolveAlert(a.id, 'declined')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors">
                      <XCircle className="w-4 h-4" /> Decline
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 4. Receiving branch confirms delivery */}
        {canReceive && (
          <section className="bg-card border-2 border-border rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              <h2>Incoming — confirm receipt</h2>
              <span className="text-muted-foreground">({incoming.length})</span>
            </div>
            {incoming.length === 0 ? (
              <Empty>Nothing incoming</Empty>
            ) : (
              <div className="divide-y divide-border">
                {incoming.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{t.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}</p>
                      <p className="text-sm text-muted-foreground">From {nameOf(t.fromBranch)} · {formatDateTime(t.createdAt)}</p>
                    </div>
                    <TransferStatusBadge status={t.status} />
                    <button onClick={() => deliverTransfer(t.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                      <PackageCheck className="w-4 h-4" /> Confirm
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* My requests (status trail) */}
        <section className="bg-card border-2 border-border rounded-2xl p-4 space-y-3">
          <h2>My requests</h2>
          {myRequests.length === 0 ? (
            <Empty>This branch hasn't requested any stock yet</Empty>
          ) : (
            <div className="divide-y divide-border">
              {myRequests.map((a) => {
                const linked = transfers.find((t) => t.alertId === a.id);
                return (
                  <div key={a.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{a.name} <span className="text-muted-foreground">× {a.requestedQty}</span></p>
                      <p className="text-sm text-muted-foreground">Raised {formatDate(a.raisedAt)}</p>
                    </div>
                    <AlertStatusBadge status={a.status} />
                    {linked && <TransferStatusBadge status={linked.status} />}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- create request */

function CreateRequest({ branchId }: { branchId: string }) {
  const inventory = useBranchInventory(branchId);
  const [query, setQuery] = useState('');
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [qty, setQty] = useState(10);
  const [done, setDone] = useState<string | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return inventory.items
      .filter((i) => `${i.name ?? ''} ${i.sku}`.toLowerCase().includes(q))
      .slice(0, 6);
  }, [inventory.items, query]);

  const selected = inventory.items.find((i) => i.sku === selectedSku);

  function submit() {
    if (!selected || qty <= 0) return;
    const user = getDemoUser(getDemoRole());
    raiseAlert({
      branchSlug: branchId,
      productId: selected.productId,
      sku: selected.sku,
      name: selected.name ?? selected.sku,
      requestedQty: qty,
      raisedBy: user?.uid ?? 'demo-user',
    });
    setDone(selected.name ?? selected.sku);
    setSelectedSku(null);
    setQuery('');
    setQty(10);
  }

  return (
    <section className="bg-card border-2 border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Plus className="w-4 h-4 text-primary" />
        <h2>Request stock from showroom</h2>
      </div>

      {done && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 text-emerald-600 px-3 py-2">
          <CheckCircle2 className="w-4 h-4" /> <span className="text-sm">Request sent for {done}</span>
        </div>
      )}

      {selected ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="truncate">{selected.name ?? selected.sku}</p>
            <p className="text-sm text-muted-foreground">{selected.sku} · {selected.quantity} in stock now</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Qty</label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-xl bg-background border-2 border-border outline-none focus:border-primary text-right"
            />
          </div>
          <button onClick={submit} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            Send request <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => setSelectedSku(null)} className="px-3 py-2 rounded-xl border-2 border-border text-muted-foreground hover:text-foreground">
            Change
          </button>
        </div>
      ) : (
        <div className="relative">
          <label className="relative block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setDone(null); }}
              placeholder="Search a product to request…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border-2 border-border outline-none focus:border-primary"
            />
          </label>
          {matches.length > 0 && (
            <div className="mt-2 border-2 border-border rounded-xl overflow-hidden divide-y divide-border">
              {matches.map((m) => (
                <button
                  key={m.sku}
                  onClick={() => setSelectedSku(m.sku)}
                  className="w-full text-left px-3 py-2.5 hover:bg-muted/40 transition-colors"
                >
                  <p className="truncate">{m.name ?? m.sku}</p>
                  <p className="text-sm text-muted-foreground">{m.sku} · {m.quantity} in stock</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ bits */

function StageTracker() {
  const steps = [
    { label: 'Branch requests', icon: <Plus className="w-4 h-4" /> },
    { label: 'Showroom receives', icon: <Send className="w-4 h-4" /> },
    { label: 'Manager approves', icon: <CheckCircle2 className="w-4 h-4" /> },
    { label: 'Branch confirms', icon: <PackageCheck className="w-4 h-4" /> },
  ];
  return (
    <section className="bg-card border-2 border-border rounded-2xl p-4">
      <div className="flex items-center justify-between gap-2 overflow-x-auto">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 text-foreground">
              <span className="text-primary">{s.icon}</span>
              <span className="text-sm whitespace-nowrap">{s.label}</span>
            </div>
            {i < steps.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />}
          </div>
        ))}
      </div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground py-4 text-center">{children}</p>;
}

function AlertStatusBadge({ status }: { status: StockAlert['status'] }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600',
    approved: 'bg-emerald-500/10 text-emerald-600',
    declined: 'bg-red-500/10 text-red-600',
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm shrink-0 ${map[status]}`}>{status}</span>;
}

function TransferStatusBadge({ status }: { status: Transfer['status'] }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600',
    claimed: 'bg-blue-500/10 text-blue-600',
    in_transit: 'bg-blue-500/10 text-blue-600',
    delivered: 'bg-emerald-500/10 text-emerald-600',
    cancelled: 'bg-muted text-muted-foreground',
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm shrink-0 ${map[status]}`}>{status.replace('_', ' ')}</span>;
}

export default BranchTransfers;
