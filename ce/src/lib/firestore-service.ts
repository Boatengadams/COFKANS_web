import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  QueryConstraint,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  FirestoreUser,
  FirestoreProduct,
  FirestoreCart,
  FirestoreOrder,
  FirestoreReview,
  FirestoreDelivery,
  FirestoreServiceRequest,
  FirestoreNotification,
  FirestoreCategory,
  CartItem,
  OrderItem,
  Address,
} from './firestore-schema';
import {
  cartItemSchema,
  reviewSchema,
  addressSchema,
  profileUpdateSchema,
  sanitizeString,
  safeParse,
} from './validators';

// ===== OWASP HARDENING HELPERS =====

/**
 * Whitelist-only field picker. Prevents mass-assignment attacks where a
 * caller passes extra fields (e.g. `role: 'admin'`, `isBanned: false`) and
 * relies on a partial update propagating them. Always pick instead of spread.
 */
function pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

/**
 * Throws a generic error so callers' toasts never leak Firestore codes,
 * rule structure, or document paths to the UI. Original error is logged
 * for server-side diagnostics only.
 */
function rethrowGeneric(scope: string, err: unknown): never {
  console.error(`[firestore:${scope}]`, err);
  throw new Error('Request could not be completed. Please try again.');
}

/** Reject sentinels / objects in places that should only hold scalars. */
function assertScalar(value: unknown, field: string): void {
  if (value && typeof value === 'object') {
    throw new Error(`Invalid value for ${field}`);
  }
}

const MUTABLE_USER_FIELDS = [
  'displayName',
  'phoneNumber',
  'photoURL',
  'preferences',
  'defaultAddressId',
  'addresses',
  'lastLogin',
] as const;

const ALLOWED_WAREHOUSES = new Set(['accra', 'kumasi', 'takoradi']);
const ALLOWED_ORDER_STATUSES = new Set([
  'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded',
]);
const ALLOWED_PAYMENT_STATUSES = new Set([
  'pending', 'paid', 'failed', 'refunded', 'partial',
]);

// ===== COLLECTION REFERENCES =====
const COLLECTIONS = {
  users: 'users',
  products: 'products',
  carts: 'carts',
  orders: 'orders',
  reviews: 'reviews',
  deliveries: 'deliveries',
  serviceRequests: 'serviceRequests',
  notifications: 'notifications',
  categories: 'categories',
  analytics: 'analytics',
} as const;

