import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Save, DollarSign, Filter, CheckCircle, AlertCircle, Tag } from 'lucide-react';
import { doc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { csvProducts } from '../../data/csvProducts';
import { usePriceOverrides } from '../../hooks/usePriceOverrides';
import { priceOverrideSchema, safeParse } from '@/lib/validators';

type EditMap = Record<string, string>;

export function BulkPriceEditor() {
  const overrides = usePriceOverrides();
  const [query, setQuery] = useState('');
  const [subcategory, setSubcategory] = useState<string>('all');
  const [onlyUnpriced, setOnlyUnpriced] = useState(true);
  const [edits, setEdits] = useState<EditMap>({});
  const [bulkValue, setBulkValue] = useState('');
  const [saving, setSaving] = useState(false);

  const subcategories = useMemo(() => {
    const set = new Set<string>();
    csvProducts.forEach((p) => set.add(p.subcategory));
    return ['all', ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return csvProducts.filter((p) => {
      const current = overrides[p.sku] ?? p.price;
      if (onlyUnpriced && current > 0) return false;
      if (subcategory !== 'all' && p.subcategory !== subcategory) return false;
      if (!q) return true;
      return (
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q)
      );
    });
  }, [query, subcategory, onlyUnpriced, overrides]);

  const dirtyCount = Object.values(edits).filter((v) => v !== '').length;

  const applyBulkToVisible = () => {
    const v = bulkValue.trim();
    if (!v || isNaN(Number(v))) {
      toast.error('Enter a valid number first');
      return;
    }
    const next: EditMap = { ...edits };
    filtered.forEach((p) => {
      next[p.sku] = v;
    });
    setEdits(next);
    toast.success(`Applied GH₵ ${v} to ${filtered.length} items (not saved yet)`);
  };

  const saveAll = async () => {
    const validated: Array<{ sku: string; price: number }> = [];
    let rejected = 0;
    for (const [sku, val] of Object.entries(edits)) {
      if (val === '') continue;
      const parsed = safeParse(priceOverrideSchema, { sku, price: val });
      if (parsed.ok) validated.push(parsed.data);
      else rejected += 1;
    }
    if (validated.length === 0) {
      toast.error(rejected > 0 ? 'No valid edits to save' : 'No edits to save');
      return;
    }
    if (rejected > 0) toast.error(`${rejected} edit(s) skipped (invalid SKU or price)`);
    setSaving(true);
    try {
      // Firestore batch limit is 500 ops
      const chunks: typeof validated[] = [];
      for (let i = 0; i < validated.length; i += 400) {
        chunks.push(validated.slice(i, i + 400));
      }
      for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach(({ sku, price }) => {
          batch.set(doc(db, 'productPriceOverrides', sku), {
            price,
            updatedAt: serverTimestamp(),
          }, { merge: true });
        });
        await batch.commit();
      }
      toast.success(`Saved ${validated.length} prices`);
      setEdits({});
    } catch (err) {
      console.error('Bulk save failed:', err);
      toast.error('Failed to save prices');
    } finally {
      setSaving(false);
    }
  };

  const saveSingle = async (sku: string) => {
    const parsed = safeParse(priceOverrideSchema, { sku, price: edits[sku] });
    if (!parsed.ok) {
      toast.error(parsed.error);
      return;
    }
    try {
      await setDoc(doc(db, 'productPriceOverrides', parsed.data.sku), {
        price: parsed.data.price,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      toast.success('Saved');
      setEdits((e) => ({ ...e, [sku]: '' }));
    } catch (err) {
      // Never surface raw Firestore errors to admin (avoids info disclosure
      // of rule structure / paths). Log to console for diagnostics only.
      console.error('Price save failed', err);
      toast.error('Failed to save');
    }
  };

  const totalUnpriced = csvProducts.filter((p) => (overrides[p.sku] ?? p.price) === 0).length;
  const totalPriced = csvProducts.length - totalUnpriced;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-2">Bulk Price Editor</h2>
        <p className="text-muted-foreground text-sm">
          Set prices for the {csvProducts.length} CSV-imported products. Overrides are stored in Firestore and applied live on the storefront.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-card border-2 border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold mb-1">
            <Tag className="w-4 h-4" /> TOTAL
          </div>
          <div className="text-2xl font-bold">{csvProducts.length}</div>
        </div>
        <div className="bg-card border-2 border-green-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-green-600 text-xs font-bold mb-1">
            <CheckCircle className="w-4 h-4" /> PRICED
          </div>
          <div className="text-2xl font-bold text-green-600">{totalPriced}</div>
        </div>
        <div className="bg-card border-2 border-orange-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-orange-600 text-xs font-bold mb-1">
            <AlertCircle className="w-4 h-4" /> UNPRICED
          </div>
          <div className="text-2xl font-bold text-orange-600">{totalUnpriced}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border-2 border-border rounded-2xl p-4 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search SKU or name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary text-sm cursor-pointer appearance-none"
            >
              {subcategories.map((s) => (
                <option key={s} value={s}>{s === 'all' ? 'All Subcategories' : s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={onlyUnpriced}
              onChange={(e) => setOnlyUnpriced(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            Show only unpriced
          </label>

          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <input
                type="number"
                placeholder="Bulk price"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                className="w-32 pl-7 pr-2 py-2 bg-background border-2 border-border rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={applyBulkToVisible}
              className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm font-bold cursor-pointer"
            >
              Apply to {filtered.length}
            </button>
          </div>
        </div>
      </div>

      {/* Save bar */}
      {dirtyCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-4 z-10 bg-primary text-white border-2 border-primary rounded-2xl p-4 flex items-center justify-between shadow-lg"
        >
          <div className="font-bold">{dirtyCount} unsaved {dirtyCount === 1 ? 'edit' : 'edits'}</div>
          <div className="flex gap-2">
            <button
              onClick={() => setEdits({})}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm cursor-pointer"
            >
              Discard
            </button>
            <button
              onClick={saveAll}
              disabled={saving}
              className="px-4 py-2 bg-white text-primary hover:bg-white/90 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save all'}
            </button>
          </div>
        </motion.div>
      )}

      {/* List */}
      <div className="bg-card border-2 border-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[64px_1fr_140px_160px_80px] gap-3 px-4 py-3 bg-muted text-xs font-bold text-muted-foreground border-b-2 border-border items-center">
          <div></div>
          <div>NAME / SKU</div>
          <div>CURRENT</div>
          <div>NEW PRICE (GH₵)</div>
          <div></div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No products match your filters.
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto divide-y divide-border">
            {filtered.slice(0, 200).map((p) => {
              const current = overrides[p.sku] ?? p.price;
              const editVal = edits[p.sku] ?? '';
              return (
                <div key={p.sku} className="grid grid-cols-[64px_1fr_140px_160px_80px] gap-3 px-4 py-3 items-center hover:bg-muted/30">
                  <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover" loading="lazy" />
                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.sku} · {p.subcategory}</div>
                  </div>
                  <div className="text-sm">
                    {current > 0 ? (
                      <span className="font-bold text-green-600">GH₵ {current.toFixed(2)}</span>
                    ) : (
                      <span className="text-orange-600 font-bold">Unpriced</span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editVal}
                    onChange={(e) => setEdits({ ...edits, [p.sku]: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => saveSingle(p.sku)}
                    disabled={!editVal}
                    className="px-3 py-2 bg-primary text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
                  >
                    Save
                  </button>
                </div>
              );
            })}
            {filtered.length > 200 && (
              <div className="text-center text-xs text-muted-foreground py-3">
                Showing first 200 of {filtered.length}. Narrow the filter to see more.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
