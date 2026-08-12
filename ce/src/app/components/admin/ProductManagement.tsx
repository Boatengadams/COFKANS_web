import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  Package,
  DollarSign,
  Tag,
  Image as ImageIcon,
  Star,
  BarChart3,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FirestoreProduct } from '@/types/firestore';
import { uploadPublicMedia } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface ProductManagementProps {
  onClose?: () => void;
}

const categories = [
  'luxury',
  'solar',
  'wiring',
  'industrial',
  'appliances',
];

const subcategories = [
  'Chandeliers',
  'Lamps',
  'Ceiling Lights',
  'Wall Lights',
  'Floodlights',
  'Outdoor',
  'Fans',
  'Commercial',
  'Switches',
  'Sockets',
  'Elite Switches',
  'Extension Sockets',
  'Breakers',
  'Mounting',
  'Protection',
  'Cables',
  'Ceiling Fans',
  'Wall Fans',
  'Bulbs',
];

export const ProductManagement: React.FC<ProductManagementProps> = ({ onClose }) => {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<FirestoreProduct | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: 0,
    tradePrice: 0,
    category: 'luxury',
    subcategory: 'Chandeliers',
    image: '',
    stock: 0,
    description: '',
    featured: false,
    badge: '',
    rating: 0,
    reviews: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreProduct[];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const { publicUrl } = await uploadPublicMedia(file, {
        folder: 'Products',
        pathPrefix: formData.sku || formData.name || 'product',
      });

      setFormData(prev => ({ ...prev, image: publicUrl }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.sku || formData.price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        tradePrice: Number(formData.tradePrice) || null,
        stock: Number(formData.stock),
        rating: Number(formData.rating) || null,
        reviews: Number(formData.reviews) || null,
        images: formData.image
          ? [{ url: formData.image, alt: formData.name, isPrimary: true, order: 0 }]
          : [],
        updatedAt: serverTimestamp(),
      };

      if (editingProduct) {
        const productRef = doc(db, 'products', editingProduct.id);
        await updateDoc(productRef, productData);
        toast.success('Product updated successfully!');
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp(),
        });
        toast.success('Product added successfully!');
      }

      setEditingProduct(null);
      setIsAddingNew(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteDoc(doc(db, 'products', productId));
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product: FirestoreProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price,
      tradePrice: product.tradePrice || 0,
      category: product.category || 'luxury',
      subcategory: product.subcategory || 'Chandeliers',
      image: product.image || '',
      stock: product.stock || 0,
      description: product.description || '',
      featured: product.featured || false,
      badge: product.badge || '',
      rating: product.rating || 0,
      reviews: product.reviews || 0,
    });
    setIsAddingNew(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      price: 0,
      tradePrice: 0,
      category: 'luxury',
      subcategory: 'Chandeliers',
      image: '',
      stock: 0,
      description: '',
      featured: false,
      badge: '',
      rating: 0,
      reviews: 0,
    });
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setIsAddingNew(false);
    resetForm();
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: products.length,
    inStock: products.filter(p => (p.stock || 0) > 0).length,
    outOfStock: products.filter(p => (p.stock || 0) === 0).length,
    featured: products.filter(p => p.featured).length,
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Product Management</h2>
          <p className="text-[var(--color-text-secondary)] mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={() => setIsAddingNew(true)}
          className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-6 h-6 text-[var(--color-primary)]" />
            <span className="text-sm text-[var(--color-text-secondary)]">Total Products</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.total}</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-sm text-[var(--color-text-secondary)]">In Stock</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.inStock}</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <span className="text-sm text-[var(--color-text-secondary)]">Out of Stock</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.outOfStock}</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-6 h-6 text-yellow-500" />
            <span className="text-sm text-[var(--color-text-secondary)]">Featured</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.featured}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products by name, SKU, or category..."
          className="w-full pl-12 pr-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>

      <AnimatePresence>
        {isAddingNew && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)] shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[var(--color-text-tertiary)]" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="e.g., Luxury Crystal Chandelier"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="e.g., LUX-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Price (GH₵) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Trade Price (GH₵)
                </label>
                <input
                  type="number"
                  value={formData.tradePrice}
                  onChange={(e) => setFormData({ ...formData, tradePrice: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Subcategory *
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  {subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Badge (Optional)
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="e.g., New, Sale, Premium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Detailed product description..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Product Image
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[var(--color-primary)] file:text-white file:cursor-pointer hover:file:bg-[var(--color-primary-dark)]"
                  />
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg border border-[var(--color-border)]"
                    />
                  )}
                </div>
                {uploading && (
                  <p className="text-sm text-[var(--color-primary)] mt-2">Uploading image...</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                  Featured Product
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={uploading}
                className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-primary)]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text-primary)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-[var(--color-surface-hover)] rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-[var(--color-text-tertiary)]" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-[var(--color-text-primary)]">{product.name}</p>
                          {product.badge && (
                            <span className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-0.5 rounded">
                              {product.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                      {product.category}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-[var(--color-text-primary)]">
                          GH₵ {product.price.toFixed(2)}
                        </p>
                        {product.tradePrice && (
                          <p className="text-xs text-[var(--color-text-tertiary)]">
                            Trade: GH₵ {product.tradePrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                      {product.stock || 0}
                    </td>
                    <td className="px-6 py-4">
                      {(product.stock || 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-600 text-xs font-medium">
                          <AlertCircle className="w-3 h-3" />
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-500/10 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-12 text-center">
              <Package className="w-12 h-12 text-[var(--color-text-tertiary)] mx-auto mb-3" />
              <p className="text-[var(--color-text-secondary)]">No products found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
