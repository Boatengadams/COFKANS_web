import { useMemo } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, Package } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';

/**
 * Full-page cart for the customer dashboard. Same data as CartDrawer, but
 * surfaced as a tab so the customer can review items before checkout.
 */
export function CartView() {
  const { user } = useFirebaseAuth();
  const cart = useCartStore((s) => s.cart);
  const isLoading = useCartStore((s) => s.isLoading);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const items = cart?.items ?? [];
  const total = useMemo(() => items.reduce((s, i) => s + (i.subtotal || 0), 0), [items]);

  const goCheckout = () => {
    window.dispatchEvent(new CustomEvent('cofkans:checkout'));
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Loading your cart…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-card border-2 border-border rounded-2xl p-6 sm:p-12 text-center">
        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-1">Your cart is empty</h3>
        <p className="text-sm text-muted-foreground">
          Items you add while browsing will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold">Shopping Cart</h2>
          <p className="text-sm text-muted-foreground">
            {items.length} item{items.length === 1 ? '' : 's'} ready to check out.
          </p>
        </div>
      </div>

      <div className="bg-card border-2 border-border rounded-2xl divide-y divide-border">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId ?? ''}`}
            className="p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            <div className="flex gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name || 'item'} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold truncate">{item.name || 'Product'}</p>
                  <div className="font-bold text-sm sm:text-base whitespace-nowrap flex-shrink-0 sm:hidden">
                    GH₵ {item.subtotal.toFixed(2)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">GH₵ {item.price.toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => user && updateQuantity(user.uid, item.productId, item.variantId ?? null, Math.max(1, item.quantity - 1))}
                    className="min-h-11 min-w-11 p-1.5 rounded-lg border-2 border-border hover:bg-muted inline-flex items-center justify-center"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => user && updateQuantity(user.uid, item.productId, item.variantId ?? null, item.quantity + 1)}
                    className="min-h-11 min-w-11 p-1.5 rounded-lg border-2 border-border hover:bg-muted inline-flex items-center justify-center"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => user && removeItem(user.uid, item.productId, item.variantId ?? null)}
                    className="ml-auto min-h-11 min-w-11 p-1.5 rounded-lg text-red-600 hover:bg-red-500/10 inline-flex items-center justify-center"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="hidden sm:block text-right flex-shrink-0 self-start pt-1">
              <div className="font-bold">GH₵ {item.subtotal.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border-2 border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Subtotal</p>
          <p className="text-xl font-bold">GH₵ {total.toFixed(2)}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={goCheckout}
          className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-12 px-6 py-3 bg-primary text-white rounded-xl font-bold"
        >
          Checkout <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