// ===== USER SERVICES =====
export const UserService = {
  async create(userId: string, userData: Partial<FirestoreUser>): Promise<void> {
    const userRef = doc(db, COLLECTIONS.users, userId);
    const email = userData.email?.trim() || '';
    const phoneNumber = userData.phoneNumber || null;
    const displayName =
      userData.displayName?.trim() ||
      email.split('@')[0] ||
      phoneNumber ||
      'Customer';
    const defaultUser: FirestoreUser = {
      uid: userId,
      email,
      displayName,
      phoneNumber,
      photoURL: userData.photoURL || null,
      role: userData.role || 'customer',
      provider: userData.provider || 'email',
      emailVerified: userData.emailVerified || false,
      phoneVerified: false,
      createdAt: serverTimestamp() as Timestamp,
      lastLogin: serverTimestamp() as Timestamp,
      addresses: [],
      defaultAddressId: null,
      preferences: {
        newsletter: true,
        smsNotifications: true,
        emailNotifications: true,
        currency: 'GHS',
        language: 'en',
      },
      stats: {
        totalOrders: 0,
        totalSpent: 0,
        lifetimeValue: 0,
      },
      twoFactorEnabled: false,
      lastPasswordChange: null,
      isActive: true,
      isBanned: false,
      banReason: null,
    };

    await setDoc(userRef, { ...defaultUser, ...userData, email, displayName, phoneNumber });
  },

  async get(userId: string): Promise<FirestoreUser | null> {
    const userRef = doc(db, COLLECTIONS.users, userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? (userSnap.data() as FirestoreUser) : null;
  },

  async update(userId: string, updates: Partial<FirestoreUser>): Promise<void> {
    // Whitelist mutable fields — prevents mass-assignment of role,
    // isDeveloper, isBanned, email, stats, etc. (defense in depth;
    // Firestore rules also reject these).
    const safe = pick(updates, MUTABLE_USER_FIELDS);

    if ('displayName' in safe || 'phoneNumber' in safe || 'photoURL' in safe) {
      const profileParsed = safeParse(profileUpdateSchema.partial(), {
        displayName: safe.displayName,
        phone: safe.phoneNumber ?? undefined,
        photoURL: safe.photoURL ?? undefined,
      });
      if (!profileParsed.ok) throw new Error(profileParsed.error);
      if (profileParsed.data.displayName !== undefined) safe.displayName = profileParsed.data.displayName;
      if (profileParsed.data.phone !== undefined) safe.phoneNumber = profileParsed.data.phone;
      if (profileParsed.data.photoURL !== undefined) safe.photoURL = profileParsed.data.photoURL;
    }

    try {
      await updateDoc(doc(db, COLLECTIONS.users, userId), safe as any);
    } catch (err) { rethrowGeneric('user.update', err); }
  },

  async updateLastLogin(userId: string): Promise<void> {
    await this.update(userId, { lastLogin: serverTimestamp() as Timestamp });
  },

  async addAddress(userId: string, address: Address): Promise<void> {
    const parsed = safeParse(addressSchema, address);
    if (!parsed.ok) throw new Error(parsed.error);
    const safeAddress: Address = {
      ...address,
      ...parsed.data,
      id: sanitizeString(address.id ?? '', 64) || crypto.randomUUID(),
    } as Address;
    try {
      await updateDoc(doc(db, COLLECTIONS.users, userId), {
        addresses: arrayUnion(safeAddress),
      });
    } catch (err) { rethrowGeneric('user.addAddress', err); }
  },

  async removeAddress(userId: string, addressId: string): Promise<void> {
    const user = await this.get(userId);
    if (!user) return;

    const updatedAddresses = user.addresses.filter(addr => addr.id !== addressId);
    await this.update(userId, { addresses: updatedAddresses });
  },

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    await this.update(userId, { defaultAddressId: addressId });
  },
};

