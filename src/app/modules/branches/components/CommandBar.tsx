/**
 * Multi-Branch Module — global command palette (⌘K) + notifications bell.
 *
 * Shared chrome mounted in the branch top bar across every role/portal:
 *   • CommandPalette — fuzzy launcher for any nav segment the role can access
 *     PLUS quick actions (new sale, raise stock alert, switch role). Opens with
 *     ⌘K / Ctrl-K or "/".
 *   • NotificationsBell — live badge + dropdown built from real stock alerts and
 *     transfer activity. Items are actionable inline (approve/decline a stock
 *     request, dispatch a driver, mark delivered) and carry a persisted
 *     read/unread state so the badge only counts genuinely new events.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Bell, ArrowLeftRight, PackageSearch, Truck, CheckCircle2,
  CornerDownLeft, Command as CommandIcon, X, ShoppingCart, PackagePlus,
  Repeat, Check, ThumbsDown, UserCheck, CheckCheck,
} from 'lucide-react';
import { branchPath, type BranchSegment } from '../routes/paths';
import { useTransfers, useStockAlerts } from '../hooks/useTransfers';
import { resolveAlert, claimTransfer, deliverTransfer } from '../services/transferService';
import { formatDateTime } from '../utils/format';
import { setDemoRole, DEMO_USERS, type DemoRole } from '../../../../lib/demo-mode';

export interface CommandItem {
  segment: BranchSegment;
  label: string;
  icon: ReactNode;
}

/* ============================================================= Command palette */

interface Entry {
  id: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  run: () => void;
}

interface Group {
  heading: string;
  entries: Entry[];
}

/** Staff roles offered by the ⌘K "switch role" quick actions. */
const SWITCHABLE: { role: DemoRole; label: string }[] = [
  { role: 'manager', label: 'Manager' },
  { role: 'front_desk', label: 'Front Desk' },
  { role: 'warehouse', label: 'Warehouse' },
  { role: 'accountant', label: 'Accountant' },
  { role: 'hr', label: 'HR' },
  { role: 'procurement', label: 'Procurement' },
  { role: 'marketing', label: 'Marketing' },
  { role: 'driver', label: 'Driver' },
  { role: 'technician', label: 'Technician' },
  { role: 'developer', label: 'Developer' },
];

