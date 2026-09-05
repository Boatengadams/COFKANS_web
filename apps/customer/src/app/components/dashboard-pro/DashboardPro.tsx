import { useMemo } from 'react';
import { Activity, Heart, LayoutDashboard, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { CartView } from '../dashboard/CartView';
import { DashboardShell, type TabDef } from './DashboardShell';
import { ProfileOverview } from '../dashboard/ProfileOverview';
import { MyOrders } from '../dashboard/MyOrders';
import { Wishlist } from '../dashboard/Wishlist';
import { SecurityActivity } from '../dashboard/SecurityActivity';
import type { FirestoreUser } from '@/lib/firestore-schema';

interface Props {
  user: FirestoreUser;
  initialTab?: string | null;
  onClose: () => void;
  onSignOut: () => void;
}

/** Customer-only account dashboard. Staff workflows live in the canonical COFKANS_Staff app. */
export function DashboardPro({ user, initialTab, onClose, onSignOut }: Props) {
  const cartCount = useCartStore((s) => s.cart?.items?.reduce((a, i) => a + i.quantity, 0) ?? 0);

  const tabs: TabDef[] = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, render: () => <ProfileOverview /> },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: cartCount || undefined, render: () => <CartView /> },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, render: () => <MyOrders /> },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, render: () => <Wishlist /> },
    { id: 'activity', label: 'Activity', icon: Activity, render: () => <SecurityActivity /> },
  ], [cartCount]);

  return (
    <DashboardShell
      user={user}
      role="customer"
      tabs={tabs}
      initialTab={initialTab ?? undefined}
      onClose={onClose}
      onSignOut={onSignOut}
      title="My Cofkans"
    />
  );
}
