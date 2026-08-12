/**
 * Developer product catalogue editor — paginated sortable table.
 *
 * - Lists every doc in `products` (real-time via onSnapshot).
 * - Sortable columns: name, price, stock, status, updated.
 * - 50 rows per page.
 * - Click a row to expand the inline editor (name, image URL, video URL,
 *   price, quantity, status).
 * - Add / delete products. "Fresh launch" wipes and re-seeds.
 *
 * Every save writes straight to Firestore so any change reflects across
 * the live storefront within the onSnapshot tick (sub-second).
 */
import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { seedProductsAlways, wipeProducts } from '../../../lib/firestore-seeder';
import type { FirestoreProduct, ProductImage } from '../../../lib/firestore-schema';
import {
  Save, Trash2, Plus, RefreshCw, Search, Image as ImageIcon, Film, X, Loader2,
  ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ChevronDown,
  Download, Upload, CheckSquare, Square, MinusSquare, DollarSign, Package as PackageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

type SortKey = 'name' | 'price' | 'totalStock' | 'status' | 'updatedAt';
type SortDir = 'asc' | 'desc';

type Editable = {
  name: string;
  price: number;
  totalStock: number;
  imageUrl: string;
  videoUrl: string;
  status: FirestoreProduct['status'];
};

function toEditable(p: FirestoreProduct): Editable {
  return {
    name: p.name || '',
    price: p.price ?? 0,
    totalStock: p.totalStock ?? 0,
    imageUrl: p.images?.[0]?.url || '',
    videoUrl: p.videos?.[0] || '',
    status: p.status || 'draft',
  };
}

function tsMillis(t: any): number {
  if (!t) return 0;
  if (typeof t === 'object' && typeof t.toMillis === 'function') return (t as Timestamp).toMillis();
  if (typeof t === 'object' && typeof t.seconds === 'number') return t.seconds * 1000;
  return 0;
}

function formatTs(t: any): string {
  const ms = tsMillis(t);
  if (!ms) return '—';
  return new Date(ms).toLocaleString();
}

const CSV_COLUMNS = ['id', 'sku', 'name', 'categoryId', 'price', 'totalStock', 'status', 'imageUrl', 'videoUrl'] as const;

function csvEscape(v: any): string {
  const s = v == null ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function buildCsv(rows: FirestoreProduct[]): string {
  const header = CSV_COLUMNS.join(',');
  const body = rows.map(p => [
    p.id, p.sku || '', p.name || '', p.categoryId || '',
    p.price ?? 0, p.totalStock ?? 0, p.status || 'draft',
    p.images?.[0]?.url || '', p.videos?.[0] || '',
  ].map(csvEscape).join(',')).join('\n');
  return header + '\n' + body + '\n';
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { cur.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        cur.push(field); rows.push(cur); cur = []; field = '';
      } else field += c;
    }
  }
  if (field.length > 0 || cur.length > 0) { cur.push(field); rows.push(cur); }
  if (rows.length === 0) return [];
  const header = rows[0].map(h => h.trim());
  return rows.slice(1)
    .filter(r => r.some(c => c.trim() !== ''))
    .map(r => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}

function downloadFile(name: string, content: string, mime = 'text/csv') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ProductsPanel() {
  const { firebaseUser } = useFirebaseAuth();
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [edits, setEdits] = useState<Record<string, Editable>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [busy, setBusy] = useState<'wipe' | 'seed' | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number | 'all'>('all'); // Changed from 50 to 'all'
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<null | 'price' | 'stock' | 'status' | 'delete'>(null);
  const [bulkValue, setBulkValue] = useState<string>('');
  const [bulkRunning, setBulkRunning] = useState(false);
  const [importPreview, setImportPreview] = useState<null | { rows: Record<string, string>[]; fileName: string }>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name'));
    const unsub = onSnapshot(
      q,
      snap => {
        const rows = snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreProduct));
        setProducts(rows);
        setLoading(false);
      },
      err => { console.error(err); toast.error('Failed to load products.'); setLoading(false); },
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const s = search.toLowerCase();
    return products.filter(p =>
      (p.name || '').toLowerCase().includes(s) ||
      (p.sku || '').toLowerCase().includes(s) ||
      p.id.toLowerCase().includes(s),
    );
  }, [products, search]);

  const sorted = useMemo(() => {
    const rows = [...filtered];
    const dir = sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      let av: any; let bv: any;
      switch (sortKey) {
        case 'name':       av = (a.name || '').toLowerCase(); bv = (b.name || '').toLowerCase(); break;
        case 'price':      av = a.price ?? 0; bv = b.price ?? 0; break;
        case 'totalStock': av = a.totalStock ?? 0; bv = b.totalStock ?? 0; break;
        case 'status':     av = a.status || ''; bv = b.status || ''; break;
        case 'updatedAt':  av = tsMillis(a.updatedAt); bv = tsMillis(b.updatedAt); break;
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return  1 * dir;
      return 0;
    });
    return rows;
  }, [filtered, sortKey, sortDir]);

  const effectivePageSize = pageSize === 'all' ? sorted.length : pageSize;
  const pageCount = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = pageSize === 'all' ? sorted : sorted.slice(safePage * effectivePageSize, safePage * effectivePageSize + effectivePageSize);

  useEffect(() => { setPage(0); }, [search, sortKey, sortDir, pageSize]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir(key === 'updatedAt' ? 'desc' : 'asc'); }
  };

  const setField = (id: string, field: keyof Editable, value: any) => {
    setEdits(prev => {
      const base = prev[id] ?? toEditable(products.find(p => p.id === id)!);
      return { ...prev, [id]: { ...base, [field]: value } };
    });
  };

  const dirty = (id: string) => !!edits[id];

  const save = async (p: FirestoreProduct) => {
    const e = edits[p.id];
    if (!e) return;
    setSavingId(p.id);
    try {
      const nextImages: ProductImage[] = e.imageUrl
        ? [{ url: e.imageUrl, alt: e.name, isPrimary: true, order: 0 }]
        : [];
      const nextVideos: string[] = e.videoUrl ? [e.videoUrl] : [];
      await updateDoc(doc(db, 'products', p.id), {
        name: e.name,
        price: Number(e.price) || 0,
        totalStock: Number(e.totalStock) || 0,
        images: nextImages,
        videos: nextVideos,
        status: e.status,
        isAvailable: (Number(e.totalStock) || 0) > 0 && e.status === 'active',
        updatedAt: serverTimestamp(),
      });
      setEdits(prev => { const n = { ...prev }; delete n[p.id]; return n; });
      toast.success(`Saved "${e.name}".`);
    } catch (err) {
      console.error(err);
      toast.error('Save failed — check your admin permissions.');
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (p: FirestoreProduct) => {
    if (!confirm(`Delete "${p.name}"? This is permanent.`)) return;
    try {
      await deleteDoc(doc(db, 'products', p.id));
      toast.success('Deleted.');
    } catch (err) {
      console.error(err);
      toast.error('Delete failed.');
    }
  };

  const allOnPageSelected = pageRows.length > 0 && pageRows.every(r => selected.has(r.id));
  const someOnPageSelected = pageRows.some(r => selected.has(r.id));

  const togglePageSelection = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allOnPageSelected) pageRows.forEach(r => next.delete(r.id));
      else pageRows.forEach(r => next.add(r.id));
      return next;
    });
  };

  const toggleRow = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const runBulk = async () => {
    if (!bulkAction || selected.size === 0) return;
    if (bulkAction === 'delete' && !confirm(`Delete ${selected.size} products? This is permanent.`)) return;
    setBulkRunning(true);
    try {
      const ids = [...selected];
      const CHUNK = 400;
      for (let i = 0; i < ids.length; i += CHUNK) {
        const batch = writeBatch(db);
        for (const id of ids.slice(i, i + CHUNK)) {
          const ref = doc(db, 'products', id);
          if (bulkAction === 'delete') {
            batch.delete(ref);
          } else if (bulkAction === 'price') {
            const v = Number(bulkValue);
            if (Number.isFinite(v) && v >= 0) batch.update(ref, { price: v, updatedAt: serverTimestamp() });
          } else if (bulkAction === 'stock') {
            const v = Math.max(0, Math.floor(Number(bulkValue) || 0));
            batch.update(ref, { totalStock: v, isAvailable: v > 0, updatedAt: serverTimestamp() });
          } else if (bulkAction === 'status') {
            const v = (bulkValue || 'draft') as FirestoreProduct['status'];
            batch.update(ref, { status: v, updatedAt: serverTimestamp() });
          }
        }
        await batch.commit();
      }
      toast.success(`Updated ${ids.length} product${ids.length === 1 ? '' : 's'}.`);
      clearSelection();
      setBulkAction(null);
      setBulkValue('');
    } catch (err) {
      console.error(err);
      toast.error('Bulk action failed.');
    } finally {
      setBulkRunning(false);
    }
  };

  const exportCsv = () => {
    if (sorted.length === 0) { toast.error('Nothing to export.'); return; }
    downloadFile(`products-${new Date().toISOString().slice(0, 10)}.csv`, buildCsv(sorted));
    toast.success(`Exported ${sorted.length} rows.`);
  };

  const onPickCsv = async (file: File) => {
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) { toast.error('CSV is empty.'); return; }
      setImportPreview({ rows, fileName: file.name });
    } catch (err) {
      console.error(err);
      toast.error('Could not read CSV.');
    }
  };

  const runImport = async () => {
    if (!importPreview) return;
    setImporting(true);
    try {
      const byId = new Map(products.map(p => [p.id, p]));
      const bySku = new Map(products.filter(p => p.sku).map(p => [p.sku.toLowerCase(), p]));
      const rows = importPreview.rows;
      const CHUNK = 400;
      let upserts = 0;
      let creates = 0;
      for (let i = 0; i < rows.length; i += CHUNK) {
        const batch = writeBatch(db);
        for (const r of rows.slice(i, i + CHUNK)) {
          const existing =
            (r.id && byId.get(r.id)) ||
            (r.sku && bySku.get(r.sku.toLowerCase())) ||
            null;
          const targetId = existing?.id || (r.id || r.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          if (!targetId) continue;
          const price = Number(r.price);
          const stock = Math.max(0, Math.floor(Number(r.totalStock) || 0));
          const update: any = { updatedAt: serverTimestamp() };
          if (r.name) update.name = r.name;
          if (r.sku) update.sku = r.sku;
          if (r.categoryId) update.categoryId = r.categoryId;
          if (r.status) update.status = r.status;
          if (Number.isFinite(price)) update.price = price;
          if (r.totalStock !== '') { update.totalStock = stock; update.isAvailable = stock > 0; }
          if (r.imageUrl !== undefined) {
            update.images = r.imageUrl
              ? [{ url: r.imageUrl, alt: r.name || existing?.name || '', isPrimary: true, order: 0 }]
              : [];
          }
          if (r.videoUrl !== undefined) update.videos = r.videoUrl ? [r.videoUrl] : [];

          if (existing) {
            batch.update(doc(db, 'products', existing.id), update);
            upserts++;
          } else {
            batch.set(doc(db, 'products', targetId), {
              id: targetId,
              sku: r.sku || targetId,
              name: r.name || targetId,
              slug: targetId,
              description: '', longDescription: '',
              categoryId: r.categoryId || 'uncategorised',
              categoryName: r.categoryId || 'Uncategorised',
              subcategory: '', tags: [],
              price: Number.isFinite(price) ? price : 0,
              tradePrice: null, costPrice: 0, currency: 'GHS', compareAtPrice: null,
              images: r.imageUrl ? [{ url: r.imageUrl, alt: r.name || '', isPrimary: true, order: 0 }] : [],
              videos: r.videoUrl ? [r.videoUrl] : [],
              hasVariants: false, variants: [], specs: {}, technicalSpecs: [],
              trackInventory: true, totalStock: stock,
              warehouseStock: { accra: stock, kumasi: 0, takoradi: 0 },
              lowStockThreshold: 5,
              status: r.status || (Number.isFinite(price) && price > 0 ? 'active' : 'draft'),
              isAvailable: stock > 0, isFeatured: false, isOnSale: false,
              rating: 0, reviewCount: 0,
              metaTitle: r.name || '', metaDescription: '', keywords: [], badges: [],
              weight: 0, dimensions: { length: 0, width: 0, height: 0 },
              createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
              publishedAt: Number.isFinite(price) && price > 0 ? serverTimestamp() : null,
              viewCount: 0, purchaseCount: 0, cartAddCount: 0,
              importedBy: firebaseUser?.uid || null,
            });
            creates++;
          }
        }
        await batch.commit();
      }
      toast.success(`Imported: ${creates} new, ${upserts} updated.`);
      setImportPreview(null);
    } catch (err) {
      console.error(err);
      toast.error('Import failed.');
    } finally {
      setImporting(false);
    }
  };

  const freshLaunch = async () => {
    if (!firebaseUser) return;
    if (!confirm('Wipe ALL products and re-seed from the canonical list? This is destructive.')) return;
    setBusy('wipe');
    try {
      const w = await wipeProducts();
      setBusy('seed');
      const s = await seedProductsAlways(firebaseUser.uid);
      toast.success(`Wiped ${w.deleted}, seeded ${s.seeded} products.`);
    } catch (err) {
      console.error(err);
      toast.error('Reseed failed.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <h3 className="text-lg font-bold">Product catalogue</h3>
          <p className="text-xs text-muted-foreground">
            {loading ? 'Loading…' : `${sorted.length.toLocaleString()} of ${products.length.toLocaleString()} products`}
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Add product
        </button>

        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-border text-sm font-semibold hover:bg-muted"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>

        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-border text-sm font-semibold hover:bg-muted cursor-pointer">
          <Upload className="w-4 h-4" /> Import CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={ev => {
              const f = ev.target.files?.[0];
              ev.target.value = '';
              if (f) onPickCsv(f);
            }}
          />
        </label>

        <button
          onClick={freshLaunch}
          disabled={!!busy}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-destructive/40 text-destructive text-sm font-semibold hover:bg-destructive/10 disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {busy === 'wipe' ? 'Wiping…' : busy === 'seed' ? 'Seeding…' : 'Fresh launch'}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, SKU, or ID…"
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border-2 border-border focus:border-primary outline-none text-sm"
        />
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border-2 border-primary/40 bg-primary/5">
          <div className="text-sm font-semibold flex-1 min-w-[140px]">
            {selected.size} selected
          </div>
          <select
            value={bulkAction ?? ''}
            onChange={ev => { setBulkAction((ev.target.value || null) as any); setBulkValue(''); }}
            className="px-2 py-1.5 rounded-md bg-background border border-border text-sm"
          >
            <option value="">Choose bulk action…</option>
            <option value="price">Set price</option>
            <option value="stock">Set stock</option>
            <option value="status">Set status</option>
            <option value="delete">Delete</option>
          </select>

          {bulkAction === 'price' && (
            <div className="inline-flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="number" min={0} step="0.01" placeholder="New price"
                value={bulkValue} onChange={ev => setBulkValue(ev.target.value)}
                className="w-32 px-2 py-1.5 rounded-md bg-background border border-border text-sm"
              />
            </div>
          )}
          {bulkAction === 'stock' && (
            <div className="inline-flex items-center gap-1">
              <PackageIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="number" min={0} placeholder="New stock"
                value={bulkValue} onChange={ev => setBulkValue(ev.target.value)}
                className="w-32 px-2 py-1.5 rounded-md bg-background border border-border text-sm"
              />
            </div>
          )}
          {bulkAction === 'status' && (
            <select
              value={bulkValue} onChange={ev => setBulkValue(ev.target.value)}
              className="px-2 py-1.5 rounded-md bg-background border border-border text-sm"
            >
              <option value="">Choose status…</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          )}

          <button
            onClick={runBulk}
            disabled={
              bulkRunning || !bulkAction ||
              (bulkAction !== 'delete' && bulkValue.trim() === '')
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold disabled:opacity-40 ${
              bulkAction === 'delete'
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-primary text-primary-foreground'
            }`}
          >
            {bulkRunning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Apply
          </button>
          <button
            onClick={clearSelection}
            className="px-2 py-1.5 rounded-md border border-border text-sm hover:bg-background"
          >
            Clear
          </button>
        </div>
      )}

      <div className="rounded-xl border-2 border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr className="text-left">
                <th className="w-10 p-2">
                  <button
                    onClick={togglePageSelection}
                    className="p-0.5 text-muted-foreground hover:text-foreground"
                    aria-label="Select page"
                  >
                    {allOnPageSelected
                      ? <CheckSquare className="w-4 h-4" />
                      : someOnPageSelected
                        ? <MinusSquare className="w-4 h-4" />
                        : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="w-10 p-2"></th>
                <th className="w-14 p-2"></th>
                <SortHeader k="name"       label="Name"     active={sortKey} dir={sortDir} onClick={toggleSort} />
                <SortHeader k="price"      label="Price"    active={sortKey} dir={sortDir} onClick={toggleSort} align="right" />
                <SortHeader k="totalStock" label="Stock"    active={sortKey} dir={sortDir} onClick={toggleSort} align="right" />
                <SortHeader k="status"     label="Status"   active={sortKey} dir={sortDir} onClick={toggleSort} />
                <SortHeader k="updatedAt"  label="Updated"  active={sortKey} dir={sortDir} onClick={toggleSort} />
                <th className="w-20 p-2"></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(p => {
                const isExpanded = expandedId === p.id;
                const e = edits[p.id] ?? toEditable(p);
                const isDirty = dirty(p.id);
                const isSaving = savingId === p.id;
                const img = e.imageUrl || p.images?.[0]?.url;
                return (
                  <Fragment key={p.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
                      className={`border-t border-border cursor-pointer hover:bg-muted/30 ${isExpanded ? 'bg-muted/40' : ''} ${selected.has(p.id) ? 'bg-primary/5' : ''}`}
                    >
                      <td className="p-2" onClick={ev => ev.stopPropagation()}>
                        <button
                          onClick={() => toggleRow(p.id)}
                          className="p-0.5 text-muted-foreground hover:text-foreground"
                          aria-label="Select row"
                        >
                          {selected.has(p.id)
                            ? <CheckSquare className="w-4 h-4 text-primary" />
                            : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-2 text-muted-foreground">
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                      </td>
                      <td className="p-2">
                        {img ? (
                          <img src={img} alt={p.name} className="w-10 h-10 object-cover rounded-md border border-border" />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="font-semibold truncate max-w-[280px]">{p.name || '—'}</div>
                        <div className="text-xs text-muted-foreground font-mono">{p.sku || p.id}</div>
                      </td>
                      <td className="p-2 text-right tabular-nums">
                        {(p.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-right tabular-nums">{p.totalStock ?? 0}</td>
                      <td className="p-2">
                        <StatusPill status={p.status} />
                      </td>
                      <td className="p-2 text-xs text-muted-foreground whitespace-nowrap">{formatTs(p.updatedAt)}</td>
                      <td className="p-2 text-right" onClick={ev => ev.stopPropagation()}>
                        {isDirty && (
                          <button
                            onClick={() => save(p)}
                            disabled={isSaving}
                            className="p-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
                            aria-label="Save"
                          >
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-background border-t border-border">
                        <td colSpan={9} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Name">
                              <input
                                value={e.name}
                                onChange={ev => setField(p.id, 'name', ev.target.value)}
                                className="w-full px-2 py-1.5 rounded-md bg-card border border-border text-sm"
                              />
                            </Field>
                            <Field label="Status">
                              <select
                                value={e.status}
                                onChange={ev => setField(p.id, 'status', ev.target.value as FirestoreProduct['status'])}
                                className="w-full px-2 py-1.5 rounded-md bg-card border border-border text-sm"
                              >
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                              </select>
                            </Field>
                            <Field label="Image URL" icon={<ImageIcon className="w-3.5 h-3.5" />}>
                              <input
                                value={e.imageUrl}
                                onChange={ev => setField(p.id, 'imageUrl', ev.target.value)}
                                placeholder="https://…"
                                className="w-full px-2 py-1.5 rounded-md bg-card border border-border text-xs"
                              />
                            </Field>
                            <Field label="Video URL" icon={<Film className="w-3.5 h-3.5" />}>
                              <input
                                value={e.videoUrl}
                                onChange={ev => setField(p.id, 'videoUrl', ev.target.value)}
                                placeholder="https://… (optional)"
                                className="w-full px-2 py-1.5 rounded-md bg-card border border-border text-xs"
                              />
                            </Field>
                            <Field label="Price (GHS)">
                              <input
                                type="number" min={0} step="0.01"
                                value={e.price}
                                onChange={ev => setField(p.id, 'price', Number(ev.target.value))}
                                className="w-full px-2 py-1.5 rounded-md bg-card border border-border text-sm tabular-nums"
                              />
                            </Field>
                            <Field label="Quantity">
                              <input
                                type="number" min={0}
                                value={e.totalStock}
                                onChange={ev => setField(p.id, 'totalStock', Number(ev.target.value))}
                                className="w-full px-2 py-1.5 rounded-md bg-card border border-border text-sm tabular-nums"
                              />
                            </Field>
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-4">
                            <button
                              onClick={() => remove(p)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-destructive border border-destructive/30 hover:bg-destructive/10 text-xs font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                            <button
                              onClick={() => save(p)}
                              disabled={!isDirty || isSaving}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold disabled:opacity-40"
                            >
                              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                              Save changes
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {!loading && pageRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-muted-foreground">
                    No products match this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 p-3 border-t border-border bg-muted/30 text-xs">
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground">
              {pageSize === 'all' ? (
                <>Showing all {sorted.length.toLocaleString()} products</>
              ) : (
                <>
                  Page <span className="font-bold text-foreground">{safePage + 1}</span> of {pageCount}
                  {' · '}
                  Showing {pageRows.length > 0 ? `${safePage * effectivePageSize + 1}–${safePage * effectivePageSize + pageRows.length}` : '0'} of {sorted.length.toLocaleString()}
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Show:</span>
              <select
                value={pageSize}
                onChange={ev => setPageSize(ev.target.value === 'all' ? 'all' : Number(ev.target.value))}
                className="px-2 py-1 rounded border border-border bg-background hover:bg-muted text-xs font-semibold"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={500}>500</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(0)}
              disabled={safePage === 0 || pageSize === 'all'}
              className="px-2 py-1 rounded border border-border hover:bg-background disabled:opacity-40"
            >First</button>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={safePage === 0 || pageSize === 'all'}
              className="p-1.5 rounded border border-border hover:bg-background disabled:opacity-40"
              aria-label="Previous page"
            ><ChevronLeft className="w-3.5 h-3.5" /></button>
            <button
              onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1 || pageSize === 'all'}
              className="p-1.5 rounded border border-border hover:bg-background disabled:opacity-40"
              aria-label="Next page"
            ><ChevronRight className="w-3.5 h-3.5" /></button>
            <button
              onClick={() => setPage(pageCount - 1)}
              disabled={safePage >= pageCount - 1 || pageSize === 'all'}
              className="px-2 py-1 rounded border border-border hover:bg-background disabled:opacity-40"
            >Last</button>
          </div>
        </div>
      </div>

      {showAdd && firebaseUser && (
        <AddProductDialog
          onClose={() => setShowAdd(false)}
          adminUid={firebaseUser.uid}
        />
      )}

      {importPreview && (
        <ImportPreviewDialog
          fileName={importPreview.fileName}
          rows={importPreview.rows}
          existingIds={new Set(products.map(p => p.id))}
          existingSkus={new Set(products.filter(p => p.sku).map(p => p.sku.toLowerCase()))}
          onCancel={() => setImportPreview(null)}
          onConfirm={runImport}
          importing={importing}
        />
      )}
    </div>
  );
}

function ImportPreviewDialog({
  fileName, rows, existingIds, existingSkus, onCancel, onConfirm, importing,
}: {
  fileName: string;
  rows: Record<string, string>[];
  existingIds: Set<string>;
  existingSkus: Set<string>;
  onCancel: () => void;
  onConfirm: () => void;
  importing: boolean;
}) {
  const counts = useMemo(() => {
    let creates = 0; let updates = 0;
    for (const r of rows) {
      const matchesExisting =
        (r.id && existingIds.has(r.id)) ||
        (r.sku && existingSkus.has(r.sku.toLowerCase()));
      if (matchesExisting) updates++; else creates++;
    }
    return { creates, updates };
  }, [rows, existingIds, existingSkus]);

  const preview = rows.slice(0, 8);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border-2 border-border shadow-2xl w-full max-w-3xl p-6 relative">
        <button onClick={onCancel} className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold mb-1">Import CSV</h3>
        <p className="text-xs text-muted-foreground mb-4 font-mono">{fileName}</p>

        <div className="flex gap-3 mb-4 text-sm">
          <div className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold">
            {counts.creates} new
          </div>
          <div className="px-3 py-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold">
            {counts.updates} updates (matched by id/sku)
          </div>
          <div className="px-3 py-2 rounded-lg bg-muted text-foreground font-semibold">
            {rows.length} total rows
          </div>
        </div>

        <div className="text-xs text-muted-foreground mb-2">Preview (first 8 rows)</div>
        <div className="rounded-lg border border-border overflow-x-auto max-h-60">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                {CSV_COLUMNS.map(c => <th key={c} className="text-left p-2 font-semibold">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {preview.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  {CSV_COLUMNS.map(c => (
                    <td key={c} className="p-2 truncate max-w-[160px]" title={r[c] || ''}>{r[c] || '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Columns: <code className="font-mono">{CSV_COLUMNS.join(', ')}</code>. Existing rows match by <code>id</code> then <code>sku</code>. Unrecognised columns are ignored.
        </p>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border-2 border-border text-sm font-semibold">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={importing || rows.length === 0}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold inline-flex items-center gap-2 disabled:opacity-50"
          >
            {importing && <Loader2 className="w-4 h-4 animate-spin" />}
            Import {rows.length} row{rows.length === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SortHeader({
  k, label, active, dir, onClick, align = 'left',
}: {
  k: SortKey; label: string; active: SortKey; dir: SortDir;
  onClick: (k: SortKey) => void; align?: 'left' | 'right';
}) {
  const isActive = active === k;
  return (
    <th className={`p-2 ${align === 'right' ? 'text-right' : 'text-left'} select-none`}>
      <button
        onClick={() => onClick(k)}
        className={`inline-flex items-center gap-1 font-semibold uppercase text-[10px] tracking-wider ${
          isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {label}
        {isActive && (dir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
      </button>
    </th>
  );
}

function StatusPill({ status }: { status: FirestoreProduct['status'] }) {
  const cls =
    status === 'active'   ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' :
    status === 'draft'    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' :
    status === 'archived' ? 'bg-muted text-muted-foreground' :
                            'bg-muted text-muted-foreground';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {status || 'draft'}
    </span>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {icon}{label}
      </span>
      {children}
    </label>
  );
}

function AddProductDialog({ onClose, adminUid }: { onClose: () => void; adminUid: string }) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [saving, setSaving] = useState(false);

  const create = async () => {
    if (!name.trim() || !sku.trim()) {
      toast.error('Name and SKU are required.');
      return;
    }
    const id = sku.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setSaving(true);
    try {
      await setDoc(doc(db, 'products', id), {
        id,
        sku: sku.trim(),
        name: name.trim(),
        slug: id,
        description: '',
        longDescription: '',
        categoryId: 'uncategorised',
        categoryName: 'Uncategorised',
        subcategory: '',
        tags: [],
        price: Number(price) || 0,
        tradePrice: null,
        costPrice: 0,
        currency: 'GHS',
        compareAtPrice: null,
        images: imageUrl ? [{ url: imageUrl, alt: name, isPrimary: true, order: 0 }] : [],
        videos: videoUrl ? [videoUrl] : [],
        hasVariants: false,
        variants: [],
        specs: {},
        technicalSpecs: [],
        trackInventory: true,
        totalStock: Number(stock) || 0,
        warehouseStock: { accra: Number(stock) || 0, kumasi: 0, takoradi: 0 },
        lowStockThreshold: 5,
        status: Number(price) > 0 ? 'active' : 'draft',
        isAvailable: Number(stock) > 0,
        isFeatured: false,
        isOnSale: false,
        rating: 0,
        reviewCount: 0,
        metaTitle: name,
        metaDescription: '',
        keywords: [],
        badges: [],
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: Number(price) > 0 ? serverTimestamp() : null,
        viewCount: 0,
        purchaseCount: 0,
        cartAddCount: 0,
        createdBy: adminUid,
      });
      toast.success('Product added.');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Add failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border-2 border-border shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold mb-4">Add product</h3>
        <div className="space-y-3">
          {[
            { label: 'Name', value: name, set: setName, ph: 'e.g. Pendant Light - Brass' },
            { label: 'SKU', value: sku, set: setSku, ph: 'e.g. LIGHT-PEND-001' },
            { label: 'Image URL', value: imageUrl, set: setImageUrl, ph: 'https://…' },
            { label: 'Video URL', value: videoUrl, set: setVideoUrl, ph: 'https://… (optional)' },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs font-semibold text-muted-foreground">{f.label}</label>
              <input
                value={f.value as string}
                onChange={e => f.set(e.target.value)}
                placeholder={f.ph}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border text-sm focus:border-primary outline-none"
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Price (GHS)</label>
              <input type="number" min={0} step="0.01" value={price} onChange={e => setPrice(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Quantity</label>
              <input type="number" min={0} value={stock} onChange={e => setStock(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border text-sm" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border-2 border-border text-sm font-semibold">Cancel</button>
          <button onClick={create} disabled={saving}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold inline-flex items-center gap-2 disabled:opacity-50">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Create
          </button>
        </div>
      </div>
    </div>
  );
}