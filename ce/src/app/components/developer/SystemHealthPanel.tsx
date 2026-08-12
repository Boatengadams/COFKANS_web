import { useEffect, useState } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Activity, Users, Package, ShoppingBag, Star, Truck, Wrench, Bell, FileWarning, Database } from 'lucide-react';
import { motion } from 'motion/react';

type Counts = Record<string, number | null>;

const COLLECTIONS = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'reviews', label: 'Reviews', icon: Star },
  { key: 'deliveries', label: 'Deliveries', icon: Truck },
  { key: 'serviceRequests', label: 'Service Requests', icon: Wrench },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'securityEvents', label: 'Security Events', icon: FileWarning },
  { key: 'auditLogs', label: 'Audit Logs', icon: Database },
];

export function SystemHealthPanel() {
  const [counts, setCounts] = useState<Counts>({});
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    const next: Counts = {};
    await Promise.all(
      COLLECTIONS.map(async ({ key }) => {
        try {
          const snap = await getCountFromServer(collection(db, key));
          next[key] = snap.data().count;
        } catch {
          next[key] = null;
        }
      })
    );
    setCounts(next);
    setRefreshedAt(new Date());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Live System Health
          </h2>
          <p className="text-sm text-muted-foreground">
            Real-time collection sizes from Firestore.
            {refreshedAt && ` Refreshed ${refreshedAt.toLocaleTimeString()}`}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {COLLECTIONS.map(({ key, label, icon: Icon }, i) => {
          const value = counts[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card border-2 border-border rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{key}</span>
              </div>
              <div className="text-2xl font-bold">
                {loading ? '…' : value === null ? 'N/A' : value.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
