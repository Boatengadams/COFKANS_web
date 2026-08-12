/**
 * Firestore Database Schema
 *
 * Collections:
 * - users: User accounts and profiles
 * - products: Product catalog
 * - orders: Customer orders
 * - carts: Shopping carts (per user)
 * - reviews: Product reviews
 * - categories: Product categories
 * - inventory: Stock levels per warehouse
 * - deliveries: Delivery tracking
 * - serviceRequests: Service/installation requests
 * - notifications: User notifications
 * - analytics: Business analytics data
 */

import { Timestamp } from 'firebase/firestore';
import type { UserRole } from '../app/types';

// ===== USER SCHEMA =====
export interface FirestoreUser {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string | null;
  photoURL: string | null;
  role: UserRole;
  provider: 'google' | 'apple' | 'email' | 'phone' | 'microsoft';
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Timestamp;
  lastLogin: Timestamp;

  // Profile
  addresses: Address[];
  defaultAddressId: string | null;

  // Preferences
  preferences: {
    newsletter: boolean;
    smsNotifications: boolean;
    emailNotifications: boolean;
    currency: 'GHS' | 'USD';
    language: 'en';
  };

  // Stats
  stats: {
    totalOrders: number;
    totalSpent: number;
    lifetimeValue: number;
  };

  // Security
  twoFactorEnabled: boolean;
  lastPasswordChange: Timestamp | null;
  isDeveloper?: boolean; // Super admin flag (highest privilege level)
  promotedBy?: string; // Admin who promoted this user
  promotedAt?: Timestamp; // When user was promoted
  demotedBy?: string; // Admin who demoted this user
  demotedAt?: Timestamp; // When user was demoted

  // Status
  isActive: boolean;
  isBanned: boolean;
  banReason: string | null;
  isLocked?: boolean; // Account locked due to failed login attempts
  mustChangePassword?: boolean; // Worker created by admin must set their own password
  createdBy?: string; // UID of admin who created this account (worker accounts)
}

export interface Address {
  id: string;
  label: string; // "Home", "Office", etc.
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  region: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  deliveryInstructions: string;
}

// ===== PRODUCT SCHEMA =====
export interface FirestoreProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;

  // Categorization
  categoryId: string;
  categoryName: string;
  subcategory: string;
  tags: string[];

  // Pricing
  price: number;
  tradePrice: number | null;
  costPrice: number;
  currency: 'GHS';
  compareAtPrice: number | null; // Original price for discounts

  // Media
  images: ProductImage[];
  videos: string[];

  // Variants (for products with options)
  hasVariants: boolean;
  variants: ProductVariant[];

  // Specifications
  specs: Record<string, string>;
  technicalSpecs: string[];

  // Inventory
  trackInventory: boolean;
  totalStock: number;
  warehouseStock: {
    accra: number;
    kumasi: number;
    takoradi: number;
  };
  lowStockThreshold: number;

  // Status
  status: 'active' | 'draft' | 'archived' | 'outOfStock';
  isAvailable: boolean;
  isFeatured: boolean;
  isOnSale: boolean;

  // Ratings & Reviews
  rating: number;
  reviewCount: number;

  // SEO
  metaTitle: string;
  metaDescription: string;
  keywords: string[];

  // Badges
  badges: string[]; // "New", "Premium", "Sale", etc.

  // Shipping
  weight: number; // kg
  dimensions: {
    length: number;
    width: number;
    height: number;
  };

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt: Timestamp | null;

  // Analytics
  viewCount: number;
  purchaseCount: number;
  cartAddCount: number;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, string>; // e.g., { "color": "Gold", "size": "Large" }
  image: string | null;
}

// ===== CART SCHEMA =====
export interface FirestoreCart {
  userId: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;

  // Applied promotions
  appliedCoupons: string[];

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp; // Auto-delete after 30 days
}

export interface CartItem {
  productId: string;
  variantId: string | null;
  sku: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;

  // Customization (if applicable)
  customization: Record<string, any> | null;

  // Stock validation
  isAvailable: boolean;
  stockLevel: number;
}

// ===== ORDER SCHEMA =====
export interface FirestoreOrder {
  id: string;
  orderNumber: string; // e.g., "ORD-2025-001234"

  // Customer
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  // Items
  items: OrderItem[];

  // Pricing
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
  currency: 'GHS';

  // Payment
  paymentMethod: 'card' | 'momo' | 'vodafone' | 'airteltigo' | 'paypal' | 'bank_transfer';
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  paymentProvider: 'flutterwave' | 'paystack' | 'stripe';
  transactionId: string | null;
  transactionReference: string;
  paidAt: Timestamp | null;

  // Shipping
  shippingAddress: Address;
  billingAddress: Address;
  deliveryMethod: 'standard' | 'express' | 'same-day' | 'pickup';
  estimatedDelivery: Timestamp;
  trackingNumber: string | null;

