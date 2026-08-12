/**
 * COFKANS ELECTRICALS ERP — Company-wide Stock Matrix (Manager view).
 *
 * A single live grid that answers "what do we have, and where, right now?":
 *   • one row per product
 *   • one column per shop/branch showing that branch's quantity on hand
 *   • a running TOTAL column = the product's quantity across every branch
 *   • a headline "units in stock" figure for the whole company
 *
 * It is fully live: the grid subscribes to the module store, so the moment a
 * Front Desk sale is charged (stock decremented) or stock is added/transferred,
 * the branch cells and the totals update on their own — no refresh needed.
 *
 * Backend-free; reads the mock + localStorage service layer. Rendered inside the
 * green ".erp-theme" enterprise surface.
 */
import { useCallback, useMemo, useState } from 'react';
import { Boxes, Search, PackageX, Warehouse } from 'lucide-react';
import { useBranches } from '../hooks/useBranches';
import { useStoreSync } from '../hooks/useStoreSync';
import { listInventory } from '../services/inventoryService';
import { formatCedis } from '../utils/format';
import { Panel, Pill, EmptyState } from '../components/ui/pro';

interface MatrixRow {
  sku: string;
  name: string;
  category: string;
  price: number;
  /** branch slug → quantity on hand at that branch. */
  perBranch: Record<string, number>;
  /** total units across every branch, right now. */
  total: number;
}

export function StockMatrix() {
  const branches = useBranches();
  const slugKey = branches.map((b) => b.slug).join(',');

  // Live per-branch inventory snapshot — re-runs on every store mutation
  // (a sale, a restock, a transfer) so the grid always shows current stock.
  const [snapshot] = useStoreSync(
    useCallback(
      () => branches.map((b) => ({ slug: b.slug, items: listInventory(b.slug) })),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [slugKey],
    ),
  );

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [onlyLow, setOnlyLow] = useState(false);

  // Fold the per-branch snapshots into one row per product.
  const rows = useMemo<MatrixRow[]>(() => {
    const map = new Map<string, MatrixRow>();
    for (const { slug, items } of snapshot) {
      for (const it of items) {
        let row = map.get(it.sku);
        if (!row) {
          row = { sku: it.sku, name: it.name ?? it.sku, category: it.category ?? 'Other', price: it.price, perBranch: {}, total: 0 };
          map.set(it.sku, row);
        }
        row.perBranch[slug] = (row.perBranch[slug] ?? 0) + it.quantity;
        row.total += it.quantity;
        if (it.price) row.price = it.price;
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [snapshot]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) set.add(r.category);
    return ['all', ...[...set].sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => category === 'all' || r.category === category)
      .filter((r) => (onlyLow ? r.total <= 5 : true))
      .filter((r) => (q ? `${r.name} ${r.sku}`.toLowerCase().includes(q) : true));
  }, [rows, query, category, onlyLow]);

  const grandUnits = useMemo(() => filtered.reduce((n, r) => n + r.total, 0), [filtered]);
  const grandValue = useMemo(() => filtered.reduce((n, r) => n + r.total * r.price, 0), [filtered]);
  const outOfStock = useMemo(() => filtered.filter((r) => r.total === 0).length, [filtered]);

  return (
    <Panel
      title="Live stock across all shops"
      icon={<Warehouse className="h-4 w-4" />}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="up">{grandUnits.toLocaleString()} units live</Pill>
          <Pill tone="gold">{formatCedis(grandValue)}</Pill>
          {outOfStock > 0 && <Pill tone="warn">{outOfStock} out of stock</Pill>}
        </div>
      }
    >
      {/* Controls */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product or SKU…"
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="appearance-none rounded-xl border border-border bg-background px-3 py-2 text-sm capitalize outline-none focus:border-primary"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>
          ))}
        </select>
        <button
          onClick={() => setOnlyLow((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm transition-colors ${
            onlyLow ? 'border-amber-400 bg-amber-500/10 text-amber-600' : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <PackageX className="h-4 w-4" /> Low / out
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState label="No products match these filters." />
      ) : (
        <div className="overflow-x-auto scrollbar-hide rounded-xl border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/50 text-left">
                <th className="sticky left-0 z-10 bg-muted/50 px-3 py-2.5 font-medium backdrop-blur">Product</th>
                {branches.map((b) => (
                  <th key={b.slug} className="whitespace-nowrap px-3 py-2.5 text-right font-medium">{b.name}</th>
                ))}
                <th className="sticky right-0 z-10 bg-muted/50 px-3 py-2.5 text-right font-medium backdrop-blur">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.sku} className="border-t border-border transition-colors hover:bg-muted/30">
                  <td className="sticky left-0 z-10 bg-card px-3 py-2.5 backdrop-blur">
                    <div className="min-w-[160px]">
                      <p className="truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.sku} · {r.category}</p>
                    </div>
                  </td>
                  {branches.map((b) => {
                    const qty = r.perBranch[b.slug] ?? 0;
                    return (
                      <td key={b.slug} className="px-3 py-2.5 text-right tabular-nums">
                        {qty === 0 ? (
                          <span className="text-muted-foreground/50">—</span>
                        ) : (
                          <span className={qty <= 3 ? 'text-amber-600' : ''}>{qty}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="sticky right-0 z-10 bg-card px-3 py-2.5 text-right backdrop-blur">
                    <span className={`inline-flex min-w-[2.5rem] justify-center rounded-lg px-2 py-0.5 tabular-nums ${
                      r.total === 0 ? 'bg-red-500/10 text-red-600' : r.total <= 5 ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'
                    }`}>
                      {r.total}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/40">
                <td className="sticky left-0 z-10 bg-muted/40 px-3 py-2.5 font-medium backdrop-blur">
                  <span className="inline-flex items-center gap-1.5"><Boxes className="h-4 w-4 text-primary" /> All products</span>
                </td>
                {branches.map((b) => {
                  const colTotal = filtered.reduce((n, r) => n + (r.perBranch[b.slug] ?? 0), 0);
                  return <td key={b.slug} className="px-3 py-2.5 text-right font-medium tabular-nums">{colTotal.toLocaleString()}</td>;
                })}
                <td className="sticky right-0 z-10 bg-muted/40 px-3 py-2.5 text-right font-medium tabular-nums backdrop-blur">
                  {grandUnits.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Panel>
  );
}

export default StockMatrix;
