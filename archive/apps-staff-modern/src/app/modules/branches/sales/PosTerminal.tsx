/**
 * COFKANS ELECTRICALS ERP — Front Desk / Cashier POS terminal.
 *
 * A modern, enterprise point-of-sale for the Point of Sale segment:
 *   • large product search + category chips + recent products, image cards
 *   • live cart with qty controls, per-line + order discount, VAT
 *   • customer lookup / quick registration (name, phone, email)
 *   • split payment (multiple methods summing to the total) with cash change
 *   • receipt preview with print / email / WhatsApp actions
 *   • "Today's queue" of recent sales
 *
 * Backend-free — persists Sales through the module's service layer and reduces
 * mock stock on checkout. Rendered inside the green ".erp-theme" surface.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, Receipt as ReceiptIcon,
  CheckCircle2, User, Package, X, CreditCard, Banknote, Smartphone,
  Building, WalletCards, Printer, Mail, MessageCircle, Clock, Percent, ArrowUp,
} from 'lucide-react';
import { useBranch } from '../hooks/useBranches';
import { useBranchInventory } from '../hooks/useBranchInventory';
import { useBranchSales } from '../hooks/useSales';
import { createSaleFromCart, buildReceipt } from '../services/saleService';
import { adjustStock } from '../services/inventoryService';
import { computeLineTotal, stockLevel, DEFAULT_TAX_RATE } from '../utils/inventory';
import { genId } from '../utils/id';
import { formatCedis, formatDateTime } from '../utils/format';
import { getDemoRole, getDemoUser } from '@/lib/demo-mode';
import { ReceiptView } from '../receipts/ReceiptView';
import { ImageWithFallback } from '../../../components/figma/ImageWithFallback';
import { PageHeader, Panel, Pill, EmptyState } from '../components/ui/pro';
import type { CartItem, Cart, CartTotals } from '../types/cart';
import type { PaymentMethod, SaleChannel } from '../types/sale';
import type { Receipt } from '../types/receipt';

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'cash', label: 'Cash', icon: <Banknote className="h-4 w-4" /> },
  { value: 'mobile-money', label: 'Mobile Money', icon: <Smartphone className="h-4 w-4" /> },
  { value: 'card', label: 'Card', icon: <CreditCard className="h-4 w-4" /> },
  { value: 'bank-transfer', label: 'Bank Transfer', icon: <Building className="h-4 w-4" /> },
  { value: 'credit', label: 'Credit', icon: <WalletCards className="h-4 w-4" /> },
];

const CHANNELS: { value: SaleChannel; label: string }[] = [
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'phone-order', label: 'Phone order' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'online-pickup', label: 'Online pickup' },
];

interface Split { id: string; method: PaymentMethod; amount: number }

/** Compute cart totals with an optional order-level discount (GH₵). */
function computeTotals(lines: CartItem[], orderDiscount = 0): CartTotals {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const lineDiscount = lines.reduce((s, l) => s + (l.discount ?? 0), 0);
  const discount = Math.min(subtotal, lineDiscount + Math.max(0, orderDiscount));
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * DEFAULT_TAX_RATE;
  return { subtotal, discount, tax, fee: 0, total: taxable + tax };
}

