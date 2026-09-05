import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ShoppingBag, Heart, Settings, User, Package } from 'lucide-react';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { MyOrders } from '../components/dashboard/MyOrders';
import { Wishlist } from '../components/dashboard/Wishlist';
import { UserSettings } from '../components/dashboard/UserSettings';
import { ProfileOverview } from '../components/dashboard/ProfileOverview';

type TabType = 'overview' | 'orders' | 'wishlist' | 'settings';

interface UserDashboardProps {
  onBack: () => void;
  initialTab?: TabType | null;
}

export function UserDashboard({ onBack, initialTab }: UserDashboardProps) {
  const { user } = useFirebaseAuth();
  const isStaff = user?.role === 'admin' || user?.role === 'technician' || user?.role === 'driver';

  const allTabs = [
    { id: 'overview' as const, label: 'Profile', icon: User },
    { id: 'orders' as const, label: 'My Orders', icon: ShoppingBag },
    { id: 'wishlist' as const, label: 'Wishlist', icon: Heart },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];
  const tabs = isStaff
    ? allTabs.filter(t => t.id === 'overview' || t.id === 'settings')
    : allTabs;

  const requested = initialTab && tabs.some(t => t.id === initialTab) ? initialTab : 'overview';
  const [activeTab, setActiveTab] = useState<TabType>(requested);

  useEffect(() => {
    if (initialTab && tabs.some(t => t.id === initialTab)) setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
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
                <User className="w-6 h-6 text-primary" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user?.displayName?.split(' ')[0] || 'User'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-border bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative px-6 py-4 flex items-center gap-2 font-bold text-sm transition-colors cursor-pointer
                    ${isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" strokeWidth={2.5} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <ProfileOverview />}
          {activeTab === 'orders' && <MyOrders />}
          {activeTab === 'wishlist' && <Wishlist />}
          {activeTab === 'settings' && <UserSettings />}
        </motion.div>
      </div>
    </div>
  );
}
