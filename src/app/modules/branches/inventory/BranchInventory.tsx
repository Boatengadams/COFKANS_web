/**
 * Multi-Branch Module — Branch Inventory screen.
 *
 * Full per-branch stock list at /branches/:branchId/inventory. Reads mock data
 * via hooks (no backend). Searchable + filterable by category and stock level.
 * Responsive: a scrollable table on desktop, stacked cards on mobile.
 */
import { useMemo, useState } from 'react';
import { Search, Package, AlertTriangle, Boxes, Filter, Plus, Minus, Lock, ArrowUpFromLine, Check } from 'lucide-react';
import { useBranch } from '../hooks/useBranches';
import { useBranchInventory } from '../hooks/useBranchInventory';
import { adjustStock } from '../services/inventoryService';
import { raiseAlert } from '../services/transferService';
import { stockLevel } from '../utils/inventory';
import { formatCedis } from '../utils/format';
import type { ProductInventory, StockLevel } from '../types/product-inventory';

/** Branches own their own stock quantity — adjust it in place (price is central). */
function adjustQty(branchSlug: string, sku: string, delta: number) {
  adjustStock(branchSlug, sku, delta, 'correction');
}

type LevelFilter = 'all' | StockLevel;

export function BranchInventory({ branchId }: { branchId: string }) {
  const branch = useBranch(branchId);
  const inventory = useBranchInventory(branchId);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState<LevelFilter>('all');
  const [requested, setRequested] = useState<Record<string, boolean>>({});

  /** Raise a low-stock alert to the showroom for this product (feeds transfers). */
  function requestRestock(item: ProductInventory) {
    const suggested = Math.max(item.reorderLevel * 2 - item.quantity, item.reorderLevel, 1);
    raiseAlert({
      branchSlug: branchId,
      productId: item.productId,
      sku: item.sku,
      name: item.name ?? item.sku,
      requestedQty: suggested,
      raisedBy: 'branch-front-desk',
    });
    setRequested((r) => ({ ...r, [item.sku]: true }));
  }

  const categories = useMemo(
    () => ['all', ...[...new Set(inventory.items.map((i) => i.category ?? 'Uncategorised'))].sort()],
    [inventory.items],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inventory.items.filter((i) => {
      if (category !== 'all' && (i.category ?? 'Uncategorised') !== category) return false;
      if (level !== 'all' && stockLevel(i) !== level) return false;
      if (q && !(`${i.name ?? ''} ${i.sku}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [inventory.items, query, category, level]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Inventory</p>
            <h1>{branch?.name ?? branchId}</h1>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-muted text-muted-foreground text-sm self-start">
            <Lock className="w-4 h-4" />
            Prices are set centrally · this branch owns its stock
          </div>
        </header>

        {/* Summary strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Tile icon={<Boxes className="w-4 h-4" />} label="Products" value={inventory.totals.skuCount.toLocaleString()} />
          <Tile icon={<Package className="w-4 h-4" />} label="Units on hand" value={inventory.totals.unitsOnHand.toLocaleString()} />
          <Tile icon={<AlertTriangle className="w-4 h-4" />} label="Low stock" value={inventory.totals.lowStockCount.toLocaleString()} tone="warn" />
          <Tile icon={<AlertTriangle className="w-4 h-4" />} label="Out of stock" value={inventory.totals.outOfStockCount.toLocaleString()} tone="danger" />
        </section>

        {/* Controls */}
        <section className="bg-card border-2 border-border rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
          <label className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or SKU…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border-2 border-border outline-none focus:border-primary"
            />
          </label>
          <div className="flex gap-3">
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="pl-9 pr-8 py-2.5 rounded-xl bg-background border-2 border-border outline-none focus:border-primary appearance-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>
                ))}
              </select>
            </div>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as LevelFilter)}
              className="px-3 py-2.5 rounded-xl bg-background border-2 border-border outline-none focus:border-primary appearance-none"
            >
              <option value="all">All stock</option>
              <option value="ok">In stock</option>
              <option value="low">Low</option>
              <option value="out">Out</option>
            </select>
          </div>
        </section>

        {/* Result count */}
        <p className="text-sm text-muted-foreground">
          Showing {rows.length.toLocaleString()} of {inventory.items.length.toLocaleString()} products
        </p>

        {/* Desktop table */}
        <section className="hidden md:block bg-card border-2 border-border rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <Th>Product</Th>
                <Th>Category</Th>
                <Th className="text-right">Price</Th>
                <Th className="text-center">Stock</Th>
                <Th className="text-right">Value</Th>
                <Th className="text-right">Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No matching products</td></tr>
              ) : (
                rows.map((i) => (
                  <tr key={i.sku} className="hover:bg-muted/30">
                    <Td>
                      <p className="truncate max-w-xs">{i.name ?? i.sku}</p>
                      <p className="text-sm text-muted-foreground">{i.sku}</p>
                    </Td>
                    <Td className="text-muted-foreground">{i.category ?? '—'}</Td>
                    <Td className="text-right">{formatCedis(i.price)}</Td>
                    <Td>
                      <div className="flex items-center justify-center gap-1">
                        <IconBtn onClick={() => adjustQty(branchId, i.sku, -1)} disabled={i.quantity <= 0}><Minus className="w-3.5 h-3.5" /></IconBtn>
                        <span className="w-8 text-center">{i.quantity}</span>
                        <IconBtn onClick={() => adjustQty(branchId, i.sku, 1)}><Plus className="w-3.5 h-3.5" /></IconBtn>
                      </div>
                    </Td>
                    <Td className="text-right">{formatCedis(i.price * i.quantity)}</Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <LevelBadge item={i} />
                        {stockLevel(i) !== 'ok' && (
                          <RestockButton done={!!requested[i.sku]} onClick={() => requestRestock(i)} />
                        )}
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* Mobile cards */}
        <section className="md:hidden space-y-3">
          {rows.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">No matching products</p>
          ) : (
            rows.map((i) => (
              <div key={i.sku} className="bg-card border-2 border-border rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate">{i.name ?? i.sku}</p>
                    <p className="text-sm text-muted-foreground">{i.sku} · {i.category ?? '—'}</p>
                  </div>
                  <LevelBadge item={i} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <Meta label="Price" value={formatCedis(i.price)} />
                  <Meta label="Value" value={formatCedis(i.price * i.quantity)} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Stock</span>
                  <div className="flex items-center gap-1">
                    <IconBtn onClick={() => adjustQty(branchId, i.sku, -1)} disabled={i.quantity <= 0}><Minus className="w-3.5 h-3.5" /></IconBtn>
                    <span className="w-10 text-center">{i.quantity}</span>
                    <IconBtn onClick={() => adjustQty(branchId, i.sku, 1)}><Plus className="w-3.5 h-3.5" /></IconBtn>
                  </div>
                </div>
                {stockLevel(i) !== 'ok' && (
                  <div className="mt-3">
                    <RestockButton done={!!requested[i.sku]} onClick={() => requestRestock(i)} full />
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- subcomponents */

function Tile({ icon, label, value, tone }: {
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

function IconBtn({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center w-7 h-7 rounded-lg border-2 border-border hover:border-primary text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}

function RestockButton({ done, onClick, full }: { done: boolean; onClick: () => void; full?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={done}
      className={`${full ? 'w-full justify-center' : ''} inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 text-sm transition-colors ${
        done
          ? 'border-emerald-500/40 text-emerald-600 cursor-default'
          : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
      }`}
    >
      {done ? <><Check className="w-3.5 h-3.5" />Requested</> : <><ArrowUpFromLine className="w-3.5 h-3.5" />Request restock</>}
    </button>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-sm ${className}`}>{children}</th>;
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p>{value}</p>
    </div>
  );
}

function LevelBadge({ item }: { item: ProductInventory }) {
  const level = stockLevel(item);
  const map: Record<StockLevel, string> = {
    ok: 'bg-emerald-500/10 text-emerald-600',
    low: 'bg-amber-500/10 text-amber-600',
    out: 'bg-red-500/10 text-red-600',
  };
  const label = level === 'ok' ? 'In stock' : level === 'low' ? 'Low' : 'Out';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm ${map[level]}`}>{label}</span>
  );
}

export default BranchInventory;
