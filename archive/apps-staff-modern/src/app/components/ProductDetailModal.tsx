import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ShoppingCart, Heart, Star, Check, Minus, Plus, ChevronLeft, ChevronRight,
  Home, Building2, Factory, Sun, Zap, Shield, Wrench, Leaf, Lightbulb,
  Plug, Fan, Sparkles, Play, Share2, Phone, Package,
} from 'lucide-react';
import { getProductMedia, parseEmbedUrl } from '@/lib/product-media';
import type { UseIcon } from '@/stores/product-media-store';
import { BranchContactModal } from './BranchContactModal';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  tradePrice?: number;
  category: string;
  subcategory: string;
  image: string;
  rating?: number;
  reviews?: number;
  stock?: number;
  description?: string;
  badge?: string;
  specs?: string[];
}

interface Props {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (id: string, qty: number) => void;
  onBuyNow?: (id: string, qty: number) => void;
  onToggleWishlist: (id: string) => void;
  isWishlisted: boolean;
  showTradePrice?: boolean;
}

const ICON_MAP: Record<UseIcon, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  home: Home, building: Building2, factory: Factory, sun: Sun, bolt: Zap,
  shield: Shield, wrench: Wrench, leaf: Leaf, lightbulb: Lightbulb,
  plug: Plug, fan: Fan, sparkles: Sparkles,
};

type Tab = 'description' | 'uses' | 'videos';

