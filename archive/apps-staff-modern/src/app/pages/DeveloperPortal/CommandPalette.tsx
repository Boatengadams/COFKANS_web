/**
 * Cmd-K driven navigation for the developer portal. Phase 1 ships the shell
 * only — actions are registered by panels as we add them in later phases.
 */
import { useEffect, useMemo, useState } from 'react';

export interface PaletteAction {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
  actions: PaletteAction[];
}

export function CommandPalette({ open, onClose, actions }: Props) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) => a.label.toLowerCase().includes(q) || a.hint?.toLowerCase().includes(q)
    );
  }, [query, actions]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command…"
          className="w-full bg-transparent border-0 px-5 py-4 outline-none"
        />
        <div className="max-h-80 overflow-y-auto border-t border-border">
          {filtered.length === 0 && (
            <div className="px-5 py-6 text-muted-foreground text-center">No matches</div>
          )}
          {filtered.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                a.run();
                onClose();
              }}
              className="w-full text-left px-5 py-3 hover:bg-accent flex items-center justify-between"
            >
              <span>{a.label}</span>
              {a.hint && <span className="text-muted-foreground">{a.hint}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

