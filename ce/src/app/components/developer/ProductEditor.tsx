/**
 * Comprehensive Product Editor
 * Full CRUD operations with Firebase sync and manual save
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  Upload,
  Download,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import type { FirestoreProduct } from '../../../lib/firestore-schema';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
  subscribeToAllProducts,
} from '../../../services/product-firebase-service';

interface UnsavedChanges {
  [productId: string]: Partial<FirestoreProduct>;
}

export function ProductEditor() {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<UnsavedChanges>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load products from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToAllProducts((fetchedProducts) => {
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter products
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  // Get unique categories
  const categories = Array.from(new Set(products.map((p) => p.categoryId)));

  // Handle field change
  const handleFieldChange = (productId: string, field: string, value: any) => {
    setUnsavedChanges((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  // Save changes for a single product
  const handleSaveProduct = async (productId: string) => {
    if (!unsavedChanges[productId]) return;

    setSaving(true);
    try {
      await updateProduct(productId, unsavedChanges[productId]);

      // Clear unsaved changes
      setUnsavedChanges((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });

      setMessage({ type: 'success', text: 'Product saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving product:', error);
      setMessage({ type: 'error', text: 'Failed to save product' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
      setEditingProduct(null);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      await deleteProduct(productId);
      setMessage({ type: 'success', text: 'Product deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage({ type: 'error', text: 'Failed to delete product' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Discard changes
  const handleDiscardChanges = (productId: string) => {
    setUnsavedChanges((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
    setEditingProduct(null);
  };

  // Get current value (with unsaved changes)
  const getCurrentValue = (product: FirestoreProduct, field: keyof FirestoreProduct) => {
    return unsavedChanges[product.id]?.[field] ?? product[field];
  };

  // Check if product has unsaved changes
  const hasUnsavedChanges = (productId: string) => {
    return !!unsavedChanges[productId] && Object.keys(unsavedChanges[productId]).length > 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Editor</h2>
          <p className="text-sm text-muted-foreground">
            Manage all products • Changes sync with Firebase
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </motion.button>
        </div>
      </div>

      {/* Message Banner */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-950/30 border-green-500 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-950/30 border-red-500 text-red-700 dark:text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, SKU, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-border bg-card focus:border-primary outline-none"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 rounded-xl border-2 border-border bg-card focus:border-primary outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-card rounded-xl border-2 border-border">
          <div className="text-2xl font-bold">{products.length}</div>
          <div className="text-sm text-muted-foreground">Total Products</div>
        </div>
        <div className="p-4 bg-card rounded-xl border-2 border-border">
          <div className="text-2xl font-bold">{filteredProducts.length}</div>
          <div className="text-sm text-muted-foreground">Filtered Results</div>
        </div>
        <div className="p-4 bg-card rounded-xl border-2 border-border">
          <div className="text-2xl font-bold text-orange-500">
            {Object.keys(unsavedChanges).length}
          </div>
          <div className="text-sm text-muted-foreground">Unsaved Changes</div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-xl border-2 border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Price (GHS)</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const isEditing = editingProduct === product.id;
                const hasChanges = hasUnsavedChanges(product.id);

                return (
                  <tr
                    key={product.id}
                    className={`border-t border-border transition-colors ${
                      hasChanges ? 'bg-orange-50 dark:bg-orange-950/20' : 'hover:bg-muted/50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{product.sku}</code>
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={getCurrentValue(product, 'name')}
                          onChange={(e) => handleFieldChange(product.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 rounded border border-border bg-card text-sm"
                        />
                      ) : (
                        <div className="font-medium text-sm">{product.name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {product.categoryId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={getCurrentValue(product, 'price')}
                          onChange={(e) =>
                            handleFieldChange(product.id, 'price', parseFloat(e.target.value) || 0)
                          }
                          className="w-24 px-2 py-1 rounded border border-border bg-card text-sm"
                          step="0.01"
                        />
                      ) : (
                        <div className="font-bold">
                          {product.price === 0 ? (
                            <span className="text-muted-foreground">Not set</span>
                          ) : (
                            `GHS ${product.price.toFixed(2)}`
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{product.totalStock} units</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleSaveProduct(product.id)}
                              disabled={saving}
                              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                              title="Save changes"
                            >
                              {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDiscardChanges(product.id)}
                              className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                              title="Discard changes"
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          </>
                        ) : (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setEditingProduct(product.id)}
                              className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                              title="Edit product"
                            >
                              <Edit3 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