export function ProductDetailModal({
  product, onClose, onAddToCart, onBuyNow, onToggleWishlist, isWishlisted, showTradePrice,
}: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>('description');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [showEnquire, setShowEnquire] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const media = useMemo(() => (product ? getProductMedia(product) : null), [product]);

  const combinedMedia = useMemo(() => {
    if (!media) return [];
    const items: Array<{ type: 'image' | 'video'; src: string; videoId?: string; videoKind?: 'url' | 'file'; videoTitle?: string }> = [];

    media.images.slice(0, 4).forEach(src => items.push({ type: 'image', src }));

    if (media.videos.length > 0) {
      const firstVideo = media.videos[0];
      items.push({
        type: 'video',
        src: firstVideo.src,
        videoId: firstVideo.id,
        videoKind: firstVideo.kind,
        videoTitle: firstVideo.title,
      });
    }

    if (media.images.length > 4) {
      media.images.slice(4).forEach(src => items.push({ type: 'image', src }));
    }

    return items;
  }, [media]);

  useEffect(() => {
    setActiveIdx(0);
    setQty(1);
    setTab('description');
    setPlayingVideoId(null);
    setShowEnquire(false);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && combinedMedia.length > 0) setActiveIdx(i => (i + 1) % combinedMedia.length);
      if (e.key === 'ArrowLeft' && combinedMedia.length > 0) setActiveIdx(i => (i - 1 + combinedMedia.length) % combinedMedia.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose, combinedMedia.length]);

  const price = product ? (showTradePrice && product.tradePrice ? product.tradePrice : product.price) : 0;
  const hasSavings = !!(product && showTradePrice && product.tradePrice && product.tradePrice < product.price);
  const savings = hasSavings && product ? product.price - (product.tradePrice ?? 0) : 0;
  const hasStockData = typeof product?.stock === 'number';
  const stock = hasStockData ? product.stock ?? 0 : 0;
  const canPurchase = !hasStockData || stock > 0;
  const activeMedia = combinedMedia[activeIdx];

  const keySpecs = useMemo(() => {
    if (!product) return [];
    const fromSpecs = (product.specs ?? [])
      .filter(spec => typeof spec === 'string' && spec.trim().length > 0)
      .slice(0, 6)
      .map(spec => ({ label: 'Feature', value: spec.trim() }));

    if (fromSpecs.length > 0) return fromSpecs;

    return [
      product.sku ? { label: 'SKU', value: product.sku } : null,
      product.category ? { label: 'Category', value: product.category } : null,
      product.subcategory ? { label: 'Type', value: product.subcategory } : null,
      typeof product.stock === 'number' ? { label: 'Stock', value: product.stock > 0 ? `${product.stock} available` : 'Out of stock' } : null,
      product.badge ? { label: 'Badge', value: product.badge } : null,
    ].filter(Boolean) as { label: string; value: string }[];
  }, [product]);

  const tabs: { id: Tab; label: string; count?: number }[] = media ? [
    { id: 'description', label: 'Description' },
    { id: 'uses', label: 'Uses', count: media.uses.length },
    { id: 'videos', label: 'Videos', count: media.videos.length },
  ] : [];

  const shareProduct = async () => {
    if (!product) return;
    const url = `${window.location.origin}${window.location.pathname}#product/${product.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: product.name, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // Sharing is best-effort and should never block the product flow.
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <AnimatePresence>
        {product && media && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-md sm:items-center sm:p-4 lg:p-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-quick-view-title"
              className="relative flex h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-t-[28px] border border-white/80 bg-[#f8f7fb] shadow-[0_30px_90px_rgba(15,23,42,0.28)] sm:h-[90vh] sm:rounded-[28px]"
            >
              <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3 sm:px-6">
                <div className="min-w-0">
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7c3aed]">Cofkans quick view</div>
                  <div className="mt-0.5 truncate text-sm font-semibold text-slate-500">{product.sku}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleWishlist(product.id)}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                      isWishlisted
                        ? 'border-rose-200 bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-[#7c3aed]/40 hover:text-[#7c3aed]'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-white' : ''}`} strokeWidth={2.4} />
                  </button>
                  <button
                    onClick={shareProduct}
                    aria-label="Share product"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-all hover:border-[#7c3aed]/40 hover:text-[#7c3aed]"
                  >
                    <Share2 className="h-4 w-4" strokeWidth={2.4} />
                  </button>
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white transition-all hover:bg-[#7c3aed]"
                  >
                    <X className="h-4 w-4" strokeWidth={2.6} />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)] lg:gap-7 lg:p-8">
                  <section className="min-w-0">
                    <div className="flex flex-col gap-3 md:flex-row-reverse lg:sticky lg:top-8">
                      <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:min-h-[480px] lg:min-h-[620px]">
                        <div
                          className="absolute inset-0"
                          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                          onTouchEnd={(e) => {
                            if (touchStartX.current === null || combinedMedia.length < 2) return;
                            const dx = e.changedTouches[0].clientX - touchStartX.current;
                            if (Math.abs(dx) > 50) {
                              setActiveIdx(i =>
                                dx < 0
                                  ? (i + 1) % combinedMedia.length
                                  : (i - 1 + combinedMedia.length) % combinedMedia.length,
                              );
                            }
                            touchStartX.current = null;
                          }}
                        >
                          <AnimatePresence mode="wait">
                            {activeMedia?.type === 'image' ? (
                              <motion.img
                                key={activeMedia.src}
                                src={activeMedia.src}
                                alt={`${product.name} view ${activeIdx + 1}`}
                                initial={{ opacity: 0, scale: 0.985 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.99 }}
                                transition={{ duration: 0.2 }}
                                draggable={false}
                                className="h-full w-full select-none object-contain p-7 sm:p-10 lg:p-14"
                              />
                            ) : activeMedia?.type === 'video' ? (
                              <motion.div
                                key={activeMedia.src}
                                initial={{ opacity: 0, scale: 1.01 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.99 }}
                                transition={{ duration: 0.22 }}
                                className="flex h-full w-full items-center justify-center bg-slate-950"
                              >
                                {activeMedia.videoKind === 'file' ? (
                                  <video src={activeMedia.src} controls className="h-full w-full object-contain" autoPlay />
                                ) : playingVideoId === activeMedia.videoId ? (
                                  <iframe
                                    src={parseEmbedUrl(activeMedia.src).embed + (parseEmbedUrl(activeMedia.src).embed.includes('?') ? '&' : '?') + 'autoplay=1'}
                                    className="h-full w-full"
                                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title={activeMedia.videoTitle ?? 'Product video'}
                                  />
                                ) : (
                                  <button
                                    onClick={() => setPlayingVideoId(activeMedia.videoId!)}
                                    className="group flex h-full w-full items-center justify-center bg-gradient-to-br from-[#7c3aed]/25 via-slate-950 to-[#c4a44f]/25"
                                  >
                                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#7c3aed] shadow-2xl transition-transform group-hover:scale-110">
                                      <Play className="ml-1 h-9 w-9" strokeWidth={2.5} fill="currentColor" />
                                    </span>
                                  </button>
                                )}
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </div>

                        {product.badge && (
                          <div className="absolute left-4 top-4 rounded-full bg-[#7c3aed] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white shadow-lg">
                            {product.badge}
                          </div>
                        )}

                        {combinedMedia.length > 1 && (
                          <>
                            <button
                              onClick={() => setActiveIdx(i => (i - 1 + combinedMedia.length) % combinedMedia.length)}
                              aria-label="Previous media"
                              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-800 shadow-lg backdrop-blur transition hover:border-[#7c3aed]/30 hover:text-[#7c3aed]"
                            >
                              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => setActiveIdx(i => (i + 1) % combinedMedia.length)}
                              aria-label="Next media"
                              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-800 shadow-lg backdrop-blur transition hover:border-[#7c3aed]/30 hover:text-[#7c3aed]"
                            >
                              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
                            </button>
                          </>
                        )}
                      </div>

                      {combinedMedia.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1 md:w-24 md:flex-col md:overflow-y-auto md:overflow-x-hidden md:pb-0">
                          {combinedMedia.map((item, i) => (
                            <button
                              key={`${item.src}-${i}`}
                              onClick={() => setActiveIdx(i)}
                              aria-label={`View ${item.type} ${i + 1}`}
                              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-white transition-all md:h-24 md:w-24 ${
                                i === activeIdx
                                  ? 'border-[#7c3aed] shadow-[0_10px_25px_rgba(124,58,237,0.2)] ring-2 ring-[#7c3aed]/15'
                                  : 'border-slate-200 opacity-75 hover:opacity-100'
                              }`}
                            >
                              {item.type === 'image' ? (
                                <img src={item.src} alt="" className="h-full w-full object-contain p-2" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#7c3aed]/25 to-slate-900">
                                  <Play className="h-6 w-6 text-white" strokeWidth={2.5} fill="currentColor" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="min-w-0 space-y-5">
                    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] sm:p-6 lg:p-7">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#7c3aed]/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#7c3aed]">
                          {product.category}
                        </span>
                        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500">
                          {product.subcategory}
                        </span>
                      </div>

                      <h1 id="product-quick-view-title" className="text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                        {product.name}
                      </h1>

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        {product.rating && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < Math.floor(product.rating!) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                                  strokeWidth={1.6}
                                />
                              ))}
                            </div>
                            <span className="font-black text-slate-900">{product.rating}</span>
                            {product.reviews ? <span className="font-semibold text-slate-500">({product.reviews} reviews)</span> : null}
                          </div>
                        )}
                        <span className="h-4 w-px bg-slate-200" />
                        <span className="font-semibold text-slate-500">SKU: <span className="font-black text-slate-900">{product.sku}</span></span>
                      </div>

                      <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                        {media.description}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950">
                          <Package className="h-4 w-4 text-[#7c3aed]" strokeWidth={2.4} />
                          Key details
                        </div>
                        <div className="space-y-2">
                          {keySpecs.map((spec, i) => (
                            <div key={`${spec.label}-${spec.value}-${i}`} className="flex gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#7c3aed]" strokeWidth={2.6} />
                              <div className="min-w-0">
                                <div className="text-[11px] font-black uppercase tracking-wide text-slate-400">{spec.label}</div>
                                <div className="text-sm font-bold leading-snug text-slate-800">{spec.value}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-3 text-sm font-black text-slate-950">Product summary</div>
                        <div className="space-y-3">
                          {product.category && <ProductSummaryItem label="Category" value={product.category} />}
                          {product.subcategory && <ProductSummaryItem label="Type" value={product.subcategory} />}
                          {product.sku && <ProductSummaryItem label="SKU" value={product.sku} />}
                          {hasStockData && (
                            <ProductSummaryItem
                              label="Availability"
                              value={stock > 0 ? `${stock} available` : 'Out of stock'}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-[#7c3aed]/15 bg-white p-5 shadow-[0_20px_55px_rgba(124,58,237,0.10)] sm:p-6">
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black ${
                            !hasStockData
                              ? 'bg-slate-100 text-slate-700'
                              : stock > 0
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                          }`}>
                            <span className={`h-2 w-2 rounded-full ${
                              !hasStockData ? 'bg-slate-400' : stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                            }`} />
                            {!hasStockData ? 'Check availability' : stock > 0 ? 'In stock' : 'Out of stock'}
                          </div>
                          {hasStockData && stock > 0 && (
                            <div className="mt-1 text-xs font-semibold text-slate-500">
                              {product.stock} available
                            </div>
                          )}
                        </div>

                        {price > 0 ? (
                          <div className="text-right">
                            <div className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                              GH₵ {price.toLocaleString()}
                            </div>
                            {hasSavings && (
                              <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
                                <span className="text-sm font-bold text-slate-400 line-through">GH₵ {product.price.toLocaleString()}</span>
                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                                  Save GH₵ {savings.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-right">
                            <div className="text-2xl font-black tracking-tight text-slate-950">Enquire for price</div>
                            <button
                              onClick={() => setShowEnquire(true)}
                              className="mt-2 rounded-full bg-[#7c3aed] px-4 py-2 text-sm font-black text-white shadow-lg shadow-[#7c3aed]/20 transition hover:bg-[#6828d8]"
                            >
                              Contact a branch
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-[132px_minmax(0,1fr)]">
                        <div className="flex h-12 items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-1">
                          <button
                            onClick={() => setQty(q => Math.max(1, q - 1))}
                            disabled={qty <= 1}
                            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-white disabled:opacity-40"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" strokeWidth={2.6} />
                          </button>
                          <div className="w-10 text-center text-base font-black tabular-nums text-slate-950">{qty}</div>
                          <button
                            onClick={() => setQty(q => Math.min(hasStockData ? stock : 99, q + 1))}
                            disabled={hasStockData && stock > 0 && qty >= stock}
                            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-white disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" strokeWidth={2.6} />
                          </button>
                        </div>

                        {!canPurchase ? (
                          <button
                            disabled
                            className="h-12 rounded-full bg-slate-100 px-5 text-sm font-black text-slate-400"
                          >
                            Out of stock
                          </button>
                        ) : price > 0 ? (
                          <div className={`grid gap-3 ${onBuyNow ? 'sm:grid-cols-2' : ''}`}>
                            <motion.button
                              whileTap={{ scale: 0.98 }}
                              onClick={() => onAddToCart(product.id, qty)}
                              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#7c3aed]/25 bg-white px-5 text-sm font-black text-[#7c3aed] shadow-sm transition hover:bg-[#7c3aed]/5"
                            >
                              <ShoppingCart className="h-4 w-4" strokeWidth={2.5} />
                              Add to Cart
                            </motion.button>
                            {onBuyNow && (
                              <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onBuyNow(product.id, qty)}
                                className="inline-flex h-12 items-center justify-center rounded-full bg-[#7c3aed] px-5 text-sm font-black text-white shadow-xl shadow-[#7c3aed]/25 transition hover:bg-[#6828d8]"
                              >
                                Buy Now · GH₵ {(price * qty).toLocaleString()}
                              </motion.button>
                            )}
                          </div>
                        ) : (
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowEnquire(true)}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#7c3aed] px-5 text-sm font-black text-white shadow-xl shadow-[#7c3aed]/25 transition hover:bg-[#6828d8]"
                          >
                            <Phone className="h-4 w-4" strokeWidth={2.5} />
                            Enquire for price
                          </motion.button>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                      <div className="mb-4 flex gap-1 rounded-2xl bg-slate-100 p-1">
                        {tabs.map(t => (
                          <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-black transition-all ${
                              tab === t.id
                                ? 'bg-white text-[#7c3aed] shadow-sm'
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            {t.label}
                            {t.count !== undefined && t.count > 0 && (
                              <span className={`ml-1.5 text-xs ${tab === t.id ? 'text-[#7c3aed]' : 'text-slate-400'}`}>
                                {t.count}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="min-h-[150px]">
                        <AnimatePresence mode="wait">
                          {tab === 'description' && (
                            <motion.div
                              key="desc"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.18 }}
                              className="rounded-2xl bg-slate-50 p-4"
                            >
                              <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                                {media.description}
                              </p>
                            </motion.div>
                          )}

                          {tab === 'uses' && (
                            <motion.div
                              key="uses"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.18 }}
                              className="grid gap-3 sm:grid-cols-2"
                            >
                              {media.uses.map(u => {
                                const Icon = ICON_MAP[u.icon] ?? Sparkles;
                                return (
                                  <div
                                    key={u.id}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-[#7c3aed]/30 hover:bg-white"
                                  >
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7c3aed]/10 text-[#7c3aed]">
                                      <Icon className="h-5 w-5" strokeWidth={2.4} />
                                    </div>
                                    <div className="mb-1 text-sm font-black text-slate-950">{u.title}</div>
                                    <div className="text-xs leading-5 text-slate-600">{u.text}</div>
                                  </div>
                                );
                              })}
                              {media.uses.length === 0 && (
                                <div className="rounded-2xl bg-slate-50 py-8 text-center text-sm font-semibold text-slate-500 sm:col-span-2">
                                  No use cases listed yet.
                                </div>
                              )}
                            </motion.div>
                          )}

                          {tab === 'videos' && (
                            <motion.div
                              key="videos"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.18 }}
                              className="space-y-3"
                            >
                              {media.videos.length === 0 && (
                                <div className="rounded-2xl bg-slate-50 py-8 text-center text-sm font-semibold text-slate-500">
                                  No videos for this product yet.
                                </div>
                              )}
                              {media.videos.map(v => {
                                const playing = playingVideoId === v.id;
                                if (v.kind === 'file') {
                                  return (
                                    <div key={v.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
                                      <video src={v.src} controls className="w-full aspect-video" />
                                      {v.title && (
                                        <div className="bg-white px-4 py-3 text-sm font-black text-slate-950">
                                          {v.title}
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                                const { embed } = parseEmbedUrl(v.src);
                                return (
                                  <div key={v.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
                                    {playing ? (
                                      <iframe
                                        src={embed + (embed.includes('?') ? '&' : '?') + 'autoplay=1'}
                                        className="w-full aspect-video"
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title={v.title ?? 'Product video'}
                                      />
                                    ) : (
                                      <button
                                        onClick={() => setPlayingVideoId(v.id)}
                                        className="group flex w-full aspect-video items-center justify-center bg-gradient-to-br from-[#7c3aed]/25 via-slate-950 to-[#c4a44f]/25"
                                      >
                                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#7c3aed] shadow-2xl transition-transform group-hover:scale-110">
                                          <Play className="ml-1 h-7 w-7" strokeWidth={2.5} fill="currentColor" />
                                        </span>
                                      </button>
                                    )}
                                    {v.title && (
                                      <div className="bg-white px-4 py-3 text-sm font-black text-slate-950">
                                        {v.title}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BranchContactModal open={showEnquire} onClose={() => setShowEnquire(false)} productName={product?.name} />
    </>,
    document.body,
  );
}

function ProductSummaryItem({
  label, value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="min-w-0">
        <div className="text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</div>
        <div className="mt-0.5 break-words text-sm font-bold leading-snug text-slate-800">{value}</div>
      </div>
    </div>
  );
}
