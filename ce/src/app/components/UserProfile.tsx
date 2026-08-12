import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogOut, ShoppingBag, Heart, Settings, ChevronDown } from 'lucide-react';
import type { FirestoreUser } from '../../lib/firestore-schema';

export type DashboardTab = 'overview' | 'orders' | 'wishlist' | 'settings';

interface UserProfileProps {
  user: FirestoreUser | null;
  onSignOut: () => void;
  onSignIn: () => void;
  onOpenDashboard?: (tab?: DashboardTab) => void;
  isAuthLoading?: boolean;
}

export function UserProfile({ user, onSignOut, onSignIn, onOpenDashboard, isAuthLoading }: UserProfileProps) {
  const [showMenu, setShowMenu] = useState(false);

  if (!user) {
    // Auth is still rehydrating from persistence — show a neutral skeleton
    // instead of flashing "Sign In" to a user who's actually about to be
    // restored. Removes the ~200-400ms login-state flicker on page load.
    if (isAuthLoading) {
      return (
        <div
          aria-label="Loading account"
          className="h-[42px] w-[42px] lg:w-[110px] rounded-full bg-muted animate-pulse"
        />
      );
    }
    return (
      <motion.button
        onClick={onSignIn}
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Sign in"
        className="flex items-center justify-center gap-2 h-[42px] w-[42px] lg:w-auto lg:px-6 lg:py-2.5 bg-foreground text-background rounded-full text-[15px] font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200 cursor-pointer"
      >
        <User className="w-4 h-4" strokeWidth={2.5} />
        <span className="hidden lg:inline">Sign In</span>
      </motion.button>
    );
  }

  const isStaff = user.role === 'admin' || user.role === 'technician' || user.role === 'driver';

  const open = (tab?: DashboardTab) => {
    setShowMenu(false);
    onOpenDashboard?.(tab);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Account menu"
        className="flex items-center gap-2 lg:gap-3 px-1.5 py-1.5 lg:px-4 lg:py-2 rounded-full bg-card border-2 border-border hover:border-primary transition-all duration-200 cursor-pointer shadow-md"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <User className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        )}
        <span className="hidden lg:block font-semibold text-sm max-w-[100px] truncate">
          {user.displayName.split(' ')[0]}
        </span>
        <ChevronDown className={`hidden lg:block w-4 h-4 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} strokeWidth={2.5} />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-[18rem] sm:w-72 bg-card border-2 border-border rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              <div className="p-4 border-b border-border bg-gradient-to-br from-primary/5 to-secondary/5">
                <div className="flex items-center gap-3 mb-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <User className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{user.displayName}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {user.role}
                </div>
              </div>

              <div className="p-2">
                <motion.button
                  onClick={() => open('overview')}
                  whileHover={{ x: 4, backgroundColor: 'var(--muted)' }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left"
                >
                  <User className="w-4 h-4" strokeWidth={2.5} />
                  <span>{isStaff ? 'My Dashboard' : 'Profile'}</span>
                </motion.button>

                {!isStaff && (
                  <>
                    <motion.button
                      onClick={() => open('orders')}
                      whileHover={{ x: 4, backgroundColor: 'var(--muted)' }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left"
                    >
                      <ShoppingBag className="w-4 h-4" strokeWidth={2.5} />
                      <span>My Orders</span>
                    </motion.button>

                    <motion.button
                      onClick={() => open('wishlist')}
                      whileHover={{ x: 4, backgroundColor: 'var(--muted)' }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left"
                    >
                      <Heart className="w-4 h-4" strokeWidth={2.5} />
                      <span>Wishlist</span>
                    </motion.button>
                  </>
                )}

                <motion.button
                  onClick={() => open('settings')}
                  whileHover={{ x: 4, backgroundColor: 'var(--muted)' }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left"
                >
                  <Settings className="w-4 h-4" strokeWidth={2.5} />
                  <span>Settings</span>
                </motion.button>

                <div className="my-2 border-t border-border" />

                <motion.button
                  onClick={() => {
                    setShowMenu(false);
                    onSignOut();
                  }}
                  whileHover={{ x: 4, backgroundColor: 'var(--muted)' }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                  <span>Sign Out</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
