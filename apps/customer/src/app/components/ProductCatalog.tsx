import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Grid3x3, List, ShoppingCart, Star, TrendingUp, Zap, Sun, Lightbulb, Home, Building2, Fan, ChevronRight, Heart, Eye, X, ZoomIn, Package, CheckCircle, AlertCircle, Minus, Plus, BarChart3, GitCompare, SlidersHorizontal, Film, Sparkles, Link } from 'lucide-react';
import { ProductConfiguratorPage } from './ProductConfiguratorPage';
import { ProductCompare } from './ProductCompare';
import { useHover } from '../contexts/HoverContext';
import { useCartStore } from '@/stores/cart-store';
import toast from 'react-hot-toast';
import { AdvancedSearch, type SearchFilters } from './AdvancedSearch';
import { ProductDetailModal } from './ProductDetailModal';
import { BranchContactModal } from './BranchContactModal';
import { trackSearch, trackProductView, trackWishlistAdd, trackWishlistRemove } from '@/services/recommendation-service';
import type { FirestoreUser } from '@/lib/firestore-schema';
import { csvProducts } from '../data/csvProducts';
import { useProductOverrides } from '../hooks/useProductOverrides';
import { resolveImageUrl } from '@/lib/product-image-map';


interface ProductCatalogProps {
  user: FirestoreUser | null;
  onRequireAuth: () => void;
  initialCategory?: string;
}

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
  featured?: boolean;
  videoUrl?: string;
  specs?: string[];
}

// csvProducts is the single source of truth for all product data.
// Firestore only stores price + stock overrides (keyed by SKU).
const BASE_PRODUCTS: Product[] = (csvProducts as Product[]).filter(p => !/^Product Image \d+$/i.test(p.name)).map(p => ({
  ...p,
  image: resolveImageUrl(p.image),
}));

const CATEGORY_DEFS = [
  { id: 'all',                   name: 'All Products',          icon: Grid3x3   },
  { id: 'Luxury Lighting',       name: 'Luxury Lighting',       icon: Lightbulb },
  { id: 'Indoor Lighting',       name: 'Indoor Lighting',       icon: Zap       },
  { id: 'Outdoor Lighting',      name: 'Outdoor Lighting',      icon: Sun       },
  { id: 'Garden & Outdoor',      name: 'Garden & Outdoor',      icon: Home      },
  { id: 'Wiring Accessories',    name: 'Wiring Accessories',    icon: Building2 },
  { id: 'Cables & Wiring',       name: 'Cables & Wiring',       icon: Fan       },
  { id: 'Electrical Control',    name: 'Electrical Control',    icon: Package   },
  { id: 'Solar & Infrastructure',name: 'Solar & Infrastructure',icon: Star      },
  { id: 'Bulbs & Lamps',         name: 'Bulbs & Lamps',         icon: Sparkles  },
  { id: 'Uncategorized',         name: 'Other',                 icon: TrendingUp},
];

