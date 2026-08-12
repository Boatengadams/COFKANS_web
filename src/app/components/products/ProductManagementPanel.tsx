/**
 * Shared Product Management panel.
 *
 * Mounted by the Manager, Front Desk and Developer portals. Every action is
 * routed through the role-aware `ProductManager` class, so the UI only ever
 * offers what the acting role is permitted to do:
 *
 *   • Manager / Front Desk — add products and update prices (from the showroom).
 *   • Developer            — everything above, plus taking products off.
 *
 * It reads/writes the single backend-free product store (dp:products), so all
 * portals stay in sync.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Package, Plus, Trash2, Search, X, Check, Pencil, ShieldAlert } from 'lucide-react';
import { onStoreChange } from '../../pages/developer-portal/store';
import type { Product } from '../../data/products-full';
import {
  ProductManager, type ProductActorRole, type NewProductInput,
} from '../../pages/developer-portal/products';

interface Props {
  /** The acting role — decides which capabilities are exposed. */
  role: ProductActorRole;
  title?: string;
  subtitle?: string;
}

const inputCls = 'w-full px-3 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[9600] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="erp-card erp-elevate-lg rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontSize: '1.15rem' }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

const roleLabel = (r: ProductActorRole) =>
  r === 'front_desk' ? 'Front Desk' : r === 'developer' ? 'Developer' : 'Manager';

