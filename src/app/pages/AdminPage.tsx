import { useState } from 'react';
import { ProtectedAdminRoute } from '../components/admin/ProtectedAdminRoute';
import { ProductMigrationPanel } from '../components/admin/ProductMigrationPanel';
import { UserManagementPanel } from '../components/admin/UserManagementPanel';
import { ProductManagement } from '../components/admin/ProductManagement';
import { ProductMediaManager } from '../components/admin/ProductMediaManager';
import { OrderManagement } from '../components/admin/OrderManagement';
import { ReviewModeration } from '../components/admin/ReviewModeration';
import { AnalyticsDashboard } from '../components/admin/AnalyticsDashboard';
import { BulkPriceEditor } from '../components/admin/BulkPriceEditor';
import { motion } from 'motion/react';
import { Settings, ArrowLeft, Users, Database, Shield, Activity, Package, ShoppingBag, Star, BarChart3, DollarSign, ImagePlay, MessageSquare } from 'lucide-react';
import { EmailSmsCampaigns } from '../components/admin/EmailSmsCampaigns';
import { SeedProductsPanel } from '../components/admin/SeedProductsPanel';

interface AdminPageProps {
  onBack: () => void;
}

type AdminTab = 'analytics' | 'database' | 'products' | 'media' | 'pricing' | 'orders' | 'reviews' | 'users' | 'security' | 'sms';

export function AdminPage({ onBack }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b-2 border-border">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="p-3 rounded-xl border-2 border-border hover:bg-muted transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </motion.button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Settings className="w-6 h-6 text-primary" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
                  <p className="text-sm text-muted-foreground">Manage your store settings and data</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('database')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'database'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Database className="w-4 h-4" />
                Database
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Package className="w-4 h-4" />
                Products
              </button>
              <button
                onClick={() => setActiveTab('media')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'media'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <ImagePlay className="w-4 h-4" />
                Product Media
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'pricing'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Bulk Pricing
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Orders
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Star className="w-4 h-4" />
                Reviews
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Users className="w-4 h-4" />
                User Management
              </button>
              <button
                onClick={() => setActiveTab('sms')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'sms'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Email & SMS
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Shield className="w-4 h-4" />
                Security
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="space-y-8">
            {activeTab === 'analytics' && (
              <AnalyticsDashboard />
            )}

            {activeTab === 'database' && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Database Management</h2>
                  <p className="text-muted-foreground text-sm">Initialize your Firestore database with product data</p>
                </div>
                <SeedProductsPanel />
                <ProductMigrationPanel />
              </>
            )}

            {activeTab === 'products' && (
              <ProductManagement />
            )}

            {activeTab === 'media' && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Product Media Manager</h2>
                  <p className="text-muted-foreground text-sm">Add images, videos, descriptions and use cases shown on the product detail modal. Stored in-memory (DEMO_MODE).</p>
                </div>
                <ProductMediaManager />
              </>
            )}

            {activeTab === 'pricing' && (
              <BulkPriceEditor />
            )}

            {activeTab === 'orders' && (
              <OrderManagement />
            )}

            {activeTab === 'reviews' && (
              <ReviewModeration />
            )}

            {activeTab === 'users' && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">User Management</h2>
                  <p className="text-muted-foreground text-sm">Promote staff members and manage user roles (Developer only)</p>
                </div>
                <UserManagementPanel />
              </>
            )}

            {activeTab === 'sms' && <EmailSmsCampaigns />}

            {activeTab === 'security' && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Security Monitoring</h2>
                  <p className="text-muted-foreground text-sm">View security events and audit logs</p>
                </div>
                <div className="bg-card border-2 border-border rounded-2xl p-8">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Security Monitoring</h3>
                    <p className="text-muted-foreground mb-4">
                      Track failed login attempts, price manipulation, and other security events
                    </p>
                    <p className="text-sm text-muted-foreground">
                      View logs in Firebase Console → Firestore → securityEvents & auditLogs collections
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedAdminRoute>
  );
}
