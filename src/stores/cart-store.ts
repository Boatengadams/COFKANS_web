import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, FirestoreCart } from '../lib/firestore-schema';
import { CartService } from '../lib/firestore-service';
import { DEMO_MODE, getBrowserStorage } from '../lib/demo-mode';
import toast from 'react-hot-toast';

function demoEmptyCart(userId: string): FirestoreCart {
  const now = { toMillis: () => Date.now(), toDate: () => new Date() } as never;
  return {
    userId,
    items: [],
    subtotal: 0,
    taxAmount: 0,
    shippingAmount: 0,
    discountAmount: 0,
    total: 0,
    appliedCoupons: [],
    updatedAt: now,
    createdAt: now,
    expiresAt: now,
  } as FirestoreCart;
}

function normalizeCart(cart: FirestoreCart, userId?: string): FirestoreCart {
  const items = Array.isArray(cart.items)
    ? cart.items.map(item => ({
        ...item,
        quantity: item.quantity ?? 0,
        price: item.price ?? 0,
        subtotal: item.subtotal ?? 0,
      }))
    : [];
  return {
    ...cart,
    userId: cart.userId || userId || '',
    items,
    subtotal: cart.subtotal ?? 0,
    taxAmount: cart.taxAmount ?? 0,
    shippingAmount: cart.shippingAmount ?? 0,
    discountAmount: cart.discountAmount ?? 0,
    total: cart.total ?? 0,
    appliedCoupons: Array.isArray(cart.appliedCoupons) ? cart.appliedCoupons : [],
  };
}

function recalcDemoCart(cart: FirestoreCart): FirestoreCart {
  const subtotal = cart.items.reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 0), 0);
  return normalizeCart({ ...cart, subtotal, taxAmount: 0, shippingAmount: 0, total: subtotal });
}

interface CartStore {
  // State
  cart: FirestoreCart | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initializeCart: (userId: string) => Promise<void>;
  addItem: (userId: string, item: Omit<CartItem, 'subtotal'>) => Promise<void>;
  updateQuantity: (userId: string, productId: string, variantId: string | null, quantity: number) => Promise<void>;
  removeItem: (userId: string, productId: string, variantId: string | null) => Promise<void>;
  removeLocalItem: (productId: string, variantId: string | null) => void;
  clearCart: (userId: string) => Promise<void>;
  refreshCart: (userId: string) => Promise<void>;

  // Computed
  getItemCount: () => number;
  getTotalItems: () => number;
  hasItem: (productId: string, variantId?: string | null) => boolean;
  getItem: (productId: string, variantId?: string | null) => CartItem | undefined;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      isLoading: false,
      isInitialized: false,

      // Initialize cart from Firebase.
      // Resilient: races with user-doc creation on first signup can cause a
      // transient PERMISSION_DENIED. We retry once with backoff and fall
      // back to an in-memory empty cart so the UI is never blocked.
      // No user-facing toast is shown — write paths surface errors when
      // the user actually tries to add to cart.
      initializeCart: async (userId: string) => {
        if (!userId) return;

        if (DEMO_MODE) {
          const existing = get().cart;
          set({ cart: existing && existing.userId === userId ? normalizeCart(existing, userId) : demoEmptyCart(userId), isInitialized: true, isLoading: false });
          return;
        }

        set({ isLoading: true });

        const tryLoad = async (): Promise<FirestoreCart> => {
          let cart = await CartService.get(userId);
          if (!cart) cart = await CartService.create(userId);
          return normalizeCart(cart, userId);
        };

        try {
          const cart = await tryLoad();
          set({ cart, isInitialized: true, isLoading: false });
        } catch (firstErr) {
          const code = (firstErr as { code?: string })?.code;
          // Retry once for races on fresh signup (user doc not yet visible
          // to the rules engine) or transient network blips.
          const retriable = code === 'permission-denied' || code === 'unavailable' || code === 'failed-precondition';
          if (retriable) {
            await new Promise(r => setTimeout(r, 800));
            try {
              const cart = await tryLoad();
              set({ cart, isInitialized: true, isLoading: false });
              return;
            } catch (retryErr) {
              console.warn('Cart init retry failed:', retryErr);
            }
          } else {
            console.warn('Cart init failed:', firstErr);
          }
          // Fall back to a local empty cart so browsing/UI still works.
          // The cart will sync the first time the user adds an item.
          set({ cart: demoEmptyCart(userId), isInitialized: true, isLoading: false });
        }
      },

