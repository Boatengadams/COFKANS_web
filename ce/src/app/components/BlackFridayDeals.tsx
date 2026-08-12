import { useState } from 'react';
import { motion } from 'motion/react';
import { PromotionalBanner } from './PromotionalBanner';
import { BulkDiscountProduct } from './BulkDiscountProduct';
import { Filter, Search, Tag, TrendingDown } from 'lucide-react';

export function BlackFridayDeals() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Promotional products with bulk discount tiers
  const promotionalProducts = [
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

  const categories = Array.from(new Set(promotionalProducts.map(p => p.category)));

  const filteredProducts = promotionalProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (productId: string, quantity: number) => {
    console.log(`Added product ${productId} with quantity ${quantity} to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Promotional Banner */}
        <PromotionalBanner />

        {/* How it works section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">🎁 How Bulk Savings Work</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-card rounded-xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-blue-600" strokeWidth={2} />
              </div>
              <h3 className="font-bold text-lg mb-2">Buy 3-5 Items</h3>
              <p className="text-muted-foreground text-sm mb-2">Get started with savings</p>
              <p className="text-3xl font-bold text-blue-600">10% OFF</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-card rounded-xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-8 h-8 text-purple-600" strokeWidth={2} />
              </div>
              <h3 className="font-bold text-lg mb-2">Buy 6-10 Items</h3>
              <p className="text-muted-foreground text-sm mb-2">Better savings unlocked</p>
              <p className="text-3xl font-bold text-purple-600">20% OFF</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-yellow-400 text-black px-3 py-1 text-xs font-bold rounded-bl-lg">
                BEST VALUE
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Buy 11+ Items</h3>
              <p className="text-white/90 text-sm mb-2">Maximum savings!</p>
              <p className="text-4xl font-bold text-yellow-300">30% OFF</p>
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
          className="mt-12 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-center text-white"
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