export function CommandPalette({
  branchId, items,
}: {
  branchId: string;
  items: CommandItem[];
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const has = (seg: BranchSegment) => items.some((i) => i.segment === seg);

  // Build the grouped command set: quick actions, navigation, role switch.
  const groups = useMemo<Group[]>(() => {
    const nav: Entry[] = items.map((i) => ({
      id: `nav-${i.segment}`,
      label: i.label,
      hint: 'Go to',
      icon: i.icon,
      run: () => navigate(branchPath(branchId, i.segment)),
    }));

    const actions: Entry[] = [];
    if (has('sales')) actions.push({
      id: 'qa-sale', label: 'New sale', hint: 'Action',
      icon: <ShoppingCart className="h-[18px] w-[18px]" />,
      run: () => navigate(branchPath(branchId, 'sales')),
    });
    if (has('transfers')) actions.push({
      id: 'qa-alert', label: 'Raise stock alert', hint: 'Action',
      icon: <PackagePlus className="h-[18px] w-[18px]" />,
      run: () => navigate(branchPath(branchId, 'transfers')),
    });
    if (has('reports')) actions.push({
      id: 'qa-report', label: 'Open reports', hint: 'Action',
      icon: <PackageSearch className="h-[18px] w-[18px]" />,
      run: () => navigate(branchPath(branchId, 'reports')),
    });

    const roles: Entry[] = SWITCHABLE.map((r) => ({
      id: `role-${r.role}`,
      label: `Switch to ${r.label}`,
      hint: 'Role',
      icon: <Repeat className="h-[18px] w-[18px]" />,
      run: () => setDemoRole(r.role),
    }));

    return [
      { heading: 'Quick actions', entries: actions },
      { heading: 'Navigate', entries: nav },
      { heading: 'Switch role', entries: roles },
    ].filter((g) => g.entries.length > 0);
  }, [items, branchId, navigate]);

  // Flatten + filter for keyboard nav and search.
  const filtered = useMemo<Group[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({ ...g, entries: g.entries.filter((e) => e.label.toLowerCase().includes(q)) }))
      .filter((g) => g.entries.length > 0);
  }, [groups, query]);

  const flat = useMemo(() => filtered.flatMap((g) => g.entries), [filtered]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      const el = e.target as HTMLElement | null;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (k === '/' && !typing && !open) { e.preventDefault(); setOpen(true); }
      if (k === 'escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const run = (entry: Entry) => { setOpen(false); entry.run(); };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && flat[active]) { e.preventDefault(); run(flat[active]); }
  };

  let idx = -1; // running index across groups for active highlighting

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        aria-label="Open command palette"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search…</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] md:inline-flex">
          <CommandIcon className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-[12vh]">
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            >
              <div className="flex items-center gap-3 border-b border-border px-4">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                  onKeyDown={onInputKey}
                  placeholder="Search screens, actions, roles…"
                  className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button onClick={() => setOpen(false)} className="rounded p-1 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[52vh] overflow-y-auto p-2 scrollbar-hide">
                {flat.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No matches for “{query}”.</p>
                ) : (
                  filtered.map((g) => (
                    <div key={g.heading} className="mb-1">
                      <p className="px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{g.heading}</p>
                      {g.entries.map((entry) => {
                        idx += 1;
                        const i = idx;
                        return (
                          <button
                            key={entry.id}
                            onMouseEnter={() => setActive(i)}
                            onClick={() => run(entry)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                              i === active ? 'bg-primary/12 text-foreground' : 'text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            <span className={i === active ? 'text-primary' : 'text-muted-foreground'}>{entry.icon}</span>
                            <span className="flex-1">{entry.label}</span>
                            {i === active && <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" />}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><CornerDownLeft className="h-3 w-3" /> to run</span>
                <span>↑↓ to navigate · esc to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ================================================================ Notifications */

const READ_KEY = 'ce.branch.notifications.read';

function loadRead(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]') as string[]); }
  catch { return new Set(); }
}
function persistRead(ids: Set<string>) {
  try { localStorage.setItem(READ_KEY, JSON.stringify([...ids])); } catch { /* ignore */ }
}

type NoteKind = 'alert' | 'transfer-pending' | 'transfer-transit';

interface Note {
  id: string;
  kind: NoteKind;
  refId: string;
  icon: ReactNode;
  title: string;
  detail: string;
  at: string;
  tone: string;
  segment: BranchSegment;
}

export function NotificationsBell({ branchId }: { branchId: string }) {
  const navigate = useNavigate();
  const transfers = useTransfers();
  const alerts = useStockAlerts();
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<Set<string>>(loadRead);

  const notes = useMemo<Note[]>(() => {
    const out: Note[] = [];
    alerts.filter((a) => a.status === 'pending').forEach((a) => out.push({
      id: `alert-${a.id}`, kind: 'alert', refId: a.id,
      icon: <PackageSearch className="h-4 w-4" />,
      title: 'Stock request',
      detail: `${a.name} ×${a.requestedQty} · ${a.branchSlug.replace('kumasi-', '')}`,
      at: a.raisedAt, tone: 'text-amber-600', segment: 'transfers',
    }));
    transfers.filter((t) => t.status === 'pending').forEach((t) => out.push({
      id: `t-pending-${t.id}`, kind: 'transfer-pending', refId: t.id,
      icon: <ArrowLeftRight className="h-4 w-4" />,
      title: 'Transfer awaiting driver',
      detail: `${t.items.length} line(s) → ${t.toBranch.replace('kumasi-', '')}`,
      at: t.createdAt, tone: 'text-sky-600', segment: 'transfers',
    }));
    transfers.filter((t) => t.status === 'in_transit').forEach((t) => out.push({
      id: `t-transit-${t.id}`, kind: 'transfer-transit', refId: t.id,
      icon: <Truck className="h-4 w-4" />,
      title: 'Delivery in transit',
      detail: `→ ${t.toBranch.replace('kumasi-', '')}${t.driverName ? ` · ${t.driverName}` : ''}`,
      at: t.pickedUpAt ?? t.createdAt, tone: 'text-primary', segment: 'transfers',
    }));
    return out.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 20);
  }, [transfers, alerts]);

  // Keep the persisted read-set from growing unbounded: drop ids that no longer
  // correspond to a live notification.
  useEffect(() => {
    const live = new Set(notes.map((n) => n.id));
    setRead((prev) => {
      const next = new Set([...prev].filter((id) => live.has(id)));
      if (next.size !== prev.size) { persistRead(next); return next; }
      return prev;
    });
  }, [notes]);

  const unread = notes.filter((n) => !read.has(n.id)).length;

  const markRead = (id: string) => setRead((prev) => {
    if (prev.has(id)) return prev;
    const next = new Set(prev).add(id);
    persistRead(next);
    return next;
  });
  const markAllRead = () => setRead(() => {
    const next = new Set(notes.map((n) => n.id));
    persistRead(next);
    return next;
  });

  // Inline actions — mutate the store; useStoreSync re-renders the list.
  const approve = (n: Note) => { resolveAlert(n.refId, 'approved'); markRead(n.id); };
  const decline = (n: Note) => { resolveAlert(n.refId, 'declined'); markRead(n.id); };
  const dispatch = (n: Note) => {
    const d = DEMO_USERS.driver;
    claimTransfer(n.refId, d.uid, d.displayName);
    markRead(n.id);
  };
  const complete = (n: Note) => { deliverTransfer(n.refId); markRead(n.id); };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full border border-border bg-card p-2 text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 z-50 mt-2 w-[22rem] overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-sm">Notifications</span>
                {unread > 0 ? (
                  <button onClick={markAllRead} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">{notes.length} total</span>
                )}
              </div>
              <div className="max-h-[60vh] overflow-y-auto scrollbar-hide">
                {notes.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-muted-foreground">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    <p className="text-sm">You're all caught up.</p>
                  </div>
                ) : (
                  notes.map((n) => {
                    const isUnread = !read.has(n.id);
                    return (
                      <div
                        key={n.id}
                        className={`border-b border-border/60 px-4 py-3 transition-colors last:border-0 ${isUnread ? 'bg-primary/[0.04]' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`mt-0.5 shrink-0 ${n.tone}`}>{n.icon}</span>
                          <button
                            onClick={() => { markRead(n.id); setOpen(false); navigate(branchPath(branchId, n.segment)); }}
                            className="min-w-0 flex-1 text-left"
                          >
                            <span className="flex items-center gap-1.5">
                              {isUnread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                              <span className="truncate text-sm">{n.title}</span>
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">{n.detail}</span>
                            <span className="mt-0.5 block text-[11px] text-muted-foreground">{formatDateTime(n.at)}</span>
                          </button>
                        </div>

                        {/* Inline actions */}
                        <div className="mt-2 flex gap-2 pl-7">
                          {n.kind === 'alert' && (
                            <>
                              <ActionBtn onClick={() => approve(n)} tone="primary" icon={<Check className="h-3.5 w-3.5" />}>Approve</ActionBtn>
                              <ActionBtn onClick={() => decline(n)} tone="ghost" icon={<ThumbsDown className="h-3.5 w-3.5" />}>Decline</ActionBtn>
                            </>
                          )}
                          {n.kind === 'transfer-pending' && (
                            <ActionBtn onClick={() => dispatch(n)} tone="primary" icon={<UserCheck className="h-3.5 w-3.5" />}>
                              Dispatch {DEMO_USERS.driver.displayName}
                            </ActionBtn>
                          )}
                          {n.kind === 'transfer-transit' && (
                            <ActionBtn onClick={() => complete(n)} tone="primary" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>Mark delivered</ActionBtn>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionBtn({
  children, onClick, icon, tone,
}: { children: ReactNode; onClick: () => void; icon: ReactNode; tone: 'primary' | 'ghost' }) {
  const cls = tone === 'primary'
    ? 'bg-primary text-primary-foreground hover:opacity-90'
    : 'border border-border text-muted-foreground hover:border-primary hover:text-foreground';
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-colors ${cls}`}>
      {icon}{children}
    </button>
  );
}
