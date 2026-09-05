import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, Star, Truck, MapPin, Link as LinkIcon, Play, X } from 'lucide-react';
import { csvProducts } from '../data/csvProducts';
import { getProduct } from '../../services/product-firebase-service';
import { useProductOverrides } from '../hooks/useProductOverrides';
import { useCartStore } from '../../stores/cart-store';
import toast from 'react-hot-toast';
import { getProductMedia, parseEmbedUrl } from '@/lib/product-media';
import { Link as RouterLink } from 'expo-router';
import { ReviewService } from '@/lib/firestore-service';
import { useFirebaseAuth as useAuth } from '../contexts/FirebaseAuthContext';

interface Props {
  productId: string;
  onClose: () => void;
}

export default function ProductPage({ productId, onClose }: Props) {
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const overrides = useProductOverrides();
  const { addItem } = useCartStore();
  const { user, firebaseUser, isAuthenticated } = useAuth();

  // Media gallery state
  const [activeIdx, setActiveIdx] = useState(0);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [tab, setTab] = useState<'details' | 'specs' | 'reviews' | 'delivery'>('details');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        // Try firestore first
        const p = await getProduct(productId);
        if (mounted && p) {
          setProduct(p);
          setLoading(false);
          return;
        }
      } catch (e) {
        // ignore and fallback
        console.warn('Firestore product load failed, falling back to CSV', e);
      }

      // Fallback to bundled CSV products
      const csv = (csvProducts as any[]).find((c: any) => c.id === productId || c.sku === productId);
      if (csv) {
        // merge overrides
        const ov = overrides[csv.sku] ?? {};
        setProduct({ ...csv, ...ov });
      } else {
        setProduct(null);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [productId, overrides]);

  // Load approved reviews for this product
  useEffect(() => {
    let mounted = true;
    if (!product?.id) return;
    setReviewsLoading(true);
    (async () => {
      try {
        const revs = await ReviewService.getProductReviews(product.id || product.sku);
        if (mounted) setReviews(revs || []);
      } catch (err) {
        console.error('Failed to load reviews', err);
      } finally {
        if (mounted) setReviewsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [product?.id]);

  const price = useMemo(() => {
    if (!product) return 0;
    return product.tradePrice && product.tradePrice > 0 ? product.tradePrice : product.price || 0;
  }, [product]);

  const stock = product?.warehouseStock ? (product.warehouseStock.accra || 0) + (product.warehouseStock.kumasi || 0) + (product.warehouseStock.takoradi || 0) : (product?.totalStock ?? product?.stock ?? 0);

  // Highlights/feature list — prefer explicit fields, fall back to technicalSpecs or description bullets
  const highlights: string[] = (product?.highlights && Array.isArray(product.highlights) && product.highlights.length > 0)
    ? product.highlights
    : (product?.technicalSpecs && Array.isArray(product.technicalSpecs) && product.technicalSpecs.length > 0)
      ? product.technicalSpecs
      : (product?.features && Array.isArray(product.features) && product.features.length > 0)
        ? product.features
        : [];

  // Media resolver (uses product-media utilities)
  const media = useMemo(() => (product ? getProductMedia({
    id: product.id || product.sku,
    name: product.name,
    sku: product.sku,
    category: product.categoryName || product.category,
    subcategory: product.subcategory,
    image: (product.images && product.images[0] && product.images[0].url) || product.image || '',
    description: product.description || product.longDescription || '',
  }) : null), [product]);

  const combinedMedia = useMemo(() => {
    if (!media) return [] as any[];
    const items: any[] = [];
    media.images.slice(0, 4).forEach(src => items.push({ type: 'image', src }));
    if (media.videos.length > 0) {
      const v = media.videos[0];
      items.push({ type: 'video', src: v.src, videoId: v.id, videoKind: v.kind, videoTitle: v.title });
    }
    if (media.images.length > 4) media.images.slice(4).forEach(src => items.push({ type: 'image', src }));
    return items;
  }, [media]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    try {
      await addItem(firebaseUser?.uid || (window as any)?.COFKANS_USER_ID || 'guest', {
        productId: product.id || product.sku,
        variantId: null,
        sku: product.sku ?? product.id,
        name: product.name,
        image: (product.images && product.images[0] && product.images[0].url) || product.image || '',
        price: price,
        quantity: qty,
        customization: null,
        isAvailable: (stock ?? 0) > 0,
        stockLevel: stock ?? 0,
      });
      toast.success('Added to cart');
    } catch (err) {
      console.error('Add to cart failed', err);
      toast.error('Unable to add to cart');
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    // kick off checkout flow used elsewhere in app
    window.dispatchEvent(new CustomEvent('cofkans:checkout'));
  };

  // Gallery keyboard + swipe handlers
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (showLightbox) setShowLightbox(false); }
      if (e.key === 'ArrowRight' && combinedMedia.length > 0) setActiveIdx(i => (i + 1) % combinedMedia.length);
      if (e.key === 'ArrowLeft' && combinedMedia.length > 0) setActiveIdx(i => (i - 1 + combinedMedia.length) % combinedMedia.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, combinedMedia.length, showLightbox]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || combinedMedia.length < 2) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      setActiveIdx(i => dx < 0 ? (i + 1) % combinedMedia.length : (i - 1 + combinedMedia.length) % combinedMedia.length);
    }
    touchStartX.current = null;
  };

  const openLightbox = () => { setShowLightbox(true); };
  const closeLightbox = () => { setShowLightbox(false); setPlayingVideoId(null); };

  const submitReview = async () => {
    if (!isAuthenticated || !user) { toast.error('Please sign in to submit a review'); return; }
    if (!product) return;

    const payload = {
      productId: product.id || product.sku,
      userId: user.uid,
      userName: user.displayName || user.email || 'Customer',
      userAvatar: user.photoURL || null,
      rating: Number(reviewForm.rating),
      title: reviewForm.title,
      comment: reviewForm.comment,
    } as any;

    setSubmittingReview(true);
    try {
      await ReviewService.create(payload);
      toast.success('Thanks! Your review is submitted for moderation.');
      setReviewForm({ rating: 5, title: '', comment: '' });
    } catch (err) {
      console.error('Failed to submit review', err);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <p className="text-muted-foreground mb-6">The requested product could not be located.</p>
          <button onClick={onClose} className="px-6 py-3 rounded-full bg-primary text-white font-bold">Return</button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6 lg:p-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <RouterLink href="/" className="text-[#4F3FF0] font-medium">Home</RouterLink>
          <span className="text-gray-300">›</span>
          <RouterLink href={`/category/${encodeURIComponent((product.categoryName || product.category || '').toLowerCase().replace(/\s+/g, '-'))}`} className="text-[#4F3FF0] font-medium">{product.categoryName || product.category}</RouterLink>
          <span className="text-gray-300">›</span>
          <RouterLink href={`/category/${encodeURIComponent((product.categoryName || product.category || '').toLowerCase().replace(/\s+/g, '-'))}#${encodeURIComponent((product.subcategory || '').toLowerCase().replace(/\s+/g, '-'))}`} className="text-[#4F3FF0] font-medium">{product.subcategory}</RouterLink>
          <span className="text-gray-300">›</span>
          <span className="text-gray-800 font-semibold">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_1fr_360px] gap-8">
        {/* Left: Gallery */}
        <section aria-labelledby="product-media" className="bg-card rounded-2xl p-4 lg:p-6">
          <div
            className="product-image-surface w-full aspect-[4/3] bg-muted rounded-xl flex items-center justify-center overflow-hidden relative"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {combinedMedia.length > 0 && combinedMedia[activeIdx]?.type === 'image' ? (
              <img
                src={combinedMedia[activeIdx].src}
                alt={`${product.name} view ${activeIdx + 1}`}
                className="object-contain max-h-full max-w-full cursor-zoom-in"
                onClick={openLightbox}
              />
            ) : combinedMedia.length > 0 && combinedMedia[activeIdx]?.type === 'video' ? (
              <div className="w-full h-full flex items-center justify-center bg-black">
                {playingVideoId === combinedMedia[activeIdx].videoId ? (
                  <iframe
                    src={parseEmbedUrl(combinedMedia[activeIdx].src).embed + (parseEmbedUrl(combinedMedia[activeIdx].src).embed.includes('?') ? '&' : '?') + 'autoplay=1'}
                    title={combinedMedia[activeIdx].videoTitle || 'Product video'}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <button onClick={() => setPlayingVideoId(combinedMedia[activeIdx].videoId)} className="flex items-center gap-3 bg-white/90 px-4 py-3 rounded-full">
                    <Play className="w-6 h-6 text-primary" /> Play video
                  </button>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">No media</div>
            )}

            {/* nav arrows */}
            {combinedMedia.length > 1 && (
              <>
                <button onClick={() => setActiveIdx(i => (i - 1 + combinedMedia.length) % combinedMedia.length)} aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-10 h-10 flex items-center justify-center">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setActiveIdx(i => (i + 1) % combinedMedia.length)} aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-10 h-10 flex items-center justify-center">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {combinedMedia.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {combinedMedia.map((item: any, i: number) => (
                <button
                  key={`${item.src}-${i}`}
                  onClick={() => setActiveIdx(i)}
                  aria-label={`View ${i + 1}`}
                  className={`product-image-surface w-20 h-20 rounded-xl bg-muted p-1 flex-shrink-0 border ${i === activeIdx ? 'ring-2 ring-primary' : 'border-border'}`}
                >
                  {item.type === 'image' ? (
                    <img src={item.src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Lightbox */}
          {showLightbox && (
            <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-6" role="dialog" aria-modal="true">
              <button onClick={closeLightbox} className="absolute right-6 top-6 p-3 rounded-full bg-white/10 text-white"><X className="w-5 h-5" /></button>
              <div className="max-w-[92vw] max-h-[92vh] w-full">
                {combinedMedia[activeIdx]?.type === 'image' ? (
                  <img src={combinedMedia[activeIdx].src} alt={`${product.name} large`} className="w-full h-full object-contain" />
                ) : (
                  <iframe src={parseEmbedUrl(combinedMedia[activeIdx].src).embed + (parseEmbedUrl(combinedMedia[activeIdx].src).embed.includes('?') ? '&' : '?') + 'autoplay=1'} className="w-full h-[60vh]" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" title={combinedMedia[activeIdx].videoTitle || 'Product video'} />
                )}
              </div>
            </div>
          )}
        </section>

        {/* Center: Info */}
        <section aria-labelledby="product-info" className="bg-card rounded-2xl p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={onClose} aria-label="Back" className="p-2 rounded-lg bg-muted">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-xs font-bold uppercase text-[#4F3FF0]">{product.categoryName || product.category}</div>
          </div>

          <h1 id="product-info" className="text-2xl lg:text-3xl font-extrabold mb-3 max-h-[4.6rem] overflow-hidden">{product.name}</h1>

          <div onClick={() => setTab('reviews')} className="flex items-center gap-4 mb-4 cursor-pointer">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor((product.rating || 0)) ? 'text-amber-400 fill-amber-400' : 'text-muted'}`} />
              ))}
            </div>
            <div className="text-sm font-semibold">{product.rating ?? '—'}</div>
            <div className="text-sm text-muted-foreground">{product.reviewCount ?? product.reviews ?? 0} reviews</div>
            <div className="text-sm text-muted-foreground">· SKU: {product.sku}</div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-4 max-h-[3.2rem] overflow-hidden">{media?.description || product.longDescription || product.description}</p>

          <div className="mb-4">
            <div className="flex gap-2 items-center bg-muted/60 p-1 rounded-xl">
              <button onClick={() => setTab('details')} className={`px-3 py-2 rounded-lg font-bold ${tab === 'details' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>Description</button>
              <button onClick={() => setTab('specs')} className={`px-3 py-2 rounded-lg font-bold ${tab === 'specs' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>Specifications</button>
              <button onClick={() => setTab('reviews')} className={`px-3 py-2 rounded-lg font-bold ${tab === 'reviews' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>Reviews</button>
              <button onClick={() => setTab('delivery')} className={`px-3 py-2 rounded-lg font-bold ${tab === 'delivery' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>Delivery & Returns</button>
            </div>
          </div>

          <div>
            {tab === 'details' && (
              <div className="text-sm text-muted-foreground">{media?.description || product.longDescription || product.description}</div>
            )}

            {tab === 'specs' && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {product.specs && Object.keys(product.specs).map((k) => (
                  <div key={k} className="p-3 rounded-xl bg-muted/30 border border-border/50">
                    <div className="text-xs text-muted-foreground">{k}</div>
                    <div className="font-bold">{product.specs[k]}</div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'reviews' && (
              <div className="space-y-4">
                {reviewsLoading ? (
                  <div className="py-8 text-center">Loading reviews…</div>
                ) : reviews.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">No reviews yet.</div>
                ) : (
                  reviews.map(r => (
                    <div key={r.id} className="p-4 rounded-xl bg-muted/30 border border-border">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">{r.userAvatar ? <img src={r.userAvatar} alt={r.userName} className="w-10 h-10 rounded-full object-cover" /> : <Star className="w-4 h-4 text-primary" />}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-bold">{r.userName}</div>
                            <div className="text-sm text-muted-foreground">{new Date((r.createdAt?.toDate?.() ?? r.createdAt) || Date.now()).toLocaleDateString()}</div>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                            ))}
                          </div>
                          <div className="mt-2 font-semibold">{r.title}</div>
                          <div className="text-sm text-muted-foreground mt-1">{r.comment}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div className="p-4 rounded-xl border border-border bg-card">
                  <h4 className="font-bold mb-2">Write a review</h4>
                  {!isAuthenticated ? (
                    <div className="text-sm text-muted-foreground">Please sign in to leave a review.</div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-bold">Rating</label>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button key={i} onClick={() => setReviewForm(s => ({ ...s, rating: i + 1 }))} className={`${i < reviewForm.rating ? 'text-amber-400' : 'text-muted-foreground'}`} aria-label={`Rate ${i+1}`}><Star className="w-5 h-5" /></button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold">Title</label>
                        <input value={reviewForm.title} onChange={e => setReviewForm(s => ({ ...s, title: e.target.value }))} className="w-full mt-1 p-2 rounded-lg border border-border" />
                      </div>
                      <div>
                        <label className="text-xs font-bold">Comment</label>
                        <textarea value={reviewForm.comment} onChange={e => setReviewForm(s => ({ ...s, comment: e.target.value }))} rows={4} className="w-full mt-1 p-2 rounded-lg border border-border" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={submitReview} disabled={submittingReview} className="px-4 py-2 rounded-full bg-primary text-white font-bold">Submit review</button>
                        <button onClick={() => setReviewForm({ rating: 5, title: '', comment: '' })} className="px-3 py-2 rounded-lg border">Reset</button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {tab === 'delivery' && (
              <div className="text-sm text-muted-foreground">
                <h4 className="font-bold">Delivery</h4>
                <p>Standard delivery (2-4 business days) · Express available at checkout · Same-day in Accra for in-stock items.</p>
                <h4 className="font-bold mt-3">Returns</h4>
                <p>14-day easy returns for unused products with original packaging. Warranty handled at branches.</p>
              </div>
            )}
          </div>
        </section>

        {/* Right: Purchase Card */}
        <aside className="bg-card rounded-2xl p-6 lg:p-8 sticky top-6 h-min">
          <div className="mb-4">
            <div className="text-muted-foreground text-sm">Price</div>
            <div className="text-3xl font-extrabold">GH₵ {price.toLocaleString()}</div>
            {product.compareAtPrice && (
              <div className="text-sm line-through text-muted-foreground">GH₵ {product.compareAtPrice.toLocaleString()}</div>
            )}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setQty(q => Math.max(1, q-1))} className="w-10 h-10 rounded-lg bg-muted">-</button>
            <div className="font-bold text-lg text-center min-w-[2.5rem]">{qty}</div>
            <button onClick={() => setQty(q => q+1)} className="w-10 h-10 rounded-lg bg-muted">+</button>
          </div>

          <div className="space-y-3">
            <button onClick={handleAddToCart} className="w-full py-3 rounded-full bg-primary text-white font-bold flex items-center justify-center gap-3">
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
            <button onClick={handleBuyNow} className="w-full py-3 rounded-full border-2 border-border font-bold">Buy Now · GH₵ {(price * qty).toLocaleString()}</button>
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Truck className="w-4 h-4" /> Delivery available</div>
            <div className="flex items-center gap-2 mt-2"><MapPin className="w-4 h-4" /> Branch pickup available</div>
          </div>

          <div className="mt-6 text-xs text-muted-foreground">
            <div className="font-semibold">Payment methods</div>
            <div className="mt-2">Debit/Credit card · Mobile Money · Bank transfer</div>
          </div>

          <div className="mt-6 text-xs text-muted-foreground">
            <div className="font-semibold">Returns</div>
            <div className="mt-2">14-day easy returns · Warranty claims at any branch</div>
          </div>
        </aside>
      </div>

      {/* Trust strip */}
      <div className="max-w-7xl mx-auto mt-8 grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <div className="font-bold">Fast Delivery</div>
          <div className="text-sm text-muted-foreground">Same-day in Accra</div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <div className="font-bold">Genuine Products</div>
          <div className="text-sm text-muted-foreground">Manufacturer-backed</div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <div className="font-bold">Warranty</div>
          <div className="text-sm text-muted-foreground">12 months standard</div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <div className="font-bold">Expert Support</div>
          <div className="text-sm text-muted-foreground">In-store & online</div>
        </div>
      </div>

    </main>
  );
}
