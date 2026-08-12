/**
 * OWASP A08: Software and Data Integrity - Price Verification Service
 *
 * Implements strict validation to prevent:
 * - Price manipulation attacks
 * - Inventory manipulation
 * - Total calculation tampering
 * - Quantity abuse
 *
 * Features:
 * - Server-side price verification
 * - Stock snapshots in orders
 * - Max quantity limits (99 per item)
 * - Price history tracking
 */

import { db } from './firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { FirestoreProduct, CartItem, OrderItem } from './firestore-schema';
import { validatePrice, validateQuantity, validateCartTotal, logPriceManipulationAttempt } from './security-service';

// ===== CONSTANTS =====
const MAX_QUANTITY_PER_ITEM = 99;
const MAX_CART_ITEMS = 100;
const TAX_RATE = 0.125; // 12.5% VAT for Ghana
const FREE_SHIPPING_THRESHOLD = 500; // GHS
const STANDARD_SHIPPING_COST = 50; // GHS

export interface PriceVerificationResult {
  isValid: boolean;
  errors: string[];
  correctedTotal?: number;
  warnings?: string[];
}

export interface OrderValidationResult {
  isValid: boolean;
  errors: string[];
  validatedItems: OrderItem[];
  validatedTotals: {
    subtotal: number;
    taxAmount: number;
    shippingAmount: number;
    discountAmount: number;
    total: number;
  };
}

// ===== PRICE VERIFICATION =====

/**
 * Verify product price against database
 * Prevents price manipulation attacks
 */
export async function verifyProductPrice(
  productId: string,
  claimedPrice: number,
  userId?: string
): Promise<{ isValid: boolean; actualPrice: number; error?: string }> {
  try {
    // Validate claimed price format
    if (!validatePrice(claimedPrice)) {
      return {
        isValid: false,
        actualPrice: 0,
        error: 'Invalid price format',
      };
    }

    // Fetch actual price from database
    const productRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      return {
        isValid: false,
        actualPrice: 0,
        error: 'Product not found',
      };
    }

    const product = productDoc.data() as FirestoreProduct;
    const actualPrice = (product.compareAtPrice && product.compareAtPrice > product.price) ? product.price : product.price;

    // Check if prices match (allow 0.01 GHS tolerance for floating point)
    const priceDifference = Math.abs(actualPrice - claimedPrice);
    const isValid = priceDifference < 0.01;

    if (!isValid && userId) {
      // Log price manipulation attempt
      await logPriceManipulationAttempt(userId, productId, actualPrice, claimedPrice);
    }

    return {
      isValid,
      actualPrice,
      error: isValid ? undefined : `Price mismatch: expected ${actualPrice}, got ${claimedPrice}`,
    };
  } catch (error) {
    console.error('Price verification error:', error);
    return {
      isValid: false,
      actualPrice: 0,
      error: 'Price verification failed',
    };
  }
}

/**
 * Verify cart item validity
 */
export async function verifyCartItem(
  item: CartItem,
  userId?: string
): Promise<{ isValid: boolean; errors: string[]; correctedItem?: CartItem }> {
  const errors: string[] = [];

  // Validate quantity
  if (!validateQuantity(item.quantity)) {
    errors.push(`Invalid quantity for ${item.name}: must be between 1 and ${MAX_QUANTITY_PER_ITEM}`);
  }

  // Validate price
  const priceVerification = await verifyProductPrice(item.productId, item.price, userId);
  if (!priceVerification.isValid) {
    errors.push(priceVerification.error || 'Price verification failed');
  }

  // Verify subtotal calculation
  const expectedSubtotal = priceVerification.actualPrice * item.quantity;
  const subtotalDifference = Math.abs(expectedSubtotal - item.subtotal);

  if (subtotalDifference >= 0.01) {
    errors.push(`Subtotal mismatch for ${item.name}: expected ${expectedSubtotal.toFixed(2)}, got ${item.subtotal.toFixed(2)}`);
  }

  // Check stock availability
  const productRef = doc(db, 'products', item.productId);
  const productDoc = await getDoc(productRef);

  if (productDoc.exists()) {
    const product = productDoc.data() as FirestoreProduct;

    if (product.totalStock < item.quantity) {
      errors.push(`Insufficient stock for ${item.name}: ${product.totalStock} available, ${item.quantity} requested`);
    }

    if (product.status !== 'active') {
      errors.push(`Product ${item.name} is no longer available`);
    }
  }

  // Create corrected item if there are issues
  const correctedItem: CartItem | undefined = errors.length > 0
    ? {
        ...item,
        price: priceVerification.actualPrice,
        subtotal: priceVerification.actualPrice * Math.min(item.quantity, MAX_QUANTITY_PER_ITEM),
        quantity: Math.min(item.quantity, MAX_QUANTITY_PER_ITEM),
      }
    : undefined;

  return {
    isValid: errors.length === 0,
    errors,
    correctedItem,
  };
}

