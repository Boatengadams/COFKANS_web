import { Home, ShoppingBag, ShoppingCart, User, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useCartStore } from '@/stores/cart-store';

export type ActiveTab = 'home' | 'shop' | 'cart' | 'account' | 'support' | null;

interface Props {
  isAuthed: boolean;
  active?: ActiveTab;
  onHome: () => void;
  onShop: () => void;
  onCart: () => void;
  onAccount: () => void;
}

export function BottomTabBar({ isAuthed, active = null, onHome, onShop, onCart, onAccount }: Props) {
  const cartCount = useCartStore(s => s.cart?.items?.reduce((n, i) => n + i.quantity, 0) ?? 0);

  const openSupport = () => window.dispatchEvent(new Event('cofkans:openSupport'));

  const Tab = ({
    id, icon: Icon, label, onClick, badge,
  }: { id: ActiveTab; icon: typeof Home; label: string; onClick: () => void; badge?: number }) => {
    const isActive = active === id;
    return (
      <button
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
        className="relative flex-1 flex items-center justify-center py-1.5"
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className={`relative flex items-center gap-1.5 rounded-full transition-colors ${
            isActive
              ? 'bg-primary/15 text-primary px-3 py-1.5'
              : 'text-muted-foreground px-2 py-1.5'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
            {badge !== undefined && badge > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border border-card">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </div>
          {isActive && (
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              transition={{ duration: 0.18 }}
              className="text-[11px] font-semibold leading-none whitespace-nowrap overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </motion.div>
      </button>
    );
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-[150] bg-card/95 backdrop-blur-md border-t border-border flex items-stretch pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      aria-label="Primary mobile navigation"
    >
      <Tab id="home" icon={Home} label="Home" onClick={onHome} />
      <Tab id="shop" icon={ShoppingBag} label="Shop" onClick={onShop} />
      <Tab id="cart" icon={ShoppingCart} label="Cart" onClick={onCart} badge={cartCount} />
      <Tab id="account" icon={User} label={isAuthed ? 'Account' : 'Sign in'} onClick={onAccount} />
      <Tab id="support" icon={MessageCircle} label="Support" onClick={openSupport} />
    </nav>
  );
}
