import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCheck, Package, Truck, AlertTriangle, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { UserRole } from '../../types';

export interface Notif {
  id: string;
  kind: 'order' | 'delivery' | 'alert' | 'promo' | 'system';
  title: string;
  body?: string;
  at: Date;
  read?: boolean;
}

const ICONS = {
  order: Package,
  delivery: Truck,
  alert: AlertTriangle,
  promo: Sparkles,
  system: Bell,
} as const;

const TINTS = {
  order: 'bg-sky-500/10 text-sky-500',
  delivery: 'bg-violet-500/10 text-violet-500',
  alert: 'bg-rose-500/10 text-rose-500',
  promo: 'bg-amber-500/10 text-amber-500',
  system: 'bg-emerald-500/10 text-emerald-500',
} as const;

function demoFor(role: UserRole): Notif[] {
  const now = Date.now();
  const m = (n: number) => new Date(now - n * 60_000);
  const base: Notif[] = [
    { id: '1', kind: 'system', title: 'Welcome to your new dashboard', body: 'We rebuilt it from scratch. Try ⌘K.', at: m(2) },
  ];
  if (role === 'customer') return [
    { id: 'c1', kind: 'order', title: 'Order #A8F2C delivered', body: 'Energy saving bulb 30W × 2', at: m(15) },
    { id: 'c2', kind: 'promo', title: 'Black Friday early access', body: 'Up to 40% off select LEDs', at: m(120) },
    { id: 'c3', kind: 'delivery', title: 'Order #B1F8E out for delivery', at: m(45) },
    ...base,
  ];
  if (role === 'admin') return [
    { id: 'a1', kind: 'alert', title: 'Low stock alert', body: '7 SKUs below threshold', at: m(8) },
    { id: 'a2', kind: 'order', title: '12 new orders today', body: 'GH₵ 4,820 in revenue', at: m(30) },
    { id: 'a3', kind: 'system', title: '2 user role requests pending', at: m(90) },
    ...base,
  ];
  if (role === 'technician') return [
    { id: 't1', kind: 'alert', title: 'Urgent: panel installation', body: 'East Legon — assigned to you', at: m(5) },
    { id: 't2', kind: 'order', title: 'Job #SR-9281 completed', body: 'Customer rated 5★', at: m(60) },
    ...base,
  ];
  return [
    { id: 'd1', kind: 'delivery', title: 'Next stop: Cantonments', body: '3 packages, 4.2 km', at: m(3) },
    { id: 'd2', kind: 'system', title: 'Route optimized', body: 'Saved 18 min', at: m(40) },
    ...base,
  ];
}

export function useNotifications(role: UserRole) {
  const initial = useMemo(() => demoFor(role), [role]);
  const [items, setItems] = useState<Notif[]>(initial);
  const unread = items.filter(i => !i.read).length;
  const markAll = () => setItems(items.map(i => ({ ...i, read: true })));
  const remove = (id: string) => setItems(items.filter(i => i.id !== id));
  return { items, unread, markAll, remove, push: (n: Notif) => setItems(prev => [n, ...prev]) };
}

export function NotificationsPanel({
  open,
  onClose,
  items,
  unread,
  markAll,
  remove,
}: {
  open: boolean;
  onClose: () => void;
  items: Notif[];
  unread: number;
  markAll: () => void;
  remove: (id: string) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-[160] w-full sm:w-[420px] bg-card/95 backdrop-blur-3xl border-l border-border shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" strokeWidth={2.5} />
                <h3 className="font-bold">Notifications</h3>
                {unread > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">{unread}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={markAll}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-1.5"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all
                </button>
                <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {items.length === 0 && (
                <div className="text-center py-16 text-sm text-muted-foreground">You're all caught up.</div>
              )}
              {items.map(n => {
                const Icon = ICONS[n.kind];
                return (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    className={`group relative flex gap-3 p-3 rounded-xl border transition-colors ${
                      n.read ? 'bg-transparent border-transparent' : 'bg-muted/40 border-border'
                    } hover:bg-muted`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${TINTS[n.kind]}`}>
                      <Icon className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-sm truncate">{n.title}</div>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                      </div>
                      {n.body && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</div>}
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {formatDistanceToNow(n.at, { addSuffix: true })}
                      </div>
                    </div>
                    <button
                      onClick={() => remove(n.id)}
                      className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 w-6 h-6 rounded hover:bg-card flex items-center justify-center transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
