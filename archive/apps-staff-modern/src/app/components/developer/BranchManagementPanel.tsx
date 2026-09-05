import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Plus, Trash2, Pencil, Power, Save, X, Star, Search, Phone, Crown, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  subscribeBranchesWithIds,
  createBranch,
  updateBranchDoc,
  deleteBranchDoc,
  SEED_BRANCHES,
  type Branch,
} from '@/lib/branches';
import { requireDevPasscode } from '@/lib/dev-passcode';

interface Row extends Branch { id: string; }

interface Draft {
  slug?: string;
  name: string;
  city: string;
  region: string;
  address: string;
  /** Comma- or newline-separated list edited in the UI. */
  phonesText: string;
  hours: string;
  isActive: boolean;
  isMain: boolean;
  displayOrder: string; // string so the input can be empty
}

const EMPTY_DRAFT: Draft = {
  name: '', city: '', region: '', address: '',
  phonesText: '', hours: 'Mon–Sat 8:00am – 5:00pm',
  isActive: true, isMain: false, displayOrder: '',
};

function rowToDraft(r: Row): Draft {
  return {
    slug: r.slug,
    name: r.name,
    city: r.city,
    region: r.region,
    address: r.address,
    phonesText: (r.phones && r.phones.length ? r.phones : (r.phone ? [r.phone] : [])).join(', '),
    hours: r.hours || '',
    isActive: r.isActive,
    isMain: !!r.isMain,
    displayOrder: typeof r.displayOrder === 'number' ? String(r.displayOrder) : '',
  };
}

function draftToPayload(d: Draft): Partial<Branch> {
  const phones = d.phonesText.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  const order = d.displayOrder.trim() === '' ? undefined : Number(d.displayOrder);
  return {
    name: d.name.trim(),
    city: d.city.trim(),
    region: d.region.trim(),
    address: d.address.trim(),
    hours: d.hours.trim() || undefined,
    isActive: d.isActive,
    isMain: d.isMain,
    displayOrder: Number.isFinite(order as number) ? (order as number) : undefined,
    phones: phones.length ? phones : undefined,
    phone: phones[0],
  };
}

