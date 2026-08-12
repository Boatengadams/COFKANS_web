/**
 * Multi-Branch Module — printable receipt view (UI only).
 *
 * Renders a single Receipt as a clean, print-friendly document. Used both as
 * the checkout "Receipt Preview" and inside Receipt History for reprinting.
 * No PDF generation — "Reprint" uses the browser's native print dialog.
 */
import { Printer, X } from 'lucide-react';
import { formatCedis, formatDateTime } from '../utils/format';
import type { Receipt } from '../types/receipt';

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Cash',
  'mobile-money': 'Mobile Money',
  card: 'Card',
  'bank-transfer': 'Bank Transfer',
  credit: 'Credit',
};

export function ReceiptView({ receipt, onClose }: { receipt: Receipt; onClose?: () => void }) {
  return (
    <div className="bg-card border-2 border-border rounded-2xl overflow-hidden">
      {/* Action bar (hidden when printing) */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border print:hidden">
        <span className="text-sm text-muted-foreground">Receipt preview</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Printer className="w-4 h-4" /> Reprint
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border-2 border-border hover:border-primary text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Receipt body */}
      <div className="p-6 max-w-md mx-auto">
        <div className="text-center space-y-1">
          <h2>{receipt.branch.name}</h2>
          <p className="text-sm text-muted-foreground">{receipt.branch.address}</p>
          {receipt.branch.phone && <p className="text-sm text-muted-foreground">{receipt.branch.phone}</p>}
        </div>

        <div className="my-4 border-t border-dashed border-border" />

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Receipt</span>
          <span>{receipt.reference}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Date</span>
          <span>{formatDateTime(receipt.issuedAt)}</span>
        </div>
        {receipt.cashierName && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cashier</span>
            <span>{receipt.cashierName}</span>
          </div>
        )}
        {receipt.customer?.name && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Customer</span>
            <span>{receipt.customer.name}</span>
          </div>
        )}

        <div className="my-4 border-t border-dashed border-border" />

        {/* Line items */}
        <div className="space-y-2">
          {receipt.items.map((it) => (
            <div key={it.sku} className="flex justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate">{it.name}</p>
                <p className="text-muted-foreground">{it.quantity} × {formatCedis(it.unitPrice)}</p>
              </div>
              <span className="shrink-0">{formatCedis(it.lineTotal)}</span>
            </div>
          ))}
        </div>

        <div className="my-4 border-t border-dashed border-border" />

        {/* Totals */}
        <div className="space-y-1 text-sm">
          <Row label="Subtotal" value={formatCedis(receipt.totals.subtotal)} />
          {receipt.totals.discount > 0 && <Row label="Discount" value={`- ${formatCedis(receipt.totals.discount)}`} />}
          <Row label="VAT" value={formatCedis(receipt.totals.tax)} />
          {receipt.totals.fee > 0 && <Row label="Fee" value={formatCedis(receipt.totals.fee)} />}
          <div className="flex justify-between pt-1" style={{ fontSize: '1.125rem', lineHeight: 1.2 }}>
            <span>Total</span>
            <span>{formatCedis(receipt.totals.total)}</span>
          </div>
        </div>

        <div className="mt-3 flex justify-between text-sm">
          <span className="text-muted-foreground">Paid via</span>
          <span>{PAYMENT_LABELS[receipt.paymentMethod] ?? receipt.paymentMethod}</span>
        </div>

        <div className="my-4 border-t border-dashed border-border" />

        {receipt.footerNote && (
          <p className="text-center text-sm text-muted-foreground">{receipt.footerNote}</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default ReceiptView;
