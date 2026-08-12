import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Package, TrendingUp, Clock, MapPin, Check } from 'lucide-react';

export function InventoryChecker() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');

  const warehouses = [
    { id: 'all', name: 'All Locations', stock: 15420 },
    { id: 'accra', name: 'Accra Main', stock: 8240 },
    { id: 'kumasi', name: 'Kumasi Branch', stock: 4890 },
    { id: 'takoradi', name: 'Takoradi Depot', stock: 2290 },
  ];

  const inventoryItems = [
    {
      sku: 'CFK-SW-001',
      name: 'Premium Gold Wall Switch',
      category: 'Switches',
      stock: 1240,
      status: 'in_stock',
      price: 450,
      minOrder: 10,
      trend: 'up',
    },
    {
      sku: 'CFK-CH-045',
      name: 'Crystal Chandelier 8-Light',
      category: 'Lighting',
      stock: 45,
      status: 'low_stock',
      price: 12500,
      minOrder: 1,
      trend: 'stable',
    },
    {
      sku: 'CFK-CB-200',
      name: 'Industrial Cable 240V 16mm²',
      category: 'Cables',
      stock: 5600,
      status: 'in_stock',
      price: 85,
      minOrder: 100,
      trend: 'up',
    },
    {
      sku: 'CFK-SM-100',
      name: 'Smart Home Control Panel',
      category: 'Smart Systems',
      stock: 8,
      status: 'low_stock',
      price: 8900,
      minOrder: 1,
      trend: 'down',
    },
    {
      sku: 'CFK-PL-330',
      name: 'LED Panel Light 60x60cm',
      category: 'Lighting',
      stock: 890,
      status: 'in_stock',
      price: 680,
      minOrder: 20,
      trend: 'up',
    },
  ];

  const filteredItems = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/30' };
      case 'low_stock':
        return { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30' };
      default:
        return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' };
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up')
      return <TrendingUp className="w-4 h-4 text-secondary rotate-0" />;
    if (trend === 'down')
      return <TrendingUp className="w-4 h-4 text-primary rotate-180" />;
    return <div className="w-4 h-1 bg-muted-foreground rounded-full" />;
  };

  return (
    <div className="w-full space-y-8">
      {/* Header & Search */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-card rounded-xl border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all duration-300"
          />
        </div>

        {/* Warehouse Selector */}
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-card rounded-xl border border-border text-foreground focus:outline-none focus:border-primary transition-all duration-300 appearance-none cursor-pointer"
          >
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id} className="bg-card">
                {wh.name} ({wh.stock.toLocaleString()} items)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-6 rounded-xl border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Total SKUs</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {inventoryItems.length.toLocaleString()}
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Check className="w-5 h-5 text-secondary" />
            <span className="text-sm text-muted-foreground">In Stock</span>
          </div>
          <div className="text-2xl font-bold text-secondary">
            {inventoryItems.filter((i) => i.status === 'in_stock').length}
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Low Stock</span>
          </div>
          <div className="text-2xl font-bold text-primary">
            {inventoryItems.filter((i) => i.status === 'low_stock').length}
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-secondary" />
            <span className="text-sm text-muted-foreground">Trending Up</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {inventoryItems.filter((i) => i.trend === 'up').length}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item, index) => {
                const statusStyle = getStatusColor(item.status);
                return (
                  <motion.tr
                    key={item.sku}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/30 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-foreground">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs font-mono text-secondary">{item.sku}</code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-foreground">
                        {item.stock.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Min: {item.minOrder}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}
                      >
                        {item.status === 'in_stock' ? 'In Stock' : 'Low Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-primary">
                        GH₵ {item.price.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">{getTrendIcon(item.trend)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all duration-200 shadow-sm"
                      >
                        Quick Order
                      </motion.button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Order CTA */}
      <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-xl font-bold mb-2">Need to Place a Bulk Order?</h4>
            <p className="text-sm text-muted-foreground">
              Get instant quotes and special pricing for orders over 1000 units
            </p>
          </div>
          <button className="px-8 py-4 bg-secondary text-white rounded-xl font-medium hover:bg-secondary/90 transition-all duration-200 shadow-md whitespace-nowrap">
            Upload BOM / Get Quote
          </button>
        </div>
      </div>
    </div>
  );
}