      // Add item to cart
      addItem: async (userId: string, itemData: Omit<CartItem, 'subtotal'>) => {
        if (!userId) {
          toast.error('Please sign in to add items to cart');
          return;
        }

        const item: CartItem = {
          ...itemData,
          subtotal: (itemData.price ?? 0) * (itemData.quantity ?? 0),
        };

        if (DEMO_MODE) {
          const cart = get().cart ?? demoEmptyCart(userId);
          const idx = cart.items.findIndex(i => i.productId === item.productId && i.variantId === item.variantId);
          const items = idx >= 0
            ? cart.items.map((i, k) => k === idx ? { ...i, quantity: i.quantity + item.quantity, subtotal: (i.quantity + item.quantity) * i.price } : i)
            : [...cart.items, item];
          set({ cart: recalcDemoCart({ ...cart, items }) });
          toast.success(`${item.name} added to cart`);
          return;
        }

        set({ isLoading: true });

        try {
          await CartService.addItem(userId, item);

          // Refresh cart from Firebase
          const updatedCart = await CartService.get(userId);
          set({ cart: updatedCart ? normalizeCart(updatedCart, userId) : demoEmptyCart(userId), isLoading: false });

          toast.success(`${item.name} added to cart`);
        } catch (error) {
          console.error('Failed to add item to cart:', error);
          toast.error('Failed to add item to cart');
          set({ isLoading: false });
        }
      },

      // Update item quantity
      updateQuantity: async (userId: string, productId: string, variantId: string | null, quantity: number) => {
        if (!userId) return;

        if (DEMO_MODE) {
          const cart = get().cart ?? demoEmptyCart(userId);
          const items = quantity <= 0
            ? cart.items.filter(i => !(i.productId === productId && i.variantId === variantId))
            : cart.items.map(i => i.productId === productId && i.variantId === variantId ? { ...i, quantity, subtotal: quantity * i.price } : i);
          set({ cart: recalcDemoCart({ ...cart, items }) });
          if (quantity === 0) toast.success('Item removed from cart');
          return;
        }

        set({ isLoading: true });

        try {
          await CartService.updateItemQuantity(userId, productId, variantId, quantity);

          // Refresh cart from Firebase
          const updatedCart = await CartService.get(userId);
          set({ cart: updatedCart ? normalizeCart(updatedCart, userId) : demoEmptyCart(userId), isLoading: false });

          if (quantity === 0) {
            toast.success('Item removed from cart');
          }
        } catch (error) {
          console.error('Failed to update quantity:', error);
          toast.error('Failed to update quantity');
          set({ isLoading: false });
        }
      },

      // Remove item from cart
      removeItem: async (userId: string, productId: string, variantId: string | null) => {
        if (!userId) return;

        if (DEMO_MODE) {
          const cart = get().cart ?? demoEmptyCart(userId);
          const items = cart.items.filter(i => !(i.productId === productId && i.variantId === variantId));
          set({ cart: recalcDemoCart({ ...cart, items }) });
          toast.success('Item removed from cart');
          return;
        }

        set({ isLoading: true });

        try {
          await CartService.removeItem(userId, productId, variantId);

          // Refresh cart from Firebase
          const updatedCart = await CartService.get(userId);
          set({ cart: updatedCart ? normalizeCart(updatedCart, userId) : demoEmptyCart(userId), isLoading: false });

          toast.success('Item removed from cart');
        } catch (error) {
          console.error('Failed to remove item:', error);
          toast.error('Failed to remove item');
          set({ isLoading: false });
        }
      },

      removeLocalItem: (productId: string, variantId: string | null) => {
        const cart = get().cart;
        if (!cart) return;
        const items = cart.items.filter(item => !(item.productId === productId && item.variantId === variantId));
        set({ cart: recalcDemoCart({ ...cart, items }) });
      },

      // Clear entire cart
      clearCart: async (userId: string) => {
        if (!userId) return;

        if (DEMO_MODE) {
          set({ cart: demoEmptyCart(userId) });
          toast.success('Cart cleared');
          return;
        }

        set({ isLoading: true });

        try {
          await CartService.clear(userId);

          // Refresh cart from Firebase
          const updatedCart = await CartService.get(userId);
          set({ cart: updatedCart ? normalizeCart(updatedCart, userId) : demoEmptyCart(userId), isLoading: false });

          toast.success('Cart cleared');
        } catch (error) {
          console.error('Failed to clear cart:', error);
          toast.error('Failed to clear cart');
          set({ isLoading: false });
        }
      },

      // Refresh cart from Firebase
      refreshCart: async (userId: string) => {
        if (!userId) return;
        if (DEMO_MODE) return;

        try {
          const cart = await CartService.get(userId);
          set({ cart: cart ? normalizeCart(cart, userId) : demoEmptyCart(userId) });
        } catch (error) {
          console.error('Failed to refresh cart:', error);
        }
      },

      // Get number of unique items
      getItemCount: () => {
        return get().cart?.items.length || 0;
      },

      // Get total number of items (including quantities)
      getTotalItems: () => {
        return get().cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
      },

      // Check if product is in cart
      hasItem: (productId: string, variantId: string | null = null) => {
        const cart = get().cart;
        if (!cart) return false;

        return cart.items.some(
          item => item.productId === productId && item.variantId === variantId
        );
      },

      // Get specific item from cart
      getItem: (productId: string, variantId: string | null = null) => {
        const cart = get().cart;
        if (!cart) return undefined;

        return cart.items.find(
          item => item.productId === productId && item.variantId === variantId
        );
      },
    }),
    {
      name: 'cofkans-cart-storage',
      storage: createJSONStorage(() => getBrowserStorage() ?? {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }),
      partialize: (state) => ({
        // Only persist cart data, not loading states
        cart: state.cart,
      }),
    }
  )
);
