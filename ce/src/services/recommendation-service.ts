import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { usePersonalizationStore } from '@/stores/personalization-store';

// Mirror events to the local personalization store so recommendations work offline / in demo mode.
const local = () => usePersonalizationStore.getState();

export interface UserActivity {
  userId: string;
  searchHistory: SearchQuery[];
  viewedProducts: ViewedProduct[];
  wishlistItems: string[];
  purchaseHistory: PurchaseItem[];
  lastUpdated: Timestamp;
}

export interface SearchQuery {
  term: string;
  timestamp: Timestamp;
  category?: string;
}

export interface ViewedProduct {
  productId: string;
  productName: string;
  category: string;
  timestamp: Timestamp;
  viewDuration?: number;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  category: string;
  timestamp: Timestamp;
  quantity: number;
  price: number;
}

export const trackSearch = async (userId: string, searchTerm: string, category?: string) => {
  local().track({ kind: 'search', query: searchTerm, at: Date.now() });
  try {
    const activityRef = doc(db, 'userActivity', userId);
    const activityDoc = await getDoc(activityRef);

    const searchQuery: SearchQuery = {
      term: searchTerm.toLowerCase().trim(),
      timestamp: Timestamp.now(),
      category,
    };

    if (activityDoc.exists()) {
      const existingData = activityDoc.data() as UserActivity;
      const searchHistory = existingData.searchHistory || [];

      // Keep only last 50 searches
      const updatedHistory = [searchQuery, ...searchHistory].slice(0, 50);

      await updateDoc(activityRef, {
        searchHistory: updatedHistory,
        lastUpdated: serverTimestamp(),
      });
    } else {
      await setDoc(activityRef, {
        userId,
        searchHistory: [searchQuery],
        viewedProducts: [],
        wishlistItems: [],
        purchaseHistory: [],
        lastUpdated: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error tracking search:', error);
  }
};

export const trackProductView = async (
  userId: string,
  productId: string,
  productName: string,
  category: string,
  viewDuration?: number
) => {
  local().track({ kind: 'view', productId, category, at: Date.now() });
  if (viewDuration && viewDuration > 0) {
    local().track({ kind: 'dwell', productId, ms: viewDuration, at: Date.now() });
  }
  try {
    const activityRef = doc(db, 'userActivity', userId);
    const activityDoc = await getDoc(activityRef);

    const viewedProduct: ViewedProduct = {
      productId,
      productName,
      category,
      timestamp: Timestamp.now(),
      viewDuration,
    };

    if (activityDoc.exists()) {
      const existingData = activityDoc.data() as UserActivity;
      const viewedProducts = existingData.viewedProducts || [];

      // Remove duplicates and keep last 100 views
      const filteredViews = viewedProducts.filter(v => v.productId !== productId);
      const updatedViews = [viewedProduct, ...filteredViews].slice(0, 100);

      await updateDoc(activityRef, {
        viewedProducts: updatedViews,
        lastUpdated: serverTimestamp(),
      });
    } else {
      await setDoc(activityRef, {
        userId,
        searchHistory: [],
        viewedProducts: [viewedProduct],
        wishlistItems: [],
        purchaseHistory: [],
        lastUpdated: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
};

export const trackWishlistAdd = async (userId: string, productId: string) => {
  local().track({ kind: 'wishlist', productId, at: Date.now() });
  try {
    const activityRef = doc(db, 'userActivity', userId);
    await setDoc(
      activityRef,
      {
        userId,
        wishlistItems: arrayUnion(productId),
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error tracking wishlist add:', error);
  }
};

export const trackWishlistRemove = async (userId: string, productId: string) => {
  try {
    const activityRef = doc(db, 'userActivity', userId);
    const activityDoc = await getDoc(activityRef);

    if (activityDoc.exists()) {
      const existingData = activityDoc.data() as UserActivity;
      const wishlistItems = (existingData.wishlistItems || []).filter(id => id !== productId);

      await updateDoc(activityRef, {
        wishlistItems,
        lastUpdated: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error tracking wishlist remove:', error);
  }
};

export const trackPurchase = async (
  userId: string,
  items: Array<{ productId: string; productName: string; category: string; quantity: number; price: number }>
) => {
  const now = Date.now();
  for (const it of items) local().track({ kind: 'purchase', productId: it.productId, category: it.category, at: now });
  try {
    const activityRef = doc(db, 'userActivity', userId);
    const activityDoc = await getDoc(activityRef);

    const purchaseItems: PurchaseItem[] = items.map(item => ({
      ...item,
      timestamp: Timestamp.now(),
    }));

    if (activityDoc.exists()) {
      const existingData = activityDoc.data() as UserActivity;
      const purchaseHistory = existingData.purchaseHistory || [];

      // Keep all purchases
      const updatedHistory = [...purchaseItems, ...purchaseHistory];

      await updateDoc(activityRef, {
        purchaseHistory: updatedHistory,
        lastUpdated: serverTimestamp(),
      });
    } else {
      await setDoc(activityRef, {
        userId,
        searchHistory: [],
        viewedProducts: [],
        wishlistItems: [],
        purchaseHistory: purchaseItems,
        lastUpdated: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error tracking purchase:', error);
  }
};

export const getUserActivity = async (userId: string): Promise<UserActivity | null> => {
  try {
    const activityRef = doc(db, 'userActivity', userId);
    const activityDoc = await getDoc(activityRef);

    if (activityDoc.exists()) {
      return activityDoc.data() as UserActivity;
    }
    return null;
  } catch (error) {
    console.error('Error getting user activity:', error);
    return null;
  }
};

export interface ProductScore {
  productId: string;
  score: number;
  reasons: string[];
}

export const getPersonalizedRecommendations = async (
  userId: string,
  allProducts: Array<{ id: string; name: string; category: string; subcategory: string }>
): Promise<string[]> => {
  try {
    const activity = await getUserActivity(userId);
    if (!activity) return [];

    const productScores: Map<string, ProductScore> = new Map();

    // Initialize scores
    allProducts.forEach(product => {
      productScores.set(product.id, {
        productId: product.id,
        score: 0,
        reasons: [],
      });
    });

    // Score based on search history (high weight)
    activity.searchHistory?.forEach((search, index) => {
      const recency = Math.max(0, 1 - index / 50); // Recent searches score higher
      allProducts.forEach(product => {
        const score = productScores.get(product.id)!;

        if (
          product.name.toLowerCase().includes(search.term) ||
          product.category.toLowerCase().includes(search.term) ||
          product.subcategory.toLowerCase().includes(search.term)
        ) {
          score.score += 10 * recency;
          score.reasons.push(`Searched: "${search.term}"`);
        }
      });
    });

    // Score based on viewed products (medium weight)
    activity.viewedProducts?.forEach((view, index) => {
      const recency = Math.max(0, 1 - index / 100);
      allProducts.forEach(product => {
        const score = productScores.get(product.id)!;

        // Same product
        if (product.id === view.productId) {
          score.score += 5 * recency;
          score.reasons.push('You viewed this');
        }

        // Same category
        if (product.category === view.category && product.id !== view.productId) {
          score.score += 3 * recency;
          score.reasons.push(`Similar to viewed: ${view.category}`);
        }
      });
    });

    // Score based on wishlist (very high weight)
    activity.wishlistItems?.forEach(wishlistId => {
      const wishlistProduct = allProducts.find(p => p.id === wishlistId);
      if (wishlistProduct) {
        allProducts.forEach(product => {
          const score = productScores.get(product.id)!;

          // Same product
          if (product.id === wishlistId) {
            score.score += 15;
            score.reasons.push('In your wishlist');
          }

          // Same category as wishlist item
          if (product.category === wishlistProduct.category && product.id !== wishlistId) {
            score.score += 5;
            score.reasons.push(`Similar to wishlist: ${wishlistProduct.category}`);
          }
        });
      }
    });

    // Score based on purchase history (highest weight for category affinity)
    const categoryPurchases: Map<string, number> = new Map();
    activity.purchaseHistory?.forEach(purchase => {
      categoryPurchases.set(purchase.category, (categoryPurchases.get(purchase.category) || 0) + 1);
    });

    allProducts.forEach(product => {
      const score = productScores.get(product.id)!;
      const categoryCount = categoryPurchases.get(product.category) || 0;

      if (categoryCount > 0) {
        score.score += 8 * categoryCount;
        score.reasons.push(`You bought ${categoryCount} ${product.category} item(s)`);
      }
    });

    // Sort by score and return top product IDs
    const sortedProducts = Array.from(productScores.values())
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(p => p.productId);

    return sortedProducts;
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [];
  }
};