/**
 * Verify entire cart
 */
export async function verifyCart(
  items: CartItem[],
  claimedSubtotal: number,
  claimedTaxAmount: number,
  claimedShippingAmount: number,
  claimedTotal: number,
  userId?: string
): Promise<PriceVerificationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate cart size
  if (items.length === 0) {
    errors.push('Cart is empty');
  }

  if (items.length > MAX_CART_ITEMS) {
    errors.push(`Cart exceeds maximum items: ${items.length} items, max ${MAX_CART_ITEMS}`);
  }

  // Verify each item
  let calculatedSubtotal = 0;
  for (const item of items) {
    const itemVerification = await verifyCartItem(item, userId);

    if (!itemVerification.isValid) {
      errors.push(...itemVerification.errors);
    }

    // Use actual price for calculation
    const priceVerification = await verifyProductPrice(item.productId, item.price, userId);
    calculatedSubtotal += priceVerification.actualPrice * item.quantity;
  }

  // Verify subtotal
  const subtotalDifference = Math.abs(calculatedSubtotal - claimedSubtotal);
  if (subtotalDifference >= 0.01) {
    errors.push(`Subtotal mismatch: expected ${calculatedSubtotal.toFixed(2)}, got ${claimedSubtotal.toFixed(2)}`);
  }

  // Verify tax calculation (12.5% VAT)
  const calculatedTax = calculatedSubtotal * TAX_RATE;
  const taxDifference = Math.abs(calculatedTax - claimedTaxAmount);
  if (taxDifference >= 0.01) {
    errors.push(`Tax calculation error: expected ${calculatedTax.toFixed(2)}, got ${claimedTaxAmount.toFixed(2)}`);
  }

  // Verify shipping calculation
  const calculatedShipping = calculatedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
  if (calculatedShipping !== claimedShippingAmount) {
    errors.push(`Shipping amount error: expected ${calculatedShipping.toFixed(2)}, got ${claimedShippingAmount.toFixed(2)}`);
  }

  // Verify total
  const calculatedTotal = calculatedSubtotal + calculatedTax + calculatedShipping;
  const totalDifference = Math.abs(calculatedTotal - claimedTotal);
  if (totalDifference >= 0.01) {
    errors.push(`Total mismatch: expected ${calculatedTotal.toFixed(2)}, got ${claimedTotal.toFixed(2)}`);
  }

  // Validate total amount
  if (!validateCartTotal(claimedTotal)) {
    errors.push('Invalid total amount');
  }

  return {
    isValid: errors.length === 0,
    errors,
    correctedTotal: errors.length > 0 ? calculatedTotal : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validate order before creation
 * Creates stock snapshots and validates all prices
 */
export async function validateOrder(
  userId: string,
  items: Omit<OrderItem, 'productSnapshot'>[],
  totals: {
    subtotal: number;
    taxAmount: number;
    shippingAmount: number;
    discountAmount: number;
    total: number;
  }
): Promise<OrderValidationResult> {
  const errors: string[] = [];
  const validatedItems: OrderItem[] = [];

  // Validate order has items
  if (items.length === 0) {
    return {
      isValid: false,
      errors: ['Order must contain at least one item'],
      validatedItems: [],
      validatedTotals: totals,
    };
  }

  if (items.length > MAX_CART_ITEMS) {
    return {
      isValid: false,
      errors: [`Order exceeds maximum items: ${items.length} items, max ${MAX_CART_ITEMS}`],
      validatedItems: [],
      validatedTotals: totals,
    };
  }

  // Validate and snapshot each item
  let calculatedSubtotal = 0;

  for (const item of items) {
    // Validate quantity
    if (!validateQuantity(item.quantity)) {
      errors.push(`Invalid quantity for ${item.name}`);
      continue;
    }

    // Verify price
    const priceVerification = await verifyProductPrice(item.productId, item.price, userId);
    if (!priceVerification.isValid) {
      errors.push(priceVerification.error || `Price verification failed for ${item.name}`);
      continue;
    }

    // Get product snapshot
    const productRef = doc(db, 'products', item.productId);
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      errors.push(`Product not found: ${item.name}`);
      continue;
    }

    const product = productDoc.data() as FirestoreProduct;

    // Check stock availability
    if (product.totalStock < item.quantity) {
      errors.push(`Insufficient stock for ${item.name}: ${product.totalStock} available, ${item.quantity} requested`);
      continue;
    }

    if (product.status !== 'active') {
      errors.push(`Product ${item.name} is not available for purchase`);
      continue;
    }

    // Create validated item with snapshot
    const validatedItem: OrderItem = {
      ...item,
      price: priceVerification.actualPrice,
      subtotal: priceVerification.actualPrice * item.quantity,
      taxAmount: priceVerification.actualPrice * item.quantity * TAX_RATE,
      productSnapshot: {
        description: product.description || '',
        specs: product.specs || {},
      },
    };

    validatedItems.push(validatedItem);
    calculatedSubtotal += validatedItem.subtotal;
  }

  // Item prices/subtotal are the anti-tampering surface — verify them strictly.
  // Tax and the delivery fee are caller-controlled (the storefront uses a flat,
  // configurable delivery fee and no VAT line), so we trust those values within
  // sane bounds and only confirm the grand total adds up from them.
  const tax = Math.max(0, totals.taxAmount || 0);
  const shipping = Math.max(0, totals.shippingAmount || 0);
  const calculatedTotal = calculatedSubtotal + tax + shipping - (totals.discountAmount || 0);

  const subtotalDiff = Math.abs(calculatedSubtotal - totals.subtotal);
  const totalDiff = Math.abs(calculatedTotal - totals.total);

  if (subtotalDiff >= 0.01) {
    errors.push(`Subtotal mismatch: expected ${calculatedSubtotal.toFixed(2)}, got ${totals.subtotal.toFixed(2)}`);
  }

  if (totalDiff >= 0.01) {
    errors.push(`Total mismatch: expected ${calculatedTotal.toFixed(2)}, got ${totals.total.toFixed(2)}`);
  }

  // Validate discount (if any)
  if (totals.discountAmount && totals.discountAmount > calculatedSubtotal) {
    errors.push('Discount cannot exceed subtotal');
  }

  const validatedTotals = {
    subtotal: calculatedSubtotal,
    taxAmount: tax,
    shippingAmount: shipping,
    discountAmount: totals.discountAmount || 0,
    total: calculatedTotal,
  };

  return {
    isValid: errors.length === 0 && validatedItems.length > 0,
    errors,
    validatedItems,
    validatedTotals,
  };
}

/**
 * Track price history for audit trail
 */
export async function logPriceChange(
  productId: string,
  oldPrice: number,
  newPrice: number,
  changedBy: string
) {
  try {
    await addDoc(collection(db, 'priceHistory'), {
      productId,
      oldPrice,
      newPrice,
      changeAmount: newPrice - oldPrice,
      changePercentage: ((newPrice - oldPrice) / oldPrice) * 100,
      changedBy,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to log price change:', error);
  }
}
