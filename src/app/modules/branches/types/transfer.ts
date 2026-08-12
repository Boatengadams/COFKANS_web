/**
 * Multi-Branch Module — Transfer model.
 *
 * Movement of stock between branches (showroom → branch, or branch → branch).
 * Created by Front Desk, carried out by a Driver. Types only.
 */

/** Lifecycle of a stock transfer. */
export type TransferStatus =
  | 'pending'      // created, awaiting a driver
  | 'claimed'      // a driver has taken ownership
  | 'in_transit'   // picked up, on the way
  | 'delivered'    // received at destination
  | 'cancelled';

/** One product line within a transfer. */
export interface TransferItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
}

/** A stock transfer request between two branches. */
export interface Transfer {
  id: string;
  fromBranch: string;
  toBranch: string;
  items: TransferItem[];
  status: TransferStatus;
  /** UID of the driver who claimed it; null while pending. */
  driverId?: string | null;
  driverName?: string;
  /** Optional link back to the branch stock alert that prompted this. */
  alertId?: string;
  note?: string;
  createdBy: string;
  createdAt: string;
  claimedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
}

/** A low-stock request raised by a branch for Front Desk to fulfil. */
export interface StockAlert {
  id: string;
  branchSlug: string;
  productId: string;
  sku: string;
  name: string;
  requestedQty: number;
  status: 'pending' | 'approved' | 'declined';
  raisedBy: string;
  raisedAt: string;
  resolvedAt?: string;
}
