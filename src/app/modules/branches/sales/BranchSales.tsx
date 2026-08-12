/**
 * Multi-Branch Module — Branch Sales (point of sale) screen.
 *
 * Lives at /branches/:branchId/sales. Two panes:
 *   - a product picker (searchable inventory) that builds a live POS cart
 *   - a cart / checkout panel that persists a Sale via the service layer
 * plus a "Recent sales" list below. All backend-free (mock + localStorage).
 * Responsive: side-by-side on desktop, stacked on mobile.
 */
import { useMemo, useState } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, Receipt as ReceiptIcon, CheckCircle2 } from 'lucide-react';
import { useBranch } from '../hooks/useBranches';
import { useBranchInventory } from '../hooks/useBranchInventory';
import { useBranchSales } from '../hooks/useSales';
import { createSaleFromCart, buildReceipt } from '../services/saleService';
import { adjustStock } from '../services/inventoryService';
import { computeCartTotals, computeLineTotal, stockLevel } from '../utils/inventory';
import { genId } from '../utils/id';
import { formatCedis, formatDateTime } from '../utils/format';
import { getDemoRole, getDemoUser } from '../../../../lib/demo-mode';
import { ReceiptView } from '../receipts/ReceiptView';
import type { CartItem, Cart } from '../types/cart';
import type { PaymentMethod, SaleChannel } from '../types/sale';
import type { Receipt } from '../types/receipt';

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'mobile-money', label: 'Mobile Money' },
  { value: 'card', label: 'Card' },
  { value: 'bank-transfer', label: 'Bank Transfer' },
  { value: 'credit', label: 'Credit' },
];

const CHANNELS: { value: SaleChannel; label: string }[] = [
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'phone-order', label: 'Phone order' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'online-pickup', label: 'Online pickup' },
];

