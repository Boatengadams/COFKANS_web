/**
 * Lightweight order shape used by the branch & front-desk dashboards.
 *
 * The customer storefront writes rich `FirestoreOrder` documents, but the
 * showroom-facing screens only need a practical subset — who's collecting or
 * receiving an order today, where, and at what stage. This module owns that
 * view model plus the status vocabulary and the one mutation the front desk
 * needs (advancing an order's status).
 */
import {
  collection, query, where, onSnapshot,
  doc, updateDoc, serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export type BranchOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export interface BranchOrderAddress {
  fullName?: string;
  phone?: string;
  street?: string;
  city?: string;
}

export interface BranchOrder {
  id: string;
  userEmail?: string;
  branchSlug?: string;
  fulfillmentType?: 'pickup' | 'delivery';
  scheduledDate?: string; // ISO yyyy-mm-dd
  createdAt?: unknown;
  status: BranchOrderStatus;
  total?: number;
  itemCount?: number;
  shippingAddress?: BranchOrderAddress;
  customerNotes?: string;
}

export const STATUS_LABEL: Record<BranchOrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// Theme-aware chip styles (work in light & dark).
export const STATUS_COLOR: Record<BranchOrderStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  confirmed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  preparing: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
  ready: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30',
  out_for_delivery: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
};

/** Safe label/colour lookups for documents that may carry an unexpected status. */
export function statusLabel(status: string): string {
  return STATUS_LABEL[status as BranchOrderStatus] ?? status;
}
export function statusColor(status: string): string {
  return STATUS_COLOR[status as BranchOrderStatus] ?? 'bg-muted text-muted-foreground border-border';
}

/** The natural forward path the front desk walks an order through. */
export const STATUS_FLOW: BranchOrderStatus[] = [
  'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed',
];

export function nextStatus(status: BranchOrderStatus): BranchOrderStatus | null {
  const i = STATUS_FLOW.indexOf(status);
  if (i === -1 || i === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[i + 1];
}

/** Normalize documents written by the former Vite portal into the root
 * Expo status vocabulary. This keeps old production orders visible during the
 * migration without changing the branch permission or Firestore rule layer. */
function normalizeStatus(status: unknown): BranchOrderStatus {
  switch (status) {
    case 'processing': return 'preparing';
    case 'packed': return 'ready';
    case 'shipped': return 'out_for_delivery';
    case 'delivered': return 'completed';
    case 'confirmed':
    case 'preparing':
    case 'ready':
    case 'out_for_delivery':
    case 'completed':
    case 'cancelled':
    case 'pending': return status;
    default: return 'pending';
  }
}

function mapBranchOrder(id: string, data: Record<string, any>): BranchOrder {
  const items = Array.isArray(data.items) ? data.items : [];
  return {
    ...(data as Omit<BranchOrder, 'id' | 'status' | 'itemCount'>),
    id,
    status: normalizeStatus(data.status),
    itemCount: data.itemCount ?? items.reduce((sum: number, item: any) => sum + (item.quantity ?? 1), 0),
  };
}

/** Live Firebase subscription used by the unified Expo web portal. */
export function subscribeBranchOrders(
  branchSlug: string,
  onChange: (orders: BranchOrder[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  const q = query(collection(db, 'orders'), where('branchSlug', '==', branchSlug));
  return onSnapshot(
    q,
    snap => onChange(snap.docs.map(d => mapBranchOrder(d.id, d.data() as Record<string, any>))),
    error => onError?.(error as Error),
  );
}

/** Advance / set an order's status from the front desk. */
export async function updateBranchOrderStatus(id: string, status: BranchOrderStatus): Promise<void> {
  await updateDoc(doc(db, 'orders', id), { status, updatedAt: serverTimestamp() });
}

/* ---------------- Rider helpers ---------------- */

export interface RiderOrder extends BranchOrder {
  driverId?: string | null;
  driverName?: string | null;
}

/**
 * Live subscription to the rider-claimable pool for a branch.
 *  - `available`: ready deliveries with no driver yet
 *  - `mine`: orders this rider has claimed and is still carrying
 */
export function subscribeRiderQueue(
  branchSlug: string,
  riderUid: string,
  onChange: (queue: { available: RiderOrder[]; mine: RiderOrder[] }) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'orders'),
    where('branchSlug', '==', branchSlug),
    where('fulfillmentType', '==', 'delivery'),
    where('status', 'in', ['ready', 'out_for_delivery', 'shipped', 'packed']),
  );
  return onSnapshot(
    q,
    snap => {
      const orders = snap.docs.map(d => mapBranchOrder(d.id, d.data() as Record<string, any>) as RiderOrder);
      onChange({
        available: orders.filter(o => o.status === 'ready' && !o.driverId),
        mine: orders.filter(o => o.driverId === riderUid && o.status === 'out_for_delivery'),
      });
    },
    err => onError?.(err as Error),
  );
}

export async function assignRider(orderId: string, riderUid: string, riderName: string): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), {
    driverId: riderUid,
    driverName: riderName,
    status: 'out_for_delivery' satisfies BranchOrderStatus,
    updatedAt: serverTimestamp(),
    'statusTimeline.out_for_delivery': serverTimestamp(),
    lastUpdatedBy: riderUid,
  });
}

export async function markDelivered(orderId: string, by: string): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), {
    status: 'completed' satisfies BranchOrderStatus,
    deliveredAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    'statusTimeline.completed': serverTimestamp(),
    lastUpdatedBy: by,
  });
}
