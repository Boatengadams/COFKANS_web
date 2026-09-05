/**
 * Developer Portal — full, backend-free testing hub.
 *
 * Two jobs:
 *  1. APP MAP — a launcher that links to every part of the app. Role portals
 *     are opened by switching the demo role (setDemoRole), which <StaffPortalHost>
 *     renders in-place — this is what actually works in the App.tsx-direct
 *     preview. Page routes are opened via navigation (they resolve in the
 *     deployed AppRouter).
 *  2. MANAGEMENT — full CRUD for products, staff, branches, orders, content and
 *     media, plus analytics, an activity log and settings. Everything persists
 *     to localStorage via ./developer-portal/store, so it works with no backend.
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import {
  Code2, LayoutDashboard, Package, Users, Building2, ShoppingCart, FileText, Image as ImageIcon,
  ScrollText, Settings as SettingsIcon, Plus, Search, Trash2, Pencil, X, Check, LogOut,
  PanelLeftClose, PanelLeftOpen, TrendingUp, AlertTriangle, DollarSign, Boxes, Activity, ShieldCheck,
  Save, RotateCcw, Compass, ExternalLink, ArrowRight, Store, Truck, Wrench, Warehouse, Calculator,
  UserCog, ClipboardList, Megaphone, LayoutGrid, FileStack, Home, KeyRound,
} from 'lucide-react';
import {
  store, onStoreChange,
  type Branch, type Order, type ContentBlock, type MediaItem, type LogEntry, type Settings,
} from './developer-portal/store';
import type { Product } from '../data/products-full';
import { setDemoRole, type DemoRole } from '@/lib/demo-mode';
import { StaffManagementPanel } from '../components/staff/StaffManagementPanel';
import { ChangePasswordModal } from '../components/staff/ChangePasswordModal';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { StaffAndSessionsPanel } from '../components/developer/StaffAndSessionsPanel';
import cofkansLogo from '../../imports/cofkans.png';
import { ThemeToggle } from '../components/ThemeToggle';
import { BlackFridayPanel } from './DeveloperPortal/panels/BlackFridayPanel';

interface Props { onBack?: () => void }

type Tab =
  | 'launcher' | 'dashboard' | 'products' | 'staff' | 'branches' | 'orders'
  | 'content' | 'black-friday' | 'media' | 'analytics' | 'logs' | 'settings';

/** Re-render whenever the store changes. */
function useStoreTick() {
  const [, setTick] = useState(0);
  useEffect(() => onStoreChange(() => setTick((t) => t + 1)), []);
}

const cedis = (n: number) => `GH₵ ${n.toLocaleString('en-GH', { minimumFractionDigits: 0 })}`;
const fmtDate = (ms: number) => new Date(ms).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (ms: number) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const CHART = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#047857', '#a7f3d0'];

/* ── shared primitives ────────────────────────────────────────────────── */
function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`erp-card erp-elevate rounded-2xl ${className}`}>{children}</div>;
}

