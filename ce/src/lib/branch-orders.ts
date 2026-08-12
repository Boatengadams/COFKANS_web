/**
 * Branch + rider order helpers.
 *
 * Orders carry `branchSlug` (set at checkout) and a `status` that moves
 * through this lifecycle:
 *
 *   processing  → branch sees a new order
 *   packed      → branch packed it (still at branch)
 *   ready       → ready for pickup OR ready to be handed to a rider
 *   shipped     → out for delivery (rider is carrying it)
 *   delivered   → completed
 *
 * Pickup orders skip 'shipped' and jump straight to 'delivered' when the
 * branch marks the customer as picked-up.
 */

import {
  collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp,
  type Unsubscribe, type QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';

export type OrderStatus = 'processing' | 'packed' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
export type FulfillmentType = 'pickup' | 'delivery';

export interface BranchOrder {
  id: string;
  userId: string;
  userEmail: string;
  status: OrderStatus;
  fulfillmentType?: FulfillmentType;
  branchSlug?: string;
  scheduledDate?: string;
  total: number;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
  };
  items?: { productSnapshot?: { name?: string }; quantity?: number; subtotal?: number }[];
  driverId?: string | null;
  driverName?: string | null;
  createdAt?: { toMillis?: () => number };
}

/** Live subscription to all orders for a branch. */
export function subscribeBranchOrders(
  branchSlug: string,
  onChange: (orders: BranchOrder[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  const constraints: QueryConstraint[] = [where('branchSlug', '==', branchSlug)];
  const q = query(collection(db, 'orders'), ...constraints, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    snap => onChange(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<BranchOrder, 'id'>) }))),
    err => onError?.(err),
  );
}

/** Live subscription to the rider-claimable pool for a branch. */
export function subscribeRiderQueue(
  branchSlug: string,
  riderUid: string,
  onChange: (queue: { available: BranchOrder[]; mine: BranchOrder[] }) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'orders'),
    where('branchSlug', '==', branchSlug),
    where('fulfillmentType', '==', 'delivery'),
    where('status', 'in', ['ready', 'shipped']),
  );
  return onSnapshot(
    q,
    snap => {
      const orders = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<BranchOrder, 'id'>) }));
      onChange({
        available: orders.filter(o => o.status === 'ready' && !o.driverId),
        mine:       orders.filter(o => o.driverId === riderUid),
      });
    },
    err => onError?.(err),
  );
}

export async function setOrderStatus(orderId: string, status: OrderStatus, by: string): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), {
    status,
    updatedAt: serverTimestamp(),
    [`statusTimeline.${status}`]: serverTimestamp(),
    lastUpdatedBy: by,
  });
}

export async function assignRider(orderId: string, riderUid: string, riderName: string): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), {
    driverId: riderUid,
    driverName: riderName,
    status: 'shipped',
    updatedAt: serverTimestamp(),
    'statusTimeline.shipped': serverTimestamp(),
    lastUpdatedBy: riderUid,
  });
}

export async function markDelivered(orderId: string, by: string): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), {
    status: 'delivered',
    updatedAt: serverTimestamp(),
    'statusTimeline.delivered': serverTimestamp(),
    deliveredAt: serverTimestamp(),
    lastUpdatedBy: by,
  });
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  processing: 'New',
  packed:     'Packed',
  ready:      'Ready',
  shipped:    'Out for delivery',
  delivered:  'Completed',
  cancelled:  'Cancelled',
};

/**
 * Natural forward path the front desk walks an order through. Pickups skip
 * `shipped` and jump from `ready` straight to `delivered` when the customer
 * collects.
 */
export function nextStatus(
  status: OrderStatus,
  fulfillment: FulfillmentType = 'delivery',
): OrderStatus | null {
  const flow: OrderStatus[] = fulfillment === 'pickup'
    ? ['processing', 'packed', 'ready', 'delivered']
    : ['processing', 'packed', 'ready', 'shipped', 'delivered'];
  const i = flow.indexOf(status);
  if (i === -1 || i === flow.length - 1) return null;
  return flow[i + 1];
}

/** Front-desk one-tap status advance (no rider assignment). */
export async function updateBranchOrderStatus(
  orderId: string,
  status: OrderStatus,
  by = 'front-desk',
): Promise<void> {
  await setOrderStatus(orderId, status, by);
}

export const STATUS_COLOR: Record<OrderStatus, string> = {
  processing: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  packed:     'bg-blue-500/15 text-blue-400 border-blue-500/30',
  ready:      'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  shipped:    'bg-violet-500/15 text-violet-400 border-violet-500/30',
  delivered:  'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  cancelled:  'bg-rose-500/15 text-rose-400 border-rose-500/30',
};
