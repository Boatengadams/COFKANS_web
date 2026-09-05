import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InventoryChecker } from './InventoryChecker';
import { fullProductCatalog, Product } from '../data/products-full';
import { resolveImageUrl } from '@/lib/product-image-map';
import { ArrowLeft, Package, CheckCircle, Star, Info, Palette, Sparkles, Check, Zap, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';

interface ProductConfiguratorPageProps {
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
    image: string;
  } | null;
  onClose: () => void;
}

export function ProductConfiguratorPage({ product, onClose }: ProductConfiguratorPageProps) {
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSpecs, setShowSpecs] = useState(false);

  // Find the full product details from catalog
  const fullProduct = fullProductCatalog.find(p => p.id === product?.id || p.sku === product?.sku);

  // Find product variants (same subcategory)
  const productVariants = fullProduct
    ? fullProductCatalog.filter(p =>
        p.subcategory === fullProduct.subcategory &&
        p.category === fullProduct.category &&
        p.id !== fullProduct.id
      ).slice(0, 8)
    : [];

  // Find related products for wholesale (same category)
  const relatedProducts = fullProduct
    ? fullProductCatalog.filter(p =>
        p.category === fullProduct.category &&
        p.id !== fullProduct.id
      ).slice(0, 6)
    : [];

  const currentProduct = selectedVariant || fullProduct;

  useEffect(() => {
    // Scroll to top when page opens
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Reset variant selection when product changes
    setSelectedVariant(null);
    setQuantity(1);
  }, [product]);

  if (!product || !fullProduct) return null;

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      onClose();
    }, 2000);
  };

  const totalPrice = currentProduct ? currentProduct.price * quantity : 0;
  const tradePrice = currentProduct?.tradePrice ? currentProduct.tradePrice * quantity : null;

  return (
    <div className="fixed inset-0 bg-background z-[100] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg border-b border-border z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="flex items-center gap-2 min-h-11 px-2 sm:px-4 py-2 rounded-xl hover:bg-muted transition-all cursor-pointer flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              <span className="font-semibold hidden sm:inline">Back to Products</span>
              <span className="font-semibold sm:hidden">Back</span>
            </motion.button>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Package className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={2.5} />
              <div className="text-right min-w-0">
                <div className="text-xs sm:text-sm font-semibold truncate">{currentProduct?.name}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground truncate">SKU: {currentProduct?.sku}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Product Info Header */}
          <div className="text-center mb-8 md:mb-16">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-gold-subtle rounded-full mb-4 md:mb-6 border border-primary/20"
            >
              <Sparkles className="w-4 h-4 text-primary" strokeWidth={2.5} />
              <span className="text-xs sm:text-sm font-bold text-primary">Product Customization</span>
            </motion.div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 px-1" style={{ fontFamily: 'var(--font-luxury)' }}>
              {currentProduct?.name}
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-1">
              {currentProduct?.description || 'Customize your selection with available variants and options'}
            </p>
          </div>

          {/* Main Product Configuration Grid */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start mb-10 md:mb-16">
            {/* Product Image & Details — sticky only on large screens */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 border-2 border-border shadow-xl">
                {/* Product Image */}
                <div className="aspect-square relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/50 to-background mb-4 sm:mb-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentProduct?.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 flex items-center justify-center p-4 sm:p-8"
                    >
                      <img
                        src={resolveImageUrl(currentProduct?.image)}
                        alt={currentProduct?.name}
                        className="w-full h-full object-contain drop-shadow-2xl"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {currentProduct?.featured && (
                      <div className="px-3 py-1.5 bg-gradient-to-r from-primary to-secondary text-white rounded-full flex items-center gap-2 shadow-lg text-xs font-bold">
                        <Star className="w-3 h-3 fill-white" strokeWidth={2} />
                        Featured
                      </div>
                    )}
                    {currentProduct?.badge && (
                      <div className="px-3 py-1.5 bg-secondary/90 text-white rounded-full text-xs font-bold shadow-lg">
                        {currentProduct.badge}
                      </div>
                    )}
                  </div>

                  {/* Stock Indicator */}
                  <div className="absolute bottom-4 right-4">
                    {(currentProduct?.stock || 0) > 50 ? (
                      <div className="px-3 py-1.5 bg-secondary/90 text-white rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" strokeWidth={2.5} />
                        In Stock ({currentProduct?.stock})
                      </div>
                    ) : (currentProduct?.stock || 0) > 0 ? (
                      <div className="px-3 py-1.5 bg-primary/90 text-white rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" strokeWidth={2.5} />
                        Low Stock ({currentProduct?.stock})
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 bg-red-500/90 text-white rounded-full text-xs font-bold backdrop-blur-sm">
                        Out of Stock
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Meta */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Product Code</div>
                      <code className="text-lg font-mono font-bold bg-muted px-3 py-1.5 rounded-lg">
                        {currentProduct?.sku}
                      </code>
                    </div>
                    {currentProduct?.rating && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Rating</div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(currentProduct.rating!)
                                    ? 'fill-primary text-primary'
                                    : 'text-muted'
                                }`}
                                strokeWidth={1.5}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-bold">{currentProduct.rating}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Specs Toggle */}
                  {currentProduct?.specs && currentProduct.specs.length > 0 && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowSpecs(!showSpecs)}
                        className="w-full py-3 bg-muted hover:bg-muted/70 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Info className="w-4 h-4" strokeWidth={2} />
                        <span>{showSpecs ? 'Hide' : 'Show'} Specifications</span>
                      </motion.button>

                      {/* Specs Panel */}
                      <AnimatePresence>
                        {showSpecs && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-muted/50 rounded-xl space-y-2">
                              {currentProduct.specs.map((spec: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <Check className="w-4 h-4 text-secondary" strokeWidth={2.5} />
                                  <span>{spec}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Configuration Options */}
            <div className="space-y-6 sm:space-y-8">
              {/* Product Variants */}
              {productVariants.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md text-sm sm:text-base flex-shrink-0">
                      1
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold">Available Variants</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose from {productVariants.length + 1} available options in this series
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Current Product */}
                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedVariant(null)}
                      className={`p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                        !selectedVariant
                          ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-xl shadow-primary/30'
                          : 'bg-card hover:bg-muted border-2 border-border hover:border-primary/30'
                      }`}
                    >
                      <div className="text-sm font-semibold line-clamp-2">{fullProduct.name}</div>
                      <div className="text-xs mt-2 opacity-80">GH₵ {fullProduct.price.toLocaleString()}</div>
                    </motion.button>

                    {/* Variants */}
                    {productVariants.map((variant) => (
                      <motion.button
                        key={variant.id}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                          selectedVariant?.id === variant.id
                            ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-xl shadow-primary/30'
                            : 'bg-card hover:bg-muted border-2 border-border hover:border-primary/30'
                        }`}
                      >
                        <div className="text-sm font-semibold line-clamp-2">{variant.name}</div>
                        <div className="text-xs mt-2 opacity-80">GH₵ {variant.price.toLocaleString()}</div>
                        {variant.tradePrice && variant.tradePrice < variant.price && (
                          <div className="text-xs mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" strokeWidth={2} />
                            Trade: GH₵ {variant.tradePrice.toLocaleString()}
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md text-sm sm:text-base flex-shrink-0">
                    {productVariants.length > 0 ? '2' : '1'}
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold">Select Quantity</h4>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-card hover:bg-muted border-2 border-border font-bold text-xl flex items-center justify-center transition-all cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    −
                  </motion.button>
                  <div className="flex-1 text-center">
                    <div className="text-3xl sm:text-4xl font-bold">{quantity}</div>
                    <div className="text-xs text-muted-foreground mt-1">Units</div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-card hover:bg-muted border-2 border-border font-bold text-xl flex items-center justify-center transition-all cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    +
                  </motion.button>
                </div>
                {quantity >= 10 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-secondary/10 border border-secondary/20 rounded-xl flex items-center gap-2 text-sm text-secondary font-semibold"
                  >
                    <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
                    Bulk order - Consider trade pricing for better rates!
                  </motion.div>
                )}
              </div>

              {/* Price & Add to Cart */}
              <div className="bg-gradient-to-br from-card via-card to-muted/30 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-border shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="min-w-0">
                    <div className="text-sm text-muted-foreground mb-2 font-medium">
                      {tradePrice ? 'Retail Price' : 'Total Price'}
                    </div>
                    <motion.div
                      key={totalPrice}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className={`text-2xl sm:text-4xl font-bold break-words ${tradePrice ? 'text-muted-foreground line-through' : 'text-primary'}`}
                    >
                      GH₵ {totalPrice.toLocaleString()}
                    </motion.div>
                    {tradePrice && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl sm:text-3xl font-bold text-primary mt-2 break-words"
                      >
                        GH₵ {tradePrice.toLocaleString()}
                      </motion.div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      GH₵ {currentProduct?.price.toFixed(2)} × {quantity} unit{quantity > 1 ? 's' : ''}
                      {tradePrice && (
                        <span className="block mt-1 text-secondary font-semibold">
                          Save GH₵ {(totalPrice - tradePrice).toLocaleString()} with trade pricing
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="sm:text-right flex-shrink-0">
                    <div className="text-xs text-muted-foreground mb-2 font-medium">Delivery</div>
                    <div className="text-base sm:text-lg font-bold flex items-center gap-2">
                      <Zap className="w-5 h-5 text-secondary" strokeWidth={2} />
                      2-3 Days
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAddToCart}
                    disabled={addedToCart || (currentProduct?.stock || 0) <= 0}
                    className={`w-full min-h-12 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer ${
                      addedToCart
                        ? 'bg-green-500 text-white shadow-xl'
                        : (currentProduct?.stock || 0) <= 0
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-2xl hover:from-primary/90 hover:to-secondary/90'
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <CheckCircle className="w-6 h-6" strokeWidth={2} />
                        <span>Added to Cart!</span>
                      </>
                    ) : (currentProduct?.stock || 0) <= 0 ? (
                      <span>Out of Stock</span>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </motion.button>

                  {addedToCart && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-sm text-muted-foreground"
                    >
                      Redirecting back to products...
                    </motion.p>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-card hover:bg-muted border-2 border-border rounded-2xl font-bold transition-all duration-200 cursor-pointer"
                  >
                    Request Custom Quote
                  </motion.button>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-border flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-secondary" strokeWidth={2.5} />
                    <span>Premium Quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-secondary" strokeWidth={2.5} />
                    <span>2 Year Warranty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-secondary" strokeWidth={2.5} />
                    <span>Free Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wholesale Hub Section - Product Specific */}
          <div className="mt-12 md:mt-24">
            <div className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 border-2 border-border shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground mb-1">Total Price</div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary break-words">
                    GH₵ {product.price.toLocaleString()}
                  </div>
                </div>
                <div className="sm:text-right min-w-0">
                  <div className="text-sm text-muted-foreground mb-1">Product Code</div>
                  <div className="text-base sm:text-lg font-mono font-bold truncate">{product.sku}</div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={addedToCart}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {addedToCart ? (
                  <>
                    <CheckCircle className="w-6 h-6" strokeWidth={2} />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <Package className="w-6 h-6" strokeWidth={2} />
                    <span>Add to Cart</span>
                  </>
                )}
              </motion.button>

              {addedToCart && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm text-muted-foreground mt-4"
                >
                  Redirecting back to products...
                </motion.p>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12 md:mt-20">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-8 md:mb-12"
              >
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <Palette className="w-4 h-4 text-primary" strokeWidth={2} />
                  <span className="text-sm font-bold text-primary">Related Products</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-luxury)' }}>
                  You May Also Like
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                  Explore similar products from the same category
                </p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {relatedProducts.slice(0, 6).map((relatedProduct, idx) => (
                  <motion.div
                    key={relatedProduct.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group bg-card rounded-2xl border-2 border-border overflow-hidden hover:shadow-xl hover:border-primary transition-all duration-300 cursor-pointer"
                  >
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      <img
                        src={resolveImageUrl(relatedProduct.image)}
                        alt={relatedProduct.name}
                        className="w-full h-full object-contain p-2 sm:p-4"
                      />
                      {relatedProduct.badge && (
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-1 bg-secondary/90 text-white rounded-full text-[10px] sm:text-xs font-bold">
                          {relatedProduct.badge}
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <code className="text-[10px] sm:text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded truncate max-w-full inline-block">
                        {relatedProduct.sku}
                      </code>
                      <h4 className="text-xs sm:text-sm font-bold mt-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedProduct.name}
                      </h4>
                      <div className="mt-2 sm:mt-3 flex flex-wrap items-baseline gap-1 sm:gap-2">
                        <div className="text-sm sm:text-lg font-bold text-primary">
                          GH₵ {relatedProduct.price.toLocaleString()}
                        </div>
                        {relatedProduct.tradePrice && relatedProduct.tradePrice < relatedProduct.price && (
                          <div className="text-[10px] sm:text-xs text-muted-foreground line-through">
                            GH₵ {relatedProduct.tradePrice.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Wholesale Hub Section - Product Specific */}
          <div className="mt-12 md:mt-24 pb-8 md:pb-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 md:mb-16"
            >
              <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 sm:px-4 py-2 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                <Package className="w-4 h-4" strokeWidth={2.5} />
                <span className="text-xs sm:text-[15px] font-semibold">For Professionals & Bulk Buyers</span>
              </div>
              <h2 className="mb-4 md:mb-6 text-2xl sm:text-4xl md:text-5xl font-bold" style={{ fontFamily: 'var(--font-luxury)' }}>
                Wholesale Hub
              </h2>
              <p className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-1">
                Real-time inventory for {currentProduct?.category} products and bulk orders
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <InventoryChecker />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
