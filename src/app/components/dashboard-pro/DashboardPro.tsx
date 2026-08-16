import { useMemo } from 'react';
import { LayoutDashboard, ShoppingBag, ShoppingCart, Heart, Activity, Users, ClipboardList, Star, Route, Wallet, Boxes, ShieldAlert, Inbox, ThumbsUp, Clock, Brain } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { CartView } from '../dashboard/CartView';
import { DashboardShell, type TabDef } from './DashboardShell';
import { ProfileOverview } from '../dashboard/ProfileOverview';
import { MyOrders } from '../dashboard/MyOrders';
import { Wishlist as CustomerWishlistReal } from '../dashboard/Wishlist';
import { SecurityActivity } from '../dashboard/SecurityActivity';
import { AdminOverview, AdminInventory, AdminUsers } from './AdminDashboard';
import { TechnicianOverview, TechnicianJobs, TechnicianReviews } from './TechnicianDashboard';
import { DriverOverview, DriverRoutes, DriverEarnings } from './DriverDashboard';
import { SupportAgentOverview, SupportAgentQueue, SupportAgentHistory } from './support/SupportAgentDashboard';
import { AISecurityOverview, AIFeedbackHub } from './support/AISecurityDashboard';
import { AISupportCenter } from './support/AISupportCenter';
import type { FirestoreUser } from '../../../lib/firestore-schema';
import type { UserRole } from '../../types';
import { isDeveloper } from '@/lib/admin-service';

interface Props {
  user: FirestoreUser;
  initialTab?: string | null;
  onClose: () => void;
  onSignOut: () => void;
}

export function DashboardPro({ user, initialTab, onClose, onSignOut }: Props) {
  const role: UserRole = (user.role ?? 'customer') as UserRole;
  const cartCount = useCartStore((s) => s.cart?.items?.reduce((a, i) => a + i.quantity, 0) ?? 0);

  const tabs: TabDef[] = useMemo(() => {
    if (role === 'admin') {
      return [
        { id: 'overview',    label: 'Overview',    icon: LayoutDashboard, render: () => <AdminOverview /> },
        { id: 'inventory',   label: 'Inventory',   icon: Boxes, render: () => <AdminInventory /> },
        { id: 'users',       label: 'Users',       icon: Users,           render: () => <AdminUsers /> },
        { id: 'ai_center',   label: 'AI Center',   icon: Brain,           render: () => <AISupportCenter currentUserId={user.uid} /> },
        { id: 'ai_security', label: 'AI Security', icon: ShieldAlert,     render: () => <AISecurityOverview /> },
        { id: 'feedback',    label: 'Feedback',    icon: ThumbsUp,        render: () => <AIFeedbackHub /> },
      ];
    }
    if (role === 'support_agent') {
      return [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, render: () => <SupportAgentOverview /> },
        { id: 'queue',    label: 'Queue',    icon: Inbox,           render: () => <SupportAgentQueue /> },
        { id: 'history',  label: 'History',  icon: Clock,           render: () => <SupportAgentHistory /> },
        { id: 'ai_center', label: 'AI Center', icon: Brain,         render: () => <AISupportCenter currentUserId={user.uid} /> },
      ];
    }
    if (role === 'technician') {
      return [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, render: () => <TechnicianOverview /> },
        { id: 'jobs',     label: 'Jobs',     icon: ClipboardList, badge: 4, render: () => <TechnicianJobs /> },
        { id: 'reviews',  label: 'Reviews',  icon: Star, render: () => <TechnicianReviews /> },
      ];
    }
    if (role === 'driver') {
      return [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, render: () => <DriverOverview /> },
        { id: 'routes',   label: 'Routes',   icon: Route, render: () => <DriverRoutes /> },
        { id: 'earnings', label: 'Earnings', icon: Wallet, render: () => <DriverEarnings /> },
      ];
    }
    // customer
    return [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard, render: () => <ProfileOverview /> },
      { id: 'cart',     label: 'Cart',     icon: ShoppingCart, badge: cartCount || undefined, render: () => <CartView /> },
      { id: 'orders',   label: 'Orders',   icon: ShoppingBag, render: () => <MyOrders /> },
      { id: 'wishlist', label: 'Wishlist', icon: Heart, render: () => <CustomerWishlistReal /> },
      { id: 'activity', label: 'Activity', icon: Activity, render: () => <SecurityActivity /> },
    ];
  }, [role, user, cartCount]);

  const titleMap: Record<UserRole, string> = {
    customer:      'My Cofkans',
    admin:         'Admin Control',
    technician:    'Technician Hub',
    driver:        'Driver Console',
    support_agent: 'Support Console',
  };

  return (
    <DashboardShell
      user={user}
      role={role}
      tabs={tabs}
      initialTab={initialTab ?? undefined}
      onClose={onClose}
      onSignOut={onSignOut}
      title={isDeveloper(user.email || '') ? 'Developer Console' : (titleMap[role] ?? 'Dashboard')}
    />
  );
}
