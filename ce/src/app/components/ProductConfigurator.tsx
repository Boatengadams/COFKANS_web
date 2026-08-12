import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Sparkles, Check, Zap, ShoppingCart, Star, Info } from 'lucide-react';

export function ProductConfigurator() {
  const [selectedFinish, setSelectedFinish] = useState('gold');
  const [selectedProduct, setSelectedProduct] = useState('socket');
  const [quantity, setQuantity] = useState(1);
  const [showSpecs, setShowSpecs] = useState(false);

  const finishes = [
    {
      id: 'gold',
      name: 'Antique Gold',
      color: '#D4AF37',
      description: 'Luxurious 24K gold-plated finish',
      metallic: true,
      premium: true,
    },
    {
      id: 'chrome',
      name: 'Polished Chrome',
      color: '#E8E8E8',
      description: 'Mirror-finish stainless steel',
      metallic: true,
      premium: true,
    },
    {
      id: 'matte',
      name: 'Matte Black',
      color: '#1A1A1A',
      description: 'Premium powder-coated',
      metallic: false,
      premium: true,
    },
    {
      id: 'rose',
      name: 'Rose Gold',
      color: '#E0A899',
      description: 'Elegant copper-rose alloy',
      metallic: true,
      premium: true,
    },
    {
      id: 'white',
      name: 'Pure White',
      color: '#F8F8F8',
      description: 'Classic glossy white',
      metallic: false,
      premium: false,
    },
  ];

  const products = [
    {
      id: 'socket',
      name: '13A Socket + USB',
      image: 'https://s.alicdn.com/@sc04/kf/H8747b6becbf442748200b2e2b3ea99b5h/Uk-13A-Wall-Switch-With-USB-Fast-Charging-Type-c-Wall-Outlet-Grey-High-Quality-PC-Electrical-Lamp-Speed-Switch-Socket-British.jpg',
      price: 52.00,
      specs: ['13A rated', '2x USB ports', 'Fast charging', 'Switched'],
    },
    {
      id: 'switch',
      name: '1 Gang Switch',
      image: 'https://images.unsplash.com/photo-1624823183493-ed5832f48f18?w=800',
      price: 10.30,
      specs: ['1-gang 1-way', '13A rated', 'Fire resistant', 'Premium plate'],
    },
    {
      id: 'dimmer',
      name: 'Smart Dimmer',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      price: 85.00,
      specs: ['Smart LED', 'App control', 'Voice compatible', 'Touch sensor'],
    },
  ];

  const currentFinish = finishes.find((f) => f.id === selectedFinish);
  const currentProduct = products.find((p) => p.id === selectedProduct);
  const totalPrice = currentProduct ? currentProduct.price * quantity : 0;

  return (
    <div className="w-full">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Product Image & Preview */}
        <div className="sticky top-24">
          <div className="bg-card rounded-3xl p-8 border-2 border-border shadow-xl">
            <div className="aspect-square relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/50 to-background">
              {/* Product Image with Filter */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedProduct}-${selectedFinish}`}
                  initial={{ opacity: 0, scale: 0.9, rotateY: 45 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.9, rotateY: -45 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
                  className="absolute inset-0 flex items-center justify-center p-8"
                  style={{ perspective: '1000px' }}
                >
                  <motion.img
                    whileHover={{ scale: 1.05, rotateY: 5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    src={currentProduct?.image}
                    alt={currentProduct?.name}
                    className="w-full h-full object-contain drop-shadow-2xl"
                    style={{
                      filter: selectedFinish === 'gold'
                        ? 'sepia(0.3) saturate(1.5) brightness(1.1) hue-rotate(10deg)'
                        : selectedFinish === 'chrome'
                        ? 'saturate(0.5) brightness(1.2) contrast(1.1)'
                        : selectedFinish === 'matte'
                        ? 'saturate(0.3) brightness(0.7) contrast(1.3)'
                        : selectedFinish === 'rose'
                        ? 'sepia(0.4) saturate(1.3) brightness(1.05) hue-rotate(-10deg)'
                        : 'saturate(0.9) brightness(1.1)',
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Color Glow Effect */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 blur-3xl -z-10"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${currentFinish?.color}40 0%, transparent 70%)`,
                }}
              />

              {/* Premium Badge */}
              {currentFinish?.premium && (
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-full flex items-center gap-2 shadow-lg"
                >
                  <Star className="w-4 h-4 fill-white" strokeWidth={2} />
                  <span className="text-xs font-bold">Premium</span>
                </motion.div>
              )}

              {/* Finish Indicator */}
              <div className="absolute top-4 left-4 px-4 py-2 bg-card/90 backdrop-blur-md rounded-full border border-border shadow-md">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{
                      background: currentFinish?.metallic
                        ? `linear-gradient(135deg, ${currentFinish.color}, ${currentFinish.color}cc)`
                        : currentFinish?.color,
                    }}
                  />
                  <span className="text-xs font-bold">{currentFinish?.name}</span>
                </div>
              </div>
            </div>

            {/* Specs Toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSpecs(!showSpecs)}
              className="w-full mt-6 py-3 bg-muted hover:bg-muted/70 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
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
                  <div className="mt-4 p-4 bg-muted/50 rounded-xl space-y-2">
                    {currentProduct?.specs.map((spec, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-secondary" strokeWidth={2.5} />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="space-y-8">
          <div>
            <h3 className="text-3xl font-bold mb-3">Configure Your Product</h3>
            <p className="text-muted-foreground text-lg">
              Customize finish and style to match your architectural vision
            </p>
          </div>

          {/* Product Type Selection */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md">
                1
              </div>
              <h4 className="text-xl font-bold">Select Product Type</h4>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {products.map((product) => (
                <motion.button
                  key={product.id}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedProduct(product.id)}
                  className={`p-4 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    selectedProduct === product.id
                      ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-xl shadow-primary/30'
                      : 'bg-card hover:bg-muted border-2 border-border hover:border-primary/30'
                  }`}
                >
                  {product.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Finish Selection */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md">
                2
              </div>
              <h4 className="text-xl font-bold">Choose Finish</h4>
            </div>
            <div className="space-y-3">
              {finishes.map((finish) => (
                <motion.button
                  key={finish.id}
                  whileHover={{ scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedFinish(finish.id)}
                  className={`w-full p-5 rounded-2xl transition-all duration-300 flex items-center gap-4 ${
                    selectedFinish === finish.id
                      ? 'bg-card border-2 border-primary shadow-lg shadow-primary/20'
                      : 'bg-card hover:bg-muted border-2 border-border hover:border-primary/30'
                  }`}
                >
                  {/* Color Swatch */}
                  <div className="relative">
                    <div
                      className="w-14 h-14 rounded-full border-2 border-white shadow-lg"
                      style={{
                        background: finish.metallic
                          ? `linear-gradient(135deg, ${finish.color}, ${finish.color}cc)`
                          : finish.color,
                        boxShadow: `0 4px 16px ${finish.color}60, inset 0 0 12px ${finish.color}40`,
                      }}
                    />
                    <AnimatePresence>
                      {selectedFinish === finish.id && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-5 h-5 text-primary" strokeWidth={3} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Finish Info */}
                  <div className="flex-1 text-left">
                    <div className="font-bold text-lg mb-1">{finish.name}</div>
                    <div className="text-sm text-muted-foreground">{finish.description}</div>
                  </div>

                  {/* Metallic Badge */}
                  {finish.metallic && (
                    <div className="px-3 py-1.5 bg-primary/10 rounded-full flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-primary" strokeWidth={2} />
                      <span className="text-xs font-bold text-primary">Metallic</span>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md">
                3
              </div>
              <h4 className="text-xl font-bold">Select Quantity</h4>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-xl bg-card hover:bg-muted border-2 border-border font-bold text-xl flex items-center justify-center transition-all"
              >
                −
              </motion.button>
              <div className="flex-1 text-center">
                <div className="text-4xl font-bold">{quantity}</div>
                <div className="text-xs text-muted-foreground mt-1">Units</div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 rounded-xl bg-card hover:bg-muted border-2 border-border font-bold text-xl flex items-center justify-center transition-all"
              >
                +
              </motion.button>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="bg-gradient-to-br from-card via-card to-muted/30 p-8 rounded-3xl border-2 border-border shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm text-muted-foreground mb-2 font-medium">Total Price</div>
                <motion.div
                  key={totalPrice}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-bold text-primary"
                >
                  GH₵ {totalPrice.toFixed(2)}
                </motion.div>
                <div className="text-xs text-muted-foreground mt-1">
                  GH₵ {currentProduct?.price.toFixed(2)} × {quantity} unit{quantity > 1 ? 's' : ''}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-2 font-medium">Delivery</div>
                <div className="text-lg font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-secondary" strokeWidth={2} />
                  2-3 Days
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                Add to Cart
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-card hover:bg-muted border-2 border-border rounded-2xl font-bold transition-all duration-200"
              >
                Request Custom Quote
              </motion.button>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-border flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary" strokeWidth={2.5} />
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary" strokeWidth={2.5} />
                <span>2 Year Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
