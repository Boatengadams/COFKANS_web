import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ShoppingCart, Heart, Star, Check, Minus, Plus, ChevronLeft, ChevronRight,
  Home, Building2, Factory, Sun, Zap, Shield, Wrench, Leaf, Lightbulb,
  Plug, Fan, Sparkles, Play, Truck, RotateCw, Award, Share2,
} from 'lucide-react';
import { getProductMedia, parseEmbedUrl } from '@/lib/product-media';
import type { UseIcon } from '@/stores/product-media-store';

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
}

interface Props {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (id: string, qty: number) => void;
  onToggleWishlist: (id: string) => void;
  isWishlisted: boolean;
  showTradePrice?: boolean;
}

const ICON_MAP: Record<UseIcon, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  home: Home, building: Building2, factory: Factory, sun: Sun, bolt: Zap,
  shield: Shield, wrench: Wrench, leaf: Leaf, lightbulb: Lightbulb,
  plug: Plug, fan: Fan, sparkles: Sparkles,
};

type Tab = 'description' | 'uses' | 'videos';

export function ProductDetailModal({
  product, onClose, onAddToCart, onToggleWishlist, isWishlisted, showTradePrice,
}: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>('description');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const media = useMemo(() => (product ? getProductMedia(product) : null), [product]);

  // Create combined media array with videos as the 5th item
  const combinedMedia = useMemo(() => {
    if (!media) return [];
    const items: Array<{ type: 'image' | 'video'; src: string; videoId?: string; videoKind?: 'url' | 'file'; videoTitle?: string }> = [];
    
    // Add first 4 images
    media.images.slice(0, 4).forEach(src => items.push({ type: 'image', src }));
    
    // Add first video as 5th item if exists
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
    
    // Add remaining images after the video
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
  }, [product?.id]);

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
  const stock = product?.stock ?? 0;
  const tabs: { id: Tab; label: string; count?: number }[] = media ? [
    { id: 'description', label: 'Description' },
    { id: 'uses', label: 'Uses', count: media.uses.length },
    { id: 'videos', label: 'Videos', count: media.videos.length },
  ] : [];

  return (
    <AnimatePresence>
      {product && media && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-card w-full max-w-6xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Floating top bar */}
          <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 md:p-5 pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              {product.badge && (
                <span className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold tracking-wide uppercase shadow-lg">
                  {product.badge}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => onToggleWishlist(product.id)}
                aria-label="Toggle wishlist"
                className={`w-11 h-11 rounded-full backdrop-blur-xl border transition-all flex items-center justify-center ${
                  isWishlisted
                    ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/30'
                    : 'bg-white/80 border-white/60 text-foreground hover:bg-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} strokeWidth={2.2} />
              </button>
              <button
                aria-label="Share"
                className="w-11 h-11 rounded-full bg-white/80 backdrop-blur-xl border border-white/60 text-foreground hover:bg-white flex items-center justify-center"
              >
                <Share2 className="w-5 h-5" strokeWidth={2.2} />
              </button>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-11 h-11 rounded-full bg-white/80 backdrop-blur-xl border border-white/60 text-foreground hover:bg-white flex items-center justify-center"
              >
                <X className="w-5 h-5" strokeWidth={2.4} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid lg:grid-cols-[1.1fr_1fr]">
              {/* GALLERY */}
              <div className="relative bg-gradient-to-br from-muted/40 via-muted/20 to-muted/40 lg:min-h-[640px]">
                <div className="relative aspect-square lg:aspect-auto lg:h-full overflow-hidden">
                  <AnimatePresence mode="wait">
                    {combinedMedia[activeIdx]?.type === 'image' ? (
                      <motion.img
                        key={combinedMedia[activeIdx].src}
                        src={combinedMedia[activeIdx].src}
                        alt={`${product.name} view ${activeIdx + 1}`}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : combinedMedia[activeIdx]?.type === 'video' ? (
                      <motion.div
                        key={combinedMedia[activeIdx].src}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0 w-full h-full flex items-center justify-center bg-black"
                      >
                        {combinedMedia[activeIdx].videoKind === 'file' ? (
                          <video
                            src={combinedMedia[activeIdx].src}
                            controls
                            className="w-full h-full object-contain"
                            autoPlay
                          />
                        ) : (
                          <>
                            {playingVideoId === combinedMedia[activeIdx].videoId ? (
                              <iframe
                                src={parseEmbedUrl(combinedMedia[activeIdx].src).embed + (parseEmbedUrl(combinedMedia[activeIdx].src).embed.includes('?') ? '&' : '?') + 'autoplay=1'}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={combinedMedia[activeIdx].videoTitle ?? 'Product video'}
                              />
                            ) : (
                              <button
                                onClick={() => setPlayingVideoId(combinedMedia[activeIdx].videoId!)}
                                className="relative w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 flex items-center justify-center group"
                              >
                                <div className="relative w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <Play className="w-9 h-9 text-primary ml-1" strokeWidth={2.5} fill="currentColor" />
                                </div>
                              </button>
                            )}
                          </>
                        )}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  {combinedMedia.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveIdx(i => (i - 1 + combinedMedia.length) % combinedMedia.length)}
                        aria-label="Previous media"
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 backdrop-blur-xl border border-white/60 hover:bg-white shadow-lg flex items-center justify-center z-10"
                      >
                        <ChevronLeft className="w-5 h-5" strokeWidth={2.4} />
                      </button>
                      <button
                        onClick={() => setActiveIdx(i => (i + 1) % combinedMedia.length)}
                        aria-label="Next media"
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 backdrop-blur-xl border border-white/60 hover:bg-white shadow-lg flex items-center justify-center z-10"
                      >
                        <ChevronRight className="w-5 h-5" strokeWidth={2.4} />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur text-white text-xs font-bold tabular-nums z-10">
                        {activeIdx + 1} / {combinedMedia.length}
                      </div>
                    </>
                  )}
                </div>

                {combinedMedia.length > 1 && (
                  <div className="p-4 lg:p-5 bg-card/50 backdrop-blur border-t border-border/60">
                    <div className="flex gap-2 overflow-x-auto scrollbar-thin">
                      {combinedMedia.map((item, i) => (
                        <button
                          key={`${item.src}-${i}`}
                          onClick={() => setActiveIdx(i)}
                          aria-label={`View ${item.type} ${i + 1}`}
                          className={`relative shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden transition-all ${
                            i === activeIdx
                              ? 'ring-2 ring-primary ring-offset-2 ring-offset-card'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          {item.type === 'image' ? (
                            <img src={item.src} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-secondary/30 to-primary/30 flex items-center justify-center">
                              <Play className="w-6 h-6 text-white drop-shadow-lg" strokeWidth={2.5} fill="currentColor" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* DETAILS */}
              <div className="p-6 md:p-8 lg:p-10 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    {product.category}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{product.subcategory}</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-3">
                  {product.name}
                </h1>

                <div className="flex items-center gap-4 mb-5 flex-wrap">
                  <code className="text-xs font-mono font-bold bg-muted px-2.5 py-1 rounded-md text-muted-foreground">
                    SKU {product.sku}
                  </code>
                  {product.rating && (
                    <div className="flex items-center gap-1.5">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating!) ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold">{product.rating}</span>
                      {product.reviews && (
                        <span className="text-sm text-muted-foreground">({product.reviews})</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Price block */}
                <div className="mb-6 pb-6 border-b border-border/60">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-4xl font-bold tracking-tight">
                      GH₵ {price.toLocaleString()}
                    </span>
                    {hasSavings && (
                      <>
                        <span className="text-lg text-muted-foreground line-through">
                          GH₵ {product.price.toLocaleString()}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          Save GH₵ {savings.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {stock > 50 ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        In stock · ready to ship
                      </span>
                    ) : stock > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Only {stock} left
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-500">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        Out of stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Trust strip */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <TrustBadge icon={Truck} label="Fast delivery" sub="Same day in Accra" />
                  <TrustBadge icon={Award} label="Genuine" sub="With warranty" />
                  <TrustBadge icon={RotateCw} label="14-day" sub="Easy returns" />
                </div>

                {/* Tabs */}
                <div className="mb-5">
                  <div className="flex gap-1 p-1 bg-muted/60 rounded-xl">
                    {tabs.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                          tab === t.id
                            ? 'bg-card shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {t.label}
                        {t.count !== undefined && t.count > 0 && (
                          <span className={`ml-1.5 text-xs ${tab === t.id ? 'text-primary' : 'text-muted-foreground'}`}>
                            {t.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-h-[120px]">
                  <AnimatePresence mode="wait">
                    {tab === 'description' && (
                      <motion.div
                        key="desc"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                      >
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
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
                        className="grid sm:grid-cols-2 gap-3"
                      >
                        {media.uses.map(u => {
                          const Icon = ICON_MAP[u.icon] ?? Sparkles;
                          return (
                            <div
                              key={u.id}
                              className="p-4 rounded-2xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className="w-9 h-9 rounded-xl bg-primary/12 text-primary flex items-center justify-center mb-2.5">
                                <Icon className="w-4 h-4" strokeWidth={2.4} />
                              </div>
                              <div className="font-bold text-sm mb-1">{u.title}</div>
                              <div className="text-xs text-muted-foreground leading-relaxed">{u.text}</div>
                            </div>
                          );
                        })}
                        {media.uses.length === 0 && (
                          <div className="sm:col-span-2 text-sm text-muted-foreground text-center py-6">
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
                          <div className="text-sm text-muted-foreground text-center py-6">
                            No videos for this product yet.
                          </div>
                        )}
                        {media.videos.map(v => {
                          const playing = playingVideoId === v.id;
                          if (v.kind === 'file') {
                            return (
                              <div key={v.id} className="rounded-2xl overflow-hidden border border-border bg-black">
                                <video src={v.src} controls className="w-full aspect-video" />
                                {v.title && (
                                  <div className="px-4 py-2.5 text-sm font-semibold bg-card text-foreground">
                                    {v.title}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          const { embed } = parseEmbedUrl(v.src);
                          return (
                            <div key={v.id} className="rounded-2xl overflow-hidden border border-border bg-black">
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
                                  className="relative w-full aspect-video bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 flex items-center justify-center group"
                                >
                                  <div className="relative w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Play className="w-7 h-7 text-primary ml-1" strokeWidth={2.5} fill="currentColor" />
                                  </div>
                                </button>
                              )}
                              {v.title && (
                                <div className="px-4 py-2.5 text-sm font-semibold bg-card text-foreground">
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
            </div>
          </div>

          {/* Sticky CTA bar */}
          <div className="border-t border-border bg-card/95 backdrop-blur-xl px-4 md:px-8 py-4 flex items-center gap-3">
            <div className="flex items-center bg-muted rounded-xl overflow-hidden">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="w-10 h-11 flex items-center justify-center hover:bg-muted-foreground/10 disabled:opacity-40 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <div className="w-10 text-center font-bold tabular-nums">{qty}</div>
              <button
                onClick={() => setQty(q => Math.min(stock || 99, q + 1))}
                disabled={stock > 0 && qty >= stock}
                className="w-10 h-11 flex items-center justify-center hover:bg-muted-foreground/10 disabled:opacity-40 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onAddToCart(product.id, qty)}
              disabled={stock === 0}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={2.4} />
              <span>{stock === 0 ? 'Out of stock' : `Add ${qty} to cart · GH₵ ${(price * qty).toLocaleString()}`}</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}

function TrustBadge({
  icon: Icon, label, sub,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/40 border border-border/60">
      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" strokeWidth={2.4} />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-bold leading-tight truncate">{label}</div>
        <div className="text-[10px] text-muted-foreground truncate">{sub}</div>
      </div>
    </div>
  );
}