export function PosTerminal({ branchId }: { branchId: string }) {
  const branch = useBranch(branchId);
  const inventory = useBranchInventory(branchId);
  const sales = useBranchSales(branchId);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [lines, setLines] = useState<CartItem[]>([]);
  const [orderDiscount, setOrderDiscount] = useState('');
  const [channel, setChannel] = useState<SaleChannel>('walk-in');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const [payOpen, setPayOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false); // mobile cart bottom-sheet
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [lastRef, setLastRef] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: "/" focuses search (classic POS ergonomics).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const i of inventory.items) if (i.category) set.add(i.category);
    return ['all', ...[...set].sort()];
  }, [inventory.items]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inventory.items
      .filter((i) => stockLevel(i) !== 'out')
      .filter((i) => category === 'all' || i.category === category)
      .filter((i) => (q ? `${i.name ?? ''} ${i.sku}`.toLowerCase().includes(q) : true))
      .slice(0, 40);
  }, [inventory.items, query, category]);

  const recentProducts = useMemo(
    () => recent.map((sku) => inventory.items.find((i) => i.sku === sku)).filter(Boolean).slice(0, 6),
    [recent, inventory.items],
  );

  const totals = useMemo(
    () => computeTotals(lines, Number.parseFloat(orderDiscount) || 0),
    [lines, orderDiscount],
  );

  // Today's stats for the header.
  const today = useMemo(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const rows = sales.filter((s) => new Date(s.soldAt).getTime() >= start.getTime());
    return { count: rows.length, revenue: rows.reduce((sum, s) => sum + s.totals.total, 0) };
  }, [sales]);

  function addProduct(sku: string) {
    const p = inventory.items.find((i) => i.sku === sku);
    if (!p) return;
    setLastRef(null);
    setRecent((prev) => [sku, ...prev.filter((s) => s !== sku)].slice(0, 8));
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
        productId: p.productId, sku: p.sku, name: p.name ?? p.sku, image: p.image,
        unitPrice: p.price, quantity: 1,
        lineTotal: computeLineTotal({ unitPrice: p.price, quantity: 1 }),
      };
      return [...prev, line];
    });
  }

  function changeQty(sku: string, delta: number) {
    setLines((prev) => prev
      .map((l) => {
        if (l.sku !== sku) return l;
        const quantity = l.quantity + delta;
        if (quantity <= 0) return null;
        return { ...l, quantity, lineTotal: computeLineTotal({ ...l, quantity }) };
      })
      .filter((l): l is CartItem => l !== null));
  }

  function setLineDiscount(sku: string, value: number) {
    setLines((prev) => prev.map((l) =>
      l.sku === sku ? { ...l, discount: value, lineTotal: computeLineTotal({ ...l, discount: value }) } : l));
  }

  const removeLine = (sku: string) => setLines((prev) => prev.filter((l) => l.sku !== sku));
  const clearCart = () => { setLines([]); setOrderDiscount(''); };

  function completeSale(splits: Split[]) {
    const user = getDemoUser(getDemoRole());
    const amountPaid = splits.reduce((s, p) => s + p.amount, 0);
    // Primary method = the split that contributed the most.
    const primary = [...splits].sort((a, b) => b.amount - a.amount)[0]?.method ?? 'cash';
    const hasCustomer = Boolean(customerName.trim() || customerPhone.trim() || customerEmail.trim());
    const cart: Cart = {
      id: genId('cart'),
      branchSlug: branchId,
      cashierId: user?.uid ?? 'demo-cashier',
      items: lines,
      totals,
      customer: hasCustomer
        ? { name: customerName.trim() || undefined, phone: customerPhone.trim() || undefined, email: customerEmail.trim() || undefined }
        : undefined,
      status: 'checked-out',
      createdAt: new Date().toISOString(),
    };
    const sale = createSaleFromCart(cart, { paymentMethod: primary, channel, amountPaid });
    for (const line of lines) adjustStock(branchId, line.sku, -line.quantity, 'sale', cart.cashierId);
    const built = buildReceipt(sale.id, { cashierName: user?.displayName });
    setReceipt(built ?? null);
    setLastRef(sale.reference);
    setLines([]); setOrderDiscount(''); setCustomerName(''); setCustomerPhone(''); setCustomerEmail('');
    setPayOpen(false);
    setCartOpen(false);
  }

  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);

  // Shared cart body — rendered in the desktop sidebar AND the mobile sheet.
  const cartBody = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <h3 style={{ fontSize: '1.05rem', lineHeight: 1.2 }}>Current sale</h3>
          <Pill tone="gold">{itemCount} items</Pill>
        </div>
        {lines.length > 0 && (
          <button onClick={clearCart} className="text-xs text-muted-foreground hover:text-red-600">Clear</button>
        )}
      </div>

      {lastRef && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm">Sale completed — {lastRef}</span>
        </div>
      )}

      {lines.length === 0 ? (
        <EmptyState label="Tap a product to start a sale." />
      ) : (
        <div className="max-h-[38vh] space-y-2 overflow-y-auto scrollbar-hide pr-1">
          {lines.map((l) => (
            <div key={l.sku} className="rounded-xl border border-border bg-background/60 p-2.5">
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{formatCedis(l.unitPrice)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <IconBtn onClick={() => changeQty(l.sku, -1)}><Minus className="h-3.5 w-3.5" /></IconBtn>
                  <span className="w-6 text-center text-sm">{l.quantity}</span>
                  <IconBtn onClick={() => changeQty(l.sku, 1)}><Plus className="h-3.5 w-3.5" /></IconBtn>
                </div>
                <span className="w-20 text-right text-sm">{formatCedis(l.lineTotal)}</span>
                <IconBtn onClick={() => removeLine(l.sku)}><Trash2 className="h-3.5 w-3.5" /></IconBtn>
              </div>
              <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Percent className="h-3 w-3" /> Line discount
                <input
                  value={l.discount ?? ''}
                  onChange={(e) => setLineDiscount(l.sku, Number.parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0)}
                  inputMode="decimal" placeholder="0.00"
                  className="ml-auto w-20 rounded-lg border border-border bg-background px-2 py-1 text-right text-foreground outline-none focus:border-primary"
                />
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Customer */}
      <div className="space-y-2 rounded-xl border border-border p-3">
        <div className="flex items-center gap-2 text-sm"><User className="h-4 w-4 text-primary" /> Customer <span className="text-xs text-muted-foreground">(optional)</span></div>
        <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Name"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <div className="grid grid-cols-2 gap-2">
          <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Email"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
      </div>

      {/* Order discount + channel */}
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-muted-foreground">
          Order discount (GH₵)
          <input value={orderDiscount} onChange={(e) => setOrderDiscount(e.target.value.replace(/[^0-9.]/g, ''))}
            inputMode="decimal" placeholder="0.00"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
        </label>
        <label className="text-xs text-muted-foreground">
          Channel
          <select value={channel} onChange={(e) => setChannel(e.target.value as SaleChannel)}
            className="mt-1 w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
            {CHANNELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
      </div>

      {/* Totals */}
      <div className="space-y-1.5 border-t border-border pt-3">
        <Row label="Subtotal" value={formatCedis(totals.subtotal)} />
        {totals.discount > 0 && <Row label="Discount" value={`- ${formatCedis(totals.discount)}`} />}
        <Row label="VAT (12.5%)" value={formatCedis(totals.tax)} />
        <div className="flex items-center justify-between border-t border-border pt-2">
          <span>Total</span>
          <span style={{ fontSize: '1.4rem', lineHeight: 1.1 }}>{formatCedis(totals.total)}</span>
        </div>
      </div>

      <button
        onClick={() => setPayOpen(true)}
        disabled={lines.length === 0}
        className="w-full rounded-xl bg-primary py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Charge {formatCedis(totals.total)}
      </button>
    </>
  );

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 pb-28 sm:px-6 xl:pb-6">
          <PageHeader
            icon={<ShoppingCart className="h-6 w-6" strokeWidth={2.5} />}
            eyebrow="Front Desk · Point of Sale"
            title={branch?.name ?? branchId}
            subtitle={<span>Press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">/</kbd> to search · {inventory.items.length} products in catalog</span>}
            actions={
              <div className="flex gap-2">
                <div className="rounded-2xl border border-border bg-background/60 px-4 py-2 text-center">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Today's sales</p>
                  <p style={{ fontSize: '1.15rem', lineHeight: 1.1 }}>{today.count}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/60 px-4 py-2 text-center">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Today's revenue</p>
                  <p style={{ fontSize: '1.15rem', lineHeight: 1.1 }}>{formatCedis(today.revenue)}</p>
                </div>
              </div>
            }
          />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            {/* -------------------------------------------------- Catalog */}
            <section className="space-y-4 xl:col-span-3">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <label className="relative block">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products by name or SKU…"
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 outline-none focus:border-primary"
                  />
                </label>
                <div className="mt-3 flex flex-wrap gap-1.5 scrollbar-hide">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                        category === c ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {c === 'all' ? 'All products' : c}
                    </button>
                  ))}
                </div>
              </div>

              {recentProducts.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Recent</span>
                  {recentProducts.map((p) => p && (
                    <button key={p.sku} onClick={() => addProduct(p.sku)}
                      className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs transition-colors hover:border-primary">
                      {p.name ?? p.sku}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {results.length === 0 ? (
                  <div className="col-span-full"><EmptyState label="No products match your search." /></div>
                ) : (
                  results.map((p) => {
                    const level = stockLevel(p);
                    return (
                      <button
                        key={p.sku}
                        onClick={() => addProduct(p.sku)}
                        className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                          {p.image ? (
                            <ImageWithFallback src={p.image} alt={p.name ?? p.sku}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <Package className="h-8 w-8" />
                            </div>
                          )}
                          <span className="absolute right-2 top-2">
                            <Pill tone={level === 'low' ? 'warn' : 'up'}>{p.quantity} left</Pill>
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col p-3">
                          <p className="line-clamp-2 text-sm" style={{ lineHeight: 1.25 }}>{p.name ?? p.sku}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{p.sku}</p>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <span style={{ fontSize: '1.05rem' }}>{formatCedis(p.price)}</span>
                            <span className="rounded-lg bg-primary/10 p-1.5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                              <Plus className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </section>

            {/* -------------------------------------------------- Cart (desktop sidebar) */}
            <section className="hidden xl:col-span-2 xl:block">
              <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm xl:sticky xl:top-6">
                {cartBody}
              </div>
            </section>
          </div>

          {/* -------------------------------------------------- Today's queue */}
          <Panel title="Today's queue" icon={<ReceiptIcon className="h-4 w-4" />}
            action={<Pill tone="muted">{sales.length} recent</Pill>}>
            {sales.length === 0 ? (
              <EmptyState label="No sales yet today." />
            ) : (
              <div className="divide-y divide-border">
                {sales.slice(0, 10).map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{s.reference}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatDateTime(s.soldAt)} · {s.items.length} item{s.items.length === 1 ? '' : 's'}
                        {s.customer?.name ? ` · ${s.customer.name}` : ''}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm">{formatCedis(s.totals.total)}</p>
                      <Pill tone={s.status === 'paid' ? 'up' : s.status === 'partial' ? 'warn' : 'muted'}>{s.status}</Pill>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* -------------------------------------------------- Floating cart summary (small screens) */}
      {lines.length > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed inset-x-3 bottom-3 z-[55] flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary px-4 py-3 text-primary-foreground shadow-2xl transition-transform active:scale-[0.99] xl:hidden"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary-foreground px-1 text-[11px] text-primary">
              {itemCount}
            </span>
          </span>
          <span className="min-w-0 flex-1 text-left leading-tight">
            <span className="block text-[11px] uppercase tracking-wide opacity-80">{itemCount} item{itemCount === 1 ? '' : 's'} selected</span>
            <span className="block" style={{ fontSize: '1.15rem', lineHeight: 1.15 }}>{formatCedis(totals.total)}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 rounded-xl bg-primary-foreground/15 px-3 py-2 text-sm">
            View &amp; pay <ArrowUp className="h-4 w-4" />
          </span>
        </button>
      )}

      {/* -------------------------------------------------- Cart bottom-sheet (small screens) */}
      {cartOpen && (
        <div className="fixed inset-0 z-[58] flex items-end justify-center bg-black/50 xl:hidden" onClick={() => setCartOpen(false)}>
          <div
            className="max-h-[90vh] w-full space-y-4 overflow-y-auto rounded-t-3xl border border-border bg-card p-4 shadow-2xl scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto -mt-1 mb-1 h-1.5 w-10 rounded-full bg-border" />
            <div className="flex items-center justify-end">
              <button onClick={() => setCartOpen(false)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            {cartBody}
          </div>
        </div>
      )}

      {payOpen && (
        <PaymentModal
          total={totals.total}
          onClose={() => setPayOpen(false)}
          onConfirm={completeSale}
        />
      )}

      {receipt && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
          <div className="my-8 w-full max-w-md">
            <ReceiptView receipt={receipt} onClose={() => setReceipt(null)} />
            <ReceiptActions receipt={receipt} />
          </div>
        </div>
      )}
    </>
  );
}

/* --------------------------------------------------------------- payment modal */

function PaymentModal({
  total, onClose, onConfirm,
}: { total: number; onClose: () => void; onConfirm: (splits: Split[]) => void }) {
  const [splits, setSplits] = useState<Split[]>([{ id: genId('pay'), method: 'cash', amount: total }]);

  const paid = splits.reduce((s, p) => s + (p.amount || 0), 0);
  const remaining = Math.max(0, total - paid);
  const change = Math.max(0, paid - total);
  const canComplete = paid >= total - 0.001;

  const setAmount = (id: string, amount: number) =>
    setSplits((prev) => prev.map((s) => (s.id === id ? { ...s, amount } : s)));
  const setMethod = (id: string, method: PaymentMethod) =>
    setSplits((prev) => prev.map((s) => (s.id === id ? { ...s, method } : s)));
  const addSplit = () =>
    setSplits((prev) => [...prev, { id: genId('pay'), method: 'mobile-money', amount: remaining }]);
  const removeSplit = (id: string) =>
    setSplits((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev));

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl border border-border bg-card p-5 shadow-xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WalletCards className="h-5 w-5 text-primary" />
            <h3 style={{ fontSize: '1.15rem', lineHeight: 1.2 }}>Take payment</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <div className="mb-4 rounded-2xl bg-primary/10 p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Amount due</p>
          <p style={{ fontSize: '2rem', lineHeight: 1.05 }}>{formatCedis(total)}</p>
        </div>

        <div className="space-y-3">
          {splits.map((s, i) => (
            <div key={s.id} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Payment {i + 1}</span>
                {splits.length > 1 && (
                  <button onClick={() => removeSplit(s.id)} className="text-xs text-muted-foreground hover:text-red-600">Remove</button>
                )}
              </div>
              <div className="mt-2 grid grid-cols-5 gap-2">
                <div className="col-span-3 grid grid-cols-2 gap-1.5">
                  {PAYMENT_METHODS.map((m) => (
                    <button key={m.value} onClick={() => setMethod(s.id, m.value)}
                      className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs transition-colors ${
                        s.method === m.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'
                      }`}>
                      {m.icon} <span className="truncate">{m.label}</span>
                    </button>
                  ))}
                </div>
                <input
                  value={s.amount || ''}
                  onChange={(e) => setAmount(s.id, Number.parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0)}
                  inputMode="decimal" placeholder="0.00"
                  className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-right outline-none focus:border-primary"
                />
              </div>
            </div>
          ))}
        </div>

        <button onClick={addSplit}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
          <Plus className="h-4 w-4" /> Split payment
        </button>

        <div className="mt-4 space-y-1.5 border-t border-border pt-3">
          <Row label="Paid" value={formatCedis(paid)} />
          {remaining > 0 ? <Row label="Remaining" value={formatCedis(remaining)} /> : (
            <div className="flex items-center justify-between">
              <span>Change due</span>
              <span style={{ fontSize: '1.15rem', lineHeight: 1.1 }}>{formatCedis(change)}</span>
            </div>
          )}
        </div>

        <button onClick={() => onConfirm(splits)} disabled={!canComplete}
          className="mt-4 w-full rounded-xl bg-primary py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
          {canComplete ? `Complete sale · ${formatCedis(total)}` : `${formatCedis(remaining)} remaining`}
        </button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- receipt actions */

function ReceiptActions({ receipt }: { receipt: Receipt }) {
  const summary = `Cofkans Electricals receipt ${receipt.reference} — Total ${formatCedis(receipt.totals.total)}. Thank you for your purchase!`;
  const phone = (receipt.customer?.phone ?? '').replace(/[^0-9]/g, '');
  const email = receipt.customer?.email ?? '';
  return (
    <div className="mt-3 grid grid-cols-3 gap-2 print:hidden">
      <a
        href={`mailto:${email}?subject=${encodeURIComponent(`Receipt ${receipt.reference}`)}&body=${encodeURIComponent(summary)}`}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-sm transition-colors hover:border-primary">
        <Mail className="h-4 w-4" /> Email
      </a>
      <a
        href={`https://wa.me/${phone}?text=${encodeURIComponent(summary)}`}
        target="_blank" rel="noreferrer"
        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-sm transition-colors hover:border-primary">
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </a>
      <button
        onClick={() => window.print()}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-90">
        <Printer className="h-4 w-4" /> Print
      </button>
    </div>
  );
}

/* --------------------------------------------------------------- small bits */

function IconBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
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

export default PosTerminal;
