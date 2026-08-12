/**
 * Developer Portal local store.
 *
 * Demo staff credentials have been removed. Complete ReaquireBackendSetUp.md
 * and create real Firebase users/staff records before using staff portals.
 */

import { csvProducts } from '../../data/csvProducts';
import type { Product } from '../../data/products-full';

export type ID = string;

export type StaffRole =
  | 'manager' | 'front_desk' | 'branch_desk' | 'driver' | 'technician'
  | 'warehouse' | 'accountant' | 'hr' | 'procurement' | 'marketing' | 'developer';

export interface StaffMember {
  id: ID;
  name: string;
  email: string;
  role: StaffRole;
  branch: string;
  status: 'active' | 'suspended';
  createdAt: number;
  /** Login password (codebase-managed; no real backend yet). */
  password?: string;
  /** Home branch slug used for branch-scoped routing. */
  branchSlug?: string;
  /** When true, the user must set a new password before using the app (set by a manager reset). */
  mustChangePassword?: boolean;
  /** Suspension metadata. `suspendedUntil = null` means indefinite. */
  suspendedUntil?: number | null;
  suspendedReason?: string;
  suspendedBy?: string;
  suspendedAt?: number;
}

/** No fallback staff password is supported. */
export const DEFAULT_STAFF_PASSWORD = '';

/** Roles allowed to create / delete / manage user accounts. */
export function canManageUsers(role?: StaffRole | string | null): boolean {
  return role === 'manager' || role === 'developer';
}

/** True if a member is suspended AND the suspension window hasn't elapsed. */
export function isCurrentlySuspended(m: StaffMember): boolean {
  if (m.status !== 'suspended') return false;
  if (m.suspendedUntil == null) return true; // indefinite
  return Date.now() < m.suspendedUntil;
}

export interface Branch {
  id: ID;
  name: string;
  city: string;
  manager: string;
  phone: string;
  isMain: boolean;
  status: 'open' | 'closed';
}

export interface Order {
  id: ID;
  customer: string;
  total: number;
  items: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  branch: string;
  createdAt: number;
}

export interface ContentBlock {
  id: ID;
  key: string;
  title: string;
  body: string;
  updatedAt: number;
}

export interface MediaItem {
  id: ID;
  name: string;
  url: string;
  kind: 'image' | 'logo' | 'banner';
}

export interface LogEntry {
  id: ID;
  at: number;
  level: 'info' | 'warn' | 'error';
  actor: string;
  message: string;
}

/** Append-only price-change record for the manager audit trail. */
export interface PriceAuditEntry {
  id: ID;
  at: number;
  productId: ID;
  sku: string;
  name: string;
  oldPrice: number;
  newPrice: number;
  /** Acting role/actor that made the change (e.g. 'manager', 'front_desk'). */
  actor: string;
}

/* ── Procurement purchase orders ─────────────────────────────────────── */
export type PurchaseOrderStatus = 'draft' | 'sent' | 'confirmed' | 'received';
export interface PurchaseOrder {
  id: ID;
  ref: string;
  supplier: string;
  category: string;
  lines: number;
  value: number;
  status: PurchaseOrderStatus;
  branch?: string;
  createdAt: number;
}

/* ── Marketing campaigns ─────────────────────────────────────────────── */
export type CampaignStatus = 'draft' | 'scheduled' | 'live' | 'ended';
export interface Campaign {
  id: ID;
  name: string;
  channel: string;
  status: CampaignStatus;
  reach: number;
  ctr: number;
  spend: number;
  createdAt: number;
}

/* ── Marketing promotions ────────────────────────────────────────────── */
export interface Promotion {
  id: ID;
  name: string;
  /** Percentage discount, e.g. 15 = -15%. */
  discount: number;
  /** Human-readable expiry, e.g. "in 3 days". */
  ends: string;
  createdAt: number;
}

