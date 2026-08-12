import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { Search, Bell, Command as CommandIcon, ChevronDown, LogOut, Sun, Moon, Bookmark, X, ArrowLeft, GripVertical } from 'lucide-react';
import { CommandPalette, type Command } from './CommandPalette';
import { NotificationsPanel, useNotifications } from './NotificationsPanel';
import { MeshBackdrop } from './primitives';
import type { FirestoreUser } from '../../../lib/firestore-schema';
import type { UserRole } from '../../types';

export interface TabDef {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: number | string;
  render: () => ReactNode;
}

interface ShellProps {
  user: FirestoreUser;
  role: UserRole;
  tabs: TabDef[];
  initialTab?: string;
  onClose: () => void;
  onSignOut: () => void;
  title?: string;
}

export function DashboardShell({ user, role, tabs, initialTab, onClose, onSignOut, title = 'Dashboard' }: ShellProps) {
  // Drag-to-reorder + saved order via localStorage
  const storageKey = `cofkans:tab-order:${role}`;
  const [orderedIds, setOrderedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return tabs.map(t => t.id);
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (Array.isArray(saved)) {
        const valid = saved.filter((id: string) => tabs.some(t => t.id === id));
        const missing = tabs.map(t => t.id).filter(id => !valid.includes(id));
        return [...valid, ...missing];
      }
    } catch { /* ignore */ }
    return tabs.map(t => t.id);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageKey, JSON.stringify(orderedIds));
  }, [orderedIds, storageKey]);

  const orderedTabs = useMemo(
    () => orderedIds.map(id => tabs.find(t => t.id === id)!).filter(Boolean),
    [orderedIds, tabs],
  );

  const [active, setActive] = useState<string>(initialTab && tabs.some(t => t.id === initialTab) ? initialTab : orderedTabs[0]?.id);
  useEffect(() => {
    if (initialTab && tabs.some(t => t.id === initialTab)) setActive(initialTab);
  }, [initialTab]);

  // Theme toggle (per-section preference)
  const [dark, setDark] = useState<boolean>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );
  const toggleDark = () => {
    const el = document.documentElement;
    el.classList.toggle('dark');
    setDark(el.classList.contains('dark'));
  };

  // Notifications + Command Palette
  const notif = useNotifications(role);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Saved views (named active-tab snapshots)
  const viewsKey = `cofkans:saved-views:${role}`;
  const [savedViews, setSavedViews] = useState<Array<{ name: string; tab: string }>>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(viewsKey) || '[]'); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem(viewsKey, JSON.stringify(savedViews)); }, [savedViews, viewsKey]);
  const saveCurrentView = () => {
    const name = prompt('Name this view');
    if (!name) return;
    setSavedViews(v => [...v, { name, tab: active }]);
  };

  // Global ⌘K / Ctrl+K + Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(o => !o); }
      if (e.key === 'n' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setNotifOpen(o => !o); }
      if (e.key === 'Escape' && !cmdOpen && !notifOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, cmdOpen, notifOpen]);

  const commands: Command[] = useMemo(() => {
    const navCmds = orderedTabs.map(t => ({
      id: `goto-${t.id}`,
      label: `Go to ${t.label}`,
      group: 'Navigation',
      icon: t.icon,
      run: () => setActive(t.id),
    }));
    const viewCmds = savedViews.map(v => ({
      id: `view-${v.name}`,
      label: `Open view: ${v.name}`,
      group: 'Saved views',
      icon: Bookmark,
      run: () => setActive(v.tab),
    }));
    return [
      ...navCmds,
      ...viewCmds,
      { id: 'save-view', label: 'Save current view…', group: 'Actions', icon: Bookmark, shortcut: '⇧⌘S', run: saveCurrentView },
      { id: 'toggle-theme', label: dark ? 'Switch to light' : 'Switch to dark', group: 'Actions', icon: dark ? Sun : Moon, run: toggleDark },
      { id: 'notif', label: 'Open notifications', group: 'Actions', icon: Bell, shortcut: '⌘N', run: () => setNotifOpen(true) },
      { id: 'signout', label: 'Sign out', group: 'Account', icon: LogOut, run: onSignOut },
      { id: 'close', label: 'Close dashboard', group: 'Account', icon: X, shortcut: 'ESC', run: onClose },
    ];
  }, [orderedTabs, savedViews, dark, onSignOut, onClose]);

  const activeTab = orderedTabs.find(t => t.id === active);

  return (
    <div className="relative min-h-full bg-gradient-to-br from-background via-background to-background">
      <MeshBackdrop />

      {/* Top bar */}
      <div className="sticky top-0 z-30 backdrop-blur-2xl bg-background/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-border hover:bg-muted flex items-center justify-center"
            aria-label="Close"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-2 mr-2">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-9 h-9 rounded-xl object-cover ring-2 ring-primary/30" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary" />
            )}
            <div className="hidden sm:block">
              <div className="text-sm font-bold leading-tight">{title}</div>
              <div className="text-[11px] text-muted-foreground capitalize">{role} · {user.displayName.split(' ')[0]}</div>
            </div>
          </div>

          <button
            onClick={() => setCmdOpen(true)}
            className="flex-1 max-w-md flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted border border-border text-sm text-muted-foreground transition-colors"
          >
            <Search className="w-4 h-4" strokeWidth={2.5} />
            <span>Search or jump to…</span>
            <kbd className="ml-auto px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">⌘K</kbd>
          </button>

          <div className="flex items-center gap-1">
            {savedViews.length > 0 && <SavedViewsMenu views={savedViews} onPick={v => setActive(v.tab)} onRemove={n => setSavedViews(s => s.filter(x => x.name !== n))} />}
            <IconButton onClick={saveCurrentView} aria-label="Save view"><Bookmark className="w-4 h-4" /></IconButton>
            <IconButton onClick={toggleDark} aria-label="Toggle theme">{dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</IconButton>
            <IconButton onClick={() => setNotifOpen(true)} aria-label="Notifications">
              <Bell className="w-4 h-4" />
              {notif.unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">{notif.unread}</span>
              )}
            </IconButton>
            <IconButton onClick={() => setCmdOpen(true)} aria-label="Command palette"><CommandIcon className="w-4 h-4" /></IconButton>
          </div>
        </div>

        {/* Tab strip — drag to reorder */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2">
          <Reorder.Group axis="x" values={orderedIds} onReorder={setOrderedIds} className="flex gap-1 overflow-x-auto scrollbar-none" as="div">
            {orderedTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = active === tab.id;
              return (
                <Reorder.Item key={tab.id} value={tab.id} as="div" className="flex-shrink-0">
                  <button
                    onClick={() => setActive(tab.id)}
                    className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-foreground text-background shadow-lg'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <GripVertical className={`w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity ${isActive ? 'text-background' : ''}`} />
                    <Icon className="w-4 h-4" strokeWidth={2.5} />
                    <span>{tab.label}</span>
                    {tab.badge != null && (
                      <span className={`px-1.5 min-w-[18px] h-[18px] inline-flex items-center justify-center rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-background/20 text-background' : 'bg-primary/15 text-primary'
                      }`}>{tab.badge}</span>
                    )}
                  </button>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab?.render()}
          </motion.div>
        </AnimatePresence>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} commands={commands} />
      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} {...notif} />
    </div>
  );
}

function IconButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="relative w-9 h-9 rounded-xl border border-transparent hover:border-border hover:bg-muted flex items-center justify-center transition-colors"
    >
      {children}
    </button>
  );
}

function SavedViewsMenu({ views, onPick, onRemove }: { views: Array<{ name: string; tab: string }>; onPick: (v: { name: string; tab: string }) => void; onRemove: (n: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 h-9 rounded-xl border border-border hover:bg-muted text-xs font-semibold"
      >
        <Bookmark className="w-3.5 h-3.5" /> Views <ChevronDown className="w-3 h-3" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 mt-1 w-56 rounded-xl bg-card border border-border shadow-xl p-1 z-40"
            >
              {views.map(v => (
                <div key={v.name} className="group flex items-center gap-1 rounded-lg hover:bg-muted">
                  <button onClick={() => { onPick(v); setOpen(false); }} className="flex-1 text-left px-3 py-2 text-sm font-medium">
                    {v.name}
                  </button>
                  <button onClick={() => onRemove(v.name)} className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
