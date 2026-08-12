/**
 * Multi-Branch Module — Master Product Catalog (UI only, mock services).
 *
 * The ONE master product list for the whole company. Every branch reads the
 * same catalog and the same single price per product.
 *
 * Pricing rule: prices are managed ONLY by the Showroom Front Desk. Branches
 * (and other roles) see prices as read-only. The edit controls are gated on the
 * resolved `showroom_front_desk` role via the permission system; everyone else
 * gets a clear read-only notice.
 *
 * Backend-free: data comes from the catalog mock/localStorage service.
 */
import { useMemo, useState } from 'react';
import { Search, Filter, Lock, Pencil, Check, X, Package } from 'lucide-react';
import { PermissionProvider, usePermissions } from '../permissions';
import { useCatalog } from '../hooks/useCatalog';
import { setMasterPrice, listCatalogCategories } from '../services/catalogService';
import { formatCedis, formatDateTime } from '../utils/format';
import { ImageWithFallback } from '../../../components/figma/ImageWithFallback';
import type { MasterProduct } from '../services/catalogService';

/** Public entry — provides the permission context so this works anywhere. */
export function MasterProductCatalog() {
  return (
    <PermissionProvider>
      <CatalogInner />
    </PermissionProvider>
  );
}

function CatalogInner() {
  const { role } = usePermissions();
  // Prices are managed ONLY by the Showroom Front Desk.
  const canEditPrice = role === 'showroom_front_desk';

  const catalog = useCatalog();
  const categories = useMemo(() => ['all', ...listCatalogCategories()], []);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (q && !`${p.name} ${p.sku}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [catalog, query, category]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Master Catalog</p>
            <h1>Product Catalog</h1>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
            canEditPrice ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
          }`}>
            {canEditPrice ? <Pencil className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {canEditPrice ? 'Price editing enabled (Showroom Front Desk)' : 'Prices managed by Showroom Front Desk'}
          </div>
        </header>

        {/* Controls */}
        <section className="bg-card border-2 border-border rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
          <label className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the master list…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border-2 border-border outline-none focus:border-primary"
            />
          </label>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl bg-background border-2 border-border outline-none focus:border-primary appearance-none"
            >
              {categories.map((c) => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
            </select>
          </div>
        </section>

        <p className="text-sm text-muted-foreground">
          {rows.length.toLocaleString()} of {catalog.length.toLocaleString()} products
        </p>

        {/* Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.length === 0 ? (
            <p className="text-muted-foreground py-10 text-center sm:col-span-2 lg:col-span-3">No products found</p>
          ) : (
            rows.map((p) => <CatalogCard key={p.sku} product={p} canEditPrice={canEditPrice} />)
          )}
        </section>
      </div>
    </div>
  );
}

function CatalogCard({ product, canEditPrice }: { product: MasterProduct; canEditPrice: boolean }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(product.price));

  function save() {
    const price = Number(value);
    if (Number.isFinite(price) && price >= 0) setMasterPrice(product.sku, price);
    setEditing(false);
  }
  function cancel() {
    setValue(String(product.price));
    setEditing(false);
  }

  return (
    <div className="bg-card border-2 border-border rounded-2xl overflow-hidden flex flex-col">
      <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
        {product.image ? (
          <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-contain" />
        ) : (
          <Package className="w-10 h-10 text-muted-foreground" />
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="min-h-10">
          <p className="line-clamp-2">{product.name}</p>
        </div>
        <p className="text-sm text-muted-foreground">{product.sku} · {product.category}</p>

        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          {editing ? (
            <>
              <div className="flex items-center gap-1 flex-1">
                <span className="text-sm text-muted-foreground">GH₵</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  autoFocus
                  className="w-full px-2 py-1.5 rounded-lg bg-background border-2 border-border outline-none focus:border-primary text-right"
                />
              </div>
              <button onClick={save} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={cancel} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground hover:bg-muted/70">
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div>
                <p style={{ fontSize: '1.125rem', lineHeight: 1.1 }}>{formatCedis(product.price)}</p>
                {product.updatedAt && (
                  <p className="text-xs text-muted-foreground">Updated {formatDateTime(product.updatedAt)}</p>
                )}
              </div>
              {canEditPrice ? (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 border-border hover:border-primary text-sm transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              ) : (
                <Lock className="w-4 h-4 text-muted-foreground" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MasterProductCatalog;
