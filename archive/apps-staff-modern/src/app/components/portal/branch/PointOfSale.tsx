/**
 * Branch POS. Type-ahead product search filtered to this branch's stock,
 * add to cart, take payment, generate a printable receipt. Works offline
 * via tryOnlineThenQueue — receipt prints immediately either way.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useStaffRole } from '../../../hooks/useStaffRole';
import {
  recordLocalSale, generateReceiptNumber,
  type LocalSaleItem, type PaymentMethod,
} from '@/lib/operations';
import { tryOnlineThenQueue } from '@/lib/offline-queue';
import type { FirestoreProduct } from '@/lib/firestore-schema';
import type { WarehouseKey } from '@/lib/manager-modules';
import { ShoppingCart, Trash2, Printer, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { SEED_BRANCHES as BRANCHES } from '@/lib/branches';

interface Props { branchSlug: WarehouseKey }

const ghs = (n: number) => `GH₵ ${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export function PointOfSale({ branchSlug }: Props) {
  const { staff } = useStaffRole();
  const [products, setProducts] = useState<FirestoreProduct[] | null>(null);
  const [filter, setFilter] = useState('');
  const [cart, setCart] = useState<LocalSaleItem[]>([]);
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [lastReceipt, setLastReceipt] = useState<{ number: string; items: LocalSaleItem[]; total: number; payment: PaymentMethod; at: Date } | null>(null);
  const [busy, setBusy] = useState(false);
  const counter = useRef(1);

  useEffect(() => {
    const q = query(collection(db, 'products'), where('status', '==', 'active'), orderBy('name'), limit(500));
    return onSnapshot(q,
      s => setProducts(s.docs.map(d => ({ id: d.id, ...(d.data() as Omit<FirestoreProduct, 'id'>) }))),
      e => toast.error(e.message ?? 'Failed to load products'),
    );
  }, []);

  // Best-effort: seed the receipt counter from today's sale count for this branch.
  useEffect(() => {
    (async () => {
      try {
        const start = new Date(); start.setHours(0, 0, 0, 0);
        const q = query(collection(db, 'localSales'),
          where('branch', '==', branchSlug),
          where('serverCreatedAt', '>=', start));
        const c = await getCountFromServer(q);
        counter.current = Math.max(1, c.data().count + 1);
      } catch { /* offline / denied — keep at 1 */ }
    })();
  }, [branchSlug]);

  const matches = useMemo(() => {
    if (!products) return null;
    const f = filter.trim().toLowerCase();
    return products
      .filter(p => (p.warehouseStock?.[branchSlug] ?? 0) > 0)
      .filter(p => !f || p.name.toLowerCase().includes(f) || p.sku.toLowerCase().includes(f))
      .slice(0, 30);
  }, [products, filter, branchSlug]);

  const addToCart = (p: FirestoreProduct) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === p.id);
      if (existing) {
        return prev.map(i => i.productId === p.id
          ? { ...i, quantity: i.quantity + 1, lineTotal: (i.quantity + 1) * i.unitPrice }
          : i);
      }
      return [...prev, {
        productId: p.id, sku: p.sku, name: p.name,
        unitPrice: p.price, quantity: 1, lineTotal: p.price,
      }];
    });
  };

  const setQty = (productId: string, q: number) => {
    setCart(prev => prev.map(i => i.productId === productId
      ? { ...i, quantity: Math.max(1, q), lineTotal: Math.max(1, q) * i.unitPrice }
      : i));
  };

  const removeItem = (productId: string) => setCart(prev => prev.filter(i => i.productId !== productId));

  const total = cart.reduce((s, i) => s + i.lineTotal, 0);

  const finalize = async () => {
    if (!staff || cart.length === 0) return;
    setBusy(true);
    const receiptNumber = generateReceiptNumber(branchSlug, counter.current);
    const payload = {
      branch: branchSlug,
      staffUid: staff.uid,
      staffName: staff.displayName ?? staff.email,
      items: cart,
      paymentMethod: payment,
      receiptNumber,
    };
    try {
      const res = await tryOnlineThenQueue('sale', payload, async () => { await recordLocalSale(payload); });
      counter.current += 1;
      setLastReceipt({ number: receiptNumber, items: cart, total, payment, at: new Date() });
      setCart([]);
      toast.success(res.status === 'ok' ? `Sale recorded · ${receiptNumber}` : `Queued offline · ${receiptNumber}`);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to record sale');
    } finally { setBusy(false); }
  };

  const printReceipt = () => {
    if (!lastReceipt) return;
    const branchInfo = BRANCHES.find(b => b.slug === branchSlug);
    const cashier = staff?.displayName ?? staff?.email ?? '—';
    const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
    const html = `<!doctype html><html><head><title>Receipt ${lastReceipt.number}</title>
      <style>body{font-family:monospace;max-width:320px;margin:16px auto;padding:8px;font-size:12px;color:#000}
      h1{font-size:15px;text-align:center;margin:0 0 2px;letter-spacing:1px}
      .sub{text-align:center;font-size:10px;line-height:1.3;margin-bottom:6px}
      .row{display:flex;justify-content:space-between;font-size:11px}
      table{width:100%;border-collapse:collapse;margin:8px 0}
      td{padding:2px 0;font-size:11px;vertical-align:top}
      .hr{border-top:1px dashed #000;margin:4px 0}
      .total{font-weight:700;font-size:13px}
      .center{text-align:center;margin-top:8px;font-size:10px}</style></head><body>
      <h1>COFKANS ELECTRICALS</h1>
      <div class="sub">
        ${esc(branchInfo?.name ?? branchSlug.toUpperCase() + ' Branch')}<br/>
        ${esc(branchInfo?.address ?? '')}<br/>
        Tel: ${esc(branchInfo?.phone ?? '+233 30 000 0000')}
      </div>
      <div class="hr"></div>
      <div class="row"><span>Receipt</span><span>${esc(lastReceipt.number)}</span></div>
      <div class="row"><span>Date</span><span>${esc(lastReceipt.at.toLocaleString())}</span></div>
      <div class="row"><span>Cashier</span><span>${esc(cashier)}</span></div>
      <div class="row"><span>Payment</span><span>${esc(lastReceipt.payment)}</span></div>
      <div class="hr"></div>
      <table>${lastReceipt.items.map(i => `<tr><td>${esc(i.name)} ×${i.quantity}</td><td style="text-align:right">${i.lineTotal.toFixed(2)}</td></tr>`).join('')}</table>
      <div class="hr"></div>
      <div class="row total"><span>TOTAL</span><span>GHS ${lastReceipt.total.toFixed(2)}</span></div>
      <div class="center">
        Thank you for shopping with us!<br/>
        Goods sold are not returnable without a valid receipt.<br/>
        cofkanselectricals.com
      </div>
      </body></html>`;
    const w = window.open('', '_blank', 'width=380,height=600');
    if (!w) { toast.error('Pop-up blocked — allow pop-ups to print receipts'); return; }
    w.document.write(html);
    w.document.close();
    setTimeout(() => { w.print(); }, 200);
  };

  return (
    <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
      <header className="flex items-center gap-2 mb-3">
        <ShoppingCart className="w-4 h-4 text-primary" />
        <h2 className="font-bold text-sm">Point of sale</h2>
        {lastReceipt && (
          <button onClick={printReceipt} className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 text-xs text-zinc-200">
            <Printer className="w-3 h-3" /> Reprint {lastReceipt.number}
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div>
          <div className="relative mb-2">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search name or SKU…"
              className="w-full pl-7 pr-2 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-xs"
            />
          </div>
          <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
            {!matches && <div className="text-xs text-zinc-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Loading…</div>}
            {matches && matches.length === 0 && <p className="text-xs text-zinc-500">No products in stock match.</p>}
            {matches?.map(p => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="w-full flex items-center justify-between p-2 rounded border border-zinc-800 hover:bg-zinc-800 text-left"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">{p.name}</div>
                  <div className="text-[10px] text-zinc-500">{p.sku} · {p.warehouseStock?.[branchSlug] ?? 0} in stock</div>
                </div>
                <div className="text-xs font-bold">{ghs(p.price)}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="rounded border border-zinc-800 p-2 min-h-[200px]">
            {cart.length === 0 && <p className="text-xs text-zinc-500 italic">Cart is empty.</p>}
            {cart.map(i => (
              <div key={i.productId} className="flex items-center gap-2 py-1 border-b border-zinc-800 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{i.name}</div>
                  <div className="text-[10px] text-zinc-500">{ghs(i.unitPrice)} ea</div>
                </div>
                <input
                  type="number"
                  min={1}
                  value={i.quantity}
                  onChange={e => setQty(i.productId, Number(e.target.value))}
                  className="w-14 px-1 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-xs"
                />
                <div className="w-20 text-right text-xs font-bold">{ghs(i.lineTotal)}</div>
                <button onClick={() => removeItem(i.productId)} className="p-1 text-zinc-500 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <select value={payment} onChange={e => setPayment(e.target.value as PaymentMethod)} className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-xs">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="momo">Momo</option>
            </select>
            <div className="ml-auto text-right">
              <div className="text-[10px] text-zinc-500">Total</div>
              <div className="text-base font-bold">{ghs(total)}</div>
            </div>
          </div>
          <button
            onClick={finalize}
            disabled={busy || cart.length === 0}
            className="mt-2 w-full px-3 py-2 rounded bg-primary text-white text-xs font-bold disabled:opacity-50"
          >
            {busy ? 'Recording…' : `Take payment · ${ghs(total)}`}
          </button>
        </div>
      </div>
    </section>
  );
}