export function BranchSales({ branchId }: { branchId: string }) {
  const branch = useBranch(branchId);
  const inventory = useBranchInventory(branchId);
  const sales = useBranchSales(branchId);

  const [query, setQuery] = useState('');
  const [lines, setLines] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [channel, setChannel] = useState<SaleChannel>('walk-in');
  const [customerName, setCustomerName] = useState('');
  const [tendered, setTendered] = useState('');
  const [lastRef, setLastRef] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inventory.items
      .filter((i) => stockLevel(i) !== 'out')
      .filter((i) => (q ? `${i.name ?? ''} ${i.sku}`.toLowerCase().includes(q) : true))
      .slice(0, 30);
  }, [inventory.items, query]);

  const totals = useMemo(() => computeCartTotals(lines), [lines]);

  // In-person cash handling: cashier keys the amount handed over, we compute
  // change. Non-cash methods are assumed paid in full (tendered ignored).
  const isCash = payment === 'cash';
  const tenderedNum = Number.parseFloat(tendered) || 0;
  const changeDue = isCash ? Math.max(0, tenderedNum - totals.total) : 0;
  const shortBy = isCash ? Math.max(0, totals.total - tenderedNum) : 0;
  const canCheckout = lines.length > 0 && (!isCash || tenderedNum >= totals.total);

  function addProduct(sku: string) {
    const p = inventory.items.find((i) => i.sku === sku);
    if (!p) return;
    setLastRef(null);
    setLines((prev) => {
      const existing = prev.find((l) => l.sku === sku);
      if (existing) {
        return prev.map((l) =>
          l.sku === sku
            ? { ...l, quantity: l.quantity + 1, lineTotal: computeLineTotal({ ...l, quantity: l.quantity + 1 }) }
            : l,
        );
      }
      const line: CartItem = {
        productId: p.productId,
        sku: p.sku,
        name: p.name ?? p.sku,
        image: p.image,
        unitPrice: p.price,
        quantity: 1,
        lineTotal: computeLineTotal({ unitPrice: p.price, quantity: 1 }),
      };
      return [...prev, line];
    });
  }

  function changeQty(sku: string, delta: number) {
    setLines((prev) =>
      prev
        .map((l) => {
          if (l.sku !== sku) return l;
          const quantity = l.quantity + delta;
          if (quantity <= 0) return null;
          return { ...l, quantity, lineTotal: computeLineTotal({ ...l, quantity }) };
        })
        .filter((l): l is CartItem => l !== null),
    );
  }

  function removeLine(sku: string) {
    setLines((prev) => prev.filter((l) => l.sku !== sku));
  }

  function checkout() {
    if (!canCheckout) return;
    const user = getDemoUser(getDemoRole());
    // Cash: record exactly what was tendered so the receipt shows change.
    // Other methods settle for the full total.
    const amountPaid = isCash ? tenderedNum : totals.total;
    const cart: Cart = {
      id: genId('cart'),
      branchSlug: branchId,
      cashierId: user?.uid ?? 'demo-cashier',
      items: lines,
      totals,
      customer: customerName.trim() ? { name: customerName.trim() } : undefined,
      status: 'checked-out',
      createdAt: new Date().toISOString(),
    };
    const sale = createSaleFromCart(cart, {
      paymentMethod: payment,
      channel,
      amountPaid,
    });

    // Mock stock reduction — deduct sold quantities from this branch's stock.
    for (const line of lines) {
      adjustStock(branchId, line.sku, -line.quantity, 'sale', cart.cashierId);
    }

    // Receipt preview from the persisted sale (no PDF — on-screen + native print).
    const built = buildReceipt(sale.id, { cashierName: user?.displayName });
    setReceipt(built ?? null);
    setLastRef(sale.reference);
    setLines([]);
    setCustomerName('');
    setTendered('');
  }

  return (
    <>
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <header className="space-y-1">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Point of Sale</p>
          <h1>{branch?.name ?? branchId}</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Product picker */}
          <section className="lg:col-span-3 space-y-4">
            <div className="bg-card border-2 border-border rounded-2xl p-4">
              <label className="relative block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products to add…"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border-2 border-border outline-none focus:border-primary"
                />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center sm:col-span-2">No products found</p>
              ) : (
                results.map((p) => (
                  <button
                    key={p.sku}
                    onClick={() => addProduct(p.sku)}
                    className="text-left bg-card border-2 border-border rounded-2xl p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate">{p.name ?? p.sku}</p>
                        <p className="text-sm text-muted-foreground">{p.sku}</p>
                      </div>
                      <Plus className="w-4 h-4 text-primary shrink-0 mt-1" />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span>{formatCedis(p.price)}</span>
                      <span className="text-sm text-muted-foreground">{p.quantity} in stock</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Cart / checkout */}
          <section className="lg:col-span-2">
            <div className="bg-card border-2 border-border rounded-2xl p-4 space-y-4 lg:sticky lg:top-6">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <h2>Cart</h2>
                <span className="text-muted-foreground">({lines.length})</span>
              </div>

              {lastRef && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 text-emerald-600 px-3 py-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Sale recorded — {lastRef}</span>
                </div>
              )}

              {lines.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center">Add products to start a sale</p>
              ) : (
                <div className="space-y-3">
                  {lines.map((l) => (
                    <div key={l.sku} className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{l.name}</p>
                        <p className="text-sm text-muted-foreground">{formatCedis(l.unitPrice)} each</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconBtn onClick={() => changeQty(l.sku, -1)}><Minus className="w-3.5 h-3.5" /></IconBtn>
                        <span className="w-6 text-center">{l.quantity}</span>
                        <IconBtn onClick={() => changeQty(l.sku, 1)}><Plus className="w-3.5 h-3.5" /></IconBtn>
                      </div>
                      <span className="w-24 text-right">{formatCedis(l.lineTotal)}</span>
                      <IconBtn onClick={() => removeLine(l.sku)}><Trash2 className="w-3.5 h-3.5" /></IconBtn>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-border pt-3 space-y-1.5">
                <Row label="Subtotal" value={formatCedis(totals.subtotal)} />
                {totals.discount > 0 && <Row label="Discount" value={`- ${formatCedis(totals.discount)}`} />}
                <Row label="VAT (12.5%)" value={formatCedis(totals.tax)} />
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span>Total</span>
                  <span style={{ fontSize: '1.25rem', lineHeight: 1.1 }}>{formatCedis(totals.total)}</span>
                </div>
              </div>

              {/* Checkout fields */}
              <div className="space-y-3">
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name (optional)"
                  className="w-full px-3 py-2.5 rounded-xl bg-background border-2 border-border outline-none focus:border-primary"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={payment}
                    onChange={(e) => setPayment(e.target.value as PaymentMethod)}
                    className="px-3 py-2.5 rounded-xl bg-background border-2 border-border outline-none focus:border-primary appearance-none"
                  >
                    {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as SaleChannel)}
                    className="px-3 py-2.5 rounded-xl bg-background border-2 border-border outline-none focus:border-primary appearance-none"
                  >
                    {CHANNELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                {/* Cash tendered + change (walk-in cash payments) */}
                {isCash && lines.length > 0 && (
                  <div className="space-y-2 rounded-xl border-2 border-border p-3">
                    <label className="block">
                      <span className="text-sm text-muted-foreground">Cash received</span>
                      <input
                        value={tendered}
                        onChange={(e) => setTendered(e.target.value.replace(/[^0-9.]/g, ''))}
                        inputMode="decimal"
                        placeholder={formatCedis(totals.total)}
                        className="mt-1 w-full px-3 py-2.5 rounded-xl bg-background border-2 border-border outline-none focus:border-primary"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {quickTenders(totals.total).map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setTendered(String(amt))}
                          className="px-3 py-1.5 rounded-lg border-2 border-border text-sm hover:border-primary transition-colors"
                        >
                          {formatCedis(amt)}
                        </button>
                      ))}
                    </div>
                    {tenderedNum > 0 && (
                      shortBy > 0 ? (
                        <Row label="Short by" value={`- ${formatCedis(shortBy)}`} />
                      ) : (
                        <div className="flex items-center justify-between">
                          <span>Change due</span>
                          <span style={{ fontSize: '1.125rem', lineHeight: 1.1 }}>{formatCedis(changeDue)}</span>
                        </div>
                      )
                    )}
                  </div>
                )}

                <button
                  onClick={checkout}
                  disabled={!canCheckout}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  {isCash && shortBy > 0
                    ? `Insufficient cash · ${formatCedis(shortBy)} short`
                    : `Complete sale · ${formatCedis(totals.total)}`}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Recent sales */}
        <section className="bg-card border-2 border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ReceiptIcon className="w-4 h-4 text-primary" />
            <h2>Recent sales</h2>
          </div>
          {sales.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center">No sales yet</p>
          ) : (
            <div className="divide-y divide-border">
              {sales.slice(0, 12).map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate">{s.reference}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(s.soldAt)} · {s.items.length} item{s.items.length === 1 ? '' : 's'}
                      {s.customer?.name ? ` · ${s.customer.name}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p>{formatCedis(s.totals.total)}</p>
                    <StatusBadge status={s.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>

    {/* Receipt Preview modal */}
    {receipt && (
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-black/50 p-4">
        <div className="w-full max-w-md my-8">
          <ReceiptView receipt={receipt} onClose={() => setReceipt(null)} />
        </div>
      </div>
    )}
    </>
  );
}

/**
 * Suggest sensible cash-tender amounts: the exact total, then the next few
 * round notes above it (nearest 10, 20, 50, 100) — matching how a cashier
 * receives real Ghana cedi notes.
 */
function quickTenders(total: number): number[] {
  if (total <= 0) return [];
  const exact = Math.ceil(total * 100) / 100;
  const rounded = new Set<number>([exact]);
  for (const step of [10, 20, 50, 100, 200]) {
    const up = Math.ceil(total / step) * step;
    if (up > total) rounded.add(up);
  }
  return Array.from(rounded).sort((a, b) => a - b).slice(0, 4);
}

/* --------------------------------------------------------------- subcomponents */

function IconBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center w-7 h-7 rounded-lg border-2 border-border hover:border-primary text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: 'bg-emerald-500/10 text-emerald-600',
    partial: 'bg-amber-500/10 text-amber-600',
    unpaid: 'bg-red-500/10 text-red-600',
    refunded: 'bg-muted text-muted-foreground',
    voided: 'bg-muted text-muted-foreground',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
}

export default BranchSales;