export interface Settings {
  storeName: string;
  currency: string;
  deliveryFee: number;
  lowStockThreshold: number;
  maintenanceMode: boolean;
  allowSignups: boolean;
  featureFlags: Record<string, boolean>;
}

/* ── keys ─────────────────────────────────────────────────────────────── */
const K = {
  products: 'dp:products',
  staff: 'dp:staff',
  branches: 'dp:branches',
  orders: 'dp:orders',
  content: 'dp:content',
  media: 'dp:media',
  logs: 'dp:logs',
  priceAudit: 'dp:price-audit',
  purchaseOrders: 'dp:purchase-orders',
  campaigns: 'dp:campaigns',
  promotions: 'dp:promotions',
  settings: 'dp:settings',
  version: 'dp:seed-version',
} as const;

const SEED_VERSION = '2026-07-dev-portal-v3-auth';
export const STORE_EVENT = 'cofkans:dev-portal:change';

const canUse = typeof window !== 'undefined' && !!window.localStorage;

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

/* ── seeds ────────────────────────────────────────────────────────────── */
function seedStaff(): StaffMember[] {
  return [];
}

function seedBranches(): Branch[] {
  return [
    { id: uid('br'), name: 'Asuoyeboa Showroom', city: 'Kumasi', manager: 'Abena Mensah', phone: '+233 24 000 0001', isMain: true, status: 'open' },
    { id: uid('br'), name: 'Ahodwo Branch', city: 'Kumasi', manager: 'Kwame Asante', phone: '+233 24 000 0002', isMain: false, status: 'open' },
    { id: uid('br'), name: 'Suame Branch', city: 'Kumasi', manager: 'Yaw Boateng', phone: '+233 24 000 0003', isMain: false, status: 'open' },
    { id: uid('br'), name: 'Adum Branch', city: 'Kumasi', manager: 'Efua Sarpong', phone: '+233 24 000 0004', isMain: false, status: 'closed' },
  ];
}

function seedOrders(): Order[] {
  const now = Date.now();
  const names = ['Kojo Antwi', 'Adjoa Smith', 'Nana Adjei', 'Yaa Asantewaa', 'Kofi Danso', 'Akua Frimpong', 'Kwabena Osei', 'Abigail Tetteh'];
  const statuses: Order['status'][] = ['pending', 'processing', 'delivered', 'delivered', 'cancelled'];
  return Array.from({ length: 12 }).map((_, i) => ({
    id: uid('ord'),
    customer: names[i % names.length],
    total: 250 + Math.round(Math.random() * 4000),
    items: 1 + Math.floor(Math.random() * 6),
    status: statuses[i % statuses.length],
    branch: i % 3 === 0 ? 'Ahodwo Branch' : 'Asuoyeboa Showroom',
    createdAt: now - i * 5.4e7,
  }));
}

function seedContent(): ContentBlock[] {
  const now = Date.now();
  return [
    { id: uid('cnt'), key: 'hero.headline', title: 'Hero Headline', body: 'Powering Ghana with premium electricals', updatedAt: now },
    { id: uid('cnt'), key: 'hero.subtitle', title: 'Hero Subtitle', body: 'Lighting, wiring and power solutions trusted since 1998.', updatedAt: now },
    { id: uid('cnt'), key: 'about.blurb', title: 'About Blurb', body: 'Cofkans Electricals supplies quality electrical products across Ashanti and beyond.', updatedAt: now },
    { id: uid('cnt'), key: 'footer.tagline', title: 'Footer Tagline', body: 'Quality you can trust. Service you can count on.', updatedAt: now },
  ];
}

function seedMedia(): MediaItem[] {
  return csvProducts.slice(0, 8).map((p) => ({ id: uid('med'), name: p.name, url: p.image, kind: 'image' as const }));
}

