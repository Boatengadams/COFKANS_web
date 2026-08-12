/**
 * Comprehensive Product Manager
 * Unified tab combining: Product Manager + Catalogue (live) + Product Media
 * Features:
 * - View all products from Firebase
 * - Edit product details (name, description, price, trade price)
 * - Manage multiple images and videos (add/remove with + button)
 * - Manual save with clear indicators
 * - Push to live (Firebase + Git)
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
  Rocket,
  RefreshCw,
  Plus,
  Video,
  Eye,
  Grid3x3,
  List,
  Settings,
} from 'lucide-react';
import type { FirestoreProduct } from '../../../lib/firestore-schema';
import {
  getAllProducts,
  updateProduct,
  bulkUpdateProducts,
} from '../../../services/product-firebase-service';
import {
  deployToGitHub,
  isGitHubConfigured,
} from '../../../services/git-deploy-service';

interface ProductEdit {
  name?: string;
  description?: string;
  longDescription?: string;
  price?: number;
  tradePrice?: number;
  images?: Array<{ url: string; alt: string; isPrimary: boolean; order: number }>;
  videos?: Array<{ url: string; title: string; thumbnail?: string; order: number }>;
  categoryId?: string;
  subcategory?: string;
  totalStock?: number;
}

interface EditState {
  [productId: string]: ProductEdit;
}

type ViewMode = 'grid' | 'detail';

export function ComprehensiveProductManager() {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editState, setEditState] = useState<EditState>({});
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedProduct, setSelectedProduct] = useState<FirestoreProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [addImageModal, setAddImageModal] = useState<{ productId: string; show: boolean }>({ productId: '', show: false });
  const [addVideoModal, setAddVideoModal] = useState<{ productId: string; show: boolean }>({ productId: '', show: false });
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [tempVideoUrl, setTempVideoUrl] = useState('');
  const [tempVideoTitle, setTempVideoTitle] = useState('');
  const [isGitConfigured] = useState(isGitHubConfigured());

  // Load products from Firebase
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

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.categoryId === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Track if product has unsaved changes
  const hasUnsavedChanges = (productId: string) => {
    return !!editState[productId];
  };

  // Count total unsaved changes
  const unsavedCount = Object.keys(editState).length;

  // Update edit state
  const updateEditState = (productId: string, field: keyof ProductEdit, value: any) => {
    setEditState(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  // Add image to product
  const addImage = (productId: string, url: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const currentImages = editState[productId]?.images || product.images || [];
    const newImage = {
      url,
      alt: product.name,
      isPrimary: currentImages.length === 0,
      order: currentImages.length,
    };

    updateEditState(productId, 'images', [...currentImages, newImage]);
    setAddImageModal({ productId: '', show: false });
    setTempImageUrl('');
    showMessage('success', 'Image added (not saved yet)');
  };

  // Remove image from product
  const removeImage = (productId: string, imageIndex: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const currentImages = editState[productId]?.images || product.images || [];
    const updatedImages = currentImages.filter((_, idx) => idx !== imageIndex);

    updateEditState(productId, 'images', updatedImages);
    showMessage('success', 'Image removed (not saved yet)');
  };

  // Add video to product
  const addVideo = (productId: string, url: string, title: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const currentVideos = editState[productId]?.videos || product.videos || [];
    const newVideo = {
      url,
      title: title || 'Product Video',
      order: currentVideos.length,
    };

    updateEditState(productId, 'videos', [...currentVideos, newVideo]);
    setAddVideoModal({ productId: '', show: false });
    setTempVideoUrl('');
    setTempVideoTitle('');
    showMessage('success', 'Video added (not saved yet)');
  };

  // Remove video from product
  const removeVideo = (productId: string, videoIndex: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const currentVideos = editState[productId]?.videos || product.videos || [];
    const updatedVideos = currentVideos.filter((_, idx) => idx !== videoIndex);

    updateEditState(productId, 'videos', updatedVideos);
    showMessage('success', 'Video removed (not saved yet)');
  };

  // Discard changes for a product
  const discardChanges = (productId: string) => {
    setEditState(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
    showMessage('success', 'Changes discarded');
  };

  // Save single product
  const saveProduct = async (productId: string) => {
    const changes = editState[productId];
    if (!changes) return;

    setSaving(true);
    try {
      await updateProduct(productId, changes);

      // Update local state
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, ...changes } : p
      ));

      // Remove from edit state
      setEditState(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });

      showMessage('success', 'Product saved to Firebase');
    } catch (error) {
      console.error('Error saving product:', error);
      showMessage('error', 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  // Save all products
  const saveAllProducts = async () => {
    if (unsavedCount === 0) {
      showMessage('error', 'No changes to save');
      return;
    }

    setSaving(true);
    try {
      const updates = new Map<string, any>();
      Object.entries(editState).forEach(([productId, changes]) => {
        updates.set(productId, changes);
      });

      await bulkUpdateProducts(updates);

      // Update local state
      setProducts(prev => prev.map(p => {
        const changes = editState[p.id];
        return changes ? { ...p, ...changes } : p;
      }));

      // Clear edit state
      setEditState({});

      showMessage('success', `Saved ${updates.size} products to Firebase`);
    } catch (error) {
      console.error('Error saving all products:', error);
      showMessage('error', 'Failed to save all products');
    } finally {
      setSaving(false);
    }
  };

  // Deploy to live (Firebase + Git)
  const deployToLive = async () => {
    if (unsavedCount > 0) {
      showMessage('error', 'Save changes first before deploying');
      return;
    }

    setDeploying(true);
    try {
      if (isGitConfigured) {
        const gitResult = await deployToGitHub(products, `Update ${products.length} products from Developer Console`);
        if (gitResult.success) {
          showMessage('success', '✅ DEPLOYED LIVE!\n✓ Git: Committed\n✓ GitHub Actions will deploy');
        } else {
          showMessage('error', `Git deployment failed: ${gitResult.error}`);
        }
      } else {
        showMessage('error', 'GitHub not configured. Products are in Firebase but not in Git.');
      }
    } catch (error) {
      console.error('Error deploying:', error);
      showMessage('error', 'Deployment failed');
    } finally {
      setDeploying(false);
    }
  };

  const categories = Array.from(new Set(products.map(p => p.categoryId)));

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold">Product Management</h2>
            <p className="text-muted-foreground">Manage products, media, and catalogue</p>
          </div>
          <div className="flex items-center gap-3">
            {unsavedCount > 0 && (
              <div className="px-4 py-2 bg-orange-500/20 border border-orange-500 rounded-lg">
                <span className="text-orange-600 dark:text-orange-400 font-bold">
                  {unsavedCount} unsaved change{unsavedCount > 1 ? 's' : ''}
                </span>
              </div>
            )}
            <button
              onClick={loadProducts}
              disabled={loading}
              className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg font-bold flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={saveAllProducts}
              disabled={saving || unsavedCount === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save All ({unsavedCount})
            </button>
            <button
              onClick={deployToLive}
              disabled={deploying || unsavedCount > 0}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
            >
              {deploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              Push to Live
            </button>
          </div>
        </div>

        {/* Status Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-lg border-2 flex items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-950/30 border-green-500'
                  : 'bg-red-50 dark:bg-red-950/30 border-red-500'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={message.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                {message.text}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products by name, SKU, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border-2 border-border rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 bg-card border-2 border-border rounded-lg focus:outline-none focus:border-primary"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'detail' : 'grid')}
          className="px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg flex items-center gap-2 transition-colors"
        >
          {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
          {viewMode === 'grid' ? 'Detail View' : 'Grid View'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-card border-2 border-border rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Total Products</div>
          <div className="text-2xl font-bold">{products.length}</div>
        </div>
        <div className="p-4 bg-card border-2 border-border rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Filtered</div>
          <div className="text-2xl font-bold">{filteredProducts.length}</div>
        </div>
        <div className="p-4 bg-card border-2 border-border rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Unsaved Changes</div>
          <div className="text-2xl font-bold text-orange-600">{unsavedCount}</div>
        </div>
        <div className="p-4 bg-card border-2 border-border rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Categories</div>
          <div className="text-2xl font-bold">{categories.length}</div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const edits = editState[product.id] || {};
            const hasChanges = hasUnsavedChanges(product.id);
            const displayProduct = { ...product, ...edits };

            return (
              <motion.div
                key={product.id}
                layout
                className={`bg-card border-2 rounded-lg overflow-hidden transition-all ${
                  hasChanges ? 'border-orange-500 shadow-lg shadow-orange-500/20' : 'border-border hover:border-primary'
                }`}
              >
                {/* Product Image */}
                <div className="relative h-48 bg-muted">
                  <img
                    src={displayProduct.images[0]?.url || ''}
                    alt={displayProduct.name}
                    className="w-full h-full object-cover"
                  />
                  {hasChanges && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                      UNSAVED
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{displayProduct.name}</h3>
                      <p className="text-sm text-muted-foreground">SKU: {displayProduct.sku}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <span className="font-bold">
                        {displayProduct.price === 0 ? 'Contact for Pricing' : `GH₵ ${displayProduct.price}`}
                      </span>
                    </div>
                    {displayProduct.tradePrice && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Trade Price:</span>
                        <span className="font-bold">GH₵ {displayProduct.tradePrice}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Stock:</span>
                      <span className="font-bold">{displayProduct.totalStock}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setViewMode('detail');
                      }}
                      className="flex-1 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    {hasChanges && (
                      <>
                        <button
                          onClick={() => saveProduct(product.id)}
                          disabled={saving}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => discardChanges(product.id)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : selectedProduct ? (
        // Detail View
        <DetailView
          product={selectedProduct}
          edits={editState[selectedProduct.id] || {}}
          onUpdate={(field, value) => updateEditState(selectedProduct.id, field, value)}
          onAddImage={() => setAddImageModal({ productId: selectedProduct.id, show: true })}
          onRemoveImage={(idx) => removeImage(selectedProduct.id, idx)}
          onAddVideo={() => setAddVideoModal({ productId: selectedProduct.id, show: true })}
          onRemoveVideo={(idx) => removeVideo(selectedProduct.id, idx)}
          onSave={() => saveProduct(selectedProduct.id)}
          onDiscard={() => discardChanges(selectedProduct.id)}
          onClose={() => {
            setSelectedProduct(null);
            setViewMode('grid');
          }}
          saving={saving}
          hasChanges={hasUnsavedChanges(selectedProduct.id)}
        />
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          Select a product to view details
        </div>
      )}

      {/* Add Image Modal */}
      {addImageModal.show && (
        <ImageModal
          onAdd={(url) => addImage(addImageModal.productId, url)}
          onClose={() => setAddImageModal({ productId: '', show: false })}
          tempUrl={tempImageUrl}
          setTempUrl={setTempImageUrl}
        />
      )}

      {/* Add Video Modal */}
      {addVideoModal.show && (
        <VideoModal
          onAdd={(url, title) => addVideo(addVideoModal.productId, url, title)}
          onClose={() => setAddVideoModal({ productId: '', show: false })}
          tempUrl={tempVideoUrl}
          setTempUrl={setTempVideoUrl}
          tempTitle={tempVideoTitle}
          setTempTitle={setTempVideoTitle}
        />
      )}
    </div>
  );
}