// ===== PRODUCT SERVICES =====
export const ProductService = {
  async getAll(options?: {
    category?: string;
    subcategory?: string;
    featured?: boolean;
    onSale?: boolean;
    limit?: number;
  }): Promise<FirestoreProduct[]> {
    const constraints: QueryConstraint[] = [where('status', '==', 'active')];

    if (options?.category) {
      constraints.push(where('categoryId', '==', options.category));
    }
    if (options?.subcategory) {
      constraints.push(where('subcategory', '==', options.subcategory));
    }
    if (options?.featured) {
      constraints.push(where('isFeatured', '==', true));
    }
    if (options?.onSale) {
      constraints.push(where('isOnSale', '==', true));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    if (options?.limit) {
      constraints.push(limit(options.limit));
    }

    const q = query(collection(db, COLLECTIONS.products), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreProduct));
  },

  async getById(productId: string): Promise<FirestoreProduct | null> {
    const productRef = doc(db, COLLECTIONS.products, productId);
    const productSnap = await getDoc(productRef);
    return productSnap.exists() ? (productSnap.data() as FirestoreProduct) : null;
  },

  async search(searchTerm: string): Promise<FirestoreProduct[]> {
    // Length-cap + strip control chars to neutralize ReDoS / log-injection.
    const term = sanitizeString(searchTerm, 100).toLowerCase();
    if (!term) return [];
    const q = query(
      collection(db, COLLECTIONS.products),
      where('status', '==', 'active'),
      orderBy('name'),
      limit(200),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as FirestoreProduct))
      .filter(product =>
        product.name?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term)
      );
  },

  async incrementViewCount(productId: string): Promise<void> {
    const productRef = doc(db, COLLECTIONS.products, productId);
    await updateDoc(productRef, {
      viewCount: increment(1),
    });
  },

  async updateStock(productId: string, quantity: number, warehouse?: 'accra' | 'kumasi' | 'takoradi'): Promise<void> {
    if (!Number.isInteger(quantity) || Math.abs(quantity) > 100_000) {
      throw new Error('Invalid stock change');
    }
    if (warehouse && !ALLOWED_WAREHOUSES.has(warehouse)) {
      throw new Error('Invalid warehouse');
    }
    const productRef = doc(db, COLLECTIONS.products, productId);
    try {
      if (warehouse) {
        await updateDoc(productRef, {
          [`warehouseStock.${warehouse}`]: increment(quantity),
          totalStock: increment(quantity),
        });
      } else {
        await updateDoc(productRef, { totalStock: increment(quantity) });
      }
    } catch (err) { rethrowGeneric('product.updateStock', err); }
  },

  async create(product: Omit<FirestoreProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const productRef = doc(collection(db, COLLECTIONS.products));
    const newProduct = {
      ...product,
      id: productRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(productRef, newProduct);
    return productRef.id;
  },

  async update(productId: string, updates: Partial<FirestoreProduct>): Promise<void> {
    const productRef = doc(db, COLLECTIONS.products, productId);
    await updateDoc(productRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    } as any);
  },
};

// ===== CART SERVICES =====
export const CartService = {
  async get(userId: string): Promise<FirestoreCart | null> {
    const cartRef = doc(db, COLLECTIONS.carts, userId);
    const cartSnap = await getDoc(cartRef);
    return cartSnap.exists() ? (cartSnap.data() as FirestoreCart) : null;
  },

  async create(userId: string): Promise<FirestoreCart> {
    const cartRef = doc(db, COLLECTIONS.carts, userId);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    const newCart: FirestoreCart = {
      userId,
      items: [],
      subtotal: 0,
      taxAmount: 0,
      shippingAmount: 0,
      discountAmount: 0,
      total: 0,
      appliedCoupons: [],
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      expiresAt: Timestamp.fromDate(expiresAt),
    };

    await setDoc(cartRef, newCart);
    return newCart;
  },

  async addItem(userId: string, item: CartItem): Promise<void> {
    const parsed = safeParse(cartItemSchema, item);
    if (!parsed.ok) throw new Error(parsed.error);
    const safeItem: CartItem = {
      ...item,
      ...parsed.data,
      subtotal: Number((parsed.data.price * parsed.data.quantity).toFixed(2)),
    } as CartItem;

    let cart = await this.get(userId);
    if (!cart) cart = await this.create(userId);

    // OWASP A04: hard cap on cart size to prevent resource-exhaustion writes.
    const MAX_CART_ITEMS = 100;

    const existingItemIndex = cart.items.findIndex(
      i => i.productId === safeItem.productId && i.variantId === safeItem.variantId
    );

    if (existingItemIndex >= 0) {
      const next = cart.items[existingItemIndex].quantity + safeItem.quantity;
      cart.items[existingItemIndex].quantity = Math.min(next, 99);
      cart.items[existingItemIndex].subtotal = Number(
        (cart.items[existingItemIndex].price * cart.items[existingItemIndex].quantity).toFixed(2)
      );
    } else {
      if (cart.items.length >= MAX_CART_ITEMS) {
        throw new Error('Cart is full. Remove an item to add another.');
      }
      cart.items.push(safeItem);
    }

    await this.recalculateCart(userId, cart.items);
  },

  async updateItemQuantity(userId: string, productId: string, variantId: string | null, quantity: number): Promise<void> {
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) {
      throw new Error('Invalid quantity');
    }
    const cart = await this.get(userId);
    if (!cart) return;

    const itemIndex = cart.items.findIndex(
      i => i.productId === productId && i.variantId === variantId
    );

    if (itemIndex >= 0) {
      if (quantity === 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].subtotal = Number(
          (cart.items[itemIndex].price * quantity).toFixed(2)
        );
      }

      await this.recalculateCart(userId, cart.items);
    }
  },

  async removeItem(userId: string, productId: string, variantId: string | null): Promise<void> {
    const cart = await this.get(userId);
    if (!cart) return;

    cart.items = cart.items.filter(
      i => !(i.productId === productId && i.variantId === variantId)
    );

    await this.recalculateCart(userId, cart.items);
  },

  async clear(userId: string): Promise<void> {
    const cartRef = doc(db, COLLECTIONS.carts, userId);
    await updateDoc(cartRef, {
      items: [],
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      updatedAt: serverTimestamp(),
    });
  },

  async recalculateCart(userId: string, items: CartItem[]): Promise<void> {
    const cartRef = doc(db, COLLECTIONS.carts, userId);

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const taxRate = 0.125; // 12.5% VAT in Ghana
    const taxAmount = subtotal * taxRate;

    // Shipping calculation (simplified)
    const shippingAmount = subtotal >= 500 ? 0 : 50; // Free shipping over GHS 500

    const total = subtotal + taxAmount + shippingAmount;

    await updateDoc(cartRef, {
      items,
      subtotal,
      taxAmount,
      shippingAmount,
      total,
      updatedAt: serverTimestamp(),
    });
  },
};

