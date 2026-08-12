import { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { TechnicianPortal } from './TechnicianPortal';
import { DeliveryTracking } from './delivery/DeliveryTracking';
import { DriverDashboard } from './delivery/DriverDashboard';
import { DispatchManagement } from './delivery/DispatchManagement';
import { DeliveryAnalytics } from './delivery/DeliveryAnalytics';
import { DeliveryZones } from './delivery/DeliveryZones';
import { User, Wrench, Shield, ShoppingBag, TrendingUp, Package, Award, Truck, MapPin, BarChart3, Settings } from 'lucide-react';

// Customer Dashboard
function CustomerDashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Orders', value: '12', icon: ShoppingBag, color: 'from-blue-500 to-blue-600' },
    { label: 'Wishlist', value: '8', icon: Package, color: 'from-purple-500 to-purple-600' },
    { label: 'Rewards', value: '250', icon: Award, color: 'from-yellow-500 to-yellow-600' },
    { label: 'Saved', value: 'GH₵ 1,200', icon: TrendingUp, color: 'from-green-500 to-green-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-gradient-to-br from-primary to-secondary rounded-2xl">
            <User className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-luxury)' }}>My Dashboard</h1>
            <p className="text-muted-foreground text-lg">Welcome back, {user?.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }} whileHover={{ y: -4 }}
            className="p-6 bg-card rounded-2xl border-2 border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <span className="text-3xl font-bold">{stat.value}</span>
            </div>
            <p className="font-semibold">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border-2 border-border p-8">
        <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="font-bold">Order #ORD-2026-001</p>
              <p className="text-sm text-muted-foreground">3 items • GH₵ 5,200</p>
            </div>
            <span className="px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-bold">
              Delivered
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="font-bold">Order #ORD-2026-002</p>
              <p className="text-sm text-muted-foreground">1 item • GH₵ 1,500</p>
            </div>
            <span className="px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-bold">
              In Transit
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin Dashboard
function AdminDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'overview' | 'dispatch' | 'analytics' | 'zones'>('overview');

  const stats = [
    { label: 'Total Orders', value: '1,234', icon: ShoppingBag, color: 'from-blue-500 to-blue-600' },
    { label: 'Active Deliveries', value: '45', icon: Truck, color: 'from-orange-500 to-orange-600' },
    { label: 'Revenue', value: 'GH₵ 450K', icon: TrendingUp, color: 'from-green-500 to-green-600' },
    { label: 'Products', value: '850', icon: Package, color: 'from-purple-500 to-purple-600' },
  ];

  // Render different sections based on activeSection
  if (activeSection === 'dispatch') {
    return <DispatchManagement />;
  }

  if (activeSection === 'analytics') {
    return <DeliveryAnalytics />;
  }

  if (activeSection === 'zones') {
    return <DeliveryZones />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-gradient-to-br from-primary to-secondary rounded-2xl">
            <Shield className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-luxury)' }}>Admin Dashboard</h1>
            <p className="text-muted-foreground text-lg">Welcome, {user?.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }} whileHover={{ y: -4 }}
            className="p-6 bg-card rounded-2xl border-2 border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <span className="text-3xl font-bold">{stat.value}</span>
            </div>
            <p className="font-semibold">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-2xl border-2 border-border p-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full px-6 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors text-left">
              Manage Products
            </button>
            <button className="w-full px-6 py-4 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-colors text-left">
              View All Orders
            </button>
            <button className="w-full px-6 py-4 bg-muted rounded-xl font-bold hover:bg-muted/70 transition-colors text-left">
              Manage Technicians
            </button>
          </div>
        </div>

        <div className="bg-card rounded-2xl border-2 border-border p-8">
          <h2 className="text-2xl font-bold mb-6">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <span className="font-semibold">Server Status</span>
              <span className="text-green-600 dark:text-green-400 font-bold">Online</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <span className="font-semibold">Payment Gateway</span>
              <span className="text-green-600 dark:text-green-400 font-bold">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Management Section */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border-2 border-primary/20 p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Truck className="w-6 h-6 text-primary" />
          Delivery Management System
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            onClick={() => setActiveSection('dispatch')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 bg-card rounded-xl border-2 border-border hover:border-primary transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                <Truck className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-sm font-semibold text-orange-600">45 Pending</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Dispatch Management</h3>
            <p className="text-sm text-muted-foreground">Assign orders to drivers and manage deliveries</p>
          </motion.button>

          <motion.button
            onClick={() => setActiveSection('analytics')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 bg-card rounded-xl border-2 border-border hover:border-primary transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-sm font-semibold text-green-600">92% On-Time</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Delivery Analytics</h3>
            <p className="text-sm text-muted-foreground">Performance metrics and insights</p>
          </motion.button>

          <motion.button
            onClick={() => setActiveSection('zones')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 bg-card rounded-xl border-2 border-border hover:border-primary transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                <MapPin className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-sm font-semibold text-purple-600">12 Zones</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Delivery Zones</h3>
            <p className="text-sm text-muted-foreground">Manage zones and pricing across Ghana</p>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// Main Role-Based Dashboard Router
export function RoleBasedDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-8">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
          <h2 className="text-2xl font-bold mb-2">Please Sign In</h2>
          <p className="text-muted-foreground">Sign in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on role
  switch (user.role) {
    case 'technician':
      return <TechnicianPortal />;
    case 'admin':
      return <AdminDashboard />;
    case 'driver':
      return <DriverDashboard />;
    case 'customer':
    default:
      return <CustomerDashboard />;
  }
}
