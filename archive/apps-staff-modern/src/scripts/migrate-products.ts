/**
 * Product Migration Script
 *
 * Migrates all products from products-full.ts to Firestore
 *
 * Run this once to populate your Firebase database with products
 */

import { collection, writeBatch, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FirestoreProduct, FirestoreCategory } from '@/lib/firestore-schema';
import { fullProductCatalog } from '../app/data/products-full';

// Helper function to create slug from name
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper function to distribute stock across warehouses
function distributeStock(totalStock: number): { accra: number; kumasi: number; takoradi: number } {
  const accra = Math.floor(totalStock * 0.5); // 50% in Accra
  const kumasi = Math.floor(totalStock * 0.35); // 35% in Kumasi
  const takoradi = totalStock - accra - kumasi; // Remaining in Takoradi

  return { accra, kumasi, takoradi };
}

// Transform source product to Firestore format
function transformProduct(sourceProduct: any): Omit<FirestoreProduct, 'id' | 'createdAt' | 'updatedAt'> {
  const imageUrl = typeof sourceProduct.image === 'string' ? sourceProduct.image : String(sourceProduct.image);
  const stock = sourceProduct.stock || 0;
  const warehouseStock = distributeStock(stock);

  return {
    sku: sourceProduct.sku,
    name: sourceProduct.name,
    slug: createSlug(sourceProduct.name),
    description: sourceProduct.description || `High-quality ${sourceProduct.name} from Cofkans Electricals`,
    longDescription: sourceProduct.description || `Professional-grade ${sourceProduct.name}. ${sourceProduct.specs?.join(', ') || 'Premium quality electrical product.'} Perfect for residential and commercial installations.`,

    // Categorization
    categoryId: sourceProduct.category,
    categoryName: getCategoryName(sourceProduct.category),
    subcategory: sourceProduct.subcategory,
    tags: [sourceProduct.category, sourceProduct.subcategory, ...(sourceProduct.badge ? [sourceProduct.badge] : [])],

    // Pricing
    price: sourceProduct.price,
    tradePrice: sourceProduct.tradePrice || null,
    costPrice: sourceProduct.price * 0.6, // Estimate 40% margin
    currency: 'GHS',
    compareAtPrice: null,

    // Media
    images: [
      {
        url: imageUrl,
        alt: sourceProduct.name,
        isPrimary: true,
        order: 0,
      },
    ],
    videos: [],

    // Variants
    hasVariants: false,
    variants: [],

    // Specifications
    specs: (sourceProduct.specs || []).reduce((acc: Record<string, string>, spec: string, index: number) => {
      acc[`spec_${index + 1}`] = spec;
      return acc;
    }, {}),
    technicalSpecs: sourceProduct.specs || [],

    // Inventory
    trackInventory: true,
    totalStock: stock,
    warehouseStock,
    lowStockThreshold: 10,

    // Status
    status: 'active',
    isAvailable: stock > 0,
    isFeatured: sourceProduct.featured || false,
    isOnSale: false,

    // Ratings & Reviews
    rating: sourceProduct.rating || 0,
    reviewCount: sourceProduct.reviews || 0,

    // SEO
    metaTitle: `${sourceProduct.name} - Cofkans Electricals`,
    metaDescription: sourceProduct.description || `Buy ${sourceProduct.name} at Cofkans Electricals. SKU: ${sourceProduct.sku}. Quality electrical products in Ghana.`,
    keywords: [sourceProduct.name, sourceProduct.sku, sourceProduct.category, sourceProduct.subcategory, 'Ghana', 'electrical'],

    // Badges
    badges: sourceProduct.badge ? [sourceProduct.badge] : [],

    // Shipping (estimate based on product category)
    weight: getEstimatedWeight(sourceProduct.category),
    dimensions: {
      length: 30,
      width: 30,
      height: 30,
    },

    // Timestamps (will be set by Firestore)
    publishedAt: Timestamp.now(),

    // Analytics
    viewCount: 0,
    purchaseCount: 0,
    cartAddCount: 0,
  };
}

// Helper functions
function getCategoryName(categoryId: string): string {
  const categoryNames: Record<string, string> = {
    luxury: 'Luxury Lighting',
    solar: 'Solar & Infrastructure',
    wiring: 'Smart Accessories',
    industrial: 'Industrial Control',
    appliances: 'Fans & Appliances',
  };
  return categoryNames[categoryId] || categoryId;
}

function getEstimatedWeight(category: string): number {
  const weights: Record<string, number> = {
    luxury: 5, // kg
    solar: 3,
    wiring: 0.5,
    industrial: 8,
    appliances: 6,
  };
  return weights[category] || 2;
}