// ===== ORDER SERVICES =====
export const OrderService = {
  async create(orderData: Omit<FirestoreOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Promise<string> {
    // OWASP A04 (Insecure Design) + A08 (Data Integrity):
    // Validate every item, clamp totals, sanitize address text before persist.
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }
    if (orderData.items.length > 100) throw new Error('Too many items in order');

    const validatedItems = orderData.items.map((it) => {
      const parsed = safeParse(cartItemSchema.partial({ stockLevel: true, isAvailable: true }), it);
      if (!parsed.ok) throw new Error(`Invalid order item: ${parsed.error}`);
      return { ...it, ...parsed.data };
    });

    const recalculatedSubtotal = validatedItems.reduce(
      (sum, it: any) => sum + (it.price ?? 0) * (it.quantity ?? 0), 0
    );
    if (!Number.isFinite(orderData.total) || orderData.total < 0 || orderData.total > 10_000_000) {
      throw new Error('Invalid order total');
    }
    // Server-side re-derivation: never trust client-computed totals.
    // Allow ±2% drift for tax/shipping rounding.
    if (Math.abs(recalculatedSubtotal - (orderData.subtotal ?? recalculatedSubtotal)) / Math.max(recalculatedSubtotal, 1) > 0.02) {
      throw new Error('Order totals do not match item prices');
    }

    let safeShipping = orderData.shippingAddress;
    if (safeShipping) {
      const sParsed = safeParse(addressSchema, safeShipping);
      if (!sParsed.ok) throw new Error(`Shipping address: ${sParsed.error}`);
      safeShipping = { ...safeShipping, ...sParsed.data } as typeof safeShipping;
    }

    assertScalar(orderData.userId, 'userId');
    if (typeof orderData.userId !== 'string' || orderData.userId.length === 0) {
      throw new Error('Invalid user');
    }

    const orderRef = doc(collection(db, COLLECTIONS.orders));
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const newOrder: FirestoreOrder = {
      ...orderData,
      items: validatedItems as typeof orderData.items,
      shippingAddress: safeShipping,
      id: orderRef.id,
      orderNumber,
      statusHistory: [
        {
          status: 'pending',
          timestamp: serverTimestamp() as Timestamp,
          note: 'Order created',
          updatedBy: orderData.userId,
        },
      ],
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    try {
      await setDoc(orderRef, newOrder);
      await updateDoc(doc(db, COLLECTIONS.users, orderData.userId), {
        'stats.totalOrders': increment(1),
        'stats.totalSpent': increment(orderData.total),
      });
    } catch (err) { rethrowGeneric('order.create', err); }

    return orderRef.id;
  },

  async getById(orderId: string): Promise<FirestoreOrder | null> {
    const orderRef = doc(db, COLLECTIONS.orders, orderId);
    const orderSnap = await getDoc(orderRef);
    return orderSnap.exists() ? (orderSnap.data() as FirestoreOrder) : null;
  },

  async getUserOrders(userId: string, limitCount: number = 20): Promise<FirestoreOrder[]> {
    const q = query(
      collection(db, COLLECTIONS.orders),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as FirestoreOrder);
  },

  async updateStatus(
    orderId: string,
    status: FirestoreOrder['status'],
    updatedBy: string,
    note?: string
  ): Promise<void> {
    if (!ALLOWED_ORDER_STATUSES.has(status)) throw new Error('Invalid order status');
    const safeNote = sanitizeString(note ?? `Order ${status}`, 500);
    const orderRef = doc(db, COLLECTIONS.orders, orderId);

    await updateDoc(orderRef, {
      status,
      statusHistory: arrayUnion({
        status,
        timestamp: serverTimestamp(),
        note: safeNote,
        updatedBy,
      }),
      updatedAt: serverTimestamp(),
    });

    if (status === 'delivered') {
      await updateDoc(orderRef, {
        deliveredAt: serverTimestamp(),
      });
    } else if (status === 'cancelled') {
      await updateDoc(orderRef, {
        cancelledAt: serverTimestamp(),
      });
    }
  },

  async updatePaymentStatus(orderId: string, paymentStatus: FirestoreOrder['paymentStatus'], transactionId?: string): Promise<void> {
    if (!ALLOWED_PAYMENT_STATUSES.has(paymentStatus)) throw new Error('Invalid payment status');
    const orderRef = doc(db, COLLECTIONS.orders, orderId);
    const updates: any = {
      paymentStatus,
      updatedAt: serverTimestamp(),
    };

    if (paymentStatus === 'paid') {
      updates.paidAt = serverTimestamp();
    }

    if (transactionId) {
      // Transaction IDs from gateways: alphanumeric+dash, capped length.
      if (!/^[A-Za-z0-9_\-]{1,128}$/.test(transactionId)) {
        throw new Error('Invalid transaction id');
      }
      updates.transactionId = transactionId;
    }

    try {
      await updateDoc(orderRef, updates);
    } catch (err) { rethrowGeneric('order.updatePaymentStatus', err); }
  },
};

// ===== REVIEW SERVICES =====
export const ReviewService = {
  async create(reviewData: Omit<FirestoreReview, 'id' | 'createdAt' | 'updatedAt' | 'helpfulCount' | 'notHelpfulCount' | 'status'>): Promise<string> {
    const parsed = safeParse(reviewSchema, {
      productId: reviewData.productId,
      rating: reviewData.rating,
      comment: (reviewData as any).comment ?? '',
      title: (reviewData as any).title ?? '',
    });
    if (!parsed.ok) throw new Error(parsed.error);

    const reviewRef = doc(collection(db, COLLECTIONS.reviews));

    const newReview: FirestoreReview = {
      ...reviewData,
      productId: parsed.data.productId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      title: parsed.data.title,
      id: reviewRef.id,
      helpfulCount: 0,
      notHelpfulCount: 0,
      // Always start unapproved — prevents review-bombing / SEO injection.
      status: 'pending',
      moderatedBy: null,
      moderatedAt: null,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    } as FirestoreReview;

    try {
      await setDoc(reviewRef, newReview);
      const productRef = doc(db, COLLECTIONS.products, parsed.data.productId);
      await updateDoc(productRef, { reviewCount: increment(1) });
    } catch (err) { rethrowGeneric('review.create', err); }

    return reviewRef.id;
  },

  async getProductReviews(productId: string): Promise<FirestoreReview[]> {
    const q = query(
      collection(db, COLLECTIONS.reviews),
      where('productId', '==', productId),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as FirestoreReview);
  },

  async approve(reviewId: string, moderatorId: string): Promise<void> {
    const reviewRef = doc(db, COLLECTIONS.reviews, reviewId);
    await updateDoc(reviewRef, {
      status: 'approved',
      moderatedBy: moderatorId,
      moderatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },
};

// ===== NOTIFICATION SERVICES =====
export const NotificationService = {
  async create(notification: Omit<FirestoreNotification, 'id' | 'createdAt' | 'isRead' | 'readAt'>): Promise<string> {
    const safe: any = {
      ...notification,
      title: sanitizeString((notification as any).title ?? '', 120),
      message: sanitizeString((notification as any).message ?? '', 1000),
    };
    if (!safe.title) throw new Error('Notification title is required');

    const notifRef = doc(collection(db, COLLECTIONS.notifications));
    const newNotification: FirestoreNotification = {
      ...safe,
      id: notifRef.id,
      isRead: false,
      readAt: null,
      createdAt: serverTimestamp() as Timestamp,
    };
    try {
      await setDoc(notifRef, newNotification);
    } catch (err) { rethrowGeneric('notification.create', err); }
    return notifRef.id;
  },

  async getUserNotifications(userId: string, limitCount: number = 50): Promise<FirestoreNotification[]> {
    const q = query(
      collection(db, COLLECTIONS.notifications),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as FirestoreNotification);
  },

  async markAsRead(notificationId: string): Promise<void> {
    const notifRef = doc(db, COLLECTIONS.notifications, notificationId);
    await updateDoc(notifRef, {
      isRead: true,
      readAt: serverTimestamp(),
    });
  },

  async markAllAsRead(userId: string): Promise<void> {
    const q = query(
      collection(db, COLLECTIONS.notifications),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        isRead: true,
        readAt: serverTimestamp(),
      });
    });

    await batch.commit();
  },
};

