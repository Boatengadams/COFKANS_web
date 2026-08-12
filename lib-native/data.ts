/**
 * Local transfer store.
 *
 * This mirrors the web app's localStorage-backed branch/transfer services in a
 * simplified form so the ported portals are interactive. A tiny pub/sub lets
 * screens re-render when a transfer changes state.
 */
export interface Branch {
  slug: string;
  name: string;
  region: string;
  isActive: boolean;
}

export const BRANCHES: Branch[] = [
  { slug: 'kumasi-asuoyeboa', name: 'Kumasi — Asuoyeboa (Showroom)', region: 'Ashanti', isActive: true },
  { slug: 'kumasi-adum', name: 'Kumasi — Adum', region: 'Ashanti', isActive: true },
  { slug: 'kumasi-abuakwa', name: 'Kumasi — Abuakwa', region: 'Ashanti', isActive: true },
  { slug: 'kumasi-suame', name: 'Kumasi — Suame', region: 'Ashanti', isActive: true },
  { slug: 'accra-circle', name: 'Accra — Circle', region: 'Greater Accra', isActive: true },
  { slug: 'accra-tema', name: 'Accra — Tema', region: 'Greater Accra', isActive: true },
  { slug: 'accra-madina', name: 'Accra — Madina', region: 'Greater Accra', isActive: false },
];

export function branchName(slug: string): string {
  return BRANCHES.find((b) => b.slug === slug)?.name ?? slug;
}

export type TransferStatus = 'pending' | 'claimed' | 'in_transit' | 'delivered';

export interface TransferItem {
  sku: string;
  name: string;
  quantity: number;
}

export interface Transfer {
  id: string;
  fromBranch: string;
  toBranch: string;
  items: TransferItem[];
  status: TransferStatus;
  driverId: string | null;
  createdAt: string;
}

let transfers: Transfer[] = [
  {
    id: 'TR-1042',
    fromBranch: 'kumasi-asuoyeboa',
    toBranch: 'kumasi-adum',
    items: [
      { sku: 'LED-A60-9W', name: 'LED Bulb A60 9W', quantity: 40 },
      { sku: 'SW-2G-WH', name: '2-Gang Switch (White)', quantity: 15 },
    ],
    status: 'pending',
    driverId: null,
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: 'TR-1041',
    fromBranch: 'kumasi-asuoyeboa',
    toBranch: 'accra-circle',
    items: [{ sku: 'CBL-2.5-100', name: 'Cable 2.5mm² (100m)', quantity: 6 }],
    status: 'claimed',
    driverId: 'unassigned-driver',
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
  },
  {
    id: 'TR-1039',
    fromBranch: 'kumasi-asuoyeboa',
    toBranch: 'kumasi-suame',
    items: [{ sku: 'FLD-50W', name: 'Floodlight 50W', quantity: 12 }],
    status: 'in_transit',
    driverId: 'unassigned-driver',
    createdAt: new Date(Date.now() - 10800_000).toISOString(),
  },
  {
    id: 'TR-1035',
    fromBranch: 'kumasi-asuoyeboa',
    toBranch: 'kumasi-abuakwa',
    items: [{ sku: 'DL-6W-RND', name: 'Downlight 6W Round', quantity: 30 }],
    status: 'delivered',
    driverId: 'unassigned-driver',
    createdAt: new Date(Date.now() - 90000_000).toISOString(),
  },
];

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function emit() {
  listeners.forEach((l) => l());
}

export function listTransfers(): Transfer[] {
  return [...transfers].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function patch(id: string, next: Partial<Transfer>) {
  transfers = transfers.map((t) => (t.id === id ? { ...t, ...next } : t));
  emit();
}

export function claimTransfer(id: string, driverId: string) {
  patch(id, { status: 'claimed', driverId });
}
export function pickUpTransfer(id: string) {
  patch(id, { status: 'in_transit' });
}
export function deliverTransfer(id: string) {
  patch(id, { status: 'delivered' });
}

export const STATUS_META: Record<TransferStatus, { label: string; tone: 'info' | 'warning' | 'success' }> = {
  pending: { label: 'Available', tone: 'warning' },
  claimed: { label: 'Claimed', tone: 'info' },
  in_transit: { label: 'In transit', tone: 'info' },
  delivered: { label: 'Delivered', tone: 'success' },
};

// ─── Stock alerts (raised by branches, resolved by Front Desk) ──────────────

export type AlertStatus = 'open' | 'approved' | 'declined';

export interface StockAlert {
  id: string;
  branchSlug: string;
  sku: string;
  name: string;
  requestedQty: number;
  status: AlertStatus;
}

let alerts: StockAlert[] = [
  { id: 'AL-501', branchSlug: 'kumasi-adum', sku: 'LED-A60-9W', name: 'LED Bulb A60 9W', requestedQty: 60, status: 'open' },
  { id: 'AL-502', branchSlug: 'accra-tema', sku: 'CBL-2.5-100', name: 'Cable 2.5mm² (100m)', requestedQty: 8, status: 'open' },
  { id: 'AL-503', branchSlug: 'kumasi-suame', sku: 'FLD-50W', name: 'Floodlight 50W', requestedQty: 20, status: 'open' },
];

export function listAlerts(): StockAlert[] {
  return [...alerts];
}

let transferSeq = 1050;

/** Approve an alert: mark it resolved and dispatch a transfer the driver sees. */
export function approveAlert(id: string, fromBranch: string) {
  const alert = alerts.find((a) => a.id === id);
  if (!alert || alert.status !== 'open') return;
  alerts = alerts.map((a) => (a.id === id ? { ...a, status: 'approved' } : a));
  transfers = [
    {
      id: `TR-${transferSeq++}`,
      fromBranch,
      toBranch: alert.branchSlug,
      items: [{ sku: alert.sku, name: alert.name, quantity: alert.requestedQty }],
      status: 'pending',
      driverId: null,
      createdAt: new Date().toISOString(),
    },
    ...transfers,
  ];
  emit();
}

let alertSeq = 510;

/** Raise a new stock request (used by technicians / branches). */
export function raiseAlert(branchSlug: string, sku: string, name: string, requestedQty: number) {
  alerts = [
    { id: `AL-${alertSeq++}`, branchSlug, sku, name, requestedQty, status: 'open' },
    ...alerts,
  ];
  emit();
}

export function declineAlert(id: string) {
  alerts = alerts.map((a) => (a.id === id ? { ...a, status: 'declined' } : a));
  emit();
}

export const ALERT_META: Record<AlertStatus, { label: string; tone: 'info' | 'warning' | 'success' | 'danger' }> = {
  open: { label: 'Open', tone: 'warning' },
  approved: { label: 'Dispatched', tone: 'success' },
  declined: { label: 'Declined', tone: 'danger' },
};
