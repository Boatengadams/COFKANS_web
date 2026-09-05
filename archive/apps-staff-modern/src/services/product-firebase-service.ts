/**
 * Product Firebase Service
 *
 * Handles all product CRUD operations with Firebase Firestore
 * Provides bidirectional sync between Developer Portal and Firebase
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FirestoreProduct } from '@/lib/firestore-schema';

export interface ProductUpdate {
  id: string;
  name?: string;
  sku?: string;
  price?: number;
  tradePrice?: number | null;
  categoryId?: string;
  categoryName?: string;
  subcategory?: string;
  description?: string;
  longDescription?: string;
  images?: { url: string; alt: string; isPrimary: boolean; order: number }[];
  specs?: Record<string, string>;
  technicalSpecs?: string[];
  totalStock?: number;
  warehouseStock?: { accra: number; kumasi: number; takoradi: number };
  isAvailable?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  badges?: string[];
  status?: 'active' | 'draft' | 'archived' | 'outOfStock';
}

/**
 * Get a single product by ID
 */
export async function getProduct(productId: string): Promise<FirestoreProduct | null> {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return null;
    }

    return productSnap.data() as FirestoreProduct;
  } catch (error) {
    console.error('[ProductService] Error getting product:', error);
    throw new Error(`Failed to get product: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all products from Firebase
 */
export async function getAllProducts(): Promise<FirestoreProduct[]> {
  try {
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);

    const products: FirestoreProduct[] = [];
    querySnapshot.forEach((doc) => {
      products.push(doc.data() as FirestoreProduct);
    });

    return products;
  } catch (error) {
    console.error('[ProductService] Error getting all products:', error);
    throw new Error(`Failed to get products: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(categoryId: string): Promise<FirestoreProduct[]> {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('categoryId', '==', categoryId));
    const querySnapshot = await getDocs(q);

    const products: FirestoreProduct[] = [];
    querySnapshot.forEach((doc) => {
      products.push(doc.data() as FirestoreProduct);
    });

    return products;
  } catch (error) {
    console.error('[ProductService] Error getting products by category:', error);
    throw new Error(`Failed to get products by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search products by name or SKU
 */
export async function searchProducts(searchTerm: string): Promise<FirestoreProduct[]> {
  try {
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);

    const products: FirestoreProduct[] = [];
    const searchLower = searchTerm.toLowerCase();

    querySnapshot.forEach((doc) => {
      const product = doc.data() as FirestoreProduct;
      if (
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      ) {
        products.push(product);
      }
    });

    return products;
  } catch (error) {
    console.error('[ProductService] Error searching products:', error);
    throw new Error(`Failed to search products: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a new product
 */
export async function createProduct(product: Omit<FirestoreProduct, 'createdAt' | 'updatedAt'>): Promise<void> {
  try {
    const productRef = doc(db, 'products', product.id);

    const firestoreProduct: FirestoreProduct = {
      ...product,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(productRef, firestoreProduct);
    console.log('[ProductService] Product created:', product.id);
  } catch (error) {
    console.error('[ProductService] Error creating product:', error);
    throw new Error(`Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(productId: string, updates: ProductUpdate): Promise<void> {
  try {
    const productRef = doc(db, 'products', productId);

    // Verify product exists
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) {
      throw new Error(`Product ${productId} not found`);
    }

    // Add updatedAt timestamp
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(productRef, updateData);
    console.log('[ProductService] Product updated:', productId);
  } catch (error) {
    console.error('[ProductService] Error updating product:', error);
    throw new Error(`Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string): Promise<void> {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    console.log('[ProductService] Product deleted:', productId);
  } catch (error) {
    console.error('[ProductService] Error deleting product:', error);
    throw new Error(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Bulk update products (e.g., price changes)
 */
export async function bulkUpdateProducts(updates: Map<string, ProductUpdate>): Promise<void> {
  try {
    const batch = writeBatch(db);
    let count = 0;

    for (const [productId, update] of updates.entries()) {
      const productRef = doc(db, 'products', productId);
      batch.update(productRef, {
        ...update,
        updatedAt: Timestamp.now(),
      });
      count++;

      // Firestore batch limit is 500 operations
      if (count >= 400) {
        await batch.commit();
        console.log(`[ProductService] Committed batch of ${count} updates`);
        count = 0;
      }
    }

    // Commit remaining updates
    if (count > 0) {
      await batch.commit();
      console.log(`[ProductService] Committed final batch of ${count} updates`);
    }

    console.log(`[ProductService] Bulk update complete: ${updates.size} products`);
  } catch (error) {
    console.error('[ProductService] Error bulk updating products:', error);
    throw new Error(`Failed to bulk update products: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Bulk delete products
 */
export async function bulkDeleteProducts(productIds: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    let count = 0;

    for (const productId of productIds) {
      const productRef = doc(db, 'products', productId);
      batch.delete(productRef);
      count++;

      // Firestore batch limit is 500 operations
      if (count >= 400) {
        await batch.commit();
        console.log(`[ProductService] Committed batch deletion of ${count} products`);
        count = 0;
      }
    }

    // Commit remaining deletions
    if (count > 0) {
      await batch.commit();
      console.log(`[ProductService] Committed final batch deletion of ${count} products`);
    }

    console.log(`[ProductService] Bulk deletion complete: ${productIds.length} products`);
  } catch (error) {
    console.error('[ProductService] Error bulk deleting products:', error);
    throw new Error(`Failed to bulk delete products: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Listen to real-time product updates
 */
export function subscribeToProduct(productId: string, callback: (product: FirestoreProduct | null) => void): Unsubscribe {
  const productRef = doc(db, 'products', productId);

  return onSnapshot(
    productRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as FirestoreProduct);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('[ProductService] Error listening to product:', error);
      callback(null);
    }
  );
}

/**
 * Listen to real-time updates for all products
 */
export function subscribeToAllProducts(callback: (products: FirestoreProduct[]) => void): Unsubscribe {
  const productsRef = collection(db, 'products');

  return onSnapshot(
    productsRef,
    (snapshot) => {
      const products: FirestoreProduct[] = [];
      snapshot.forEach((doc) => {
        products.push(doc.data() as FirestoreProduct);
      });
      callback(products);
    },
    (error) => {
      console.error('[ProductService] Error listening to products:', error);
      callback([]);
    }
  );
}

/**
 * Update product stock levels
 */
export async function updateProductStock(
  productId: string,
  warehouseStock: { accra?: number; kumasi?: number; takoradi?: number }
): Promise<void> {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      throw new Error(`Product ${productId} not found`);
    }

    const currentProduct = productSnap.data() as FirestoreProduct;
    const updatedWarehouseStock = {
      accra: warehouseStock.accra ?? currentProduct.warehouseStock.accra,
      kumasi: warehouseStock.kumasi ?? currentProduct.warehouseStock.kumasi,
      takoradi: warehouseStock.takoradi ?? currentProduct.warehouseStock.takoradi,
    };

    const totalStock = updatedWarehouseStock.accra + updatedWarehouseStock.kumasi + updatedWarehouseStock.takoradi;

    await updateDoc(productRef, {
      warehouseStock: updatedWarehouseStock,
      totalStock,
      isAvailable: totalStock > 0,
      status: totalStock > 0 ? 'active' : 'outOfStock',
      updatedAt: Timestamp.now(),
    });

    console.log('[ProductService] Stock updated for product:', productId);
  } catch (error) {
    console.error('[ProductService] Error updating stock:', error);
    throw new Error(`Failed to update stock: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
