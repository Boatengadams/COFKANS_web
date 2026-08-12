// Complete Cofkans Product Catalog - 962 Products
// Generated from CSV import (cofkans_items_A_plus_B.csv)
// All prices set to 0 - update via Developer Console
// Last updated: 2026-05-25

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  tradePrice?: number;
  category: string;
  subcategory: string;
  image: string;
  featured?: boolean;
  badge?: string;
  rating?: number;
  reviews?: number;
  stock?: number;
  description?: string;
  specs?: string[];
}

// Re-export csvProducts as fullProductCatalog
export { csvProducts as fullProductCatalog } from './csvProducts';
