import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { PromotionalBanner } from './PromotionalBanner';
import { BulkDiscountProduct } from './BulkDiscountProduct';
import { Filter, Search, Tag, TrendingDown } from 'lucide-react';
import { BLACK_FRIDAY_DEFAULTS, subscribeBlackFriday, type BlackFridayCampaign } from '@/lib/black-friday';
import { resolveImageUrl } from '@/lib/product-image-map';
import { csvProducts } from '../data/csvProducts';
import { useCartStore } from '@/stores/cart-store';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';

export function BlackFridayDeals() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [campaign, setCampaign] = useState<BlackFridayCampaign>(BLACK_FRIDAY_DEFAULTS);
  const { addItem } = useCartStore();
  const { user } = useFirebaseAuth();

  useEffect(() => subscribeBlackFriday(setCampaign), []);

  // Promotional products with bulk discount tiers
  const fallbackProducts = [
    {
      id: 'promo-1',
      name: 'Crystal Chandelier - Royal Gold',
      originalPrice: 12500,
      category: 'Luxury Lighting',
      stock: 50,
      discountTiers: [
        { minQuantity: 1, maxQuantity: 2, discountPercent: 0 },
        { minQuantity: 3, maxQuantity: 5, discountPercent: 10 },
        { minQuantity: 6, maxQuantity: 10, discountPercent: 20 },
        { minQuantity: 11, discountPercent: 30 }
      ]
    },
    {
      id: 'promo-2',
      name: 'LED Strip Light (5m)',
      originalPrice: 250,
      category: 'LED Lighting',
      stock: 200,
      discountTiers: [
        { minQuantity: 1, maxQuantity: 2, discountPercent: 0 },
        { minQuantity: 3, maxQuantity: 5, discountPercent: 10 },
        { minQuantity: 6, maxQuantity: 10, discountPercent: 20 },
        { minQuantity: 11, discountPercent: 30 }
      ]
    },
    {
      id: 'promo-3',
      name: 'Solar Panel 300W',
      originalPrice: 1800,
      category: 'Solar Products',
      stock: 30,
      discountTiers: [
        { minQuantity: 1, maxQuantity: 2, discountPercent: 0 },
        { minQuantity: 3, maxQuantity: 5, discountPercent: 10 },
        { minQuantity: 6, maxQuantity: 10, discountPercent: 20 },
        { minQuantity: 11, discountPercent: 30 }
      ]
    },
    {
      id: 'promo-4',
      name: 'Smart Wall Switch',
      originalPrice: 180,
      category: 'Wiring & Switches',
      stock: 150,
      discountTiers: [
        { minQuantity: 1, maxQuantity: 2, discountPercent: 0 },
        { minQuantity: 3, maxQuantity: 5, discountPercent: 10 },
        { minQuantity: 6, maxQuantity: 10, discountPercent: 20 },
        { minQuantity: 11, discountPercent: 30 }
      ]
    },
    {
      id: 'promo-5',
      name: 'Industrial Fan 48"',
      originalPrice: 3200,
      category: 'Industrial',
      stock: 40,
      discountTiers: [
        { minQuantity: 1, maxQuantity: 2, discountPercent: 0 },
        { minQuantity: 3, maxQuantity: 5, discountPercent: 10 },
        { minQuantity: 6, maxQuantity: 10, discountPercent: 20 },
        { minQuantity: 11, discountPercent: 30 }
      ]
    },
    {
      id: 'promo-6',
      name: 'Pendant Light - Modern',
      originalPrice: 850,
      category: 'Luxury Lighting',
      stock: 80,
      discountTiers: [
        { minQuantity: 1, maxQuantity: 2, discountPercent: 0 },
        { minQuantity: 3, maxQuantity: 5, discountPercent: 10 },
        { minQuantity: 6, maxQuantity: 10, discountPercent: 20 },
        { minQuantity: 11, discountPercent: 30 }
      ]
    },
    {
      id: 'promo-7',
      name: 'Circuit Breaker 60A',
      originalPrice: 450,
      category: 'Wiring & Switches',
      stock: 100,
      discountTiers: [
        { minQuantity: 1, maxQuantity: 2, discountPercent: 0 },
        { minQuantity: 3, maxQuantity: 5, discountPercent: 10 },
        { minQuantity: 6, maxQuantity: 10, discountPercent: 20 },
        { minQuantity: 11, discountPercent: 30 }
      ]
    },
    {
      id: 'promo-8',
      name: 'Solar Inverter 5KVA',
      originalPrice: 4500,
      category: 'Solar Products',
      stock: 25,
      discountTiers: [
        { minQuantity: 1, maxQuantity: 2, discountPercent: 0 },
        { minQuantity: 3, maxQuantity: 5, discountPercent: 10 },
        { minQuantity: 6, maxQuantity: 10, discountPercent: 20 },
        { minQuantity: 11, discountPercent: 30 }
      ]
    },
    {
      id: 'promo-9',
      name: 'Emergency Light',
      originalPrice: 120,
      category: 'LED Lighting',
      stock: 120,
      discountTiers: [
        { minQuantity: 1, maxQuantity: 2, discountPercent: 0 },
        { minQuantity: 3, maxQuantity: 5, discountPercent: 10 },
        { minQuantity: 6, maxQuantity: 10, discountPercent: 20 },
        { minQuantity: 11, discountPercent: 30 }
      ]
    },
  ];

  const configuredProducts = campaign.products.some(product => csvProducts.some(catalog => catalog.id === product.id || catalog.sku === product.id))
    ? campaign.products
    : BLACK_FRIDAY_DEFAULTS.products;
  const promotionalProducts = (configuredProducts.length ? configuredProducts : fallbackProducts).map(product => {
    const catalog = csvProducts.find(p => p.id === product.id || p.sku === product.id);
    return catalog ? {
      ...product,
      name: catalog.name,
      category: catalog.category,
      originalPrice: product.originalPrice || catalog.price,
      stock: product.stock || catalog.stock,
      image: resolveImageUrl((product as { image?: string }).image || catalog.image || catalog.name),
      description: catalog.description,
    } : product;
  });
  if (!campaign.enabled) return <div className="min-h-screen bg-background" />;
  const categories = Array.from(new Set(promotionalProducts.map(p => p.category)));

  const filteredProducts = promotionalProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = async (productId: string, quantity: number) => {
    if (!user?.uid) {
      toast.error('Please sign in to add promotional items to your cart');
      return;
    }
    const product = promotionalProducts.find(p => p.id === productId);
    if (!product) {
      toast.error('Product not found');
      return;
    }
    const catalog = csvProducts.find(p => p.id === productId || p.sku === productId);
    const unitPrice = Number(product.originalPrice || catalog?.price || 0);
    const tier = (product.discountTiers || []).find(t =>
      quantity >= t.minQuantity && (t.maxQuantity == null || quantity <= t.maxQuantity)
    );
    const discountPercent = tier?.discountPercent ?? 0;
    const price = Math.max(0, unitPrice * (1 - discountPercent / 100));
    try {
      await addItem(user.uid, {
        productId,
        variantId: null,
        sku: catalog?.sku || productId,
        name: product.name,
        image: resolveImageUrl((product as { image?: string }).image || catalog?.image || product.name),
        price,
        quantity,
        customization: {
          campaign: 'black_friday',
          discountPercent,
          originalPrice: unitPrice,
        },
        isAvailable: (product.stock || 0) > 0,
        stockLevel: product.stock || 0,
      });
      toast.success(discountPercent > 0 ? `Added with ${discountPercent}% bulk discount` : 'Added to cart');
    } catch {
      toast.error('Unable to add item to cart');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Promotional Banner */}
        <PromotionalBanner title={campaign.title} subtitle={campaign.subtitle} />

        {/* How it works section */}
        <div className="mb-8 rounded-2xl border border-[#c9a84c]/25 bg-card p-5 shadow-[0_12px_35px_rgba(15,23,42,.06)] sm:p-8">
          <div className="mb-5 text-center">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[.18em] text-primary">Volume pricing</p>
            <h2 className="text-2xl font-bold tracking-tight">How bulk savings work</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-background p-5 text-center shadow-sm sm:p-6"
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-blue-600" strokeWidth={2} />
              </div>
              <h3 className="font-bold text-lg mb-2">Buy 3-5 Items</h3>
              <p className="text-muted-foreground text-sm mb-2">Get started with savings</p>
                <p className="text-3xl font-bold text-primary">10% OFF</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-background p-5 text-center shadow-sm sm:p-6"
            >
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-8 h-8 text-purple-600" strokeWidth={2} />
              </div>
              <h3 className="font-bold text-lg mb-2">Buy 6-10 Items</h3>
              <p className="text-muted-foreground text-sm mb-2">Better savings unlocked</p>
                <p className="text-3xl font-bold text-primary">20% OFF</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative overflow-hidden rounded-xl border border-[#c9a84c] bg-[linear-gradient(145deg,#2a2d33,#0e1014)] p-5 text-center shadow-sm sm:p-6"
            >
              <div className="absolute top-0 right-0 bg-yellow-400 text-black px-3 py-1 text-xs font-bold rounded-bl-lg">
                BEST VALUE
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Buy 11+ Items</h3>
              <p className="text-white/90 text-sm mb-2">Maximum savings!</p>
                <p className="text-4xl font-bold text-[#f1d58a]">30% OFF</p>
            </motion.div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search promotional products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-card rounded-xl border-2 border-border focus:border-primary focus:outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 bg-card rounded-xl border-2 border-border focus:border-primary focus:outline-none min-w-[200px]"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <BulkDiscountProduct
                {...product}
                onAddToCart={handleAddToCart}
              />
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Tag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">No promotional products found</p>
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 rounded-2xl border border-[#c9a84c]/45 bg-[linear-gradient(135deg,#202226,#0e1014)] p-8 text-center text-white shadow-[0_18px_50px_rgba(0,0,0,.18)]"
        >
          <h2 className="text-3xl font-bold mb-2">Don't Miss Out!</h2>
          <p className="text-lg mb-6">Stock up now and save big with our bulk discount deals</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <p className="text-sm opacity-90">Over</p>
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm">Products on Sale</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <p className="text-sm opacity-90">Save up to</p>
              <p className="text-3xl font-bold">30%</p>
              <p className="text-sm">On Bulk Orders</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <p className="text-sm opacity-90">Free Shipping</p>
              <p className="text-3xl font-bold">GH₵500+</p>
              <p className="text-sm">Minimum Order</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