// Demo-mode override: replace every service method with a safe no-op so the UI
// renders without ever calling Firestore. Flip DEMO_MODE = false in
// /src/lib/demo-mode.ts to restore real behavior.
import { DEMO_MODE } from './demo-mode';
if (DEMO_MODE) {
  const safeDefault = (m: string): unknown => {
    const n = m.toLowerCase();
    if (n.startsWith('list') || n.startsWith('search') || n.startsWith('getall') || n.startsWith('getby') || n.endsWith('s')) return [];
    if (n.startsWith('count')) return 0;
    if (n.startsWith('has') || n.startsWith('is')) return false;
    return null;
  };
  const stub = (svc: Record<string, unknown>, name: string) => {
    for (const key of Object.keys(svc)) {
      if (typeof svc[key] === 'function') {
        svc[key] = async (...args: unknown[]) => {
          // eslint-disable-next-line no-console
          console.debug(`[demo] ${name}.${key}(`, ...args, ')');
          return safeDefault(key);
        };
      }
    }
  };
  stub(UserService as unknown as Record<string, unknown>, 'UserService');
  stub(ProductService as unknown as Record<string, unknown>, 'ProductService');
  stub(CartService as unknown as Record<string, unknown>, 'CartService');
  stub(OrderService as unknown as Record<string, unknown>, 'OrderService');
  stub(ReviewService as unknown as Record<string, unknown>, 'ReviewService');
  stub(NotificationService as unknown as Record<string, unknown>, 'NotificationService');
}

export default {
  UserService,
  ProductService,
  CartService,
  OrderService,
  ReviewService,
  NotificationService,
};
