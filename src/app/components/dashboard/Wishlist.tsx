import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, ShoppingCart, Trash2, Search } from 'lucide-react';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc as fsGetDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEMO_MODE } from '@/lib/demo-mode';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { useCartStore } from '@/stores/cart-store';
import toast from 'react-hot-toast';

interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage?: string;
  addedAt: Date;
}

export function Wishlist() {
  const { user } = useFirebaseAuth();
  const { addItem } = useCartStore();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadWishlist();
  }, [user]);

  const loadWishlist = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    if (DEMO_MODE) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const wishlistQuery = query(
        collection(db, 'wishlists'),
        where('userId', '==', user.uid)
      );

      const snapshot = await getDocs(wishlistQuery);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        addedAt: doc.data().addedAt?.toDate() || new Date()
      })) as WishlistItem[];

      setWishlistItems(items);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      toast.error('Unable to load your wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    if (DEMO_MODE) {
      setWishlistItems(items => items.filter(item => item.id !== itemId));
      toast.success('Removed from wishlist');
      return;
    }
    try {
      await deleteDoc(doc(db, 'wishlists', itemId));
      setWishlistItems(items => items.filter(item => item.id !== itemId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      toast.error('Unable to remove item');
    }
  };

  const moveToCart = async (item: WishlistItem) => {
    if (!user?.uid) return;

    if (DEMO_MODE) {
      await addItem(user.uid, {
        productId: item.productId,
        variantId: null,
        sku: '',
        name: item.productName,
        image: item.productImage || '',
        price: item.productPrice,
        quantity: 1,
        customization: null,
        isAvailable: true,
        stockLevel: 99,
      });
      setWishlistItems(items => items.filter(i => i.id !== item.id));
      return;
    }

    try {
      const productSnap = await fsGetDoc(doc(db, 'products', item.productId));

      if (!productSnap.exists()) {
        toast.error('Product not found');
        return;
      }

      const product = productSnap.data();

      // Add to cart with proper CartItem structure
      await addItem(user.uid, {
        productId: item.productId,
        variantId: null,
        sku: product.sku || '',
        name: item.productName,
        image: item.productImage || product.image || '',
        price: item.productPrice,
        quantity: 1,
        customization: null,
        isAvailable: (product.stock || 0) > 0,
        stockLevel: product.stock || 0,
      });

      await removeFromWishlist(item.id);
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Failed to move to cart:', error);
      toast.error('Unable to add to cart');
    }
  };

  const filteredItems = wishlistItems.filter(item =>
    item.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Wishlist</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
      </div>

      {/* Search */}
      {wishlistItems.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search wishlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      )}

      {/* Wishlist Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-card border-2 border-border rounded-2xl p-12 text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? 'No items match your search'
              : 'Save your favorite items for later'}
          </p>
          {!searchQuery && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const productsSection = document.getElementById('products');
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: 'smooth' });
                  window.history.pushState({}, '', '/');
                }
              }}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Browse Products
            </motion.button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border-2 border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors group"
            >
              {/* Product Image */}
              <div className="aspect-square bg-muted relative overflow-hidden">
                {item.productImage ? (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Heart className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                </motion.button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-2">
                  {item.productName}
                </h3>
                <div className="text-2xl font-bold text-primary mb-4">
                  GH₵ {item.productPrice.toFixed(2)}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => moveToCart(item)}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => removeFromWishlist(item.id)}
                    className="px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-500/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
