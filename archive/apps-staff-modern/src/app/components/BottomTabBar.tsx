import { motion } from 'motion/react';
import { Home, Grid3x3, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';

interface BottomTabBarProps {
  currentView: string;
  onNavigate: (view: 'home' | 'products' | 'cart' | 'account') => void;
}

export function BottomTabBar({ currentView, onNavigate }: BottomTabBarProps) {
  const { cart } = useCartStore();
  const cartCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  const tabs = [
    { id: 'home',     label: 'Home',     icon: Home },
    { id: 'products', label: 'Products', icon: Grid3x3 },
    { id: 'cart',     label: 'Cart',     icon: ShoppingCart, badge: cartCount },
    { id: 'account',  label: 'Account',  icon: User },
  ] as const;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border safe-area-inset-bottom">
      <div className="flex items-stretch h-16">
        {tabs.map(({ id, label, icon: Icon, badge }) => {
          const active = currentView === id || (id === 'home' && currentView === 'home') || (id === 'products' && (currentView === 'dashboard'));
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.92 }}
              onClick={() => onNavigate(id as any)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
            >
              <div className={`relative transition-colors duration-200 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
                {badge != null && badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-colors duration-200 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
