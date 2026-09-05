import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  X,
  ShoppingBag,
  Heart,
  ShieldCheck,
  MessageSquare,
  Package,
  Star,
  Wrench,
  Monitor,
} from 'lucide-react';

type TabKey = 'orders' | 'wishlist' | 'security' | 'engagement';

interface Props {
  userId: string;
  userEmail?: string;
  userName?: string;
  onClose: () => void;
}

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'wishlist', label: 'Wishlist & Interests', icon: Heart },
  { key: 'security', label: 'Security Activity', icon: ShieldCheck },
  { key: 'engagement', label: 'Cart, Reviews & Requests', icon: MessageSquare },
];

const fmtMoney = (n: number) =>
  `GH₵ ${(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (v: any): string => {
  if (!v) return '—';
  const d =
    typeof v?.toDate === 'function'
      ? v.toDate()
      : v?.seconds
        ? new Date(v.seconds * 1000)
        : new Date(v);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString();
};

async function safeQuery(
  coll: string,
  field: string,
  uid: string,
  opts?: { order?: string; max?: number },
): Promise<any[]> {
  try {
    const cons: any[] = [where(field, '==', uid)];
    if (opts?.order) cons.push(orderBy(opts.order, 'desc'));
    if (opts?.max) cons.push(limit(opts.max));
    const snap = await getDocs(query(collection(db, coll), ...cons));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    try {
      const snap = await getDocs(
        query(collection(db, coll), where(field, '==', uid)),
      );
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch {
      return [];
    }
  }
}

export function UserActivityModal({ userId, userEmail, userName, onClose }: Props) {
  const [tab, setTab] = useState<TabKey>('orders');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [knownDevices, setKnownDevices] = useState<any[]>([]);
  const [cart, setCart] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!userId) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      // getDoc throws synchronously when given an undefined / empty id, which
      // would bypass the .catch() in Promise.all and crash the modal. Guard
      // and isolate so one failure can't break the whole activity view.
      const cartPromise = (async () => {
        try { return await getDoc(doc(db, 'carts', userId)); }
        catch { return null; }
      })();
      const [
        oRes,
        wRes,
        rvRes,
        seRes,
        kdRes,
        revRes,
        srRes,
        cartSnap,
      ] = await Promise.all([
        safeQuery('orders', 'userId', userId, { order: 'createdAt', max: 100 }),
        safeQuery('wishlists', 'userId', userId, { max: 200 }),
        safeQuery('userActivity', 'userId', userId, { order: 'viewedAt', max: 50 }),
        safeQuery('securityEvents', 'userId', userId, { order: 'at', max: 100 }),
        safeQuery('knownDevices', 'userId', userId, { order: 'lastSeenAt', max: 50 }),
        safeQuery('reviews', 'userId', userId, { order: 'createdAt', max: 100 }),
        safeQuery('serviceRequests', 'userId', userId, { order: 'createdAt', max: 50 }),
        cartPromise,
      ]);
      if (cancelled) return;
      setOrders(oRes);
      setWishlist(wRes);
      setRecentlyViewed(rvRes);
      setSecurityEvents(seRes);
      setKnownDevices(kdRes);
      setReviews(revRes);
      setServiceRequests(srRes);
      setCart(cartSnap && cartSnap.exists() ? { id: cartSnap.id, ...cartSnap.data() } : null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const totals = useMemo(() => {
    const paid = orders.filter(
      (o) => o.paymentStatus === 'paid' || o.paymentStatus === 'cash_on_delivery',
    );
    const spent = paid.reduce((s, o) => s + (Number(o.total) || 0), 0);
    return { paidCount: paid.length, spent };
  }, [orders]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-card border-2 border-border rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between p-6 border-b-2 border-border">
            <div>
              <h2 className="text-2xl font-bold">{userName || 'User'} — Activity</h2>
              <p className="text-sm text-muted-foreground">{userEmail || userId}</p>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>Orders: <b className="text-foreground">{orders.length}</b></span>
                <span>Paid: <b className="text-foreground">{totals.paidCount}</b></span>
                <span>Spent: <b className="text-foreground">{fmtMoney(totals.spent)}</b></span>
                <span>Wishlist: <b className="text-foreground">{wishlist.length}</b></span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 px-6 pt-4 border-b border-border">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-bold transition-colors ${
                  tab === key
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Loading activity…</p>
              </div>
            ) : tab === 'orders' ? (
              <OrdersTab orders={orders} />
            ) : tab === 'wishlist' ? (
              <WishlistTab wishlist={wishlist} recentlyViewed={recentlyViewed} />
            ) : tab === 'security' ? (
              <SecurityTab events={securityEvents} devices={knownDevices} />
            ) : (
              <EngagementTab cart={cart} reviews={reviews} requests={serviceRequests} />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="text-center py-12 text-sm text-muted-foreground">{label}</div>
  );
}

function OrdersTab({ orders }: { orders: any[] }) {
  if (!orders.length) return <Empty label="No orders yet." />;
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="border-2 border-border rounded-xl p-4">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
            <div>
              <div className="font-bold text-sm">
                #{(o.orderNumber || o.id).toString().slice(0, 12)}
              </div>
              <div className="text-xs text-muted-foreground">
                {fmtDate(o.createdAt)}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="blue">{o.status || 'pending'}</Badge>
              <Badge tone={o.paymentStatus === 'paid' ? 'green' : 'gray'}>
                {o.paymentStatus || 'pending'}
              </Badge>
              <Badge tone="purple">{o.paymentMethod || '—'}</Badge>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {(o.items || []).length} item(s) · Total{' '}
            <span className="font-bold text-foreground">{fmtMoney(o.total)}</span>
          </div>
          {Array.isArray(o.items) && o.items.length > 0 && (
            <ul className="mt-2 text-xs text-muted-foreground space-y-0.5">
              {o.items.slice(0, 5).map((it: any, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <Package className="w-3 h-3" />
                  {it.name || it.productName || it.productId} × {it.quantity || 1}
                </li>
              ))}
              {o.items.length > 5 && <li>… and {o.items.length - 5} more</li>}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function WishlistTab({
  wishlist,
  recentlyViewed,
}: {
  wishlist: any[];
  recentlyViewed: any[];
}) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4" /> Wishlist ({wishlist.length})
        </h3>
        {wishlist.length === 0 ? (
          <Empty label="Wishlist is empty." />
        ) : (
          <ul className="grid sm:grid-cols-2 gap-2">
            {wishlist.map((w) => (
              <li
                key={w.id}
                className="border border-border rounded-lg p-3 text-sm"
              >
                <div className="font-medium truncate">
                  {w.productName || w.name || w.productId}
                </div>
                <div className="text-xs text-muted-foreground">
                  Added {fmtDate(w.createdAt || w.addedAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h3 className="font-bold mb-3">Recently Viewed / Interests</h3>
        {recentlyViewed.length === 0 ? (
          <Empty label="No tracked activity." />
        ) : (
          <ul className="space-y-1 text-sm">
            {recentlyViewed.map((r) => (
              <li
                key={r.id}
                className="flex justify-between border-b border-border py-1"
              >
                <span className="truncate">
                  {r.productName || r.category || r.type || r.productId || r.id}
                </span>
                <span className="text-xs text-muted-foreground ml-3">
                  {fmtDate(r.viewedAt || r.at || r.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SecurityTab({ events, devices }: { events: any[]; devices: any[] }) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Security Events ({events.length})
        </h3>
        {events.length === 0 ? (
          <Empty label="No security events recorded." />
        ) : (
          <ul className="space-y-2">
            {events.map((e) => (
              <li
                key={e.id}
                className="border border-border rounded-lg p-3 text-sm flex justify-between gap-3"
              >
                <div>
                  <div className="font-medium">
                    {e.type || e.event || 'event'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {e.ip || e.userAgent || e.detail || ''}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {fmtDate(e.at || e.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Monitor className="w-4 h-4" /> Known Devices ({devices.length})
        </h3>
        {devices.length === 0 ? (
          <Empty label="No registered devices." />
        ) : (
          <ul className="space-y-2">
            {devices.map((d) => (
              <li
                key={d.id}
                className="border border-border rounded-lg p-3 text-sm"
              >
                <div className="font-medium truncate">
                  {d.deviceName || d.userAgent || d.id}
                </div>
                <div className="text-xs text-muted-foreground">
                  Last seen {fmtDate(d.lastSeenAt || d.updatedAt)} · {d.ip || ''}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function EngagementTab({
  cart,
  reviews,
  requests,
}: {
  cart: any | null;
  reviews: any[];
  requests: any[];
}) {
  const cartItems: any[] = cart?.items || [];
  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-bold mb-3">Current Cart ({cartItems.length})</h3>
        {cartItems.length === 0 ? (
          <Empty label="Cart is empty." />
        ) : (
          <ul className="space-y-1 text-sm">
            {cartItems.map((it, i) => (
              <li
                key={i}
                className="flex justify-between border-b border-border py-1"
              >
                <span>
                  {it.name || it.productName || it.productId} × {it.quantity || 1}
                </span>
                <span className="text-muted-foreground">{fmtMoney(it.price)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Star className="w-4 h-4" /> Reviews ({reviews.length})
        </h3>
        {reviews.length === 0 ? (
          <Empty label="No reviews written." />
        ) : (
          <ul className="space-y-2">
            {reviews.map((r) => (
              <li key={r.id} className="border border-border rounded-lg p-3 text-sm">
                <div className="flex justify-between mb-1">
                  <div className="font-medium">
                    {r.productName || r.productId} · {r.rating ?? '—'}★
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {fmtDate(r.createdAt)}
                  </div>
                </div>
                {r.comment && (
                  <p className="text-xs text-muted-foreground">{r.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4" /> Service Requests ({requests.length})
        </h3>
        {requests.length === 0 ? (
          <Empty label="No service requests." />
        ) : (
          <ul className="space-y-2">
            {requests.map((s) => (
              <li key={s.id} className="border border-border rounded-lg p-3 text-sm">
                <div className="flex justify-between">
                  <div className="font-medium">
                    {s.serviceType || s.type || 'request'}
                  </div>
                  <Badge tone="blue">{s.status || 'pending'}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {fmtDate(s.createdAt)} · {s.priority || ''}
                </div>
                {s.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {s.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: 'blue' | 'green' | 'gray' | 'purple';
}) {
  const toneCls = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    gray: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  }[tone];
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${toneCls}`}>
      {children}
    </span>
  );
}
