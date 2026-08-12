/**
 * Price Audit panel — lightweight "who changed which price, when" trail.
 *
 * Reads the append-only price-audit log from the backend-free store so a
 * manager can review every price change: product, old → new price, who made
 * it and when. Newest first, searchable.
 */
import { useEffect, useMemo, useState } from 'react';
import { History, Search, ArrowRight, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { store, onStoreChange, type PriceAuditEntry } from '../../pages/developer-portal/store';

const inputCls = 'w-full px-3 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm';

const roleLabel = (r: string) =>
  r === 'front_desk' ? 'Front Desk' : r === 'developer' ? 'Developer' : r === 'manager' ? 'Manager' : r;

const fmt = (ms: number) =>
  new Date(ms).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Wrap a value for safe CSV output (quotes, commas, newlines). */
const csvCell = (v: string | number) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Build a CSV string from audit entries and trigger a download. */
function exportCsv(rows: PriceAuditEntry[]) {
  const header = ['When', 'Product', 'SKU', 'Old Price (GH₵)', 'New Price (GH₵)', 'Changed By'];
  const lines = rows.map((e) =>
    [fmt(e.at), e.name, e.sku, e.oldPrice, e.newPrice, roleLabel(e.actor)].map(csvCell).join(','),
  );
  const csv = [header.join(','), ...lines].join('\r\n');
  // Prepend a UTF-8 BOM so Excel renders the GH₵ symbol correctly.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `price-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function PriceAuditPanel({ title = 'Price Audit', subtitle }: { title?: string; subtitle?: string }) {
  const [, setTick] = useState(0);
  useEffect(() => onStoreChange(() => setTick((t) => t + 1)), []);

  const entries = store.getPriceAudit();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s
      ? entries.filter((e) => `${e.name} ${e.sku} ${e.actor}`.toLowerCase().includes(s))
      : entries;
  }, [entries, q]);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="erp-sheen p-3 bg-primary/10 rounded-xl ring-1 ring-primary/20"><History className="w-6 h-6 text-primary" /></div>
        <div className="flex-1">
          <h2 className="erp-gradient-text" style={{ fontSize: '1.5rem', lineHeight: 1.15 }}>{title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {subtitle ?? `${entries.length} price ${entries.length === 1 ? 'change' : 'changes'} recorded`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => exportCsv(filtered)}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm bg-primary/10 text-primary ring-1 ring-primary/20 hover:bg-primary/15 transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          title="Download the audit trail as a CSV file"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search product or person…" className={`${inputCls} pl-9`} />
      </div>

      <div className="erp-card erp-elevate rounded-2xl p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left p-3">When</th>
                <th className="text-left p-3">Product</th>
                <th className="text-left p-3">Change (GH₵)</th>
                <th className="text-left p-3">By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e: PriceAuditEntry) => {
                const up = e.newPrice > e.oldPrice;
                const down = e.newPrice < e.oldPrice;
                return (
                  <tr key={e.id} className="border-t border-border/60">
                    <td className="p-3 text-muted-foreground whitespace-nowrap">{fmt(e.at)}</td>
                    <td className="p-3 max-w-[20rem]">
                      <div className="line-clamp-1">{e.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{e.sku}</div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-2 whitespace-nowrap">
                        <span className="text-muted-foreground">{e.oldPrice.toLocaleString()}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-semibold">{e.newPrice.toLocaleString()}</span>
                        {up && <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
                        {down && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{roleLabel(e.actor)}</span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-sm text-muted-foreground">
                    {entries.length === 0 ? 'No price changes recorded yet.' : 'No entries match your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PriceAuditPanel;
