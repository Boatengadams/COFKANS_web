import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react';

export interface Command {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  shortcut?: string;
  run: () => void;
}

export function CommandPalette({
  open,
  onClose,
  commands,
}: {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}) {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!q.trim()) return commands;
    const lower = q.toLowerCase();
    return commands.filter(
      c => c.label.toLowerCase().includes(lower) || c.group.toLowerCase().includes(lower),
    );
  }, [commands, q]);

  const grouped = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filtered.forEach(c => {
      groups[c.group] ||= [];
      groups[c.group].push(c);
    });
    return groups;
  }, [filtered]);

  useEffect(() => { setIdx(0); }, [q]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter')     { e.preventDefault(); const c = filtered[idx]; if (c) { c.run(); onClose(); } }
    if (e.key === 'Escape')    { e.preventDefault(); onClose(); }
  };

  let runningIdx = -1;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-2xl rounded-2xl bg-card/95 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
              <input
                ref={inputRef}
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder="Search commands, pages, actions…"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground border border-border">
                ESC
              </kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {Object.keys(grouped).length === 0 && (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  No commands match "{q}"
                </div>
              )}
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group} className="mb-2">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {group}
                  </div>
                  {items.map(c => {
                    runningIdx++;
                    const active = runningIdx === idx;
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.id}
                        onMouseEnter={() => setIdx(runningIdx)}
                        onClick={() => { c.run(); onClose(); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                          active ? 'bg-primary text-white' : 'hover:bg-muted'
                        }`}
                      >
                        {Icon && <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />}
                        <span className="flex-1 truncate font-medium">{c.label}</span>
                        {c.hint && <span className={`text-xs ${active ? 'text-white/70' : 'text-muted-foreground'}`}>{c.hint}</span>}
                        {c.shortcut && (
                          <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                            active ? 'bg-white/20 border-white/30 text-white' : 'bg-muted border-border text-muted-foreground'
                          }`}>
                            {c.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 px-4 py-2 border-t border-border bg-muted/30 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3" /><ArrowDown className="w-3 h-3" />navigate</span>
                <span className="flex items-center gap-1"><CornerDownLeft className="w-3 h-3" />select</span>
              </div>
              <div>Cofkans Dashboard · ⌘K</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
