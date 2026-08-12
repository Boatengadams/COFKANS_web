import { AnimatePresence, motion } from 'motion/react';
import { X, Plus, Minus, Trash2, ShoppingBag, AlertCircle } from 'lucide-react';
import { useCartStore } from '../../../stores/cart-store';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { user } = useFirebaseAuth();
  const cart = useCartStore(state => state.cart);
  const isLoading = useCartStore(state => state.isLoading);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);

  const handleUpdateQuantity = async (productId: string, variantId: string | null, newQuantity: number) => {
    if (!user) return;
    await updateQuantity(user.uid, productId, variantId, newQuantity);
  };

  const handleRemoveItem = async (productId: string, variantId: string | null) => {
    if (!user) return;
    await removeItem(user.uid, productId, variantId);
  };

  const handleCheckout = () => {
    onClose();
    onCheckout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-primary" strokeWidth={2} />
                <h2 className="text-2xl font-bold">Shopping Cart</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {!cart || cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground/50 mb-4" strokeWidth={1.5} />
                  <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                  <p className="text-muted-foreground mb-6">Add some products to get started!</p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <motion.div
                      key={`${item.productId}-${item.variantId}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 p-4 bg-card rounded-xl border border-border"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1 truncate">{item.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">SKU: {item.sku}</p>

                        {/* Stock Status */}
                        {!item.isAvailable ? (
                          <div className="flex items-center gap-1 text-xs text-red-600 mb-2">
                            <AlertCircle className="w-3 h-3" />
                            <span>Out of stock</span>
                          </div>
                        ) : item.stockLevel < 10 ? (
                          <div className="flex items-center gap-1 text-xs text-orange-600 mb-2">
                            <AlertCircle className="w-3 h-3" />
                            <span>Only {item.stockLevel} left</span>
                          </div>
                        ) : null}

                        {/* Price & Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.productId, item.variantId, item.quantity - 1)}
                              disabled={isLoading || item.quantity <= 1}
                              className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <span className="w-8 text-center font-semibold">{item.quantity}</span>

                            <button
                              onClick={() => handleUpdateQuantity(item.productId, item.variantId, item.quantity + 1)}
                              disabled={isLoading || !item.isAvailable || item.quantity >= item.stockLevel}
                              className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-bold text-primary">
                              GH₵{item.subtotal.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              GH₵{item.price.toFixed(2)} each
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.productId, item.variantId)}
                        disabled={isLoading}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-600 disabled:opacity-50 transition-colors h-fit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - Totals & Checkout */}
            {cart && cart.items.length > 0 && (
              <div className="border-t border-border p-6 bg-muted/30">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">GH₵{cart.subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tax (12.5%)</span>
                    <span className="font-semibold">GH₵{cart.taxAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">
                      {cart.shippingAmount === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `GH₵${cart.shippingAmount.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {cart.subtotal < 500 && (
                    <div className="text-xs text-muted-foreground bg-primary/10 p-2 rounded-lg">
                      Add GH₵{(500 - cart.subtotal).toFixed(2)} more for free shipping
                    </div>
                  )}

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl text-primary">GH₵{cart.total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={onClose}
                  className="w-full mt-3 py-3 bg-muted hover:bg-muted/80 rounded-xl font-semibold transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
