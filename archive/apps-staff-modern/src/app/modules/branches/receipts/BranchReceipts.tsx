/**
 * Multi-Branch Module — Receipt pages (UI only, mock data).
 *
 * At /branches/:branchId/receipts. Provides:
 *   - Receipt History  → every receipt for the branch (from its sales)
 *   - Receipt Search   → filter by reference / customer / item
 *   - Receipt Preview  → open a full receipt
 *   - Reprint          → native browser print (no PDF generation)
 *
 * Receipts are derived from the branch's persisted sales via the mock service.
 */
import { useMemo, useState } from 'react';
import { Search, Receipt as ReceiptIcon, Eye } from 'lucide-react';
import { useBranch } from '../hooks/useBranches';
import { useBranchSales } from '../hooks/useSales';
import { buildReceipt } from '../services/saleService';
import { formatCedis, formatDateTime } from '../utils/format';
import { ReceiptView } from './ReceiptView';
import type { Receipt } from '../types/receipt';

export function BranchReceipts({ branchId }: { branchId: string }) {
  const branch = useBranch(branchId);
  const sales = useBranchSales(branchId);

  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Receipt | null>(null);

  // Derive a receipt per sale (issued date pinned to the sale time).
  const receipts = useMemo<Receipt[]>(() => {
    return sales
      .map((s) => {
        const r = buildReceipt(s.id);
        return r ? { ...r, issuedAt: s.soldAt } : null;
      })
      .filter((r): r is Receipt => r !== null);
  }, [sales]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return receipts;
    return receipts.filter((r) => {
      if (r.reference.toLowerCase().includes(q)) return true;
      if (r.customer?.name?.toLowerCase().includes(q)) return true;
      return r.items.some((it) => it.name.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q));
    });
  }, [receipts, query]);

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <header className="space-y-1">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Receipts</p>
            <h1>{branch?.name ?? branchId}</h1>
          </header>

          {/* Receipt Search */}
          <section className="bg-card border-2 border-border rounded-2xl p-4">
            <label className="relative block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by receipt no., customer, or item…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border-2 border-border outline-none focus:border-primary"
              />
            </label>
          </section>

          <p className="text-sm text-muted-foreground">
            {results.length.toLocaleString()} of {receipts.length.toLocaleString()} receipts
          </p>

          {/* Receipt History */}
          <section className="bg-card border-2 border-border rounded-2xl overflow-hidden">
            {results.length === 0 ? (
              <p className="text-muted-foreground py-12 text-center">No receipts found</p>
            ) : (
              <div className="divide-y divide-border">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setActive(r)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shrink-0">
                      <ReceiptIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{r.reference}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {formatDateTime(r.issuedAt)} · {r.items.length} item{r.items.length === 1 ? '' : 's'}
                        {r.customer?.name ? ` · ${r.customer.name}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0">{formatCedis(r.totals.total)}</span>
                    <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Receipt Preview modal */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="w-full max-w-md my-8">
            <ReceiptView receipt={active} onClose={() => setActive(null)} />
          </div>
        </div>
      )}
    </>
  );
}

export default BranchReceipts;