function CardMedia({ imageSrc, videoSrc, alt }: { imageSrc: string; videoSrc?: string; alt: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [imgState, setImgState] = useState<'loading' | 'ready' | 'error'>('loading');

  const start = () => {
    if (!videoSrc) return;
    setActive(true);
    const v = videoRef.current;
    if (v) { v.currentTime = 0; v.play().catch(() => {}); }
  };

  const stop = () => {
    setActive(false);
    const v = videoRef.current;
    if (v) { v.pause(); }
  };

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={start}
      onMouseLeave={stop}
      // Pointer events keep the web path out of React Native's touch bank.
      // In particular, a synthetic touchend without a matching touchstart
      // must not reach the native responder system.
      onPointerEnter={start}
      onPointerLeave={stop}
    >
      {imgState === 'loading' && (
        <div className="absolute inset-0 bg-muted dark:bg-white animate-pulse" aria-hidden />
      )}
      {imgState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/60 dark:!bg-white gap-2">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="opacity-20">
            <rect x="4" y="4" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2"/>
            <circle cx="14" cy="15" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M4 28l9-10 8 9 5-6 10 9" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          <span className="text-[10px] text-muted-foreground/50 font-medium px-2 text-center leading-tight">{alt}</span>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setImgState('ready')}
        onError={() => setImgState('error')}
        className={`w-full h-full object-contain p-4 sm:p-6 transition-transform duration-300 ease-out group-hover:scale-105 ${
          imgState === 'ready' ? 'opacity-100' : 'opacity-0 absolute'
        } ${videoSrc && active && loaded ? '!opacity-0' : ''}`}
      />
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          muted loop playsInline preload="metadata"
          onLoadedData={() => setLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${
            active && loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {/* Subtle hover sheen for depth (kept light so product images stay crisp) */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      {videoSrc && (
        <div className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1 pointer-events-none">
          <Film className="w-3 h-3" /> VIDEO
        </div>
      )}
    </div>
  );
}

export function ProductCatalog({ user, onRequireAuth, initialCategory = 'all' }: ProductCatalogProps) {
  // csvProducts is the source of truth — no Firestore read needed for product data
  const products: Product[] = BASE_PRODUCTS;
  const productsLoading = false;
  const categories = useMemo(
    () => CATEGORY_DEFS.map(c => ({
      ...c,
      count: c.id === 'all' ? products.length : products.filter(p => p.category === c.id).length,
    })),
    [products],
  );
  const { setHoveredProduct, addToViewedProducts } = useHover();
  const { cart, addItem, updateQuantity, removeItem } = useCartStore();
  const cartItems = cart?.items || [];
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showTradePrice, setShowTradePrice] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'name' | 'rating'>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Number.MAX_SAFE_INTEGER]);
  const [priceTouched, setPriceTouched] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [groupBy, setGroupBy] = useState<'none' | 'name' | 'sku' | 'category' | 'subcategory'>('none');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [enquireProduct, setEnquireProduct] = useState<Product | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [configuratorProduct, setConfiguratorProduct] = useState<Product | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: '',
    category: 'all',
    priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
    minRating: 0,
    inStock: false,
  });

  const maxPrice = products.length ? Math.max(...products.map(p => p.price)) : 0;
  const subcategories = Array.from(new Set(products.map(p => p.subcategory)));

  useEffect(() => {
    if (initialCategory && initialCategory !== 'all') {
      setSelectedCategory(initialCategory);
      setSelectedSubcategory('all');
    }
  }, [initialCategory]);

  // Once products load, snap the price slider's upper bound to the real max so
  // no product is hidden by the default price filter (unless the user adjusts it).
  useEffect(() => {
    if (!priceTouched && maxPrice > 0) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice, priceTouched]);

  // Track search queries
  useEffect(() => {
    if (user && searchTerm && searchTerm.length >= 2) {
      const timeoutId = setTimeout(() => {
        trackSearch(user.uid, searchTerm, selectedCategory !== 'all' ? selectedCategory : undefined);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, selectedCategory, user]);

  // Track advanced search filters
  useEffect(() => {
    if (user && searchFilters.searchTerm && searchFilters.searchTerm.length >= 2) {
      trackSearch(
        user.uid,
        searchFilters.searchTerm,
        searchFilters.category !== 'all' ? searchFilters.category : undefined
      );
    }
  }, [searchFilters, user]);

  // Keyboard event handlers for closing modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (quickViewProduct) {
          setQuickViewProduct(null);
        } else if (showCart) {
          setShowCart(false);
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [quickViewProduct, showCart]);

  const toggleWishlist = (productId: string) => {
    if (user) {
      const isInWishlist = wishlist.includes(productId);
      if (isInWishlist) {
        trackWishlistRemove(user.uid, productId);
      } else {
        trackWishlistAdd(user.uid, productId);
      }
    }

    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const openConfigurator = (productId: string) => {
    if (!user) {
      onRequireAuth();
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product) {
      // Track product view
      trackProductView(user.uid, product.id, product.name, product.category);
      setConfiguratorProduct(product);
      setQuickViewProduct(null);
    }
  };

  const handleQuickView = (product: Product) => {
    if (user) {
      // Track product view
      trackProductView(user.uid, product.id, product.name, product.category);
    }
    setQuickViewProduct(product);
  };

  const handleAddToCart = async (productId: string, quantity: number = 1): Promise<boolean> => {
    if (!user) {
      onRequireAuth();
      return false;
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
      toast.error('Product not found');
      return false;
    }

    try {
      const price = showTradePrice && product.tradePrice ? product.tradePrice : product.price;

      await addItem(user.uid, {
        productId: product.id,
        variantId: null,
        sku: product.sku,
        name: product.name,
        image: product.image,
        price: price,
        quantity: quantity,
        customization: null,
        isAvailable: (product.stock || 0) > 0,
        stockLevel: product.stock || 0,
      });

      toast.success('Added to cart!', {
        icon: '🛒',
        duration: 2000,
      });
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Unable to add item to cart');
      return false;
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    if (!user) return;

    try {
      await removeItem(user.uid, productId, null);
      toast.success('Removed from cart');
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      toast.error('Unable to remove item');
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
      await handleRemoveFromCart(productId);
    } else {
      try {
        await updateQuantity(user.uid, productId, null, quantity);
      } catch (error) {
        console.error('Failed to update quantity:', error);
        toast.error('Unable to update quantity');
      }
    }
  };

  // Get cart quantity for a product
  const getCartQuantity = (productId: string) => {
    const item = cartItems.find(i => i.productId === productId && i.variantId === null);
    return item?.quantity || 0;
  };

  const toggleCompare = (productId: string) => {
    setCompareList(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : prev.length < 4 ? [...prev, productId] : prev
    );
  };

  // Merge Firestore price+stock overrides onto the static product list
  const firestoreOverrides = useProductOverrides();
  const pricedProducts = useMemo(
    () => products.map(p => {
      const ov = firestoreOverrides[p.sku];
      if (!ov) return p;
      return {
        ...p,
        ...(ov.price != null ? { price: ov.price } : {}),
        ...(ov.stock != null ? { stock: ov.stock } : {}),
      };
    }),
    [firestoreOverrides],
  );

  const filteredProducts = useMemo(() => {
    const term = (searchFilters.searchTerm || searchTerm).toLowerCase();
    const minP = Math.max(priceRange[0], searchFilters.priceRange.min);
    const maxP = Math.min(priceRange[1], searchFilters.priceRange.max);
    const minRating = searchFilters.minRating;
    const inStockOnly = searchFilters.inStock;
    const cat = searchFilters.category === 'all' ? selectedCategory : searchFilters.category;
    const sub = searchFilters.subcategory && searchFilters.subcategory !== 'all'
      ? searchFilters.subcategory
      : selectedSubcategory;

    const tokens = term.split(/\s+/).filter(Boolean);
    const out = pricedProducts.filter(p => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (sub !== 'all' && p.subcategory !== sub) return false;
      if (p.price < minP || p.price > maxP) return false;
      if (minRating > 0 && (p.rating || 0) < minRating) return false;
      if (inStockOnly && (p.stock || 0) <= 0) return false;
      if (tokens.length) {
        const hay = `${p.name} ${p.sku} ${p.category ?? ''} ${p.subcategory ?? ''} ${p.description ?? ''} ${(p.specs ?? []).join(' ')}`.toLowerCase();
        if (!tokens.every(t => hay.includes(t))) return false;
      }
      return true;
    });

    out.sort((a, b) => {
      switch (sortBy) {
        case 'featured': return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name);
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        default: return 0;
      }
    });
    return out;
  }, [pricedProducts, selectedCategory, selectedSubcategory, searchTerm, priceRange, searchFilters, sortBy]);

  // Show the full result set at once — no pagination cap.
  const visibleProducts = filteredProducts;

  const groupedVisible = useMemo(() => {
    if (groupBy === 'none') return null;
    const map = new Map<string, typeof visibleProducts>();
    const keyFor = (p: typeof visibleProducts[number]) => {
      if (groupBy === 'name')        return (p.name?.[0] ?? '#').toUpperCase();
      if (groupBy === 'sku')         return (p.sku?.split(/[-\s/]/)[0] ?? '#').toUpperCase() || '#';
      if (groupBy === 'category')    return p.category ?? 'Other';
      if (groupBy === 'subcategory') return p.subcategory ?? 'Other';
      return 'Other';
    };
    visibleProducts.forEach(p => {
      const k = keyFor(p);
      const arr = map.get(k) ?? [];
      arr.push(p);
      map.set(k, arr);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [groupBy, visibleProducts]);

  // Flat sequence of products with group-header markers interleaved (for the existing grid)
  const renderSequence = useMemo<Array<
    | { type: 'header'; key: string; label: string; count: number }
    | { type: 'product'; product: typeof visibleProducts[number]; index: number }
  >>(() => {
    if (!groupedVisible) {
      return visibleProducts.map((product, index) => ({ type: 'product', product, index }));
    }
    const out: Array<any> = [];
    let i = 0;
    for (const [key, items] of groupedVisible) {
      out.push({ type: 'header', key: `hdr-${key}`, label: key, count: items.length });
      for (const product of items) out.push({ type: 'product', product, index: i++ });
    }
    return out;
  }, [groupedVisible, visibleProducts]);

  const cartTotal = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return sum;
    const price = showTradePrice && product.tradePrice ? product.tradePrice : product.price;
    return sum + (price * item.quantity);
  }, 0);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="w-full space-y-8 relative">
      {/* Floating Action Buttons */}
      <AnimatePresence>
        {/* Compare Button */}
        {compareList.length > 0 && (
          <motion.button
            initial={{ scale: 0, x: 100 }}
            animate={{ scale: 1, x: 0 }}
            exit={{ scale: 0, x: 100 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCompare(true)}
            className="mobile-compare-safe fixed right-3 z-50 flex items-center gap-2 rounded-full bg-secondary px-4 py-3 text-sm font-bold text-white shadow-2xl sm:right-8 sm:px-6 sm:py-4 sm:text-base"
          >
            <GitCompare className="w-5 h-5" strokeWidth={2.5} />
            <span>Compare ({compareList.length})</span>
          </motion.button>
        )}

        {/* Cart Button */}
        {cartItemCount > 0 && (
          <motion.button
            initial={{ scale: 0, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 100 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCart(true)}
            className="mobile-cart-safe fixed right-3 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-white shadow-2xl sm:right-8 sm:px-8 sm:py-5 sm:text-base"
            style={{
              background: 'linear-gradient(135deg, var(--gradient-primary-from) 0%, var(--gradient-primary-to) 100%)'
            }}
          >
            <ShoppingCart className="w-6 h-6" strokeWidth={2.5} />
            <span>{cartItemCount} Items</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">GH₵ {cartTotal.toLocaleString()}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Search & Filters */}
      <div className="space-y-3 sm:space-y-4">
        {/* Row 1 — Search (full width) */}
        <div className="w-full">
          <AdvancedSearch
            onSearch={(filters) => {
              setSearchFilters(filters);
              setSearchTerm(filters.searchTerm);
              setSelectedCategory(filters.category || 'all');
              setSelectedSubcategory(filters.subcategory || 'all');
            }}
            categories={categories.map(c => ({ id: c.id, label: c.name }))}
            subcategories={subcategories}
            maxPrice={maxPrice}
            localProducts={pricedProducts.map(p => ({
              id: p.id, name: p.name, sku: p.sku, price: p.price,
              category: p.category, subcategory: p.subcategory,
              image: p.image, description: p.description, specs: p.specs,
              stock: p.stock, rating: p.rating,
            }))}
            sortBy={sortBy}
            onSortChange={(v) => setSortBy(v as any)}
            showTradePrice={showTradePrice}
            onToggleTradePrice={() => setShowTradePrice(!showTradePrice)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-border space-y-5 sm:space-y-6 shadow-md">
                {/* Subcategory Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-foreground">Subcategory</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedSubcategory('all')}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                        selectedSubcategory === 'all'
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-muted hover:bg-muted/70'
                      }`}
                    >
                      All
                    </button>
                    {subcategories.map(sub => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                          selectedSubcategory === sub
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-muted hover:bg-muted/70'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-foreground">
                    Price Range: GH₵ {priceRange[0].toLocaleString()} - GH₵ {priceRange[1].toLocaleString()}
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={(e) => { setPriceTouched(true); setPriceRange([Number(e.target.value), priceRange[1]]); }}
                      className="flex-1"
                    />
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => { setPriceTouched(true); setPriceRange([priceRange[0], Number(e.target.value)]); }}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Row 3 — Category Tabs (with fade edges to hint scroll) */}
        <div className="relative">
          <div className="flex overflow-x-auto gap-2 sm:gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`snap-start flex items-center gap-1.5 sm:gap-3 px-3 sm:px-7 py-2.5 sm:py-4 rounded-full text-xs sm:text-base font-bold whitespace-nowrap transition-all duration-300 shadow-sm sm:shadow-md cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'pc-tab-active'
                    : 'bg-card border-2 border-border hover:bg-muted hover:shadow-xl hover:border-[#7c3aed]/30'
                }`}
              >
                <cat.icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                <span>{cat.name}</span>
                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                  selectedCategory === cat.id
                    ? 'bg-white/20 text-white'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {cat.count}
                </span>
              </motion.button>
            ))}
          </div>
          {/* Scroll fade hint on the right edge (mobile) */}
          <div className="sm:hidden pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-background to-transparent" />
        </div>
      </div>

      {/* Results summary + Group-by */}
      {filteredProducts.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-card border-2 border-border rounded-xl px-3 sm:px-4 py-2.5">
          <div className="text-xs sm:text-sm font-semibold text-foreground">
            <span className="font-bold text-primary">{filteredProducts.length.toLocaleString()}</span> total item{filteredProducts.length !== 1 ? 's' : ''}
            {filteredProducts.length !== pricedProducts.length && (
              <span className="text-muted-foreground font-medium"> of {pricedProducts.length.toLocaleString()}</span>
            )}
            {groupedVisible && (
              <span className="text-muted-foreground font-medium"> · {groupedVisible.length} group{groupedVisible.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">Group by</label>
            <div className="relative">
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
                className="appearance-none pl-3 pr-7 py-1.5 text-xs font-bold rounded-lg border-2 border-border bg-muted/40 hover:bg-muted focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="none">None</option>
                <option value="name">Name (A–Z)</option>
                <option value="category">Category</option>
                <option value="subcategory">Subcategory</option>
              </select>
              <ChevronRight className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rotate-90 text-muted-foreground pointer-events-none" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedCategory}-${viewMode}-${selectedSubcategory}-${groupBy}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={viewMode === 'grid'
            ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'
            : 'space-y-4'
          }
        >
          {renderSequence.map(entry => entry.type === 'header' ? (
            <div key={entry.key} className="col-span-full flex items-center gap-2 pt-2 pb-1 border-b-2 border-border sticky top-0 bg-background/95 backdrop-blur z-10">
              <span className="w-8 h-8 rounded-lg bg-foreground text-background text-xs font-bold flex items-center justify-center flex-shrink-0">
                {entry.label.slice(0, 2)}
              </span>
              <h3 className="text-sm font-bold truncate flex-1">{entry.label}</h3>
              <span className="text-[11px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {entry.count} item{entry.count !== 1 ? 's' : ''}
              </span>
            </div>
          ) : (() => { const { product, index } = entry; return (
            <div
              key={product.id}
              onMouseEnter={() => {
                setHoveredProduct({
                  id: product.id,
                  name: product.name,
                  category: product.category,
                  price: `GH₵ ${product.price.toLocaleString()}`,
                  description: product.description,
                  specs: product.specs,
                });
                addToViewedProducts({
                  id: product.id,
                  name: product.name,
                  category: product.category,
                  price: `GH₵ ${product.price.toLocaleString()}`,
                  description: product.description,
                  specs: product.specs,
                });
              }}
              onClick={() => handleQuickView(product)}
              onMouseLeave={() => setHoveredProduct(null)}
              className={`pc-card group relative bg-card/95 rounded-2xl overflow-hidden border border-border/70 shadow-[0_10px_35px_rgba(15,23,42,0.06)] hover:border-primary/35 hover:shadow-[0_22px_55px_rgba(15,23,42,0.14)] transition-all duration-500 cursor-pointer ${
                viewMode === 'list' ? 'flex flex-col gap-3 sm:flex-row sm:gap-6' : 'flex h-full flex-col'
              }`}
            >
              {/* Product Image */}
              <div
                className={`pc-media product-image-surface relative overflow-hidden bg-gradient-to-br from-muted/80 via-card to-muted/30 ${
                  viewMode === 'grid' ? 'aspect-square' : 'h-40 w-full flex-shrink-0 sm:h-64 sm:w-64'
                }`}
              >
                <CardMedia
                  imageSrc={product.image}
                  videoSrc={product.videoUrl}
                  alt={product.name}
                />

                {/* Badges */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1 sm:gap-2 max-w-[60%] z-10">
                  {product.badge && (
                    <div className="pc-badge pc-badge-grad px-2 py-0.5 sm:px-4 sm:py-2 text-[9px] sm:text-xs font-bold leading-tight truncate">
                      {product.badge}
                    </div>
                  )}
                  {product.featured && (
                    <div className="pc-badge pc-badge-glass px-2 py-0.5 sm:px-4 sm:py-2 text-[9px] sm:text-xs font-bold flex items-center gap-1 leading-tight">
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current flex-shrink-0" strokeWidth={2} />
                      <span className="hidden sm:inline">Featured</span>
                      <span className="sm:hidden">★</span>
                    </div>
                  )}
                </div>

                {/* Quick Actions — always visible on mobile, hover-reveal on desktop */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-1.5 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <div className="relative group/tooltip">
                    <motion.button
                      whileHover={{ scale: 1.15, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      aria-label={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      className={`p-2.5 sm:p-3 rounded-full cursor-pointer ${
                        wishlist.includes(product.id)
                          ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
                          : 'pc-fab'
                      }`}
                    >
                      <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${wishlist.includes(product.id) ? 'fill-white' : ''}`} strokeWidth={2.5} />
                    </motion.button>
                    <div className="hidden sm:block absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-background text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-lg">
                      {wishlist.includes(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </div>
                  </div>
                  <div className="relative group/tooltip">
                    <motion.button
                      whileHover={{ scale: 1.15, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompare(product.id);
                      }}
                      aria-label={compareList.includes(product.id) ? 'Remove from compare' : 'Add to compare'}
                      className={`p-2 sm:p-3 rounded-full cursor-pointer disabled:opacity-50 ${
                        compareList.includes(product.id) ? 'pc-fab-active' : 'pc-fab'
                      }`}
                      disabled={!compareList.includes(product.id) && compareList.length >= 4}
                    >
                      <GitCompare className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                    </motion.button>
                    <div className="hidden sm:block absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-background text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-lg">
                      {compareList.includes(product.id) ? 'Remove from Compare' : 'Add to Compare'}
                    </div>
                  </div>

                  {/* Direct product page */}
                  <div className="relative group/tooltip">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Use hash navigation so the preview host doesn't require react-router changes
                        window.location.hash = `product/${product.id}`;
                      }}
                      aria-label="Open product page"
                      className="p-2.5 sm:p-3 rounded-full pc-fab"
                    >
                      <Link className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
                    </motion.button>
                    <div className="hidden sm:block absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-background text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-lg">
                      Open product page
                    </div>
                  </div>
                </div>

                {/* Price Badge — shows the set price, or a tappable "Enquire for price" if unset */}
                <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-10">
                  {(product.stock || 0) > 0 ? (
                    (showTradePrice && product.tradePrice ? product.tradePrice : product.price) > 0 ? (
                      <div className="pc-badge pc-badge-grad px-2.5 py-0.5 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-sm font-bold leading-tight">
                        GH₵ {(showTradePrice && product.tradePrice ? product.tradePrice : product.price).toLocaleString()}
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setEnquireProduct(product); }}
                        className="pc-btn-soft px-2.5 py-0.5 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-sm font-bold leading-tight cursor-pointer"
                      >
                        Enquire for price
                      </button>
                    )
                  ) : (
                    <div className="px-2 py-0.5 sm:px-3 sm:py-1.5 bg-red-500/90 text-white rounded-full text-[9px] sm:text-xs font-bold backdrop-blur-md leading-tight shadow-[0_6px_16px_-6px_rgba(0,0,0,0.5)]">
                      <span className="hidden sm:inline">Out of Stock</span>
                      <span className="sm:hidden">Sold Out</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className={`p-3 sm:p-5 lg:p-6 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : 'flex flex-1 flex-col'}`}>
                <div className="space-y-3">
                  <h4
                    className="text-sm sm:text-base lg:text-lg font-bold leading-tight line-clamp-2 group-hover:text-[#7c3aed] transition-colors duration-300"
                  >
                    {product.name}
                  </h4>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating!)
                                ? 'fill-[#a855f7] text-[#a855f7]'
                                : 'text-muted'
                            }`}
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold">{product.rating}</span>
                      <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
                    </div>
                  )}


                  {viewMode === 'list' && product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ); })())}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {productsLoading && products.length === 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card rounded-3xl border-2 border-border overflow-hidden animate-pulse">
              <div className="aspect-square bg-muted" />
              <div className="p-3 sm:p-5 space-y-2.5">
                <div className="h-3 bg-muted rounded-full w-1/3" />
                <div className="h-4 bg-muted rounded-full w-4/5" />
                <div className="h-3 bg-muted rounded-full w-2/3" />
                <div className="flex items-center justify-between pt-1">
                  <div className="h-5 bg-muted rounded-full w-1/2" />
                  <div className="h-8 w-8 bg-muted rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!productsLoading && products.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Package className="w-12 h-12 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="text-3xl font-bold mb-3">Catalogue coming soon</h3>
          <p className="text-muted-foreground text-lg">Products are being added. Check back shortly.</p>
        </div>
      )}

      {!productsLoading && products.length > 0 && filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Search className="w-12 h-12 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="text-3xl font-bold mb-3">No products found</h3>
          <p className="text-muted-foreground mb-8 text-lg">Try adjusting your filters or search term</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedSubcategory('all');
              setPriceTouched(false);
              setPriceRange([0, maxPrice]);
            }}
            className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold hover:shadow-xl transition-all shadow-md"
          >
            Clear All Filters
          </button>
        </motion.div>
      )}

      {/* Quick View Modal */}
      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(id, qty) => { handleAddToCart(id, qty); }}
        onToggleWishlist={toggleWishlist}
        isWishlisted={quickViewProduct ? wishlist.includes(quickViewProduct.id) : false}
        showTradePrice={showTradePrice}
      />

      {/* Enquire-for-price → branch contact info */}
      <BranchContactModal
        open={!!enquireProduct}
        onClose={() => setEnquireProduct(null)}
        productName={enquireProduct?.name}
      />

      {/* Shopping Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCart(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-end p-4"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-3xl w-full max-w-md h-[90vh] overflow-auto border-2 border-border shadow-2xl"
            >
              <div className="p-6 sticky top-0 bg-card border-b-2 border-border z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold">Shopping Cart</h3>
                  <button
                    onClick={() => setShowCart(false)}
                    className="p-2 hover:bg-muted rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" strokeWidth={2} />
                  </button>
                </div>
                <p className="text-muted-foreground">{cartItemCount} items</p>
              </div>

              <div className="p-6 space-y-4">
                {cartItems.map((item) => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  const price = showTradePrice && product.tradePrice ? product.tradePrice : product.price;

                  return (
                    <motion.div
                      key={item.productId}
                      layout
                      className="flex gap-4 bg-muted rounded-2xl p-4"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold line-clamp-1">{product.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">GH₵ {price.toLocaleString()}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            className="p-1.5 bg-background hover:bg-card rounded-lg transition"
                          >
                            <Minus className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                          <span className="font-bold min-w-[3ch] text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            className="p-1.5 bg-background hover:bg-card rounded-lg transition"
                          >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => handleRemoveFromCart(item.productId)}
                            className="ml-auto p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                          >
                            <X className="w-5 h-5" strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          GH₵ {(price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {cartItemCount === 0 && (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
                    <p className="text-muted-foreground">Your cart is empty</p>
                  </div>
                )}
              </div>

              {cartItemCount > 0 && (
                <div className="p-6 sticky bottom-0 bg-card border-t-2 border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-3xl font-bold text-primary">
                      GH₵ {cartTotal.toLocaleString()}
                    </span>
                  </div>
                  <motion.button
                    onClick={() => {
                      setShowCart(false);
                      if (!user) { onRequireAuth(); return; }
                      // Hand off to the real checkout flow (CheckoutPage → Paystack).
                      window.dispatchEvent(new CustomEvent('cofkans:checkout'));
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold hover:shadow-xl transition-all duration-300 shadow-md cursor-pointer"
                  >
                    Proceed to Checkout
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Configurator Page */}
      {configuratorProduct && (
        <ProductConfiguratorPage
          product={configuratorProduct}
          onClose={() => setConfiguratorProduct(null)}
        />
      )}

      {/* Product Compare Modal */}
      {showCompare && compareList.length > 0 && (
        <ProductCompare
          products={products.filter(p => compareList.includes(p.id))}
          onClose={() => setShowCompare(false)}
          onRemove={(productId) => {
            setCompareList(prev => prev.filter(id => id !== productId));
            if (compareList.length <= 1) {
              setShowCompare(false);
            }
          }}
          onAddToCart={openConfigurator}
        />
      )}
    </div>
  );
}