export function BranchManagementPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const unsub = subscribeBranchesWithIds((rs) => {
      // Surface in displayOrder, then main first, then by name.
      const sorted = [...rs].sort((a, b) => {
        const ao = a.displayOrder ?? 9999;
        const bo = b.displayOrder ?? 9999;
        if (ao !== bo) return ao - bo;
        if (!!b.isMain !== !!a.isMain) return b.isMain ? 1 : -1;
        return (a.name || '').localeCompare(b.name || '');
      });
      setRows(sorted);
      setLoading(false);
    });
    return unsub;
  }, []);

  const startEdit = (r: Row) => {
    setEditingId(r.id);
    setDraft(rowToDraft(r));
  };
  const cancelEdit = () => { setEditingId(null); setDraft(EMPTY_DRAFT); };

  const save = async () => {
    if (!draft.name || !draft.city || !draft.region || !draft.address) {
      toast.error('Name, city, region and address are required.');
      return;
    }
    const ok = await requireDevPasscode(editingId ? `Update branch "${draft.name}"` : `Create branch "${draft.name}"`);
    if (!ok) return;
    try {
      const payload = draftToPayload(draft);
      if (editingId) {
        await updateBranchDoc(editingId, payload);
        toast.success('Branch updated.');
      } else {
        await createBranch(payload as Omit<Branch, 'slug'> & { slug?: string });
        toast.success('Branch created.');
      }
      cancelEdit();
    } catch (e: any) {
      toast.error(e?.message || 'Could not save branch.');
    }
  };

  const toggleActive = async (r: Row) => {
    const ok = await requireDevPasscode(`${r.isActive ? 'Hide' : 'Show'} branch "${r.name}"`);
    if (!ok) return;
    try {
      await updateBranchDoc(r.id, { isActive: !r.isActive });
    } catch (e: any) {
      toast.error(e?.message || 'Could not update branch.');
    }
  };

  const toggleMain = async (r: Row) => {
    const ok = await requireDevPasscode(`${r.isMain ? 'Unmark' : 'Mark'} "${r.name}" as Main Showroom`);
    if (!ok) return;
    try {
      await updateBranchDoc(r.id, { isMain: !r.isMain });
    } catch (e: any) {
      toast.error(e?.message || 'Could not update branch.');
    }
  };

  const remove = async (r: Row) => {
    const ok = await requireDevPasscode(`Delete branch "${r.name}"`);
    if (!ok) return;
    try {
      await deleteBranchDoc(r.id);
      toast.success('Branch removed.');
    } catch (e: any) {
      toast.error(e?.message || 'Could not delete branch.');
    }
  };

  /** One-shot sync: copy every seed branch into Firestore if it's not already
   *  there (matched by slug). Lets the developer edit any field live without
   *  re-deploying. Safe to run multiple times — existing rows are skipped. */
  const syncDefaults = async () => {
    const ok = await requireDevPasscode(`Sync ${SEED_BRANCHES.length} default branches to Firestore`);
    if (!ok) return;
    setSyncing(true);
    try {
      const existingSlugs = new Set(rows.map(r => r.slug));
      let added = 0;
      for (const b of SEED_BRANCHES) {
        if (existingSlugs.has(b.slug)) continue;
        await createBranch(b);
        added++;
      }
      toast.success(added > 0 ? `Added ${added} branch${added === 1 ? '' : 'es'} to Firestore.` : 'All defaults already in Firestore.');
    } catch (e: any) {
      toast.error(e?.message || 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      [r.name, r.city, r.region, r.address, ...(r.phones || []), r.phone].filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q)),
    );
  }, [rows, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <MapPin className="w-6 h-6 text-primary" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Branch Management</h2>
            <p className="text-sm text-muted-foreground">
              Pickup locations shown at checkout. Mutations require the developer passcode.
            </p>
          </div>
        </div>
        <button
          onClick={syncDefaults}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-border hover:bg-muted text-sm font-bold disabled:opacity-60"
          title="Copy the codebase seed branches into Firestore (skips any already present) so they can be edited live."
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} /> Sync defaults to Firestore
        </button>
      </div>

      {/* Editor */}
      <div className="bg-card border-2 border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <h3 className="font-bold">{editingId ? 'Edit branch' : 'Add new branch'}</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
          <Field label="City" value={draft.city} onChange={(v) => setDraft({ ...draft, city: v })} />
          <Field label="Region" value={draft.region} onChange={(v) => setDraft({ ...draft, region: v })} placeholder="Ashanti Region · Greater Accra Region" />
          <Field label="Display order" value={draft.displayOrder} onChange={(v) => setDraft({ ...draft, displayOrder: v.replace(/[^0-9]/g, '') })} placeholder="1 (lower = shown first)" />
          <Field label="Address" value={draft.address} onChange={(v) => setDraft({ ...draft, address: v })} className="sm:col-span-2" />
          <Field label="Hours" value={draft.hours} onChange={(v) => setDraft({ ...draft, hours: v })} className="sm:col-span-2" />
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold mb-1 text-muted-foreground">
              Phone numbers <span className="font-normal">— one per line or comma-separated. First number is primary.</span>
            </label>
            <textarea
              rows={2}
              value={draft.phonesText}
              onChange={(e) => setDraft({ ...draft, phonesText: e.target.value })}
              placeholder="024-7603798&#10;055-3298335"
              className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary text-sm font-mono"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={draft.isActive}
              onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} />
            Show on storefront / checkout
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={draft.isMain}
              onChange={(e) => setDraft({ ...draft, isMain: e.target.checked })} />
            Main Showroom (badged + listed first)
          </label>
        </div>
        <div className="flex gap-2">
          <button onClick={save}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm">
            <Save className="w-4 h-4" /> {editingId ? 'Save changes' : 'Create branch'}
          </button>
          {editingId && (
            <button onClick={cancelEdit}
              className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-lg font-bold text-sm">
              <X className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-card border-2 border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-bold">
            Branches <span className="text-muted-foreground font-normal">({rows.length})</span>
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, city, phone…"
              className="pl-9 pr-3 py-2 w-64 max-w-full bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary text-sm"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border-2 border-amber-500/20 text-sm">
              <p className="font-bold mb-0.5">No branches saved to Firestore yet</p>
              <p className="text-muted-foreground">
                The defaults below are what customers currently see at checkout. Click
                <strong> “Sync defaults to Firestore”</strong> above to save them so you can edit, disable or add staff to them.
              </p>
            </div>
            {SEED_BRANCHES.map((b) => (
              <SeedRow key={b.slug} b={b} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No branches match “{query}”.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((r) => (
              <RowItem
                key={r.id} r={r}
                onEdit={() => startEdit(r)}
                onToggleActive={() => toggleActive(r)}
                onToggleMain={() => toggleMain(r)}
                onRemove={() => remove(r)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SeedRow({ b }: { b: Branch }) {
  const phones = b.phones || (b.phone ? [b.phone] : []);
  return (
    <div className="flex items-start gap-3 p-3 border-2 border-dashed border-border rounded-xl opacity-90">
      <div className={`p-2 rounded-lg ${b.isMain ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
        {b.isMain ? <Crown className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold">{b.name}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{b.city}</span>
          {b.isMain && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Main Showroom
            </span>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-bold">Default — not saved</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{b.address}</p>
        <p className="text-[11px] text-muted-foreground">{[b.region, b.hours].filter(Boolean).join(' • ')}</p>
        {phones.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {phones.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                <Phone className="w-3 h-3" /> {p}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RowItem({ r, onEdit, onToggleActive, onToggleMain, onRemove }: {
  r: Row;
  onEdit: () => void;
  onToggleActive: () => void;
  onToggleMain: () => void;
  onRemove: () => void;
}) {
  const phones = r.phones && r.phones.length ? r.phones : (r.phone ? [r.phone] : []);
  const phonesE164 = r.phonesE164 || phones;
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-3 border-2 border-border rounded-xl"
    >
      <div className={`p-2 rounded-lg ${r.isActive ? (r.isMain ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-600') : 'bg-muted text-muted-foreground'}`}>
        {r.isMain ? <Crown className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold">{r.name}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{r.city}</span>
          {r.isMain && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Main Showroom
            </span>
          )}
          {!r.isActive && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 font-bold">Hidden</span>
          )}
          {typeof r.displayOrder === 'number' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">#{r.displayOrder}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{r.address}</p>
        <p className="text-[11px] text-muted-foreground">{[r.region, r.hours].filter(Boolean).join(' • ')}</p>
        {phones.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {phones.map((p, i) => (
              <a
                key={i}
                href={`tel:${phonesE164[i] || p}`}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary font-mono"
              >
                <Phone className="w-3 h-3" /> {p}
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-1">
        <button onClick={onToggleMain} className={`p-1.5 rounded hover:bg-muted ${r.isMain ? 'text-primary' : ''}`} title={r.isMain ? 'Unmark as Main Showroom' : 'Mark as Main Showroom'}>
          <Star className={`w-4 h-4 ${r.isMain ? 'fill-current' : ''}`} />
        </button>
        <button onClick={onToggleActive} className="p-1.5 rounded hover:bg-muted" title={r.isActive ? 'Hide from storefront' : 'Show on storefront'}>
          <Power className="w-4 h-4" />
        </button>
        <button onClick={onEdit} className="p-1.5 rounded hover:bg-muted" title="Edit">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={onRemove} className="p-1.5 rounded hover:bg-red-500/10 text-red-600" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function Field({
  label, value, onChange, className, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; className?: string; placeholder?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold mb-1 text-muted-foreground">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary text-sm"
      />
    </div>
  );
}