// Main migration function - uploads in small batches of 100 products
export async function migrateProducts(onProgress?: (current: number, total: number, productName: string) => void) {
  console.log('Starting product migration');
  console.log(`📦 Found ${fullProductCatalog.length} products to migrate`);

  const productsRef = collection(db, 'products');
  const BATCH_SIZE = 100; // Small batches to avoid issues
  const totalProducts = fullProductCatalog.length;
  let migrated = 0;

  // Split products into chunks of 100
  for (let i = 0; i < totalProducts; i += BATCH_SIZE) {
    const chunk = fullProductCatalog.slice(i, i + BATCH_SIZE);

    // Create a NEW batch for each chunk
    const batch = writeBatch(db);

    console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (products ${i + 1} to ${Math.min(i + BATCH_SIZE, totalProducts)})`);

    for (const sourceProduct of chunk) {
      try {
        const transformedProduct = transformProduct(sourceProduct);
        const productRef = doc(productsRef, sourceProduct.id);

        const firestoreProduct: FirestoreProduct = {
          id: sourceProduct.id,
          ...transformedProduct,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        batch.set(productRef, firestoreProduct);
        migrated++;

        if (onProgress) {
          onProgress(migrated, totalProducts, sourceProduct.name);
        }

        console.log(`✓ Prepared: ${sourceProduct.name} (${migrated}/${totalProducts})`);
      } catch (error) {
        console.error(`❌ Failed to prepare product ${sourceProduct.name}:`, error);
      }
    }

    // Commit this batch
    try {
      await batch.commit();
      console.log(`💾 Committed batch ${Math.floor(i / BATCH_SIZE) + 1} - ${chunk.length} products (total: ${migrated}/${totalProducts})`);
    } catch (error) {
      console.error(`❌ Failed to commit batch:`, error);
      throw error;
    }
  }

  console.log(`✅ Migration complete. Migrated ${migrated}/${totalProducts} products`);

  return { migrated, total: totalProducts };
}

// Create categories
export async function migrateCategories() {
  console.log('🏷️  Creating categories...');

  const categories: Omit<FirestoreCategory, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'Luxury Lighting',
      slug: 'luxury-lighting',
      description: 'Premium chandeliers, pendant lights, and designer fixtures',
      parentId: null,
      image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800',
      icon: 'Sparkles',
      metaTitle: 'Luxury Lighting - Cofkans Electricals',
      metaDescription: 'Explore our collection of luxury chandeliers and designer lighting',
      order: 1,
      isActive: true,
      isFeatured: true,
      productCount: 0,
    },
    {
      name: 'Solar & Infrastructure',
      slug: 'solar-infrastructure',
      description: 'Solar-powered lighting and commercial floodlights',
      parentId: null,
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
      icon: 'Sun',
      metaTitle: 'Solar & Infrastructure - Cofkans Electricals',
      metaDescription: 'Energy-efficient solar lighting solutions for homes and businesses',
      order: 2,
      isActive: true,
      isFeatured: true,
      productCount: 0,
    },
    {
      name: 'Smart Accessories',
      slug: 'smart-accessories',
      description: 'Switches, sockets, and smart electrical accessories',
      parentId: null,
      image: 'https://images.unsplash.com/photo-1558089687-3d5e04b4d6c9?w=800',
      icon: 'Zap',
      metaTitle: 'Smart Accessories - Cofkans Electricals',
      metaDescription: 'Modern switches, USB sockets, and smart home accessories',
      order: 3,
      isActive: true,
      isFeatured: false,
      productCount: 0,
    },
    {
      name: 'Industrial Control',
      slug: 'industrial-control',
      description: 'Circuit breakers, distribution boards, and industrial equipment',
      parentId: null,
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
      icon: 'Building2',
      metaTitle: 'Industrial Control - Cofkans Electricals',
      metaDescription: 'Professional-grade circuit breakers and distribution equipment',
      order: 4,
      isActive: true,
      isFeatured: false,
      productCount: 0,
    },
    {
      name: 'Fans & Appliances',
      slug: 'fans-appliances',
      description: 'Ceiling fans, LED bulbs, and electrical appliances',
      parentId: null,
      image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800',
      icon: 'Fan',
      metaTitle: 'Fans & Appliances - Cofkans Electricals',
      metaDescription: 'Quality ceiling fans, LED bulbs, and home appliances',
      order: 5,
      isActive: true,
      isFeatured: false,
      productCount: 0,
    },
  ];

  const batch = writeBatch(db);
  const categoriesRef = collection(db, 'categories');

  for (const category of categories) {
    const categoryRef = doc(categoriesRef, category.slug);

    const firestoreCategory: FirestoreCategory = {
      id: category.slug,
      ...category,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    batch.set(categoryRef, firestoreCategory);
    console.log(`Created category: ${category.name}`);
  }

  await batch.commit();
  console.log(`Categories migration complete.`);
}

// Run full migration
export async function runFullMigration(onProgress?: (current: number, total: number, productName: string) => void) {
  console.log('Starting full migration');

  try {
    // Step 1: Create categories
    await migrateCategories();

    // Step 2: Migrate products
    const result = await migrateProducts(onProgress);

    console.log('Full migration complete.');
    console.log(`📊 Results: ${result.migrated}/${result.total} products migrated`);

    return result;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
