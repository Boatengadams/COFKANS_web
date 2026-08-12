import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Save, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/firebase';
import { getBranchBySlug } from '../../../lib/branches';
import { useStaffRole } from '../../hooks/useStaffRole';

/**
 * Per-branch settings doc lives at branchSettings/{slug}. Firestore rules let
 * the matching branch_manager write it; everyone (incl. anonymous customers)
 * can read so contact details show on storefront branch pages.
 */
interface BranchSettingsDoc {
  contactPhone?: string;
  contactEmail?: string;
  whatsapp?: string;
  hours?: string;
  address?: string;
  pickupNotes?: string;
  deliveryNotes?: string;
  updatedAt?: unknown;
  updatedBy?: string;
}

interface Props { branchSlug: string }

export function BranchSettingsPage({ branchSlug }: Props) {
  const { staff } = useStaffRole();
  const branch = getBranchBySlug(branchSlug);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<BranchSettingsDoc>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'branchSettings', branchSlug));
        if (!alive) return;
        if (snap.exists()) setForm(snap.data() as BranchSettingsDoc);
        else if (branch) {
          setForm({ contactPhone: branch.phone, hours: branch.hours, address: branch.address });
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [branchSlug, branch]);

  if (loading) return <div className="flex items-center gap-2 text-zinc-400 p-8"><Loader2 className="w-4 h-4 animate-spin" /> Loading settings…</div>;

  const save = async () => {
    if (!staff?.uid) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'branchSettings', branchSlug), {
        ...form,
        updatedAt: serverTimestamp(),
        updatedBy: staff.uid,
      }, { merge: true });
      toast.success('Branch settings saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: keyof BranchSettingsDoc, placeholder?: string, multi?: boolean) => (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-zinc-500">{label}</span>
      {multi ? (
        <textarea
          rows={3}
          value={(form[key] as string) ?? ''}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder}
          className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
        />
      ) : (
        <input
          type="text"
          value={(form[key] as string) ?? ''}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder}
          className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
        />
      )}
    </label>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <header className="flex items-center gap-3">
        <Building2 className="w-5 h-5" />
        <div>
          <h2 className="font-bold text-xl">{branch?.name ?? branchSlug} — Settings</h2>
          <p className="text-xs text-zinc-500">Customer-facing details. Changes save instantly.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field('Phone', 'contactPhone', '+233 …')}
        {field('Email', 'contactEmail', 'branch@cofkans.com')}
        {field('WhatsApp', 'whatsapp', '+233 …')}
        {field('Hours', 'hours', 'Mon–Sat 08:00–18:00')}
      </div>
      {field('Street address', 'address')}
      {field('Pickup notes', 'pickupNotes', 'Where to park, ask for…', true)}
      {field('Delivery notes', 'deliveryNotes', 'Same-day cutoff, rider count, etc.', true)}

      <button
        onClick={save}
        disabled={saving}
        className="px-4 py-2 bg-primary text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save settings
      </button>
    </div>
  );
}