function PanelHeader({ icon, title, subtitle, action }: { icon: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="erp-sheen p-3 bg-primary/10 rounded-xl ring-1 ring-primary/20">{icon}</div>
      <div className="flex-1">
        <h2 className="erp-gradient-text" style={{ fontSize: '1.5rem', lineHeight: 1.15 }}>{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wide text-muted-foreground block mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const inputCls = 'w-full px-3 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm';

function PrimaryBtn({ children, onClick, type = 'button', className = '' }: { children: ReactNode; onClick?: () => void; type?: 'button' | 'submit'; className?: string }) {
  return (
    <button type={type} onClick={onClick} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground erp-glow hover:opacity-90 transition text-sm ${className}`}>
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, className = '' }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition text-sm ${className}`}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[9500] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="erp-card erp-elevate-lg rounded-2xl w-full max-w-lg max-h-[88vh] overflow-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontSize: '1.2rem' }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

/* ── APP MAP / launcher ───────────────────────────────────────────────── */
interface RoleLink { role: DemoRole; label: string; desc: string; icon: ReactNode }
const ROLE_LINKS: RoleLink[] = [
  { role: 'customer', label: 'Storefront (Customer)', desc: 'Public shop & customer account', icon: <Store className="w-5 h-5" /> },
  { role: 'manager', label: 'Manager Portal', desc: 'Company-wide branch workspace', icon: <UserCog className="w-5 h-5" /> },
  { role: 'front_desk', label: 'Front Desk (Showroom)', desc: 'POS, catalog & support desk', icon: <LayoutGrid className="w-5 h-5" /> },
  { role: 'branch_desk', label: 'Front Desk (Branch)', desc: 'Branch-level desk', icon: <LayoutGrid className="w-5 h-5" /> },
  { role: 'driver', label: 'Driver Portal', desc: 'Deliveries & stock transfers', icon: <Truck className="w-5 h-5" /> },
  { role: 'technician', label: 'Technician Portal', desc: 'Service jobs & installs', icon: <Wrench className="w-5 h-5" /> },
  { role: 'warehouse', label: 'Warehouse', desc: 'Stock control', icon: <Warehouse className="w-5 h-5" /> },
  { role: 'accountant', label: 'Accountant', desc: 'Finance & accounts', icon: <Calculator className="w-5 h-5" /> },
  { role: 'hr', label: 'Human Resources', desc: 'People & payroll', icon: <Users className="w-5 h-5" /> },
  { role: 'procurement', label: 'Procurement', desc: 'Supply & purchasing', icon: <ClipboardList className="w-5 h-5" /> },
  { role: 'marketing', label: 'Marketing', desc: 'Campaigns & promos', icon: <Megaphone className="w-5 h-5" /> },
];

interface PageLink { path: string; label: string; icon: ReactNode }
const PAGE_LINKS: PageLink[] = [
  { path: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
  { path: '/manager', label: '/manager', icon: <ExternalLink className="w-4 h-4" /> },
  { path: '/frontdesk', label: '/frontdesk', icon: <ExternalLink className="w-4 h-4" /> },
  { path: '/driver', label: '/driver', icon: <ExternalLink className="w-4 h-4" /> },
  { path: '/technician', label: '/technician', icon: <ExternalLink className="w-4 h-4" /> },
  { path: '/showroom', label: '/showroom', icon: <ExternalLink className="w-4 h-4" /> },
  { path: '/catalog', label: '/catalog', icon: <ExternalLink className="w-4 h-4" /> },
  { path: '/reports', label: '/reports', icon: <ExternalLink className="w-4 h-4" /> },
  { path: '/branches', label: '/branches', icon: <ExternalLink className="w-4 h-4" /> },
  { path: '/login', label: '/login', icon: <ExternalLink className="w-4 h-4" /> },
];
const SITE_LINKS: PageLink[] = [
  { path: '/about', label: 'About', icon: <FileStack className="w-4 h-4" /> },
  { path: '/contact', label: 'Contact', icon: <FileStack className="w-4 h-4" /> },
  { path: '/support', label: 'Support', icon: <FileStack className="w-4 h-4" /> },
  { path: '/faq', label: 'FAQ', icon: <FileStack className="w-4 h-4" /> },
  { path: '/privacy', label: 'Privacy', icon: <FileStack className="w-4 h-4" /> },
  { path: '/terms', label: 'Terms', icon: <FileStack className="w-4 h-4" /> },
  { path: '/warranty', label: 'Warranty', icon: <FileStack className="w-4 h-4" /> },
  { path: '/shipping', label: 'Shipping', icon: <FileStack className="w-4 h-4" /> },
  { path: '/installation', label: 'Installation', icon: <FileStack className="w-4 h-4" /> },
  { path: '/careers', label: 'Careers', icon: <FileStack className="w-4 h-4" /> },
];

function AppMap() {
  const openRole = (role: DemoRole) => setDemoRole(role); // StaffPortalHost swaps in-place
  const openPath = (path: string) => { window.location.href = path; };

  return (
    <div className="space-y-6">
      <PanelHeader
        icon={<Compass className="w-6 h-6 text-primary" />}
        title="App Map"
        subtitle="Jump into every portal and page — role portals open live in the preview"
      />

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Role portals — open live</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLE_LINKS.map((r) => (
            <button key={r.role} onClick={() => openRole(r.role)} className="text-left">
              <Card className="erp-card-hover p-4 flex items-center gap-3 h-full">
                <div className="erp-sheen p-2.5 rounded-xl bg-primary/10 ring-1 ring-primary/20 text-primary">{r.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate">{r.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Card>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">App routes — navigate</div>
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {PAGE_LINKS.map((p) => (
              <button key={p.path} onClick={() => openPath(p.path)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-sm">
                {p.icon}<span>{p.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Marketing & legal pages</div>
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {SITE_LINKS.map((p) => (
              <button key={p.path} onClick={() => openPath(p.path)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-sm">
                {p.icon}<span>{p.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Role portals now require real Firebase users, staff records, and custom claims.
          Complete <strong>ReaquireBackendSetUp.md</strong> before testing staff access.
        </p>
      </Card>
    </div>
  );
}

/* ── dashboard ────────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, tone = 'primary' }: { icon: ReactNode; label: string; value: string; tone?: string }) {
  return (
    <Card className="erp-card-hover p-5 relative overflow-hidden">
      <div className={`inline-flex p-2.5 rounded-xl mb-3 ring-1 bg-${tone}/10 ring-${tone}/20 text-${tone}`}>{icon}</div>
      <div className="text-muted-foreground text-sm">{label}</div>
      <div style={{ fontSize: '1.75rem', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </Card>
  );
}

function Dashboard() {
  const products = store.getProducts();
  const staff = store.getStaff();
  const branches = store.getBranches();
  const orders = store.getOrders();
  const settings = store.getSettings();

  const revenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const lowStock = products.filter((p) => p.stock <= settings.lowStockThreshold).length;
  const pending = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;

  const revenueSeries = useMemo(
    () => ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((m, i) => ({ m, v: 8000 + Math.round(Math.sin(i) * 3000) + i * 1500 })),
    [],
  );
  const catData = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => counts.set(p.category, (counts.get(p.category) || 0) + 1));
    return [...counts.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [products]);

  return (
    <div className="space-y-6">
      <PanelHeader icon={<LayoutDashboard className="w-6 h-6 text-primary" />} title="Dashboard" subtitle="Live overview of the whole application" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign className="w-5 h-5" />} label="Revenue (demo)" value={cedis(revenue)} tone="primary" />
        <StatCard icon={<Boxes className="w-5 h-5" />} label="Products" value={String(products.length)} tone="emerald-600" />
        <StatCard icon={<ShoppingCart className="w-5 h-5" />} label="Open orders" value={String(pending)} tone="primary" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Low stock" value={String(lowStock)} tone="amber-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-primary" /><span className="text-sm">Revenue trend</span></div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <AreaChart data={revenueSeries} margin={{ left: -10, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="dpRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--erp-hairline, rgba(120,120,120,0.15))" key="grid" />
                <XAxis dataKey="m" tick={{ fontSize: 12 }} key="x" />
                <YAxis tick={{ fontSize: 12 }} key="y" />
                <Tooltip key="tip" />
                <Area key="area" type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fill="url(#dpRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4"><Activity className="w-4 h-4 text-primary" /><span className="text-sm">Products by category</span></div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {catData.map((_, i) => <Cell key={`c${i}`} fill={CHART[i % CHART.length]} />)}
                </Pie>
                <Tooltip key="tip" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5"><div className="text-sm text-muted-foreground">Staff accounts</div><div style={{ fontSize: '1.5rem' }}>{staff.length}</div></Card>
        <Card className="p-5"><div className="text-sm text-muted-foreground">Branches</div><div style={{ fontSize: '1.5rem' }}>{branches.length}</div></Card>
        <Card className="p-5 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <div><div className="text-sm">Demo mode</div><div className="text-xs text-muted-foreground">All data is local & safe to edit</div></div>
        </Card>
      </div>
    </div>
  );
}

/* ── products (full CRUD + creation) ──────────────────────────────────── */
const emptyProduct: Omit<Product, 'id'> = { name: '', sku: '', price: 0, category: '', subcategory: '', image: '', stock: 0, description: '' };

function ProductsPanel() {
  const products = store.getProducts();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Product | 'new' | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = s ? products.filter((p) => (p.name + p.sku + p.category).toLowerCase().includes(s)) : products;
    return list.slice(0, 60);
  }, [products, q]);

  return (
    <div className="space-y-5">
      <PanelHeader
        icon={<Package className="w-6 h-6 text-primary" />}
        title="Products"
        subtitle={`${products.length} items · create, edit and remove catalogue products`}
        action={<PrimaryBtn onClick={() => setEditing('new')}><Plus className="w-4 h-4" /> New product</PrimaryBtn>}
      />
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className={`${inputCls} pl-9`} />
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <Card key={p.id} className="erp-card-hover p-4 flex gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 m-5 text-muted-foreground" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.category}</div>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span>{p.price ? cedis(p.price) : '—'}</span>
                <span className={p.stock <= 5 ? 'text-amber-600' : 'text-muted-foreground'}>· {p.stock} in stock</span>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => setEditing(p)} className="p-1.5 rounded-md hover:bg-muted"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => { if (confirm(`Delete “${p.name}”?`)) store.deleteProduct(p.id); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editing && <ProductForm initial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function ProductForm({ initial, onClose }: { initial: Product | null; onClose: () => void }) {
  const [form, setForm] = useState<Omit<Product, 'id'>>(initial ? { ...initial } : { ...emptyProduct });
  const set = (k: keyof Omit<Product, 'id'>, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name.trim()) { alert('Name is required.'); return; }
    if (initial) store.updateProduct(initial.id, form);
    else store.addProduct(form);
    onClose();
  };

  return (
    <Modal title={initial ? 'Edit product' : 'Create product'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Name"><input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="SKU"><input className={inputCls} value={form.sku} onChange={(e) => set('sku', e.target.value)} /></Field>
          <Field label="Price (GH₵)"><input type="number" className={inputCls} value={form.price} onChange={(e) => set('price', Number(e.target.value))} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category"><input className={inputCls} value={form.category} onChange={(e) => set('category', e.target.value)} /></Field>
          <Field label="Subcategory"><input className={inputCls} value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)} /></Field>
        </div>
        <Field label="Stock"><input type="number" className={inputCls} value={form.stock} onChange={(e) => set('stock', Number(e.target.value))} /></Field>
        <Field label="Image URL"><input className={inputCls} value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="https://…" /></Field>
        <Field label="Description"><textarea className={`${inputCls} resize-none`} rows={3} value={form.description || ''} onChange={(e) => set('description', e.target.value)} /></Field>
        <div className="flex justify-end gap-2 pt-2">
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PrimaryBtn onClick={save}><Save className="w-4 h-4" /> {initial ? 'Save changes' : 'Create product'}</PrimaryBtn>
        </div>
      </div>
    </Modal>
  );
}

/* ── branches ─────────────────────────────────────────────────────────── */
function BranchesPanel() {
  const branches = store.getBranches();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  return (
    <div className="space-y-5">
      <PanelHeader
        icon={<Building2 className="w-6 h-6 text-primary" />}
        title="Branches"
        subtitle={`${branches.length} locations`}
        action={<PrimaryBtn onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> New branch</PrimaryBtn>}
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((b) => (
          <Card key={b.id} className="erp-card-hover p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">{b.name}{b.isMain && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary">MAIN</span>}</div>
                <div className="text-xs text-muted-foreground">{b.city}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditing(b)} className="p-1.5 rounded-md hover:bg-primary/10 text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => { if (confirm(`Delete ${b.name}?`)) store.deleteBranch(b.id); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="text-sm mt-3 space-y-1">
              <div className="text-muted-foreground">Manager: <span className="text-foreground">{b.manager}</span></div>
              <div className="text-muted-foreground">Phone: <span className="text-foreground">{b.phone}</span></div>
            </div>
            <button
              onClick={() => store.updateBranch(b.id, { status: b.status === 'open' ? 'closed' : 'open' })}
              className={`mt-3 px-2.5 py-1 rounded-full text-xs ${b.status === 'open' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-muted text-muted-foreground'}`}
            >{b.status}</button>
          </Card>
        ))}
      </div>
      {creating && <BranchForm onClose={() => setCreating(false)} />}
      {editing && <BranchForm branch={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function BranchForm({ branch, onClose }: { branch?: Branch; onClose: () => void }) {
  const isEdit = !!branch;
  const [form, setForm] = useState<Omit<Branch, 'id'>>(
    branch
      ? { name: branch.name, city: branch.city, manager: branch.manager, phone: branch.phone, isMain: branch.isMain, status: branch.status }
      : { name: '', city: 'Kumasi', manager: '', phone: '', isMain: false, status: 'open' },
  );
  const set = (k: keyof Omit<Branch, 'id'>, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const save = () => {
    if (!form.name.trim()) { alert('Branch name is required.'); return; }
    if (isEdit) store.updateBranch(branch!.id, form); else store.addBranch(form);
    onClose();
  };
  return (
    <Modal title={isEdit ? 'Edit branch' : 'Create branch'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Branch name"><input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City"><input className={inputCls} value={form.city} onChange={(e) => set('city', e.target.value)} /></Field>
          <Field label="Phone"><input className={inputCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
        </div>
        <Field label="Manager"><input className={inputCls} value={form.manager} onChange={(e) => set('manager', e.target.value)} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isMain} onChange={(e) => set('isMain', e.target.checked)} /> Main showroom</label>
        <div className="flex justify-end gap-2 pt-2">
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PrimaryBtn onClick={save}>{isEdit ? <><Check className="w-4 h-4" /> Save changes</> : <><Plus className="w-4 h-4" /> Create branch</>}</PrimaryBtn>
        </div>
      </div>
    </Modal>
  );
}

/* ── orders ───────────────────────────────────────────────────────────── */
const ORDER_STATUSES: Order['status'][] = ['pending', 'processing', 'delivered', 'cancelled'];
const statusTone: Record<Order['status'], string> = {
  pending: 'bg-amber-500/15 text-amber-600',
  processing: 'bg-blue-500/15 text-blue-600',
  delivered: 'bg-emerald-500/15 text-emerald-600',
  cancelled: 'bg-destructive/15 text-destructive',
};

function OrdersPanel() {
  const orders = store.getOrders();
  return (
    <div className="space-y-5">
      <PanelHeader icon={<ShoppingCart className="w-6 h-6 text-primary" />} title="Orders" subtitle={`${orders.length} orders · update fulfilment status`} />
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left p-3">Order</th><th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Branch</th><th className="text-left p-3">Items</th>
                <th className="text-left p-3">Total</th><th className="text-left p-3">Date</th><th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-border/60">
                  <td className="p-3 font-mono text-xs">{o.id.slice(-6).toUpperCase()}</td>
                  <td className="p-3">{o.customer}</td>
                  <td className="p-3 text-muted-foreground">{o.branch}</td>
                  <td className="p-3">{o.items}</td>
                  <td className="p-3">{cedis(o.total)}</td>
                  <td className="p-3 text-muted-foreground">{fmtDate(o.createdAt)}</td>
                  <td className="p-3">
                    <select value={o.status} onChange={(e) => store.updateOrder(o.id, { status: e.target.value as Order['status'] })} className={`px-2 py-1 rounded-full text-xs border-0 ${statusTone[o.status]}`}>
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ── content ──────────────────────────────────────────────────────────── */
function ContentPanel() {
  const blocks = store.getContent();
  const [draft, setDraft] = useState<Record<string, string>>({});
  return (
    <div className="space-y-5">
      <PanelHeader icon={<FileText className="w-6 h-6 text-primary" />} title="Site Content" subtitle="Edit landing-page copy that shows on the storefront" />
      <div className="grid gap-4">
        {blocks.map((c) => {
          const val = draft[c.id] ?? c.body;
          const dirty = val !== c.body;
          return (
            <Card key={c.id} className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div><div className="text-sm">{c.title}</div><code className="text-xs text-muted-foreground">{c.key}</code></div>
                <span className="text-[11px] text-muted-foreground">updated {fmtDate(c.updatedAt)}</span>
              </div>
              <textarea className={`${inputCls} resize-none`} rows={2} value={val} onChange={(e) => setDraft((d) => ({ ...d, [c.id]: e.target.value }))} />
              {dirty && (
                <div className="flex justify-end gap-2 mt-2">
                  <GhostBtn onClick={() => setDraft((d) => { const n = { ...d }; delete n[c.id]; return n; })}>Reset</GhostBtn>
                  <PrimaryBtn onClick={() => { store.updateContent(c.id, { body: val }); setDraft((d) => { const n = { ...d }; delete n[c.id]; return n; }); }}><Check className="w-4 h-4" /> Save</PrimaryBtn>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ── media ────────────────────────────────────────────────────────────── */
function MediaPanel() {
  const media = store.getMedia();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const add = () => { if (!url.trim()) return; store.addMedia({ name: name.trim() || 'Untitled', url: url.trim(), kind: 'image' }); setUrl(''); setName(''); };
  return (
    <div className="space-y-5">
      <PanelHeader icon={<ImageIcon className="w-6 h-6 text-primary" />} title="Media Library" subtitle={`${media.length} assets`} />
      <Card className="p-4 flex flex-col sm:flex-row gap-2">
        <input className={inputCls} placeholder="Asset name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={inputCls} placeholder="Image URL (https://…)" value={url} onChange={(e) => setUrl(e.target.value)} />
        <PrimaryBtn onClick={add} className="flex-shrink-0"><Plus className="w-4 h-4" /> Add</PrimaryBtn>
      </Card>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((m) => (
          <Card key={m.id} className="erp-card-hover overflow-hidden">
            <div className="aspect-square bg-muted"><img src={m.url} alt={m.name} className="w-full h-full object-cover" /></div>
            <div className="p-3 flex items-center justify-between gap-2">
              <span className="truncate text-xs">{m.name}</span>
              <button onClick={() => store.deleteMedia(m.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ── analytics ────────────────────────────────────────────────────────── */
function AnalyticsPanel() {
  const orders = store.getOrders();
  const products = store.getProducts();
  const byBranch = useMemo(() => {
    const m = new Map<string, number>();
    orders.forEach((o) => m.set(o.branch, (m.get(o.branch) || 0) + o.total));
    return [...m.entries()].map(([name, value]) => ({ name, value }));
  }, [orders]);
  const topCats = useMemo(() => {
    const m = new Map<string, number>();
    products.forEach((p) => m.set(p.category, (m.get(p.category) || 0) + 1));
    return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [products]);

  return (
    <div className="space-y-6">
      <PanelHeader icon={<TrendingUp className="w-6 h-6 text-primary" />} title="Analytics" subtitle="Revenue and catalogue insights" />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="text-sm mb-4">Revenue by branch</div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={byBranch} margin={{ left: -10, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--erp-hairline, rgba(120,120,120,0.15))" key="g" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} key="x" /><YAxis tick={{ fontSize: 11 }} key="y" /><Tooltip key="t" />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} key="b">{byBranch.map((_, i) => <Cell key={i} fill={CHART[i % CHART.length]} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm mb-4">Top categories by count</div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={topCats} layout="vertical" margin={{ left: 30, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--erp-hairline, rgba(120,120,120,0.15))" key="g" />
                <XAxis type="number" tick={{ fontSize: 11 }} key="x" /><YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} key="y" /><Tooltip key="t" />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#10b981" key="b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── logs ─────────────────────────────────────────────────────────────── */
const logTone: Record<LogEntry['level'], string> = { info: 'text-emerald-600', warn: 'text-amber-600', error: 'text-destructive' };
function LogsPanel() {
  const logs = store.getLogs();
  return (
    <div className="space-y-5">
      <PanelHeader
        icon={<ScrollText className="w-6 h-6 text-primary" />} title="Activity Log"
        subtitle={`${logs.length} entries`}
        action={<GhostBtn onClick={() => { if (confirm('Clear all logs?')) store.clearLogs(); }}><Trash2 className="w-4 h-4" /> Clear</GhostBtn>}
      />
      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-border/60">
          {logs.map((l) => (
            <div key={l.id} className="flex items-center gap-3 p-3 text-sm">
              <span className={`text-[10px] uppercase w-12 ${logTone[l.level]}`}>{l.level}</span>
              <span className="flex-1">{l.message}</span>
              <span className="text-xs text-muted-foreground">{l.actor}</span>
              <span className="text-xs text-muted-foreground w-16 text-right">{fmtTime(l.at)}</span>
            </div>
          ))}
          {logs.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No activity yet.</div>}
        </div>
      </Card>
    </div>
  );
}

/* ── settings ─────────────────────────────────────────────────────────── */
function SettingsPanel() {
  const [form, setForm] = useState<Settings>(() => store.getSettings());
  const set = (patch: Partial<Settings>) => setForm((f) => ({ ...f, ...patch }));
  const flag = (k: string, v: boolean) => setForm((f) => ({ ...f, featureFlags: { ...f.featureFlags, [k]: v } }));

  return (
    <div className="space-y-5">
      <PanelHeader icon={<SettingsIcon className="w-6 h-6 text-primary" />} title="Settings" subtitle="Global configuration, feature flags and danger zone" />
      <Card className="p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Store name"><input className={inputCls} value={form.storeName} onChange={(e) => set({ storeName: e.target.value })} /></Field>
          <Field label="Currency"><input className={inputCls} value={form.currency} onChange={(e) => set({ currency: e.target.value })} /></Field>
          <Field label="Delivery fee"><input type="number" className={inputCls} value={form.deliveryFee} onChange={(e) => set({ deliveryFee: Number(e.target.value) })} /></Field>
          <Field label="Low-stock threshold"><input type="number" className={inputCls} value={form.lowStockThreshold} onChange={(e) => set({ lowStockThreshold: Number(e.target.value) })} /></Field>
        </div>
        <div className="flex flex-wrap gap-4 pt-1">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.maintenanceMode} onChange={(e) => set({ maintenanceMode: e.target.checked })} /> Maintenance mode</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.allowSignups} onChange={(e) => set({ allowSignups: e.target.checked })} /> Allow customer signups</label>
        </div>
        <PrimaryBtn onClick={() => store.setSettings(form)}><Save className="w-4 h-4" /> Save settings</PrimaryBtn>
      </Card>

      <Card className="p-5">
        <div className="text-sm mb-3">Feature flags</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.entries(form.featureFlags).map(([k, v]) => (
            <label key={k} className="flex items-center justify-between gap-2 text-sm px-3 py-2 rounded-lg border border-border">
              <span>{k}</span>
              <input type="checkbox" checked={v} onChange={(e) => flag(k, e.target.checked)} />
            </label>
          ))}
        </div>
        <PrimaryBtn onClick={() => store.setSettings(form)} className="mt-4"><Save className="w-4 h-4" /> Save flags</PrimaryBtn>
      </Card>

      <Card className="p-5 border border-destructive/30">
        <div className="flex items-center gap-2 text-destructive mb-1"><AlertTriangle className="w-4 h-4" /><span className="text-sm">Danger zone</span></div>
        <p className="text-xs text-muted-foreground mb-3">Reset all demo data back to its seeded state. This cannot be undone.</p>
        <GhostBtn onClick={() => { if (confirm('Reset ALL developer-portal data to defaults?')) store.resetAll(); }} className="text-destructive border-destructive/40 hover:bg-destructive/10"><RotateCcw className="w-4 h-4" /> Reset all data</GhostBtn>
      </Card>
    </div>
  );
}

/* ── shell ────────────────────────────────────────────────────────────── */
const NAV: { group: string; items: { id: Tab; label: string; icon: ReactNode }[] }[] = [
  { group: 'Explore', items: [
    { id: 'launcher', label: 'App Map', icon: <Compass className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
  ] },
  { group: 'Manage', items: [
    { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
    { id: 'staff', label: 'Staff & Roles', icon: <Users className="w-4 h-4" /> },
    { id: 'branches', label: 'Branches', icon: <Building2 className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-4 h-4" /> },
  ] },
  { group: 'Content', items: [
    { id: 'content', label: 'Site Content', icon: <FileText className="w-4 h-4" /> },
    { id: 'black-friday', label: 'Black Friday', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'media', label: 'Media', icon: <ImageIcon className="w-4 h-4" /> },
  ] },
  { group: 'System', items: [
    { id: 'logs', label: 'Activity Log', icon: <ScrollText className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ] },
];

export function DeveloperPortal({ onBack }: Props) {
  useStoreTick();
  const [tab, setTab] = useState<Tab>('launcher');
  const [compact, setCompact] = useState(false);
  const [changePw, setChangePw] = useState(false);
  const { mustChangePassword } = useFirebaseAuth() as { mustChangePassword?: boolean };

  const panel = (() => {
    switch (tab) {
      case 'launcher': return <AppMap />;
      case 'dashboard': return <Dashboard />;
      case 'analytics': return <AnalyticsPanel />;
      case 'products': return <ProductsPanel />;
      case 'staff': return (
        <div className="space-y-8">
          <StaffManagementPanel actor="developer" title="Staff & Roles" subtitle="Full control — create, suspend for a period, or delete any account" />
          <StaffAndSessionsPanel />
        </div>
      );
      case 'branches': return <BranchesPanel />;
      case 'orders': return <OrdersPanel />;
      case 'content': return <ContentPanel />;
      case 'black-friday': return <BlackFridayPanel />;
      case 'media': return <MediaPanel />;
      case 'logs': return <LogsPanel />;
      case 'settings': return <SettingsPanel />;
      default: return <AppMap />;
    }
  })();

  return (
    <div className="erp-theme relative min-h-screen bg-background text-foreground flex">
      <div className="erp-ambient pointer-events-none absolute inset-0" />
      <div className="erp-grid-bg pointer-events-none absolute inset-0 opacity-40" />

      {/* Sidebar */}
      <aside className={`relative z-10 shrink-0 erp-glass border-r border-border flex flex-col ${compact ? 'w-16' : 'w-60'} transition-all`}>
        <div className="flex items-center gap-2 p-4 border-b border-border">
          {compact ? (
            <div className="erp-sheen inline-flex items-center justify-center rounded-xl p-2 shadow-md ring-1 ring-white/10" style={{ background: '#F5DEB3' }}>
              <img src={cofkansLogo} alt="Cofkans" className="h-4 w-auto max-w-[36px] object-contain" />
            </div>
          ) : (
            <>
              <div className="erp-sheen inline-flex items-center justify-center rounded-xl px-3 py-2 shadow-md ring-1 ring-white/10" style={{ background: '#F5DEB3' }}>
                <img src={cofkansLogo} alt="Cofkans Electricals" className="h-6 w-auto object-contain" />
              </div>
              <div className="min-w-0 border-l border-border pl-2">
                <div className="text-[11px] text-muted-foreground leading-tight">Developer<br />Testing hub</div>
              </div>
            </>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-4">
          {NAV.map((g) => (
            <div key={g.group}>
              {!compact && <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 mb-1">{g.group}</div>}
              <div className="space-y-1">
                {g.items.map((it) => {
                  const active = tab === it.id;
                  return (
                    <button
                      key={it.id}
                      onClick={() => setTab(it.id)}
                      title={it.label}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition ${active ? 'bg-primary text-primary-foreground erp-glow' : 'hover:bg-muted text-foreground/80'} ${compact ? 'justify-center' : ''}`}
                    >
                      {it.icon}{!compact && <span className="truncate">{it.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-2 border-t border-border space-y-1">
          <button onClick={() => setCompact((c) => !c)} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-muted ${compact ? 'justify-center' : ''}`} title="Toggle sidebar">
            {compact ? <PanelLeftOpen className="w-4 h-4" /> : <><PanelLeftClose className="w-4 h-4" /> <span>Collapse</span></>}
          </button>
          {onBack && (
            <button onClick={onBack} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-destructive/10 text-destructive ${compact ? 'justify-center' : ''}`} title="Exit">
              <LogOut className="w-4 h-4" />{!compact && <span>Exit portal</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="relative z-10 flex-1 min-w-0 overflow-y-auto">
        <div className="sticky top-0 z-20 erp-glass border-b border-border px-6 py-3 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Developer Portal</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary">Root access</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600">Demo data</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setChangePw(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground"
            >
              <KeyRound className="w-3.5 h-3.5" /> Change password
            </button>
            <ThemeToggle />
          </div>
        </div>
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="p-6 max-w-6xl mx-auto">
          {panel}
        </motion.div>
      </main>

      {mustChangePassword && <ChangePasswordModal forced onClose={() => {}} />}
      {changePw && !mustChangePassword && <ChangePasswordModal onClose={() => setChangePw(false)} />}
    </div>
  );
}

export default DeveloperPortal;
