import { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Plus, Minus, Tag, TrendingDown, Percent, Zap } from 'lucide-react';

interface DiscountTier {
  minQuantity: number;
  maxQuantity?: number;
  discountPercent: number;
}

interface BulkDiscountProductProps {
  id: string;
  name: string;
  originalPrice: number;
  image?: string;
  category: string;
  discountTiers: DiscountTier[];
  stock: number;
  onAddToCart?: (productId: string, quantity: number) => void;
}

export function BulkDiscountProduct({
  id,
  name,
  originalPrice,
  image,
  category,
  discountTiers,
  stock,
  onAddToCart
}: BulkDiscountProductProps) {
  const [quantity, setQuantity] = useState(1);

  // Calculate discount based on quantity
  const getCurrentDiscount = (qty: number): DiscountTier | null => {
    for (const tier of discountTiers.sort((a, b) => b.minQuantity - a.minQuantity)) {
      if (qty >= tier.minQuantity && (!tier.maxQuantity || qty <= tier.maxQuantity)) {
        return tier;
      }
    }
    return null;
  };

  const currentDiscount = getCurrentDiscount(quantity);
  const discountPercent = currentDiscount?.discountPercent || 0;
  const discountedPrice = originalPrice * (1 - discountPercent / 100);
  const totalSavings = (originalPrice - discountedPrice) * quantity;
  const finalTotal = discountedPrice * quantity;

  // Get next discount tier
  const getNextTier = () => {
    const nextTiers = discountTiers.filter(tier => tier.minQuantity > quantity);
    return nextTiers.length > 0 ? nextTiers.reduce((min, tier) =>
      tier.minQuantity < min.minQuantity ? tier : min
    ) : null;
  };

  const nextTier = getNextTier();

  const handleQuantityChange = (change: number) => {
    const newQty = Math.max(1, Math.min(stock, quantity + change));
    setQuantity(newQty);
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(id, quantity);
    }
    alert(`Added ${quantity}x ${name} to cart at GH₵ ${discountedPrice.toFixed(2)} each! Total: GH₵ ${finalTotal.toFixed(2)}`);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-card rounded-2xl border-2 border-border overflow-hidden shadow-lg hover:shadow-2xl transition-all relative"
    >
      {/* Discount badge */}
      {discountPercent > 0 && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute top-3 right-3 z-10 bg-gradient-to-br from-red-500 to-red-600 text-white px-3 py-2 rounded-full shadow-lg"
        >
          <p className="font-bold text-sm flex items-center gap-1">
            <Zap className="w-4 h-4 fill-current" />
            {discountPercent}% OFF
          </p>
        </motion.div>
      )}

      {/* Product image */}
      <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <ShoppingCart className="w-20 h-20 text-primary/40" strokeWidth={1.5} />
          </div>
        )}
        <span className="absolute top-3 left-3 px-3 py-1 bg-black/70 text-white text-xs font-bold rounded-full">
          {category}
        </span>
      </div>

      <div className="p-5">
        {/* Product name */}
        <h3 className="font-bold text-lg mb-3">{name}</h3>

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            {discountPercent > 0 ? (
              <>
                <p className="text-2xl font-bold text-primary">GH₵ {discountedPrice.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground line-through">GH₵ {originalPrice.toFixed(2)}</p>
              </>
            ) : (
              <p className="text-2xl font-bold">GH₵ {originalPrice.toFixed(2)}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">per unit</p>
        </div>

        {/* Discount tiers display */}
        <div className="bg-muted rounded-xl p-3 mb-4">
          <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            BULK SAVINGS
          </p>
          <div className="space-y-1">
            {discountTiers.map((tier, index) => (
              <div
                key={index}
                className={`flex items-center justify-between text-xs p-2 rounded ${
                  currentDiscount?.minQuantity === tier.minQuantity
                    ? 'bg-primary/20 border border-primary font-bold'
                    : 'bg-background/50'
                }`}
              >
                <span>
                  {tier.minQuantity}{tier.maxQuantity ? `-${tier.maxQuantity}` : '+'} units
                </span>
                <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  {tier.discountPercent}% OFF
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Next tier incentive */}
        {nextTier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4"
          >
            <p className="text-xs text-yellow-800 dark:text-yellow-200 font-bold flex items-center gap-1">
              <Percent className="w-3 h-3" />
              Buy {nextTier.minQuantity - quantity} more to unlock {nextTier.discountPercent}% discount!
            </p>
          </motion.div>
        )}

        {/* Quantity selector */}
        <div className="mb-4">
          <p className="text-xs font-bold text-muted-foreground mb-2">Quantity</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-lg bg-muted hover:bg-muted/70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4" strokeWidth={2} />
            </button>
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold">{quantity}</p>
              <p className="text-xs text-muted-foreground">{stock} in stock</p>
            </div>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= stock}
              className="w-10 h-10 rounded-lg bg-muted hover:bg-muted/70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Total calculation */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Subtotal ({quantity} items)</p>
            <p className="text-sm font-bold">GH₵ {(originalPrice * quantity).toFixed(2)}</p>
          </div>
          {totalSavings > 0 && (
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-green-600 dark:text-green-400">You save</p>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">
                -GH₵ {totalSavings.toFixed(2)}
              </p>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-green-200 dark:border-green-800">
            <p className="text-sm font-bold">Total</p>
            <p className="text-xl font-bold text-primary">GH₵ {finalTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Add to cart button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" strokeWidth={2} />
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
}