export function ProductManagementPanel({ role, title = 'Products', subtitle }: Props) {
  const pm = useMemo(() => new ProductManager(role), [role]);
  const [, setTick] = useState(0);
  useEffect(() => onStoreChange(() => setTick((t) => t + 1)), []);

  const products = pm.list();
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const [priceTarget, setPriceTarget] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s
      ? products.filter((p) => `${p.name} ${p.sku} ${p.category} ${p.subcategory ?? ''}`.toLowerCase().includes(s))
      : products;
  }, [products, q]);

  const unpriced = products.filter((p) => !p.price).length;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="erp-sheen p-3 bg-primary/10 rounded-xl ring-1 ring-primary/20"><Package className="w-6 h-6 text-primary" /></div>
        <div className="flex-1">
          <h2 className="erp-gradient-text" style={{ fontSize: '1.5rem', lineHeight: 1.15 }}>{title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {subtitle ?? `${products.length} products · ${unpriced} unpriced · acting as ${roleLabel(role)}`}
          </p>
        </div>
        {pm.can('add') && (
          <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground erp-glow hover:opacity-90 transition text-sm">
            <Plus className="w-4 h-4" /> Add product
          </button>
        )}
      </div>

      {/* Capability hint — clarifies what this role may and may not do. */}
      {!pm.can('delete') && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-primary/5 border border-primary/15">
          <ShieldAlert className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          You can add products and update prices. Only a Developer can take a product off the catalogue.
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className={`${inputCls} pl-9`} />
      </div>

      <div className="erp-card erp-elevate rounded-2xl p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left p-3">Product</th>
                <th className="text-left p-3">Code</th>
                <th className="text-left p-3">Category</th>
                <th className="text-right p-3">Price (GH₵)</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 300).map((p) => (
                <tr key={p.id} className="border-t border-border/60">
                  <td className="p-3 max-w-[22rem]"><span className="line-clamp-1">{p.name}</span></td>
                  <td className="p-3 text-muted-foreground font-mono text-xs">{p.sku}</td>
                  <td className="p-3 text-muted-foreground">{p.category}</td>
                  <td className="p-3 text-right">
                    {p.price ? p.price.toLocaleString() : <span className="text-amber-600">Unpriced</span>}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {pm.can('updatePrice') && (
                        <button onClick={() => setPriceTarget(p)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-border hover:bg-muted">
                          <Pencil className="w-3.5 h-3.5" /> Price
                        </button>
                      )}
                      {pm.can('delete') && (
                        <button
                          onClick={() => { if (confirm(`Take “${p.name}” off the catalogue? This cannot be undone.`)) pm.remove(p.id); }}
                          className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"
                          title="Take product off (Developer only)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">No products match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 300 && (
          <div className="p-3 text-center text-xs text-muted-foreground border-t border-border/60">
            Showing first 300 of {filtered.length}. Refine your search to see more.
          </div>
        )}
      </div>

      {creating && <CreateForm pm={pm} onClose={() => setCreating(false)} />}
      {priceTarget && <PriceForm pm={pm} product={priceTarget} onClose={() => setPriceTarget(null)} />}
    </div>
  );
}

function CreateForm({ pm, onClose }: { pm: ProductManager; onClose: () => void }) {
  const [form, setForm] = useState<NewProductInput>({
    name: '', price: 0, category: '', subcategory: '', image: '', stock: 0, description: '',
  });
  const set = (k: keyof NewProductInput, v: string) =>
    setForm((f) => ({ ...f, [k]: k === 'price' || k === 'stock' ? Number(v) : v }));

  const save = () => {
    if (!form.name.trim()) { alert('Product name is required.'); return; }
    if (!form.category.trim()) { alert('Category is required.'); return; }
    try {
      pm.add(form);
      onClose();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not add product.');
    }
  };

  return (
    <Modal title="Add product" onClose={onClose}>
      <div className="space-y-4">
        <label className="block"><span className="text-xs uppercase tracking-wide text-muted-foreground block mb-1.5">Product name</span>
          <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="text-xs uppercase tracking-wide text-muted-foreground block mb-1.5">Category</span>
            <input className={inputCls} value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="e.g. Outdoor Lighting" /></label>
          <label className="block"><span className="text-xs uppercase tracking-wide text-muted-foreground block mb-1.5">Subcategory</span>
            <input className={inputCls} value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)} placeholder="e.g. Floodlights" /></label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="text-xs uppercase tracking-wide text-muted-foreground block mb-1.5">Price (GH₵)</span>
            <input type="number" min={0} className={inputCls} value={form.price} onChange={(e) => set('price', e.target.value)} /></label>
          <label className="block"><span className="text-xs uppercase tracking-wide text-muted-foreground block mb-1.5">Stock (internal)</span>
            <input type="number" min={0} className={inputCls} value={form.stock} onChange={(e) => set('stock', e.target.value)} /></label>
        </div>
        <label className="block"><span className="text-xs uppercase tracking-wide text-muted-foreground block mb-1.5">Image URL (optional)</span>
          <input className={inputCls} value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="https://…" /></label>
        <label className="block"><span className="text-xs uppercase tracking-wide text-muted-foreground block mb-1.5">Description (optional)</span>
          <textarea className={`${inputCls} resize-none`} rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} /></label>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm">Cancel</button>
          <button onClick={save} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground erp-glow hover:opacity-90 text-sm"><Plus className="w-4 h-4" /> Add product</button>
        </div>
      </div>
    </Modal>
  );
}

function PriceForm({ pm, product, onClose }: { pm: ProductManager; product: Product; onClose: () => void }) {
  const [price, setPrice] = useState<number>(product.price || 0);
  const apply = () => {
    try {
      pm.updatePrice(product.id, price);
      onClose();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not update price.');
    }
  };
  return (
    <Modal title="Update price" onClose={onClose}>
      <div className="space-y-4">
        <div className="text-sm">
          <div className="font-semibold line-clamp-2">{product.name}</div>
          <div className="text-xs text-muted-foreground font-mono mt-1">{product.sku}</div>
        </div>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-muted-foreground block mb-1.5">New price (GH₵)</span>
          <input type="number" min={0} autoFocus className={inputCls} value={price} onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))} />
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm">Cancel</button>
          <button onClick={apply} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground erp-glow hover:opacity-90 text-sm"><Check className="w-4 h-4" /> Save price</button>
        </div>
      </div>
    </Modal>
  );
}

export default ProductManagementPanel;
