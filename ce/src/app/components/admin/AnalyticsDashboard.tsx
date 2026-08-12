import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { collection, getDocs, query, where, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FirestoreOrder, FirestoreProduct } from '@/types/firestore';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Star,
  Calendar,
  RefreshCw,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
  Clock,
  Activity,
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface ProductData {
  name: string;
  sales: number;
  revenue: number;
}

interface CategoryData {
  name: string;
  value: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const autoRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    totalUsers: 0,
    customerCount: 0,
    driverCount: 0,
    technicianCount: 0,
    adminCount: 0,
    productsActive: 0,
    productsOutOfStock: 0,
    // New metrics
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  useEffect(() => {
    if (autoRefresh) {
      autoRefreshInterval.current = setInterval(() => {
        fetchAnalytics();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
  }, [autoRefresh, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = Timestamp.fromDate(subDays(new Date(), timeRange));
      const previousStartDate = Timestamp.fromDate(subDays(new Date(), timeRange * 2));
      const previousEndDate = startDate;

      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('createdAt', '>=', startDate));
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreOrder[];

      // Get previous period data for growth comparison
      const previousQ = query(
        ordersRef,
        where('createdAt', '>=', previousStartDate),
        where('createdAt', '<', previousEndDate)
      );
      const previousSnapshot = await getDocs(previousQ);
      const previousOrders = previousSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreOrder[];

      const [usersSnap, productsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'products')),
      ]);
      const roleCounts = { customer: 0, driver: 0, technician: 0, manager: 0, management_support: 0 } as Record<string, number>;
      usersSnap.forEach(d => { const r = (d.data() as any).role || 'customer'; roleCounts[r] = (roleCounts[r] || 0) + 1; });
      let productsActive = 0, productsOOS = 0;
      productsSnap.forEach(d => {
        const p = d.data() as any;
        if (p.status === 'active') productsActive++;
        if ((p.totalStock ?? 0) <= 0) productsOOS++;
      });

      // Calculate order status counts
      const statusCounts = {
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        completed: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
      };

      processSalesData(orders);
      processTopProducts(orders);
      processCategoryData(orders);
      calculateStats(orders, previousOrders, {
        totalUsers: usersSnap.size,
        customerCount: roleCounts.customer,
        driverCount: roleCounts.driver,
        technicianCount: roleCounts.technician,
        adminCount: roleCounts.manager,
        productsActive,
        productsOutOfStock: productsOOS,
        ...statusCounts,
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processSalesData = (orders: FirestoreOrder[]) => {
    const salesMap = new Map<string, { revenue: number; orders: number }>();

    for (let i = timeRange - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'MMM dd');
      salesMap.set(date, { revenue: 0, orders: 0 });
    }

    orders.forEach(order => {
      if (order.status !== 'cancelled' && order.createdAt) {
        const date = format(
          order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt),
          'MMM dd'
        );
        const current = salesMap.get(date) || { revenue: 0, orders: 0 };
        salesMap.set(date, {
          revenue: current.revenue + (order.total || 0),
          orders: current.orders + 1,
        });
      }
    });

    const data = Array.from(salesMap.entries()).map(([date, values]) => ({
      date,
      revenue: Math.round(values.revenue),
      orders: values.orders,
    }));

    setSalesData(data);
  };

  const processTopProducts = (orders: FirestoreOrder[]) => {
    const productMap = new Map<string, { sales: number; revenue: number }>();

    orders.forEach(order => {
      if (order.status !== 'cancelled' && order.items) {
        order.items.forEach(item => {
          const current = productMap.get(item.name) || { sales: 0, revenue: 0 };
          productMap.set(item.name, {
            sales: current.sales + item.quantity,
            revenue: current.revenue + item.price * item.quantity,
          });
        });
      }
    });

    const data = Array.from(productMap.entries())
      .map(([name, values]) => ({
        name: name.length > 30 ? name.substring(0, 30) + '...' : name,
        sales: values.sales,
        revenue: Math.round(values.revenue),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    setTopProducts(data);
  };

  const processCategoryData = (orders: FirestoreOrder[]) => {
    const categoryMap = new Map<string, number>();

    orders.forEach(order => {
      if (order.status !== 'cancelled' && order.items) {
        order.items.forEach(item => {
          const current = categoryMap.get(item.productId) || 0;
          categoryMap.set(item.productId, current + item.price * item.quantity);
        });
      }
    });

    const data = [
      { name: 'Luxury Lighting', value: 0 },
      { name: 'Solar & Infrastructure', value: 0 },
      { name: 'Smart Accessories', value: 0 },
      { name: 'Industrial Control', value: 0 },
      { name: 'Fans & Appliances', value: 0 },
    ];

    categoryMap.forEach((value, key) => {
      if (key.startsWith('lux')) data[0].value += value;
      else if (key.startsWith('sol')) data[1].value += value;
      else if (key.startsWith('wire')) data[2].value += value;
      else if (key.startsWith('ind')) data[3].value += value;
      else if (key.startsWith('fan') || key.startsWith('bulb')) data[4].value += value;
    });

    setCategoryData(data.filter(d => d.value > 0).map(d => ({ ...d, value: Math.round(d.value) })));
  };

  const calculateStats = (
    orders: FirestoreOrder[],
    previousOrders: FirestoreOrder[],
    extra: {
      totalUsers: number;
      customerCount: number;
      driverCount: number;
      technicianCount: number;
      adminCount: number;
      productsActive: number;
      productsOutOfStock: number;
      pending: number;
      processing: number;
      completed: number;
      cancelled: number;
    }
  ) => {
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = validOrders.length;
    const uniqueCustomers = new Set(validOrders.map(o => o.userId)).size;

    // Previous period metrics for growth calculation
    const previousValidOrders = previousOrders.filter(o => o.status !== 'cancelled');
    const previousRevenue = previousValidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const previousOrderCount = previousValidOrders.length;

    // Calculate growth percentages
    const revenueGrowth =
      previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const ordersGrowth =
      previousOrderCount > 0 ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100 : 0;

    const today = startOfDay(new Date());
    const weekAgo = subDays(today, 7);

    const todayRevenue = validOrders
      .filter(o => {
        const orderDate = o.createdAt instanceof Timestamp ? o.createdAt.toDate() : new Date(o.createdAt);
        return orderDate >= today;
      })
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const weekRevenue = validOrders
      .filter(o => {
        const orderDate = o.createdAt instanceof Timestamp ? o.createdAt.toDate() : new Date(o.createdAt);
        return orderDate >= weekAgo;
      })
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const monthRevenue = totalRevenue;

    setStats({
      totalRevenue,
      totalOrders,
      totalCustomers: uniqueCustomers,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      revenueGrowth,
      ordersGrowth,
      pendingOrders: extra.pending,
      processingOrders: extra.processing,
      completedOrders: extra.completed,
      cancelledOrders: extra.cancelled,
      totalUsers: extra.totalUsers,
      customerCount: extra.customerCount,
      driverCount: extra.driverCount,
      technicianCount: extra.technicianCount,
      adminCount: extra.adminCount,
      productsActive: extra.productsActive,
      productsOutOfStock: extra.productsOutOfStock,
    });
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const GrowthIndicator = ({ value }: { value: number }) => {
    if (Math.abs(value) < 0.1) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
          <Minus className="w-3 h-3" /> 0%
        </span>
      );
    }
    if (value > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-green-600">
          <ArrowUp className="w-3 h-3" /> {value.toFixed(1)}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-600">
        <ArrowDown className="w-3 h-3" /> {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  const exportData = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Revenue', `GH₵ ${stats.totalRevenue.toLocaleString()}`],
      ['Total Orders', stats.totalOrders.toString()],
      ['Customers', stats.totalCustomers.toString()],
      ['Average Order Value', `GH₵ ${Math.round(stats.averageOrderValue)}`],
      ['Revenue Growth', `${stats.revenueGrowth.toFixed(1)}%`],
      ['Orders Growth', `${stats.ordersGrowth.toFixed(1)}%`],
      ['Pending Orders', stats.pendingOrders.toString()],
      ['Processing Orders', stats.processingOrders.toString()],
      ['Completed Orders', stats.completedOrders.toString()],
      ['Cancelled Orders', stats.cancelledOrders.toString()],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Analytics Dashboard</h2>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Real-time store performance and insights
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-[var(--color-text-tertiary)]">
            <Clock className="w-3 h-3" />
            Last updated: {format(lastUpdate, 'MMM dd, yyyy HH:mm:ss')}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg border-2 text-sm font-bold transition-colors ${
              autoRefresh
                ? 'border-green-500 text-green-600 bg-green-50'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-1" />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
          <button
            onClick={exportData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="text-sm text-[var(--color-text-secondary)]">Total Revenue</span>
                </div>
                <GrowthIndicator value={stats.revenueGrowth} />
              </div>
              <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                GH₵ {stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Last {timeRange} days</p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-green-500" />
                  </div>
                  <span className="text-sm text-[var(--color-text-secondary)]">Total Orders</span>
                </div>
                <GrowthIndicator value={stats.ordersGrowth} />
              </div>
              <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.totalOrders}</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                Avg: GH₵ {Math.round(stats.averageOrderValue)}
              </p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
                <span className="text-sm text-[var(--color-text-secondary)]">Customers</span>
              </div>
              <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.totalCustomers}</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Unique buyers</p>
            </div>

            <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-sm text-[var(--color-text-secondary)]">Today's Revenue</span>
              </div>
              <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                GH₵ {Math.round(stats.todayRevenue).toLocaleString()}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                Week: GH₵ {Math.round(stats.weekRevenue).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Pending', value: stats.pendingOrders, icon: Clock, tint: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
              { label: 'Processing', value: stats.processingOrders, icon: Activity, tint: 'bg-blue-500/10 text-blue-600 border-blue-200' },
              { label: 'Completed', value: stats.completedOrders, icon: ShoppingCart, tint: 'bg-green-500/10 text-green-600 border-green-200' },
              { label: 'Cancelled', value: stats.cancelledOrders, icon: TrendingDown, tint: 'bg-red-500/10 text-red-600 border-red-200' },
            ].map(card => (
              <div key={card.label} className={`rounded-xl p-4 border ${card.tint}`}>
                <div className="flex items-center gap-2 mb-2">
                  <card.icon className="w-4 h-4" />
                  <p className="text-xs font-bold uppercase tracking-wide">{card.label}</p>
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>

          {/* People & Catalogue — live Firestore counts */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total users', value: stats.totalUsers, tint: 'bg-blue-500/10 text-blue-600' },
              { label: 'Customers', value: stats.customerCount, tint: 'bg-emerald-500/10 text-emerald-600' },
              { label: 'Drivers', value: stats.driverCount, tint: 'bg-amber-500/10 text-amber-600' },
              { label: 'Technicians', value: stats.technicianCount, tint: 'bg-violet-500/10 text-violet-600' },
              { label: 'Active products', value: stats.productsActive, tint: 'bg-cyan-500/10 text-cyan-600' },
              { label: 'Out of stock', value: stats.productsOutOfStock, tint: 'bg-red-500/10 text-red-600' },
            ].map(card => (
              <div key={card.label} className={`rounded-xl p-4 border border-[var(--color-border)] ${card.tint}`}>
                <p className="text-xs font-bold uppercase tracking-wide opacity-80">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-text-secondary)" />
                  <YAxis stroke="var(--color-text-secondary)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Revenue (GH₵)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Orders Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-text-secondary)" />
                  <YAxis stroke="var(--color-text-secondary)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="orders" fill="#10B981" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Top Products by Revenue</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" stroke="var(--color-text-secondary)" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={150}
                    stroke="var(--color-text-secondary)"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#F59E0B" name="Revenue (GH₵)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[var(--color-surface)] rounded-lg p-6 border border-[var(--color-border)]">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Revenue by Category</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
