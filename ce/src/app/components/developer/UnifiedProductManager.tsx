/**
 * Unified Product Manager
 * Complete product management with Firebase sync and Git deployment
 * - View Firebase products in Developer Console
 * - Edit inline with pen icons
 * - Upload images or use URLs
 * - Bulk price editor
 * - Push to live (Git + Firebase)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package,
  Edit3,
  Save,
  X,
  Search,
  Upload,
  Link,
  Image as ImageIcon,
  DollarSign,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  GitBranch,
  Rocket,
  RefreshCw,
} from 'lucide-react';
import type { FirestoreProduct } from '../../../lib/firestore-schema';
import {
  getAllProducts,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
  subscribeToAllProducts,
} from '../../../services/product-firebase-service';
import {
  deployToGitHub,
  isGitHubConfigured,
  configureGitHub,
  getGitHubConfig,
  clearGitHubConfig,
} from '../../../services/git-deploy-service';

interface EditState {
  [productId: string]: {
    name?: string;
    price?: number;
    tradePrice?: number;
    imageUrl?: string;
    description?: string;
  };
}

type ViewMode = 'grid' | 'table' | 'bulk-pricing';

export function UnifiedProductManager() {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editState, setEditState] = useState<EditState>({});
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imageUploadModal, setImageUploadModal] = useState<{ productId: string; show: boolean }>({ productId: '', show: false });
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('url');
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [showGitHubConfig, setShowGitHubConfig] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [githubOwner, setGithubOwner] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [isGitConfigured, setIsGitConfigured] = useState(isGitHubConfigured());

  // Load products from Firebase - use manual fetch instead of real-time listeners
  // to avoid WebChannel connection errors
  const loadProducts = async () => {
    setLoading(true);
    try {
      const fetchedProducts = await getAllProducts();
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
      showMessage('success', `Loaded ${fetchedProducts.length} products from Firebase`);
    } catch (error) {
      console.error('Error loading products:', error);
      showMessage('error', 'Failed to load products from Firebase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const categories = Array.from(new Set(products.map((p) => p.categoryId)));
  const hasUnsavedChanges = Object.keys(editState).length > 0;

  // Start editing a field
  const startEdit = (productId: string, field: string, currentValue: any) => {
    setEditState((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: currentValue,
      },
    }));
  };

  // Update edit state
  const updateEdit = (productId: string, field: string, value: any) => {
    setEditState((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  // Cancel edit
  const cancelEdit = (productId: string) => {
    setEditState((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  // Save single product
  const saveProduct = async (productId: string) => {
    if (!editState[productId]) return;

    setSaving(true);
    try {
      await updateProduct(productId, editState[productId]);

      // Clear edit state
      setEditState((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });

      // Reload to show updated Firebase data
      await loadProducts();

      showMessage('success', 'Product saved to Firebase!');
    } catch (error) {
      console.error('Error saving product:', error);
      showMessage('error', 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  // Save all changes
  const saveAllChanges = async () => {
    if (!hasUnsavedChanges) return;

    setSaving(true);
    try {
      const updates = new Map(Object.entries(editState));
      await bulkUpdateProducts(updates);

      setEditState({});

      // Reload to show updated Firebase data
      await loadProducts();

      showMessage('success', `Saved ${updates.size} products to Firebase!`);
    } catch (error) {
      console.error('Error saving all:', error);
      showMessage('error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Image upload/URL modal
  const openImageModal = (productId: string, currentUrl: string) => {
    setImageUploadModal({ productId, show: true });
    setTempImageUrl(currentUrl);
  };

  const saveImage = () => {
    if (imageUploadModal.productId && tempImageUrl) {
      updateEdit(imageUploadModal.productId, 'imageUrl', tempImageUrl);
      setImageUploadModal({ productId: '', show: false });
      setTempImageUrl('');
    }
  };

  // Bulk price update
  const applyBulkPriceChange = (percentage: number, applyTo: 'price' | 'tradePrice') => {
    const updates: EditState = {};

    filteredProducts.forEach((product) => {
      const currentPrice = applyTo === 'price' ? product.price : (product.tradePrice || 0);
      const newPrice = currentPrice * (1 + percentage / 100);

      updates[product.id] = {
        ...editState[product.id],
        [applyTo]: Math.round(newPrice * 100) / 100,
      };
    });

    setEditState(updates);
    showMessage('success', `Applied ${percentage}% to ${filteredProducts.length} products`);
  };

  // Deploy to Git + Firebase (HYBRID AUTOMATIC)
  const deployToLive = async () => {
    if (!hasUnsavedChanges) {
      showMessage('error', 'No changes to deploy');
      return;
    }

    setDeploying(true);
    try {
      const updates = new Map(Object.entries(editState));

      // STEP 1: Save to Firebase (INSTANT - Live site updates immediately)
      showMessage('success', '⏳ Saving to Firebase...');
      await bulkUpdateProducts(updates);
      console.log('[Deploy] ✅ Saved to Firebase');

      // STEP 2: Reload products from Firebase
      await loadProducts();

      // STEP 3: Commit to Git (AUTOMATIC - Triggers GitHub Actions)
      if (isGitConfigured) {
        showMessage('success', '⏳ Committing to Git...');
        const gitResult = await deployToGitHub(
          products,
          `Update ${updates.size} products from Developer Console`
        );

        if (gitResult.success) {
          console.log('[Deploy] ✅ Committed to Git:', gitResult.commitSha);
          showMessage(
            'success',
            `✅ DEPLOYED LIVE!\n✓ Firebase: Updated instantly\n✓ Git: Committed ${gitResult.commitSha?.substring(0, 7)}\n✓ GitHub Actions: Deploying...`
          );
        } else {
          console.error('[Deploy] ❌ Git commit failed:', gitResult.error);
          showMessage(
            'success',
            `⚠️ Partial Success:\n✓ Firebase: Updated (live now)\n✗ Git: ${gitResult.error}\n\nLive site is updated, but code not committed.`
          );
        }
      } else {
        // Firebase only (no Git configured)
        showMessage(
          'success',
          `✅ Saved to Firebase!\n${updates.size} products updated on live site.\n\n⚠️ Git not configured - changes not committed to repository.`
        );
      }

      // Clear edit state
      setEditState({});
    } catch (error) {
      console.error('Error deploying:', error);
      showMessage('error', `Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeploying(false);
    }
  };

  // Save to Firebase only (instant update, no Git commit)
  const saveToFirebaseOnly = async () => {
    if (!hasUnsavedChanges) return;

    setSaving(true);
    try {
      const updates = new Map(Object.entries(editState));
      await bulkUpdateProducts(updates);
      setEditState({});
      await loadProducts();
      showMessage('success', `✅ Saved ${updates.size} products to Firebase! Live site updated.`);
    } catch (error) {
      console.error('Error saving:', error);
      showMessage('error', 'Failed to save to Firebase');
    } finally {
      setSaving(false);
    }
  };

  // Configure GitHub integration
  const saveGitHubConfig = () => {
    if (!githubToken || !githubOwner || !githubRepo) {
      showMessage('error', 'Please fill in all GitHub configuration fields');
      return;
    }

    configureGitHub(githubToken, githubOwner, githubRepo);
    setIsGitConfigured(true);
    setShowGitHubConfig(false);
    showMessage('success', '✅ GitHub integration configured! Auto-commit enabled.');
  };

  // Show message
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Get current value
  const getCurrentValue = (product: FirestoreProduct, field: keyof FirestoreProduct) => {
    return editState[product.id]?.[field as any] ?? product[field];
  };

  const isEditing = (productId: string, field?: string) => {
    if (field) {
      return editState[productId]?.[field as any] !== undefined;
    }
    return !!editState[productId];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading products from Firebase...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Management Center</h2>
          <p className="text-sm text-muted-foreground">
            Firebase Live Sync • Edit • Upload Images • Bulk Pricing • Deploy
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadProducts}
            disabled={loading}
            className="px-4 py-2 bg-muted text-foreground rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </motion.button>

          {/* GitHub Config Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGitHubConfig(true)}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 ${
              isGitConfigured
                ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                : 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            {isGitConfigured ? 'Git: ON' : 'Git: OFF'}
          </motion.button>

          {hasUnsavedChanges && (
            <>
              {/* Save to Firebase Only (Instant) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveToFirebaseOnly}
                disabled={saving}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save to Firebase
              </motion.button>

              {/* Push to Live (Firebase + Git Automatic) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={deployToLive}
                disabled={deploying}
                className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50 shadow-lg"
              >
                {deploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                Push to Live {isGitConfigured && '(Firebase + Git)'}
              </motion.button>
            </>
          )}
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
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Mode Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('grid')}
          className={`px-4 py-2 rounded-lg font-bold text-sm ${
            viewMode === 'grid' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Products
        </button>
        <button
          onClick={() => setViewMode('table')}
          className={`px-4 py-2 rounded-lg font-bold text-sm ${
            viewMode === 'table' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
          }`}
        >
          <Edit3 className="w-4 h-4 inline mr-2" />
          Quick Edit
        </button>
        <button
          onClick={() => setViewMode('bulk-pricing')}
          className={`px-4 py-2 rounded-lg font-bold text-sm ${
            viewMode === 'bulk-pricing' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
          }`}
        >
          <DollarSign className="w-4 h-4 inline mr-2" />
          Bulk Pricing
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
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
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-card rounded-xl border-2 border-border">
          <div className="text-2xl font-bold">{products.length}</div>
          <div className="text-sm text-muted-foreground">Total in Firebase</div>
        </div>
        <div className="p-4 bg-card rounded-xl border-2 border-border">
          <div className="text-2xl font-bold">{filteredProducts.length}</div>
          <div className="text-sm text-muted-foreground">Filtered</div>
        </div>
        <div className="p-4 bg-card rounded-xl border-2 border-border">
          <div className="text-2xl font-bold text-orange-500">{Object.keys(editState).length}</div>
          <div className="text-sm text-muted-foreground">Unsaved Changes</div>
        </div>
        <div className="p-4 bg-card rounded-xl border-2 border-border">
          <div className="text-2xl font-bold text-green-500">
            {products.filter((p) => p.price > 0).length}
          </div>
          <div className="text-sm text-muted-foreground">Priced Products</div>
        </div>
      </div>

      {/* Bulk Pricing Panel */}
      {viewMode === 'bulk-pricing' && (
        <div className="bg-card rounded-xl border-2 border-border p-6">
          <h3 className="text-lg font-bold mb-4">Bulk Price Editor</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Adjust Retail Prices</label>
              <div className="flex gap-2">
                <button
                  onClick={() => applyBulkPriceChange(10, 'price')}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
                >
                  +10%
                </button>
                <button
                  onClick={() => applyBulkPriceChange(20, 'price')}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
                >
                  +20%
                </button>
                <button
                  onClick={() => applyBulkPriceChange(-10, 'price')}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600"
                >
                  -10%
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Adjust Trade Prices</label>
              <div className="flex gap-2">
                <button
                  onClick={() => applyBulkPriceChange(10, 'tradePrice')}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
                >
                  +10%
                </button>
                <button
                  onClick={() => applyBulkPriceChange(20, 'tradePrice')}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
                >
                  +20%
                </button>
                <button
                  onClick={() => applyBulkPriceChange(-10, 'tradePrice')}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600"
                >
                  -10%
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Applies to {filteredProducts.length} filtered products. Click "Save All" to apply changes.
          </p>
        </div>
      )}

      {/* Products Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const hasEdits = isEditing(product.id);
            const imageUrl = getCurrentValue(product, 'images')?.[0]?.url || product.images[0]?.url;

            return (
              <motion.div
                key={product.id}
                className={`bg-card rounded-xl border-2 overflow-hidden transition-all ${
                  hasEdits ? 'border-orange-500 shadow-lg' : 'border-border'
                }`}
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-muted group">
                  <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => openImageModal(product.id, imageUrl)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ImageIcon className="w-8 h-8 text-white" />
                    <span className="ml-2 text-white font-bold">Change Image</span>
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Name with Edit Icon */}
                  <div className="flex items-center gap-2 mb-2">
                    {isEditing(product.id, 'name') ? (
                      <input
                        type="text"
                        value={getCurrentValue(product, 'name')}
                        onChange={(e) => updateEdit(product.id, 'name', e.target.value)}
                        className="flex-1 px-2 py-1 rounded border border-border bg-card text-sm font-bold"
                        autoFocus
                      />
                    ) : (
                      <>
                        <h3 className="flex-1 font-bold text-sm line-clamp-2">{product.name}</h3>
                        <button
                          onClick={() => startEdit(product.id, 'name', product.name)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-primary" />
                        </button>
                      </>
                    )}
                  </div>

                  <code className="text-xs bg-muted px-2 py-1 rounded">{product.sku}</code>

                  {/* Price */}
                  <div className="mt-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    {isEditing(product.id, 'price') ? (
                      <input
                        type="number"
                        value={getCurrentValue(product, 'price')}
                        onChange={(e) => updateEdit(product.id, 'price', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 rounded border border-border bg-card text-sm font-bold"
                        step="0.01"
                      />
                    ) : (
                      <button
                        onClick={() => startEdit(product.id, 'price', product.price)}
                        className="font-bold hover:text-primary"
                      >
                        {product.price === 0 ? (
                          <span className="text-red-500">Set Price</span>
                        ) : (
                          `GHS ${product.price.toFixed(2)}`
                        )}
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  {hasEdits && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => saveProduct(product.id)}
                        className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600"
                      >
                        <Save className="w-3 h-3 inline mr-1" />
                        Save
                      </button>
                      <button
                        onClick={() => cancelEdit(product.id)}
                        className="px-3 py-1.5 bg-gray-500 text-white rounded-lg text-xs font-bold hover:bg-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-card rounded-xl border-2 border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase">Trade Price</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase">Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const hasEdits = isEditing(product.id);

                  return (
                    <tr
                      key={product.id}
                      className={`border-t border-border ${hasEdits ? 'bg-orange-50 dark:bg-orange-950/20' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openImageModal(product.id, product.images[0]?.url)}
                          className="w-12 h-12 rounded overflow-hidden hover:ring-2 ring-primary"
                        >
                          <img
                            src={product.images[0]?.url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{product.sku}</code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isEditing(product.id, 'name') ? (
                            <input
                              type="text"
                              value={getCurrentValue(product, 'name')}
                              onChange={(e) => updateEdit(product.id, 'name', e.target.value)}
                              className="flex-1 px-2 py-1 rounded border border-border bg-card text-sm"
                            />
                          ) : (
                            <>
                              <span className="text-sm">{product.name}</span>
                              <button onClick={() => startEdit(product.id, 'name', product.name)}>
                                <Edit3 className="w-3.5 h-3.5 text-primary" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isEditing(product.id, 'price') ? (
                          <input
                            type="number"
                            value={getCurrentValue(product, 'price')}
                            onChange={(e) => updateEdit(product.id, 'price', parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1 rounded border border-border bg-card text-sm"
                            step="0.01"
                          />
                        ) : (
                          <button
                            onClick={() => startEdit(product.id, 'price', product.price)}
                            className="font-bold hover:text-primary text-sm"
                          >
                            {product.price === 0 ? (
                              <span className="text-red-500">Set</span>
                            ) : (
                              `GHS ${product.price.toFixed(2)}`
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing(product.id, 'tradePrice') ? (
                          <input
                            type="number"
                            value={getCurrentValue(product, 'tradePrice') || 0}
                            onChange={(e) =>
                              updateEdit(product.id, 'tradePrice', parseFloat(e.target.value) || 0)
                            }
                            className="w-24 px-2 py-1 rounded border border-border bg-card text-sm"
                            step="0.01"
                          />
                        ) : (
                          <button
                            onClick={() => startEdit(product.id, 'tradePrice', product.tradePrice || 0)}
                            className="text-sm hover:text-primary"
                          >
                            {product.tradePrice ? `GHS ${product.tradePrice.toFixed(2)}` : '-'}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{product.totalStock}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {hasEdits ? (
                            <>
                              <button
                                onClick={() => saveProduct(product.id)}
                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => cancelEdit(product.id)}
                                className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startEdit(product.id, 'name', product.name)}
                              className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GitHub Configuration Modal */}
      <AnimatePresence>
        {showGitHubConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowGitHubConfig(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-md w-full border-2 border-border"
            >
              <h3 className="text-xl font-bold mb-2">GitHub Integration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enable automatic Git commits when you push changes to live
              </p>

              {/* Instructions */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4 text-sm">
                <p className="font-bold mb-2">How to set up:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Go to GitHub → Settings → Developer settings</li>
                  <li>Create Personal Access Token (classic)</li>
                  <li>Grant <code className="bg-muted px-1 rounded">repo</code> permission</li>
                  <li>Copy token and paste below</li>
                </ol>
              </div>

              {/* Form */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-bold mb-1">GitHub Username/Org</label>
                  <input
                    type="text"
                    value={githubOwner}
                    onChange={(e) => setGithubOwner(e.target.value)}
                    placeholder="e.g., your-username"
                    className="w-full px-3 py-2 rounded-lg border-2 border-border bg-card focus:border-primary outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">Repository Name</label>
                  <input
                    type="text"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    placeholder="e.g., my-ecommerce-site"
                    className="w-full px-3 py-2 rounded-lg border-2 border-border bg-card focus:border-primary outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">Personal Access Token</label>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full px-3 py-2 rounded-lg border-2 border-border bg-card focus:border-primary outline-none text-sm font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Stored locally in your browser (never sent to server)
                  </p>
                </div>
              </div>

              {/* Current Config */}
              {isGitConfigured && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-500 rounded-lg p-3 mb-4">
                  <p className="text-sm font-bold text-green-700 dark:text-green-400 mb-1">
                    ✅ Git Integration Active
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500">
                    Auto-commits enabled for: {getGitHubConfig()?.owner}/{getGitHubConfig()?.repo}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={saveGitHubConfig}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90"
                >
                  Save Configuration
                </button>
                {isGitConfigured && (
                  <button
                    onClick={() => {
                      clearGitHubConfig();
                      setIsGitConfigured(false);
                      setGithubToken('');
                      setGithubOwner('');
                      setGithubRepo('');
                      showMessage('success', 'Git integration disabled');
                    }}
                    className="px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600"
                  >
                    Disable
                  </button>
                )}
                <button
                  onClick={() => setShowGitHubConfig(false)}
                  className="px-4 py-3 bg-muted rounded-xl font-bold hover:bg-muted/80"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Upload Modal */}
      <AnimatePresence>
        {imageUploadModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setImageUploadModal({ productId: '', show: false })}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-md w-full border-2 border-border"
            >
              <h3 className="text-xl font-bold mb-4">Change Product Image</h3>

              {/* Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setImageInputMode('url')}
                  className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${
                    imageInputMode === 'url' ? 'bg-primary text-white' : 'bg-muted'
                  }`}
                >
                  <Link className="w-4 h-4" />
                  URL
                </button>
                <button
                  onClick={() => setImageInputMode('upload')}
                  className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${
                    imageInputMode === 'upload' ? 'bg-primary text-white' : 'bg-muted'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
              </div>

              {/* URL Input */}
              {imageInputMode === 'url' && (
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2">Image URL</label>
                  <input
                    type="url"
                    value={tempImageUrl}
                    onChange={(e) => setTempImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card focus:border-primary outline-none"
                  />
                </div>
              )}

              {/* Upload Input */}
              {imageInputMode === 'upload' && (
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2">Upload Image</label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
                    <input type="file" accept="image/*" className="hidden" />
                    <button className="text-sm text-primary font-bold">Browse Files</button>
                  </div>
                </div>
              )}

              {/* Preview */}
              {tempImageUrl && (
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2">Preview</label>
                  <img
                    src={tempImageUrl}
                    alt="Preview"
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={saveImage}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90"
                >
                  Save Image
                </button>
                <button
                  onClick={() => setImageUploadModal({ productId: '', show: false })}
                  className="px-4 py-3 bg-muted rounded-xl font-bold hover:bg-muted/80"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