function seedLogs(): LogEntry[] {
  const now = Date.now();
  return [
    { id: uid('log'), at: now - 6e5, level: 'info', actor: 'system', message: 'Developer portal initialised in demo mode.' },
    { id: uid('log'), at: now - 12e5, level: 'info', actor: 'abena@cofkanselectricals.com', message: 'Updated pricing for Outdoor Lighting.' },
    { id: uid('log'), at: now - 30e5, level: 'warn', actor: 'system', message: 'Low stock detected on 4 SKUs.' },
    { id: uid('log'), at: now - 60e5, level: 'error', actor: 'system', message: 'Payment webhook retry (demo — no real backend).' },
  ];
}

function seedSettings(): Settings {
  return {
    storeName: 'Cofkans Electricals',
    currency: 'GH₵',
    deliveryFee: 50,
    lowStockThreshold: 5,
    maintenanceMode: false,
    allowSignups: true,
    featureFlags: {
      blackFridayDeals: true,
      personalization: true,
      supportWidget: true,
      pwaInstall: true,
    },
  };
}

function seedPurchaseOrders(): PurchaseOrder[] {
  const now = Date.now();
  return [
    { id: uid('po'), ref: 'PO-2041', supplier: 'Nexans Ghana', category: 'Cables & Wiring', lines: 8, value: 42800, status: 'confirmed', branch: 'Asuoyeboa (Main)', createdAt: now - 3.2e8 },
    { id: uid('po'), ref: 'PO-2042', supplier: 'Philips Lighting', category: 'Lighting', lines: 5, value: 18600, status: 'sent', branch: 'Asuoyeboa (Main)', createdAt: now - 1.9e8 },
    { id: uid('po'), ref: 'PO-2043', supplier: 'Schneider Electric', category: 'Switchgear', lines: 12, value: 63400, status: 'received', branch: 'Ahodwo Branch', createdAt: now - 5.4e8 },
    { id: uid('po'), ref: 'PO-2044', supplier: 'Legrand WA', category: 'Accessories', lines: 6, value: 12250, status: 'draft', branch: 'Asuoyeboa (Main)', createdAt: now - 4.2e7 },
    { id: uid('po'), ref: 'PO-2045', supplier: 'ABB Ghana', category: 'Protection', lines: 4, value: 29900, status: 'sent', branch: 'Suame Branch', createdAt: now - 8.6e7 },
  ];
}

function seedCampaigns(): Campaign[] {
  const now = Date.now();
  return [
    { id: uid('cmp'), name: 'Black Friday Power Deals', channel: 'Email + Social', status: 'live', reach: 18400, ctr: 4.2, spend: 3200, createdAt: now - 1.2e8 },
    { id: uid('cmp'), name: 'Rainy Season Lighting', channel: 'Social', status: 'scheduled', reach: 0, ctr: 0, spend: 1500, createdAt: now - 3.1e7 },
    { id: uid('cmp'), name: 'Contractor Bulk Discount', channel: 'SMS', status: 'live', reach: 6200, ctr: 6.8, spend: 900, createdAt: now - 2.4e8 },
    { id: uid('cmp'), name: 'Easter Home Upgrade', channel: 'Email', status: 'ended', reach: 22100, ctr: 3.5, spend: 4100, createdAt: now - 7.8e8 },
    { id: uid('cmp'), name: 'New Branch Launch — Suame', channel: 'Radio + Social', status: 'draft', reach: 0, ctr: 0, spend: 0, createdAt: now - 1.1e7 },
  ];
}

function seedPromotions(): Promotion[] {
  const now = Date.now();
  return [
    { id: uid('promo'), name: 'LED Panel 18W', discount: 15, ends: 'in 3 days', createdAt: now - 2e7 },
    { id: uid('promo'), name: '2.5mm² Twin & Earth (90m)', discount: 10, ends: 'in 6 days', createdAt: now - 1e7 },
    { id: uid('promo'), name: 'Surface Socket Double', discount: 20, ends: 'in 1 day', createdAt: now - 3e7 },
    { id: uid('promo'), name: 'Circuit Breaker 32A', discount: 12, ends: 'in 9 days', createdAt: now - 5e6 },
  ];
}

