import { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Search, Plus, Trash2, Upload, Link as LinkIcon, Video, Image as ImageIcon,
  RotateCcw, Eye, Sparkles, FileText, LayoutGrid, Star,
} from 'lucide-react';
import { fullProductCatalog, type Product } from '../../data/products-full';
import { useProductMediaStore } from '@/stores/product-media-store';
import { getProductMedia, USE_ICON_OPTIONS } from '@/lib/product-media';
import { uploadPublicMedia } from '@/lib/supabase';
import { ProductDetailModal } from '../ProductDetailModal';
import toast from 'react-hot-toast';

export function ProductMediaManager() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Product | null>(null);

  const overrides = useProductMediaStore(s => s.overrides);
  const editedCount = Object.keys(overrides).length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return fullProductCatalog.slice(0, 80);
    return fullProductCatalog
      .filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.subcategory.toLowerCase().includes(q))
      .slice(0, 80);
  }, [search]);

  const selected = useMemo(
    () => fullProductCatalog.find(p => p.id === selectedId) ?? null,
    [selectedId],
  );

  return (
    <>
      {/* Top stat strip */}
      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <StatCard icon={LayoutGrid} label="Catalog" value={fullProductCatalog.length.toLocaleString()} sub="products available" />
        <StatCard icon={Sparkles} label="Customised" value={editedCount.toString()} sub="with media overrides" accent />
        <StatCard icon={ImageIcon} label="Storage" value="In-memory" sub="DEMO_MODE persisted locally" />
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-5 items-start">
        {/* Product list */}
        <div className="bg-card border border-border rounded-3xl p-4 lg:sticky lg:top-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, SKU, type…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 mb-2">
            {filtered.length} of {fullProductCatalog.length}
          </div>
          <div className="max-h-[68vh] overflow-y-auto pr-1 space-y-1">
            {filtered.map(p => {
              const hasOverride = !!overrides[p.id];
              const active = selectedId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all ${
                    active ? 'bg-primary/10 ring-2 ring-primary/40' : 'hover:bg-muted'
                  }`}
                >
                  <img src={p.image} alt="" className="w-11 h-11 rounded-lg object-cover bg-muted shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold truncate">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{p.sku}</div>
                  </div>
                  {hasOverride && (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-500" title="Has overrides" />
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-10">No products match.</div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div>
          {!selected ? (
            <div className="bg-gradient-to-br from-card to-muted/30 border-2 border-dashed border-border rounded-3xl p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto mb-4 flex items-center justify-center">
                <ImageIcon className="w-8 h-8" strokeWidth={1.8} />
              </div>
              <h3 className="font-bold text-lg mb-1">Pick a product to customise</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Manage gallery images, marketing description, rich use-case cards and product videos — everything that shows on the public product page.
              </p>
            </div>
          ) : (
            <Editor
              key={selected.id}
              product={selected}
              onPreview={() => setPreview(selected)}
            />
          )}
        </div>
      </div>

      <ProductDetailModal
        product={preview}
        onClose={() => setPreview(null)}
        onAddToCart={() => toast.success('Preview — cart disabled')}
        onToggleWishlist={() => {}}
        isWishlisted={false}
      />
    </>
  );
}

function StatCard({
  icon: Icon, label, value, sub, accent,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string; value: string; sub: string; accent?: boolean;
}) {
  return (
    <div className={`p-4 rounded-2xl border ${accent ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}>
          <Icon className="w-5 h-5" strokeWidth={2.4} />
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="font-bold text-lg leading-tight">{value}</div>
          <div className="text-[11px] text-muted-foreground">{sub}</div>
        </div>
      </div>
    </div>
  );
}

function Editor({ product, onPreview }: { product: Product; onPreview: () => void }) {
  const store = useProductMediaStore();
  const override = useProductMediaStore(s => s.overrides[product.id]);
  const media = getProductMedia(product);

  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState(override?.description ?? media.description);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [newUse, setNewUse] = useState({ icon: 'home' as const, title: '', text: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);

  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    store.addImage(product.id, imageUrl.trim());
    setImageUrl('');
    toast.success('Image added');
  };
  const handleFileUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const { publicUrl } = await uploadPublicMedia(file, {
        folder: 'Products',
        pathPrefix: product.sku || product.id,
      });
      store.addImage(product.id, publicUrl);
      toast.success('Image uploaded');
    } catch (err) {
      console.error(err);
      toast.error('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };
  const handleAddVideoUrl = () => {
    if (!videoUrl.trim()) return;
    store.addVideo(product.id, { kind: 'url', src: videoUrl.trim(), title: videoTitle.trim() || undefined });
    setVideoUrl(''); setVideoTitle('');
    toast.success('Video added');
  };
  const handleVideoFile = (file: File) => {
    store.addVideo(product.id, { kind: 'file', src: URL.createObjectURL(file), title: videoTitle.trim() || file.name });
    setVideoTitle('');
    toast.success('Video uploaded');
  };
  const handleAddUse = () => {
    if (!newUse.title.trim() || !newUse.text.trim()) return;
    store.addUse(product.id, newUse);
    setNewUse({ icon: 'home', title: '', text: '' });
    toast.success('Use case added');
  };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/30 p-5 md:p-6"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative">
            <img src={product.image} alt="" className="w-20 h-20 rounded-2xl object-cover bg-muted ring-2 ring-border" />
            {override && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-card flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">{product.category}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs text-muted-foreground">{product.subcategory}</span>
            </div>
            <div className="font-bold text-xl truncate">{product.name}</div>
            <div className="flex items-center gap-3 mt-1">
              <code className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">{product.sku}</code>
              <span className="text-sm font-bold">GH₵ {product.price.toLocaleString()}</span>
              {product.rating && (
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {product.rating}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onPreview}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
            >
              <Eye className="w-4 h-4" /> Live preview
            </button>
            {override && (
              <button
                onClick={() => { store.reset(product.id); toast.success('Reset to defaults'); }}
                className="px-4 py-2.5 rounded-xl border border-border font-bold text-sm flex items-center gap-2 hover:bg-muted transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Images */}
      <Panel icon={ImageIcon} title="Gallery images" subtitle="The first image shows on the catalog card. Customers see all images in the detail modal.">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {media.images.map((src, i) => (
            <motion.div
              key={`${src}-${i}`}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="relative group aspect-square rounded-2xl overflow-hidden border border-border bg-muted"
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-primary text-white text-[10px] font-bold tracking-wider uppercase shadow-lg">
                  Primary
                </span>
              )}
              {override?.images && (
                <button
                  onClick={() => store.removeImage(product.id, i)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
        <div className="grid sm:grid-cols-[1fr_auto] gap-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddImage()}
                placeholder="Paste image URL and press Enter…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
            <button onClick={handleAddImage} className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm flex items-center gap-1 hover:opacity-90">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadingImage}
            className="px-4 py-2.5 rounded-xl border border-border font-bold text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors"
          >
            <Upload className="w-4 h-4" /> {uploadingImage ? 'Uploading...' : 'Upload'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) void handleFileUpload(f); e.target.value = ''; }}
          />
        </div>
      </Panel>

      {/* Description */}
      <Panel icon={FileText} title="Marketing description">
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          className="w-full p-4 rounded-xl border border-border bg-background text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">{description.length} characters</span>
          <button
            onClick={() => { store.setDescription(product.id, description); toast.success('Description saved'); }}
            className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90"
          >
            Save description
          </button>
        </div>
      </Panel>

      {/* Uses */}
      <Panel icon={Sparkles} title="Use cases" subtitle="Rich cards shown on the product detail modal — what is this product good for?">
        <div className="space-y-2 mb-4">
          {media.uses.map(u => (
            <div key={u.id} className="grid grid-cols-[110px_1fr_auto] gap-3 p-3 rounded-2xl border border-border bg-muted/30">
              <select
                value={u.icon}
                onChange={e => store.updateUse(product.id, u.id, { icon: e.target.value as typeof u.icon })}
                disabled={!override?.uses}
                className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs font-semibold self-start disabled:opacity-60"
              >
                {USE_ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="min-w-0">
                <input
                  value={u.title}
                  onChange={e => store.updateUse(product.id, u.id, { title: e.target.value })}
                  disabled={!override?.uses}
                  className="w-full px-2 py-1 rounded-md border-0 bg-transparent text-sm font-bold mb-1 focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-70"
                />
                <textarea
                  value={u.text}
                  onChange={e => store.updateUse(product.id, u.id, { text: e.target.value })}
                  disabled={!override?.uses}
                  rows={2}
                  className="w-full px-2 py-1 rounded-md border-0 bg-transparent text-xs text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-70"
                />
              </div>
              {override?.uses && (
                <button
                  onClick={() => store.removeUse(product.id, u.id)}
                  className="self-start p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {!override?.uses && (
            <div className="text-xs text-muted-foreground italic px-1">Showing smart defaults — add your own use case below to customise.</div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr_1.4fr_auto] gap-2 p-3 rounded-2xl border-2 border-dashed border-border bg-muted/20">
          <select
            value={newUse.icon}
            onChange={e => setNewUse(u => ({ ...u, icon: e.target.value as typeof u.icon }))}
            className="px-2 py-2 rounded-lg border border-border bg-background text-xs font-semibold"
          >
            {USE_ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input
            value={newUse.title}
            onChange={e => setNewUse(u => ({ ...u, title: e.target.value }))}
            placeholder="Title — e.g. Home lighting"
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            value={newUse.text}
            onChange={e => setNewUse(u => ({ ...u, text: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleAddUse()}
            placeholder="One-line description shown on the card"
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button onClick={handleAddUse} className="px-4 py-2 rounded-lg bg-primary text-white font-bold text-sm flex items-center justify-center gap-1 hover:opacity-90">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </Panel>

      {/* Videos */}
      <Panel icon={Video} title="Product videos" subtitle="Paste a YouTube / Vimeo link, or upload an MP4 demo.">
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          {media.videos.map(v => (
            <div key={v.id} className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-muted/30">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Video className="w-5 h-5" strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{v.title || (v.kind === 'url' ? 'Linked video' : 'Uploaded video')}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {v.kind === 'url' ? v.src : 'In-memory file'}
                </div>
              </div>
              <button onClick={() => store.removeVideo(product.id, v.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {media.videos.length === 0 && (
            <div className="sm:col-span-2 text-sm text-muted-foreground text-center py-6 italic">No videos yet.</div>
          )}
        </div>
        <input
          value={videoTitle}
          onChange={e => setVideoTitle(e.target.value)}
          placeholder="Optional video title…"
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <div className="grid sm:grid-cols-[1fr_auto] gap-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddVideoUrl()}
                placeholder="YouTube or Vimeo URL…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <button onClick={handleAddVideoUrl} className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm flex items-center gap-1 hover:opacity-90">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <button
            onClick={() => videoFileRef.current?.click()}
            className="px-4 py-2.5 rounded-xl border border-border font-bold text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors"
          >
            <Upload className="w-4 h-4" /> Upload MP4
          </button>
          <input ref={videoFileRef} type="file" accept="video/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoFile(f); e.target.value = ''; }}
          />
        </div>
      </Panel>
    </div>
  );
}

function Panel({
  icon: Icon, title, subtitle, children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl p-5 md:p-6"
    >
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="w-4 h-4" strokeWidth={2.4} />
        </div>
        <h3 className="font-bold">{title}</h3>
      </div>
      {subtitle ? (
        <p className="text-xs text-muted-foreground mb-4 ml-10">{subtitle}</p>
      ) : (
        <div className="mb-4" />
      )}
      {children}
    </motion.div>
  );
}