// Detail View Component
function DetailView({
  product,
  edits,
  onUpdate,
  onAddImage,
  onRemoveImage,
  onAddVideo,
  onRemoveVideo,
  onSave,
  onDiscard,
  onClose,
  saving,
  hasChanges,
}: {
  product: FirestoreProduct;
  edits: ProductEdit;
  onUpdate: (field: keyof ProductEdit, value: any) => void;
  onAddImage: () => void;
  onRemoveImage: (idx: number) => void;
  onAddVideo: () => void;
  onRemoveVideo: (idx: number) => void;
  onSave: () => void;
  onDiscard: () => void;
  onClose: () => void;
  saving: boolean;
  hasChanges: boolean;
}) {
  const displayProduct = { ...product, ...edits };
  const images = edits.images || product.images || [];
  const videos = edits.videos || product.videos || [];

  return (
    <div className="bg-card border-2 border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Edit Product</h3>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="px-3 py-1 bg-orange-500/20 border border-orange-500 rounded-lg text-orange-600 dark:text-orange-400 text-sm font-bold">
              UNSAVED CHANGES
            </span>
          )}
          <button
            onClick={onSave}
            disabled={saving || !hasChanges}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
          {hasChanges && (
            <button
              onClick={onDiscard}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Discard
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg font-bold"
          >
            Close
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-bold mb-2">Product Name</label>
            <input
              type="text"
              value={edits.name ?? product.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Description</label>
            <textarea
              value={edits.description ?? product.description}
              onChange={(e) => onUpdate('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Long Description</label>
            <textarea
              value={edits.longDescription ?? product.longDescription}
              onChange={(e) => onUpdate('longDescription', e.target.value)}
              rows={5}
              className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Price (GH₵)</label>
              <input
                type="number"
                value={edits.price ?? product.price}
                onChange={(e) => onUpdate('price', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Trade Price (GH₵)</label>
              <input
                type="number"
                value={edits.tradePrice ?? product.tradePrice ?? 0}
                onChange={(e) => onUpdate('tradePrice', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Category</label>
              <input
                type="text"
                value={edits.categoryId ?? product.categoryId}
                onChange={(e) => onUpdate('categoryId', e.target.value)}
                className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Subcategory</label>
              <input
                type="text"
                value={edits.subcategory ?? product.subcategory}
                onChange={(e) => onUpdate('subcategory', e.target.value)}
                className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Total Stock</label>
            <input
              type="number"
              value={edits.totalStock ?? product.totalStock}
              onChange={(e) => onUpdate('totalStock', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Right Column - Media */}
        <div className="space-y-6">
          {/* Images */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold">Images ({images.length})</label>
              <button
                onClick={onAddImage}
                className="px-3 py-1 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-2 text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                Add Image
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-32 object-cover rounded-lg border-2 border-border"
                  />
                  <button
                    onClick={() => onRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {img.isPrimary && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-white text-xs font-bold rounded">
                      PRIMARY
                    </div>
                  )}
                </div>
              ))}
              {images.length === 0 && (
                <div className="col-span-2 p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
                  No images yet
                </div>
              )}
            </div>
          </div>

          {/* Videos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold">Videos ({videos.length})</label>
              <button
                onClick={onAddVideo}
                className="px-3 py-1 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-2 text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                Add Video
              </button>
            </div>
            <div className="space-y-2">
              {videos.map((video, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-lg group">
                  <Video className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{video.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{video.url}</div>
                  </div>
                  <button
                    onClick={() => onRemoveVideo(idx)}
                    className="p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {videos.length === 0 && (
                <div className="p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
                  No videos yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Image Modal Component
function ImageModal({
  onAdd,
  onClose,
  tempUrl,
  setTempUrl,
}: {
  onAdd: (url: string) => void;
  onClose: () => void;
  tempUrl: string;
  setTempUrl: (url: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border-2 border-border rounded-lg p-6 max-w-md w-full mx-4"
      >
        <h3 className="text-xl font-bold mb-4">Add Image URL</h3>
        <input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={tempUrl}
          onChange={(e) => setTempUrl(e.target.value)}
          className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary mb-4"
          autoFocus
        />
        {tempUrl && (
          <div className="mb-4">
            <img src={tempUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg border-2 border-border" onError={() => setTempUrl('')} />
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => tempUrl && onAdd(tempUrl)}
            disabled={!tempUrl}
            className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Image
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg font-bold"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Video Modal Component
function VideoModal({
  onAdd,
  onClose,
  tempUrl,
  setTempUrl,
  tempTitle,
  setTempTitle,
}: {
  onAdd: (url: string, title: string) => void;
  onClose: () => void;
  tempUrl: string;
  setTempUrl: (url: string) => void;
  tempTitle: string;
  setTempTitle: (title: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border-2 border-border rounded-lg p-6 max-w-md w-full mx-4"
      >
        <h3 className="text-xl font-bold mb-4">Add Video URL</h3>
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-bold mb-2">Video Title</label>
            <input
              type="text"
              placeholder="Product Demo Video"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Video URL</label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => tempUrl && onAdd(tempUrl, tempTitle)}
            disabled={!tempUrl}
            className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Video
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg font-bold"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
