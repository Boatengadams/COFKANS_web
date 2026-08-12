import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, TrendingUp, Heart, ShoppingCart, Eye } from 'lucide-react';
import { getPersonalizedRecommendations } from '@/services/recommendation-service';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FirestoreUser, FirestoreProduct } from '@/types/firestore';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  subcategory: string;
  image: string;
  rating?: number;
  stock?: number;
}

interface PersonalizedRecommendationsProps {
  user: FirestoreUser | null;
  onRequireAuth: () => void;
}

export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  user,
  onRequireAuth,
}) => {
  const [recommendedProducts, setRecommendedProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<FirestoreProduct[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user && allProducts.length > 0) {
      loadRecommendations();
    } else {
      setLoading(false);
    }
  }, [user, allProducts]);

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreProduct[];
      setAllProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const loadRecommendations = async () => {
    if (!user || allProducts.length === 0) return;

    setLoading(true);
    try {
      const simplifiedProducts = allProducts.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category || '',
        subcategory: p.subcategory || '',
      }));

      const recommendedIds = await getPersonalizedRecommendations(user.id, simplifiedProducts);

      const recommended = recommendedIds
        .map(id => allProducts.find(p => p.id === id))
        .filter((p): p is FirestoreProduct => p !== undefined)
        .slice(0, 8);

      setRecommendedProducts(recommended);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return null;
  }

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-[var(--color-primary)]/10 rounded-xl">
          <TrendingUp className="w-6 h-6 text-[var(--color-primary)]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Recommended for You</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Based on your searches, views, and purchase history
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recommendedProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)] hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => {
              const productsSection = document.getElementById('products');
              if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <div className="relative mb-3">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
              )}
              <div className="absolute top-2 right-2 bg-[var(--color-primary)] text-white px-2 py-1 rounded-full text-xs font-bold">
                For You
              </div>
            </div>

            <h3 className="font-semibold text-[var(--color-text-primary)] text-sm mb-1 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
              {product.name}
            </h3>

            <p className="text-xs text-[var(--color-text-tertiary)] mb-2">{product.sku}</p>

            {product.rating && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                <span className="text-xs text-[var(--color-text-secondary)]">{product.rating.toFixed(1)}</span>
              </div>
            )}

            <div className="flex items-center justify-between mt-3">
              <p className="text-lg font-bold text-[var(--color-primary)]">GH₵ {product.price.toFixed(2)}</p>
              <div className="text-xs text-[var(--color-text-tertiary)]">View →</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
