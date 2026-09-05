/**
 * ShowroomInventory — Front Desk panel.
 *
 * Shows every product in the catalogue with its Firestore stock/price.
 * Front Desk can initiate a stock transfer: pick a product, enter a
 * quantity, choose a destination branch → creates a stockTransfer doc.
 *
 * In DEMO_MODE the "transfer" is saved to localStorage only.
 */
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Package, X, ChevronDown, Truck, CheckCircle2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { csvProducts } from '../../data/csvProducts';
import { useBranches } from '@/lib/branches';
import { DEMO_MODE } from '@/lib/demo-mode';
import { db } from '@/lib/firebase';

const SHOWROOM_SLUG = 'kumasi-asuoyeboa';

interface TransferDraft {
  productId: string;
  productName: string;
  toBranchSlug: string;
  quantity: number;
}

function useMockTransfers() {
  const KEY = 'cofkans:stock-transfers';
  const load = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  };
  const save = (t: object) => {
    const list = load();
    list.unshift(t);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
  };
  return { save, load };
}

export function ShowroomInventoryPanel() {
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<TransferDraft | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const branches = useBranches(true).filter(b => b.slug !== SHOWROOM_SLUG);
  const { save } = useMockTransfers();

  const products = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? csvProducts.filter(p => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q))
      : csvProducts;
  }, [search]);

  const sendTransfer = async () => {
    if (!draft || !draft.toBranchSlug || draft.quantity < 1) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 500));
    const transfer = {
      fromBranch: SHOWROOM_SLUG,
      toBranch: draft.toBranchSlug,
      items: [{ productId: draft.productId, name: draft.productName, quantity: draft.quantity }],
      status: 'pending',
      driverId: null,
      createdAt: DEMO_MODE ? new Date().toISOString() : serverTimestamp(),
    };
    const transferId = DEMO_MODE
      ? `TR-${Date.now()}`
      : (await addDoc(collection(db, 'stockTransfers'), transfer)).id;
    if (DEMO_MODE) save({ id: transferId, ...transfer });
    setSent(transferId);
    setSending(false);
    setTimeout(() => { setSent(null); setDraft(null); }, 2500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold">Showroom Inventory</h2>
          <p className="text-sm text-muted-foreground">
            Asuoyeboa Showroom · {csvProducts.length} products · select any to send to a branch
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by product or category…"
          className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary text-sm"
        />
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[65vh] overflow-y-auto pr-1">
        {products.map(p => (
          <motion.button
            key={p.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDraft({ productId: p.id, productName: p.name, toBranchSlug: '', quantity: 1 })}
            className="text-left bg-card border-2 border-border hover:border-primary rounded-xl overflow-hidden transition-all"
          >
            {p.image ? (
              <img src={p.image} alt={p.name} className="w-full aspect-square object-cover" />
            ) : (
              <div className="w-full aspect-square bg-muted flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
              </div>
            )}
            <div className="p-2">
              <p className="text-xs font-bold line-clamp-2 leading-tight">{p.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{p.category || '—'}</p>
              {p.price > 0 && (
                <p className="text-xs font-bold text-primary mt-1">GH₵ {p.price.toLocaleString()}</p>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Transfer modal */}
      <AnimatePresence>
        {draft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => !sending && setDraft(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border-2 border-border rounded-3xl w-full max-w-md p-6 space-y-5"
            >
              {sent ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold">Transfer created</h3>
                  <p className="text-sm text-muted-foreground mt-1">Ref: {sent}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Driver will be notified to pick up.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">Send to branch</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{draft.productName}</p>
                    </div>
                    <button onClick={() => setDraft(null)} className="p-2 rounded-xl hover:bg-muted">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Destination branch</span>
                      <div className="relative mt-1">
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <select
                          value={draft.toBranchSlug}
                          onChange={e => setDraft({ ...draft, toBranchSlug: e.target.value })}
                          className="w-full pl-3 pr-10 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary appearance-none text-sm"
                        >
                          <option value="">— Choose branch —</option>
                          {branches.map(b => (
                            <option key={b.slug} value={b.slug}>{b.name} ({b.city})</option>
                          ))}
                        </select>
                      </div>
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Quantity</span>
                      <input
                        type="number" min={1} value={draft.quantity}
                        onChange={e => setDraft({ ...draft, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-full mt-1 px-3 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary text-sm"
                      />
                    </label>
                  </div>

                  <button
                    onClick={sendTransfer}
                    disabled={!draft.toBranchSlug || draft.quantity < 1 || sending}
                    className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {sending
                      ? 'Creating transfer…'
                      : <><Truck className="w-4 h-4" /> Send {draft.quantity} unit{draft.quantity !== 1 ? 's' : ''} to branch</>}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ShowroomInventoryPanel;
