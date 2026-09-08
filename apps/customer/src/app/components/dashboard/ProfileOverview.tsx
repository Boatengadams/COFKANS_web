import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Calendar, Shield, CheckCircle, XCircle, Crown } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

interface Stats {
  totalOrders: number;
  wishlistCount: number;
  totalSpent: number;
  loading: boolean;
}

export function ProfileOverview() {
  const { user } = useFirebaseAuth();
  const isSuper = Boolean(user?.isDeveloper || user?.role === 'developer');
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    wishlistCount: 0,
    totalSpent: 0,
    loading: true,
  });

  useEffect(() => {
    if (!user?.uid) {
      setStats(s => ({ ...s, loading: false }));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        // Wishlist lives on customerActivity/{uid}.wishlistItems — there is no
        // top-level `wishlists` collection (querying it hits permission-denied).
        const [ordersSnap, activitySnap] = await Promise.all([
          getDocs(query(collection(db, 'orders'), where('userId', '==', user.uid))),
          getDoc(doc(db, 'customerActivity', user.uid)),
        ]);
        const wishlistItems = activitySnap.exists()
          ? (activitySnap.data()?.wishlistItems as string[] | undefined)
          : undefined;
        const totalSpent = ordersSnap.docs.reduce((sum, d) => {
          const o = d.data();
          // Only count actually-paid orders so cancelled / pending don't inflate.
          if (o.paymentStatus === 'paid' || o.paymentStatus === 'cash_on_delivery') {
            return sum + (typeof o.total === 'number' ? o.total : 0);
          }
          return sum;
        }, 0);
        if (cancelled) return;
        setStats({
          totalOrders: ordersSnap.size,
          wishlistCount: Array.isArray(wishlistItems) ? wishlistItems.length : 0,
          totalSpent,
          loading: false,
        });
      } catch (err) {
        console.error('[ProfileOverview] stats load failed:', err);
        if (!cancelled) setStats(s => ({ ...s, loading: false }));
      }
    })();
    return () => { cancelled = true; };
  }, [user?.uid]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Please sign in to view your profile</p>
      </div>
    );
  }


  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'technician':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'driver':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-2 border-border rounded-2xl p-8"
      >
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-border"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center border-2 border-border">
                <User className="w-12 h-12 text-white" strokeWidth={2} />
              </div>
            )}
            {user.emailVerified && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-card">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold truncate">{user.displayName}</h2>
              {isSuper && (
                <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-primary to-secondary rounded-full">
                  <Crown className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold text-white">DEVELOPER</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border-2 ${isSuper ? 'bg-purple-600/20 text-purple-600 dark:text-purple-300 border-purple-500/40' : getRoleBadgeColor(user.role || 'customer')}`}>
                <Shield className="w-3 h-3" />
                {isSuper ? 'DEVELOPER' : (user.role?.toUpperCase() || 'CUSTOMER')}
              </span>
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold border-2 border-green-500/20">
                  <CheckCircle className="w-3 h-3" />
                  VERIFIED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold border-2 border-amber-500/20">
                  <XCircle className="w-3 h-3" />
                  NOT VERIFIED
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Account Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border-2 border-border rounded-2xl p-8"
      >
        <h3 className="text-xl font-bold mb-6">Account Details</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-bold text-muted-foreground mb-2 block">
              Full Name
            </label>
            <div className="px-4 py-3 bg-background border-2 border-border rounded-xl">
              {user.displayName}
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-muted-foreground mb-2 block">
              Email Address
            </label>
            <div className="px-4 py-3 bg-background border-2 border-border rounded-xl truncate">
              {user.email}
            </div>
          </div>
          {user.phoneNumber && (
            <div>
              <label className="text-sm font-bold text-muted-foreground mb-2 block">
                Phone Number
              </label>
              <div className="px-4 py-3 bg-background border-2 border-border rounded-xl">
                {user.phoneNumber}
              </div>
            </div>
          )}
          <div>
            <label className="text-sm font-bold text-muted-foreground mb-2 block">
              Account Type
            </label>
            <div className="px-4 py-3 bg-background border-2 border-border rounded-xl">
              {(user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'Customer')}
            </div>
          </div>
          {user.createdAt && (
            <div>
              <label className="text-sm font-bold text-muted-foreground mb-2 block">
                Member Since
              </label>
              <div className="px-4 py-3 bg-background border-2 border-border rounded-xl flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {format(user.createdAt.toDate(), 'MMMM dd, yyyy')}
              </div>
            </div>
          )}
          <div>
            <label className="text-sm font-bold text-muted-foreground mb-2 block">
              Sign-In Method
            </label>
            <div className="px-4 py-3 bg-background border-2 border-border rounded-xl capitalize">
              {user.provider || 'Email/Password'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-4"
      >
        <div className="bg-card border-2 border-border rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-1">
            {stats.loading ? '—' : stats.totalOrders}
          </div>
          <div className="text-sm text-muted-foreground">Total Orders</div>
        </div>
        <div className="bg-card border-2 border-border rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-secondary mb-1">
            {stats.loading ? '—' : stats.wishlistCount}
          </div>
          <div className="text-sm text-muted-foreground">Wishlist Items</div>
        </div>
        <div className="bg-card border-2 border-border rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
            {stats.loading ? 'GH₵ —' : `GH₵ ${stats.totalSpent.toFixed(2)}`}
          </div>
          <div className="text-sm text-muted-foreground">Total Spent</div>
        </div>
      </motion.div>
    </div>
  );
}
