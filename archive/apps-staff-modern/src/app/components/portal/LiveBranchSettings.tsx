import { useEffect, useState } from 'react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Building2, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { DEMO_MODE } from '@/lib/demo-mode';
import { getBranchBySlug } from '@/lib/branches';
import { useStaffRole } from '../../hooks/useStaffRole';

interface BranchSettingsDoc {
  contactPhone?: string;
  contactEmail?: string;
  whatsapp?: string;
  hours?: string;
  address?: string;
  pickupNotes?: string;
  deliveryNotes?: string;
}

export function LiveBranchSettings({ branchSlug }: { branchSlug: string }) {
  if (DEMO_MODE) {
    return <p className="rounded-xl border border-dashed border-zinc-700 p-6 text-sm text-zinc-400">Branch settings require the live backend. Set `EXPO_PUBLIC_APP_ENV` to `development` or `production` and complete `ReaquireBackendSetUp.md`.</p>;
  }
  return <FirebaseBranchSettings branchSlug={branchSlug} />;
}

function FirebaseBranchSettings({ branchSlug }: { branchSlug: string }) {
  const { staff } = useStaffRole();
  const branch = getBranchBySlug(branchSlug);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<BranchSettingsDoc>({});

  useEffect(() => {
    let alive = true;
    getDoc(doc(db, 'branchSettings', branchSlug)).then(snapshot => {
      if (!alive) return;
      setForm(snapshot.exists() ? snapshot.data() as BranchSettingsDoc : {
        contactPhone: branch?.phone,
        hours: branch?.hours,
        address: branch?.address,
      });
    }).catch(() => { if (alive) toast.error('Could not load branch settings'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [branch, branchSlug]);

  if (loading) return <div className="flex items-center gap-2 p-8 text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" />Loading settings…</div>;

  const setField = (key: keyof BranchSettingsDoc, value: string) => setForm(current => ({ ...current, [key]: value }));
  const save = async () => {
    if (!staff?.uid) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'branchSettings', branchSlug), { ...form, updatedAt: serverTimestamp(), updatedBy: staff.uid }, { merge: true });
      toast.success('Branch settings saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save settings');
    } finally { setSaving(false); }
  };

  const input = (label: string, key: keyof BranchSettingsDoc, multiline = false) => (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-zinc-500">{label}</span>
      {multiline ? (
        <textarea rows={3} value={form[key] ?? ''} onChange={event => setField(key, event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-sm outline-none focus:border-primary" />
      ) : (
        <input value={form[key] ?? ''} onChange={event => setField(key, event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-sm outline-none focus:border-primary" />
      )}
    </label>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <header className="flex items-center gap-3"><Building2 className="h-5 w-5" /><div><h2 className="text-xl font-bold">{branch?.name ?? branchSlug}</h2><p className="text-xs text-zinc-500">Customer-facing branch details.</p></div></header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{input('Phone', 'contactPhone')}{input('Email', 'contactEmail')}{input('WhatsApp', 'whatsapp')}{input('Hours', 'hours')}</div>
      {input('Street address', 'address')}
      {input('Pickup notes', 'pickupNotes', true)}
      {input('Delivery notes', 'deliveryNotes', true)}
      <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save settings'}</button>
    </div>
  );
}