  // Status
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  statusHistory: OrderStatusHistory[];

  // Fulfillment
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled';
  assignedWarehouse: 'accra' | 'kumasi' | 'takoradi' | null;

  // Delivery (if applicable)
  deliveryId: string | null;
  driverId: string | null;
  driverName: string | null;

  // Notes
  customerNotes: string;
  internalNotes: string;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  cancelledAt: Timestamp | null;
  deliveredAt: Timestamp | null;

  // Metadata
  source: 'web' | 'mobile' | 'admin' | 'api';
  userAgent: string;
  ipAddress: string;
}

export interface OrderItem {
  productId: string;
  variantId: string | null;
  sku: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
  taxAmount: number;

  // Snapshot of product at time of order
  productSnapshot: {
    description: string;
    specs: Record<string, string>;
  };
}

export interface OrderStatusHistory {
  status: FirestoreOrder['status'];
  timestamp: Timestamp;
  note: string;
  updatedBy: string; // userId or "system"
}

// ===== REVIEW SCHEMA =====
export interface FirestoreReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;

  // Review content
  rating: number; // 1-5
  title: string;
  content: string;
  images: string[];

  // Verification
  isVerifiedPurchase: boolean;
  orderId: string | null;

  // Helpful votes
  helpfulCount: number;
  notHelpfulCount: number;

  // Moderation
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderatedBy: string | null;
  moderatedAt: Timestamp | null;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===== DELIVERY SCHEMA =====
export interface FirestoreDelivery {
  id: string;
  orderId: string;
  orderNumber: string;

  // Customer
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: Address;

  // Driver
  driverId: string | null;
  driverName: string | null;
  driverPhone: string | null;
  driverVehicle: string | null;

  // Delivery details
  zone: string;
  deliveryMethod: 'standard' | 'express' | 'same-day';
  scheduledDate: Timestamp;
  estimatedTime: string; // "2-4 PM"

  // Status
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'cancelled';
  statusHistory: DeliveryStatusHistory[];

  // Tracking
  currentLocation: GeoPoint | null;
  routePoints: GeoPoint[];

  // Proof of delivery
  proofOfDelivery: {
    signature: string | null;
    photo: string | null;
    recipientName: string | null;
    notes: string;
    deliveredAt: Timestamp | null;
  } | null;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  pickedUpAt: Timestamp | null;
  deliveredAt: Timestamp | null;

  // Performance
  onTimeDelivery: boolean;
  deliveryDuration: number | null; // minutes
  customerRating: number | null;
  customerFeedback: string | null;
}

export interface DeliveryStatusHistory {
  status: FirestoreDelivery['status'];
  timestamp: Timestamp;
  location: GeoPoint | null;
  note: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// ===== SERVICE REQUEST SCHEMA =====
export interface FirestoreServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  // Request details
  serviceType: 'installation' | 'repair' | 'consultation' | 'maintenance';
  productId: string | null;
  productName: string | null;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Location
  location: string;
  address: Address;

  // Assignment
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  assignedTechnicianId: string | null;
  assignedTechnicianName: string | null;

  // Scheduling
  scheduledDate: Timestamp | null;
  completedDate: Timestamp | null;

  // Notes
  customerNotes: string;
  technicianNotes: string;
  internalNotes: string;

  // Attachments
  images: string[];
  beforePhotos: string[];
  afterPhotos: string[];

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===== NOTIFICATION SCHEMA =====
export interface FirestoreNotification {
  id: string;
  userId: string;

  // Content
  type: 'order' | 'delivery' | 'payment' | 'promotion' | 'system';
  title: string;
  message: string;
  actionUrl: string | null;

  // Status
  isRead: boolean;
  readAt: Timestamp | null;

  // Delivery channels
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };

  // Timestamps
  createdAt: Timestamp;
  expiresAt: Timestamp | null;
}

// ===== CATEGORY SCHEMA =====
export interface FirestoreCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  image: string;
  icon: string;

  // SEO
  metaTitle: string;
  metaDescription: string;

  // Display
  order: number;
  isActive: boolean;
  isFeatured: boolean;

  // Stats
  productCount: number;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===== ANALYTICS SCHEMA =====
export interface FirestoreAnalytics {
  id: string; // Format: "daily-2025-05-17" or "monthly-2025-05"
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: string; // ISO date string

  // Sales metrics
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;

  // Product metrics
  topProducts: {
    productId: string;
    productName: string;
    revenue: number;
    unitsSold: number;
  }[];

  // Customer metrics
  newCustomers: number;
  returningCustomers: number;

  // Traffic
  pageViews: number;
  uniqueVisitors: number;

  // Conversion
  conversionRate: number;
  cartAbandonmentRate: number;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
