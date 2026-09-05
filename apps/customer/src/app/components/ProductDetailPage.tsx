import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ShoppingCart, Heart, Star, Minus, Plus, ChevronLeft, ChevronRight,
  Truck, RotateCw, Award, Share2, Phone, Shield, Wrench,
  Search, Grid3x3, Sun, Zap, Lightbulb, Home, Building2, Package,
  Play, Zap as Lightning, Check, CreditCard,
} from 'lucide-react';
import { resolveImageUrl } from '@/lib/product-image-map';
import { csvProducts } from '../data/csvProducts';
import type { Product } from '../data/products-full';
import { useCartStore } from '@/stores/cart-store';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import toast from 'react-hot-toast';

interface ProductDetailPageProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductDetailPage({ product, onClose }: ProductDetailPageProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCartStore();
  const { user } = useFirebaseAuth();

  useEffect(() => {
    if (!product) return;
    setActiveIdx(0);
    setQty(1);
    setIsWishlisted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  if (!product) return null;

  const price = product.price;
  const stock = product.stock ?? 0;
  const images = [product.image];
  const displayProduct = { ...product, image: resolveImageUrl(product.image) };

  const handleAddToCart = async () => {
    if (!user?.uid) {
      toast.error('Please sign in to add items to your cart');
      return;
    }
    try {
      await addItem(user.uid, {
        productId: displayProduct.id,
        variantId: null,
        sku: displayProduct.sku || displayProduct.id,
        name: displayProduct.name,
        image: displayProduct.image,
        price: displayProduct.price,
        quantity: qty,
        customization: null,
        isAvailable: true,
        stockLevel: displayProduct.stock ?? 0,
      });
      toast.success('Added to cart!');
    } catch {
      toast.error('Could not add to cart');
    }
  };

  return createPortal(
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6"
        >
          <motion.div
            initial={{ opacity: 0, y: '6%', scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: '4%', scale: 0.98 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white w-full max-w-7xl h-[100vh] sm:h-[90vh] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden absolute top-2.5 left-1/2 -translate-x-1/2 z-30 w-11 h-1.5 rounded-full bg-gray-200 pointer-events-none" />

            {/* Floating top bar */}
            <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 md:p-5 pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={onClose}
                  aria-label="Back"
                  className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xl border border-gray-200 hover:bg-white flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" strokeWidth={2.4} />
                </button>
              </div>
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  aria-label="Wishlist"
                  className={`w-10 h-10 rounded-full backdrop-blur-xl border flex items-center justify-center ${
                    isWishlisted ? 'bg-red-500 border-red-400 text-white' : 'bg-white/90 border-gray-200 text-gray-700 hover:bg-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} strokeWidth={2.2} />
                </button>
                <button
                  aria-label="Share"
                  className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-700 hover:bg-white flex items-center justify-center"
                >
                  <Share2 className="w-5 h-5" strokeWidth={2.2} />
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-700 hover:bg-white flex items-center justify-center"
                >
                  <X className="w-5 h-5" strokeWidth={2.4} />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              {/* Promo bar */}
              <div className="bg-[#2E1FA8] text-white text-xs sm:text-sm px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>🔥</span>
                  <span>Quality Electricals. Trusted Service. Nationwide Delivery.</span>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-white/80">
                  <span>Need help? +233 24 123 4567</span>
                  <span className="w-px h-3.5 bg-white/25" />
                  <span className="flex items-center gap-1">📍 Select Branch ▾</span>
                </div>
              </div>

              {/* Header */}
              <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center">
                    <Lightning className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-extrabold tracking-tight leading-none">COFKANS</div>
                    <div className="text-[10px] sm:text-xs font-bold text-gray-400 tracking-[0.15em] uppercase">Electricals</div>
                  </div>
                  <span className="hidden sm:inline-block bg-purple-50 text-[#7C3AED] text-[11px] font-bold px-2.5 py-1 rounded-full">Since 2014</span>
                </div>

                <div className="flex-1 max-w-md hidden sm:flex">
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Search products, brands, categories..."
                      className="w-full h-11 pl-4 pr-12 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                    <button className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#7C3AED] rounded-lg flex items-center justify-center hover:bg-[#6D28D9] transition-colors">
                      <Search className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 text-sm font-semibold text-gray-700">
                  <span className="hidden md:flex items-center gap-1.5 hover:text-[#7C3AED] cursor-pointer transition-colors">
                    <Grid3x3 className="w-4 h-4" strokeWidth={2} /> Categories
                  </span>
                  <span className="hidden md:flex items-center gap-1.5 hover:text-[#7C3AED] cursor-pointer transition-colors">
                    <Sun className="w-4 h-4" strokeWidth={2} /> Deals
                  </span>
                  <span className="hidden md:flex items-center gap-1.5 text-[#7C3AED] cursor-pointer">
                    <Lightning className="w-4 h-4" strokeWidth={2} /> AI Assistant
                  </span>
                  <span className="flex items-center gap-1.5 cursor-pointer hover:text-[#7C3AED] transition-colors">
                    <Home className="w-4 h-4" strokeWidth={2} /> Hi, Adams
                  </span>
                  <span className="relative flex items-center gap-1.5 cursor-pointer hover:text-[#7C3AED] transition-colors">
                    <ShoppingCart className="w-4 h-4" strokeWidth={2} />
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">2</span>
                  </span>
                </div>
              </header>

              {/* Breadcrumb */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-0">
                <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                  <a href="#" className="hover:text-[#7C3AED] transition-colors">Home</a>
                  <span className="text-gray-300">›</span>
                  <a href="#" className="hover:text-[#7C3AED] transition-colors">{product.category}</a>
                  <span className="text-gray-300">›</span>
                  <a href="#" className="hover:text-[#7C3AED] transition-colors">{product.subcategory}</a>
                  <span className="text-gray-300">›</span>
                  <span className="text-gray-800 font-semibold">{product.name}</span>
                </nav>
              </div>

              {/* Main content */}
              <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  {/* Thumbnails */}
                  <div className="hidden sm:flex flex-col gap-2.5">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIdx(i)}
                        className={`w-full aspect-square rounded-xl border-2 overflow-hidden transition-all ${
                          i === activeIdx ? 'border-[#7C3AED] shadow-[0_0_0_1px_rgba(124,58,237,1)]' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <img src={resolveImageUrl(img)} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    <button className="w-full aspect-[3/2] rounded-xl border-2 border-gray-100 hover:border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-600 transition-all">
                      <span className="text-lg font-bold">+2</span>
                      <span className="text-[10px] font-semibold">View all</span>
                    </button>
                  </div>

                  {/* Main image */}
                  <div className="col-span-2 relative bg-gray-50 rounded-2xl sm:rounded-3xl overflow-hidden aspect-square">
                    <img
                      src={resolveImageUrl(images[activeIdx] || product.image)}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 sm:p-8"
                    />
                  </div>

                  {/* Details */}
                  <div className="col-span-2 sm:col-span-1 space-y-5">
                    <div>
                      <div className="text-[#7C3AED] font-bold text-xs uppercase tracking-wider mb-1.5">{product.category}</div>
                      <h1 className="text-xl sm:text-2xl font-extrabold leading-tight tracking-tight text-gray-900">{product.name}</h1>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" strokeWidth={1.5} />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-900">4.8</span>
                      <span className="text-sm text-gray-400">(56 reviews)</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400 font-medium">SKU: {product.sku}</span>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed">
                      {product.description || 'High-performance product with advanced technology for maximum brightness and efficiency.'}
                    </p>

                    {/* Feature grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-2.5">
                      {[
                        { icon: Lightning, label: '100W', sub: 'Power' },
                        { icon: Shield, label: 'IP66', sub: 'Waterproof' },
                        { icon: Zap, label: 'SMD', sub: 'LED Type' },
                        { icon: Sun, label: '6500K', sub: 'Daylight' },
                      ].map((feat, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                            <feat.icon className="w-4 h-4 text-[#7C3AED]" strokeWidth={2} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 leading-none">{feat.label}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">{feat.sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Highlights */}
                    <div className="space-y-2.5">
                      {[
                        'Premium quality with genuine LED chips',
                        'Energy efficient & long lifespan',
                        'Perfect for outdoor & industrial use',
                        '1 Year Warranty',
                      ].map((text, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-[#7C3AED] shrink-0" strokeWidth={2.5} />
                          <span>{text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stock */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {stock > 0 ? 'In Stock — Ready to ship' : 'Out of Stock'}
                    </div>
                  </div>

                  {/* Buy panel */}
                  <div className="col-span-2 sm:col-span-1">
                    <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 sm:sticky sm:top-6 space-y-5">
                      <div>
                        <div className="text-3xl font-extrabold text-[#7C3AED] tracking-tight">
                          {price > 0 ? `GH₵ ${price.toLocaleString()}` : 'Contact for Price'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Inclusive of VAT ⓘ</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          You Save: GH₵ 45.00 (15%)
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-gray-700 mb-2">Quantity</div>
                        <div className="flex items-center justify-between border border-gray-200 rounded-xl p-1">
                          <button
                            onClick={() => setQty(q => Math.max(1, q - 1))}
                            disabled={qty <= 1}
                            className="w-9 h-9 rounded-lg bg-gray-50 hover:bg-purple-50 hover:text-[#7C3AED] disabled:opacity-40 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                          <span className="text-sm font-bold tabular-nums w-8 text-center">{qty}</span>
                          <button
                            onClick={() => setQty(q => Math.min(stock || 99, q + 1))}
                            disabled={stock > 0 && qty >= stock}
                            className="w-9 h-9 rounded-lg bg-gray-50 hover:bg-purple-50 hover:text-[#7C3AED] disabled:opacity-40 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <button
                          onClick={handleAddToCart}
                          className="w-full h-12 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4" strokeWidth={2.4} />
                          Add to Cart
                        </button>
                        <button className="w-full h-12 rounded-xl border-2 border-[#7C3AED] text-[#7C3AED] hover:bg-purple-50 font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                          Buy Now
                        </button>
                      </div>

                      <div className="relative flex items-center gap-3 text-xs font-bold text-gray-400">
                        <div className="flex-1 h-px bg-gray-200" />
                        OR
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#7C3AED] flex items-center justify-center shrink-0">
                          <CreditCard className="w-5 h-5 text-white" strokeWidth={2} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">Buy with Paystack</div>
                          <div className="text-[11px] text-gray-500">Secure payments powered by Paystack</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 h-10 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:border-gray-400 flex items-center justify-center gap-1.5 transition-colors">
                          <Heart className="w-3.5 h-3.5" strokeWidth={2} /> Wishlist
                        </button>
                        <button className="flex-1 h-10 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:border-gray-400 flex items-center justify-center gap-1.5 transition-colors">
                          <Share2 className="w-3.5 h-3.5" strokeWidth={2} /> Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {[
                    { icon: Truck, label: 'Fast Delivery', sub: '1–3 working days nationwide' },
                    { icon: Award, label: 'Trusted Quality', sub: 'Genuine products, 1 year warranty' },
                    { icon: RotateCw, label: 'Easy Returns', sub: '7-day return policy' },
                    { icon: Shield, label: 'Expert Support', sub: '24/7 customer support' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-2xl">
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-[#7C3AED]" strokeWidth={2} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-400 leading-snug mt-0.5">{item.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tabs */}
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <div className="flex gap-6 sm:gap-8 border-b border-gray-100">
                    {['Description', 'Specifications', 'Reviews', 'Delivery & Returns'].map((tab, i) => (
                      <button
                        key={tab}
                        className={`pb-3 text-sm font-bold transition-colors relative ${
                          i === 0 ? 'text-[#7C3AED]' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {tab}
                        {i === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="py-6 text-sm text-gray-600 leading-relaxed max-w-3xl">
                    <p className="mb-4">
                      The {product.name} is engineered for superior performance and durability. Its slim, low-profile die-cast aluminium body houses genuine LED chips, delivering strong, even coverage for compounds, warehouses, car parks and security perimeters.
                    </p>
                    <p>
                      Every unit is factory-tested and IP66-sealed to handle Ghana's rainy season without hesitation, and ships with a 1-year warranty covering parts and workmanship.
                    </p>
                  </div>
                </div>
              </main>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