/* ── low-level read/write ─────────────────────────────────────────────── */
function ensureVersion() {
  if (!canUse) return;
  try {
    if (window.localStorage.getItem(K.version) === SEED_VERSION) return;
    [K.products, K.staff, K.branches, K.orders, K.content, K.media, K.logs, K.priceAudit, K.purchaseOrders, K.campaigns, K.promotions, K.settings].forEach((k) =>
      window.localStorage.removeItem(k),
    );
    window.localStorage.setItem(K.version, SEED_VERSION);
  } catch { /* ignore */ }
}
ensureVersion();

function read<T>(key: string, seed: T): T {
  if (!canUse) return seed;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) {
      window.localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as T;
  } catch {
    return seed;
  }
}

function write<T>(key: string, value: T): void {
  if (!canUse) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: key }));
  } catch { /* ignore */ }
}

export function onStoreChange(fn: () => void): () => void {
  if (!canUse) return () => {};
  const handler = () => fn();
  window.addEventListener(STORE_EVENT, handler);
  return () => window.removeEventListener(STORE_EVENT, handler);
}

/* ── public collection API ────────────────────────────────────────────── */
export const store = {
  // Products
  getProducts: (): Product[] => read<Product[]>(K.products, csvProducts),
  setProducts: (v: Product[]) => write(K.products, v),
  addProduct: (p: Omit<Product, 'id'>): Product => {
    const list = store.getProducts();
    const created: Product = { ...p, id: uid('cfk') };
    store.setProducts([created, ...list]);
    store.log('info', 'developer', `Created product “${created.name}”.`);
    return created;
  },
  updateProduct: (id: ID, patch: Partial<Product>) => {
    store.setProducts(store.getProducts().map((p) => (p.id === id ? { ...p, ...patch } : p)));
  },
  deleteProduct: (id: ID) => {
    const p = store.getProducts().find((x) => x.id === id);
    store.setProducts(store.getProducts().filter((x) => x.id !== id));
    if (p) store.log('warn', 'developer', `Deleted product “${p.name}”.`);
  },

  // Staff
  getStaff: (): StaffMember[] => {
    const list = read<StaffMember[]>(K.staff, seedStaff());
    // Auto-reinstate anyone whose timed suspension has elapsed.
    let changed = false;
    const now = Date.now();
    const reconciled = list.map((s) => {
      if (s.status === 'suspended' && s.suspendedUntil != null && now >= s.suspendedUntil) {
        changed = true;
        return { ...s, status: 'active' as const, suspendedUntil: undefined, suspendedReason: undefined, suspendedBy: undefined, suspendedAt: undefined };
      }
      return s;
    });
    if (changed) write(K.staff, reconciled);
    return reconciled;
  },
  setStaff: (v: StaffMember[]) => write(K.staff, v),
  addStaff: (s: Omit<StaffMember, 'id' | 'createdAt'>, actor = 'developer'): StaffMember => {
    const created: StaffMember = { ...s, id: uid('stf'), createdAt: Date.now() };
    store.setStaff([created, ...store.getStaff()]);
    store.log('info', actor, `Created staff account for ${created.email} (${created.role}).`);
    return created;
  },
  updateStaff: (id: ID, patch: Partial<StaffMember>) =>
    store.setStaff(store.getStaff().map((s) => (s.id === id ? { ...s, ...patch } : s))),
  deleteStaff: (id: ID, actor = 'developer') => {
    const s = store.getStaff().find((x) => x.id === id);
    store.setStaff(store.getStaff().filter((x) => x.id !== id));
    if (s) store.log('warn', actor, `Deleted staff account ${s.email}.`);
  },
  /**
   * Suspend a staff member for `days` (0 / undefined = indefinite). Fires a log
   * entry recording who did it, why and until when.
   */
  suspendStaff: (id: ID, opts: { days?: number; reason?: string; actor?: string } = {}) => {
    const { days, reason, actor = 'developer' } = opts;
    const until = days && days > 0 ? Date.now() + days * 86_400_000 : null;
    store.setStaff(store.getStaff().map((s) => (s.id === id
      ? { ...s, status: 'suspended' as const, suspendedUntil: until, suspendedReason: reason, suspendedBy: actor, suspendedAt: Date.now() }
      : s)));
    const s = store.getStaff().find((x) => x.id === id);
    const when = until ? `until ${new Date(until).toLocaleDateString('en-GB')}` : 'indefinitely';
    if (s) store.log('warn', actor, `Suspended ${s.email} ${when}${reason ? ` — ${reason}` : ''}.`);
  },
  reinstateStaff: (id: ID, actor = 'developer') => {
    store.setStaff(store.getStaff().map((s) => (s.id === id
      ? { ...s, status: 'active' as const, suspendedUntil: undefined, suspendedReason: undefined, suspendedBy: undefined, suspendedAt: undefined }
      : s)));
    const s = store.getStaff().find((x) => x.id === id);
    if (s) store.log('info', actor, `Reinstated ${s.email}.`);
  },

  /** Find an account by email, username (email local-part) or full name. */
  findByLogin: (login: string): StaffMember | null => {
    const l = login.trim().toLowerCase();
    if (!l) return null;
    return store.getStaff().find((m) => {
      const email = m.email.toLowerCase();
      return email === l || email.split('@')[0] === l || m.name.toLowerCase() === l;
    }) ?? null;
  },
  /** Validate credentials. Returns the account on match, else null. */
  verifyLogin: (login: string, password: string): StaffMember | null => {
    const member = store.findByLogin(login);
    if (!member) return null;
    return (member.password ?? DEFAULT_STAFF_PASSWORD) === password ? member : null;
  },
  getStaffById: (id: ID): StaffMember | null => store.getStaff().find((m) => m.id === id) ?? null,

  /**
   * Set an account's login password (manager/developer reset). Logs the action
   * against `actor` without revealing the password.
   */
  setPassword: (id: ID, password: string, actor = 'developer'): boolean => {
    const m = store.getStaffById(id);
    if (!m) return false;
    // A manager-set password is temporary — force the user to choose their own on next login.
    store.updateStaff(id, { password, mustChangePassword: true });
    store.log('warn', actor, `Reset password for ${m.email} (user must change it at next login).`);
    return true;
  },
  /**
   * Change your own password after re-confirming the current one. Returns a
   * result flag so the UI can show the right error.
   */
  changePassword: (id: ID, current: string, next: string): 'ok' | 'wrong-current' | 'not-found' => {
    const m = store.getStaffById(id);
    if (!m) return 'not-found';
    if ((m.password ?? DEFAULT_STAFF_PASSWORD) !== current) return 'wrong-current';
    store.updateStaff(id, { password: next, mustChangePassword: false });
    store.log('info', m.email, 'Changed their own password.');
    return 'ok';
  },

  // Branches
  getBranches: (): Branch[] => read<Branch[]>(K.branches, seedBranches()),
  setBranches: (v: Branch[]) => write(K.branches, v),
  addBranch: (b: Omit<Branch, 'id'>): Branch => {
    const created: Branch = { ...b, id: uid('br') };
    store.setBranches([...store.getBranches(), created]);
    store.log('info', 'developer', `Added branch “${created.name}”.`);
    return created;
  },
  updateBranch: (id: ID, patch: Partial<Branch>) =>
    store.setBranches(store.getBranches().map((b) => (b.id === id ? { ...b, ...patch } : b))),
  deleteBranch: (id: ID) => store.setBranches(store.getBranches().filter((b) => b.id !== id)),

  // Orders
  getOrders: (): Order[] => read<Order[]>(K.orders, seedOrders()),
  setOrders: (v: Order[]) => write(K.orders, v),
  updateOrder: (id: ID, patch: Partial<Order>) =>
    store.setOrders(store.getOrders().map((o) => (o.id === id ? { ...o, ...patch } : o))),

  // Content
  getContent: (): ContentBlock[] => read<ContentBlock[]>(K.content, seedContent()),
  setContent: (v: ContentBlock[]) => write(K.content, v),
  addContent: (c: Omit<ContentBlock, 'id' | 'updatedAt'>): ContentBlock => {
    const created: ContentBlock = { ...c, id: uid('cnt'), updatedAt: Date.now() };
    store.setContent([...store.getContent(), created]);
    return created;
  },
  updateContent: (id: ID, patch: Partial<ContentBlock>) =>
    store.setContent(store.getContent().map((c) => (c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c))),
  deleteContent: (id: ID) => store.setContent(store.getContent().filter((c) => c.id !== id)),

  // Media
  getMedia: (): MediaItem[] => read<MediaItem[]>(K.media, seedMedia()),
  setMedia: (v: MediaItem[]) => write(K.media, v),
  addMedia: (m: Omit<MediaItem, 'id'>): MediaItem => {
    const created: MediaItem = { ...m, id: uid('med') };
    store.setMedia([created, ...store.getMedia()]);
    return created;
  },
  deleteMedia: (id: ID) => store.setMedia(store.getMedia().filter((m) => m.id !== id)),

  // Logs
  getLogs: (): LogEntry[] => read<LogEntry[]>(K.logs, seedLogs()),
  log: (level: LogEntry['level'], actor: string, message: string) => {
    const entry: LogEntry = { id: uid('log'), at: Date.now(), level, actor, message };
    write(K.logs, [entry, ...read<LogEntry[]>(K.logs, seedLogs())].slice(0, 200));
  },
  clearLogs: () => write(K.logs, []),

  // Price audit (append-only, newest first)
  getPriceAudit: (): PriceAuditEntry[] => read<PriceAuditEntry[]>(K.priceAudit, []),
  recordPriceChange: (e: Omit<PriceAuditEntry, 'id' | 'at'>) => {
    const entry: PriceAuditEntry = { ...e, id: uid('pa'), at: Date.now() };
    write(K.priceAudit, [entry, ...read<PriceAuditEntry[]>(K.priceAudit, [])].slice(0, 500));
  },

  // Procurement — purchase orders
  getPurchaseOrders: (): PurchaseOrder[] => read<PurchaseOrder[]>(K.purchaseOrders, seedPurchaseOrders()),
  setPurchaseOrders: (v: PurchaseOrder[]) => write(K.purchaseOrders, v),
  addPurchaseOrder: (p: Omit<PurchaseOrder, 'id' | 'ref' | 'createdAt'> & { ref?: string }, actor = 'procurement'): PurchaseOrder => {
    const existing = store.getPurchaseOrders();
    const nextNum = 2041 + existing.length;
    const created: PurchaseOrder = { ...p, id: uid('po'), ref: p.ref ?? `PO-${nextNum}`, createdAt: Date.now() };
    store.setPurchaseOrders([created, ...existing]);
    store.log('info', actor, `Raised purchase order ${created.ref} to ${created.supplier} (${store.getSettings().currency}${created.value.toLocaleString()}).`);
    return created;
  },
  updatePurchaseOrder: (id: ID, patch: Partial<PurchaseOrder>) =>
    store.setPurchaseOrders(store.getPurchaseOrders().map((p) => (p.id === id ? { ...p, ...patch } : p))),
  advancePurchaseOrder: (id: ID, actor = 'procurement') => {
    const flow: PurchaseOrderStatus[] = ['draft', 'sent', 'confirmed', 'received'];
    const po = store.getPurchaseOrders().find((x) => x.id === id);
    if (!po) return;
    const next = flow[Math.min(flow.indexOf(po.status) + 1, flow.length - 1)];
    if (next === po.status) return;
    store.updatePurchaseOrder(id, { status: next });
    store.log('info', actor, `Purchase order ${po.ref} moved to “${next}”.`);
  },
  deletePurchaseOrder: (id: ID, actor = 'procurement') => {
    const po = store.getPurchaseOrders().find((x) => x.id === id);
    store.setPurchaseOrders(store.getPurchaseOrders().filter((x) => x.id !== id));
    if (po) store.log('warn', actor, `Deleted purchase order ${po.ref}.`);
  },

  // Marketing — campaigns
  getCampaigns: (): Campaign[] => read<Campaign[]>(K.campaigns, seedCampaigns()),
  setCampaigns: (v: Campaign[]) => write(K.campaigns, v),
  addCampaign: (c: Omit<Campaign, 'id' | 'createdAt'>, actor = 'marketing'): Campaign => {
    const created: Campaign = { ...c, id: uid('cmp'), createdAt: Date.now() };
    store.setCampaigns([created, ...store.getCampaigns()]);
    store.log('info', actor, `Created campaign “${created.name}” on ${created.channel}.`);
    return created;
  },
  updateCampaign: (id: ID, patch: Partial<Campaign>) =>
    store.setCampaigns(store.getCampaigns().map((c) => (c.id === id ? { ...c, ...patch } : c))),
  advanceCampaign: (id: ID, actor = 'marketing') => {
    const flow: CampaignStatus[] = ['draft', 'scheduled', 'live', 'ended'];
    const c = store.getCampaigns().find((x) => x.id === id);
    if (!c) return;
    const next = flow[Math.min(flow.indexOf(c.status) + 1, flow.length - 1)];
    if (next === c.status) return;
    store.updateCampaign(id, { status: next });
    store.log('info', actor, `Campaign “${c.name}” moved to “${next}”.`);
  },
  deleteCampaign: (id: ID, actor = 'marketing') => {
    const c = store.getCampaigns().find((x) => x.id === id);
    store.setCampaigns(store.getCampaigns().filter((x) => x.id !== id));
    if (c) store.log('warn', actor, `Deleted campaign “${c.name}”.`);
  },

  // Marketing — promotions
  getPromotions: (): Promotion[] => read<Promotion[]>(K.promotions, seedPromotions()),
  setPromotions: (v: Promotion[]) => write(K.promotions, v),
  addPromotion: (p: Omit<Promotion, 'id' | 'createdAt'>, actor = 'marketing'): Promotion => {
    const created: Promotion = { ...p, id: uid('promo'), createdAt: Date.now() };
    store.setPromotions([created, ...store.getPromotions()]);
    store.log('info', actor, `Created promotion “${created.name}” (-${created.discount}%).`);
    return created;
  },
  updatePromotion: (id: ID, patch: Partial<Promotion>) =>
    store.setPromotions(store.getPromotions().map((p) => (p.id === id ? { ...p, ...patch } : p))),
  deletePromotion: (id: ID, actor = 'marketing') => {
    const p = store.getPromotions().find((x) => x.id === id);
    store.setPromotions(store.getPromotions().filter((x) => x.id !== id));
    if (p) store.log('warn', actor, `Deleted promotion “${p.name}”.`);
  },

  // Settings
  getSettings: (): Settings => read<Settings>(K.settings, seedSettings()),
  setSettings: (v: Settings) => {
    write(K.settings, v);
    store.log('info', 'developer', 'Updated system settings.');
  },

  // Danger zone
  resetAll: () => {
    if (!canUse) return;
    [K.products, K.staff, K.branches, K.orders, K.content, K.media, K.logs, K.priceAudit, K.purchaseOrders, K.campaigns, K.promotions, K.settings, K.version].forEach((k) =>
      window.localStorage.removeItem(k),
    );
    ensureVersion();
    window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: 'reset' }));
  },
};
