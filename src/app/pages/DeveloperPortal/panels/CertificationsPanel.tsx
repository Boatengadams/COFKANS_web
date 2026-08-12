/**
 * Certifications Panel — feeds the Legacy of Excellence timeline.
 * Upload certificate images, edit name/year/issuer, reorder, show/hide.
 * The public site reads these live via the `certifications` collection.
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Plus, Trash2, Save, Loader2, Eye, X, MoveUp, MoveDown, ShieldCheck,
} from 'lucide-react';
import {
  collection, doc, getDocs, setDoc, deleteDoc, updateDoc,
  orderBy, query, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface CertDoc {
  id: string;
  year: string;
  name: string;
  issuer: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export function CertificationsPanel() {
  const [certs, setCerts] = useState<CertDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'certifications'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      setCerts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as CertDoc[]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load certifications');
    } finally {
      setLoading(false);
    }
  };

  const save = async (cert: CertDoc) => {
    setSaving(cert.id);
    try {
      await updateDoc(doc(db, 'certifications', cert.id), {
        year: cert.year, name: cert.name, issuer: cert.issuer,
        imageUrl: cert.imageUrl, isActive: cert.isActive, order: cert.order,
        updatedAt: serverTimestamp(),
      });
      toast.success('Certification updated!');
      await load();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save certification');
    } finally {
      setSaving(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this certification?')) return;
    try {
      await deleteDoc(doc(db, 'certifications', id));
      toast.success('Certification deleted');
      await load();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete certification');
    }
  };

  const move = async (index: number, direction: 'up' | 'down') => {
    const next = [...certs];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index]; next[index] = next[target]; next[target] = tmp;
    next[index].order = index; next[target].order = target;
    try {
      await Promise.all([
        updateDoc(doc(db, 'certifications', next[index].id), { order: index }),
        updateDoc(doc(db, 'certifications', next[target].id), { order: target }),
      ]);
      setCerts(next);
      toast.success('Order updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update order');
    }
  };

  const updateField = (id: string, field: keyof CertDoc, value: unknown) =>
    setCerts(prev => prev.map(c => (c.id === id ? { ...c, [field]: value } : c)));

  const toggleActive = async (c: CertDoc) => save({ ...c, isActive: !c.isActive });

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Certifications Manager</h2>
          <p className="text-sm text-muted-foreground">
            Tag each certification with the year earned. It appears beside the matching milestone on the homepage Legacy timeline.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Add Certification
        </button>
      </div>

      <div className="grid gap-4">
        {certs.map((cert, index) => (
          <motion.div key={cert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border-2 border-border bg-card">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="relative w-32 h-24 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  {cert.imageUrl ? (
                    <>
                      <img src={cert.imageUrl} alt={cert.name} className="w-full h-full object-contain p-2"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <button onClick={() => setPreviewUrl(cert.imageUrl)}
                        className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-5 h-5 text-white" />
                      </button>
                    </>
                  ) : <ShieldCheck className="w-7 h-7 text-muted-foreground" />}
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Year</label>
                  <input value={cert.year} onChange={(e) => updateField(cert.id, 'year', e.target.value)}
                    placeholder="2020" className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Name</label>
                  <input value={cert.name} onChange={(e) => updateField(cert.id, 'name', e.target.value)}
                    placeholder="ISO 9001:2015 Certified" className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Issuer</label>
                  <input value={cert.issuer} onChange={(e) => updateField(cert.id, 'issuer', e.target.value)}
                    placeholder="Ghana Standards Authority" className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Certificate Image URL</label>
                  <input value={cert.imageUrl} onChange={(e) => updateField(cert.id, 'imageUrl', e.target.value)}
                    placeholder="https://…/cert.png" className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border text-sm font-mono" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={() => move(index, 'up')} disabled={index === 0}
                  className="p-2 rounded-lg border-2 border-border hover:bg-muted disabled:opacity-40" title="Move up">
                  <MoveUp className="w-4 h-4" />
                </button>
                <button onClick={() => move(index, 'down')} disabled={index === certs.length - 1}
                  className="p-2 rounded-lg border-2 border-border hover:bg-muted disabled:opacity-40" title="Move down">
                  <MoveDown className="w-4 h-4" />
                </button>
                <button onClick={() => toggleActive(cert)}
                  className={`p-2 rounded-lg border-2 ${cert.isActive ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300' : 'border-border hover:bg-muted'}`}
                  title={cert.isActive ? 'Visible' : 'Hidden'}>
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => save(cert)} disabled={saving === cert.id}
                  className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50" title="Save">
                  {saving === cert.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </button>
                <button onClick={() => remove(cert.id)}
                  className="p-2 rounded-lg border-2 border-destructive/40 text-destructive hover:bg-destructive/10" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {certs.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No certifications yet. Click "Add Certification" to create one.
          </div>
        )}
      </div>

      {showAdd && <AddCertDialog onClose={() => setShowAdd(false)} onAdded={load} nextOrder={certs.length} />}
      {previewUrl && <ImagePreviewDialog url={previewUrl} onClose={() => setPreviewUrl(null)} />}
    </div>
  );
}

function AddCertDialog({ onClose, onAdded, nextOrder }: { onClose: () => void; onAdded: () => void; nextOrder: number }) {
  const [year, setYear] = useState('');
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const id = `cert-${Date.now()}`;
      await setDoc(doc(db, 'certifications', id), {
        id, year: year.trim(), name: name.trim(), issuer: issuer.trim(),
        imageUrl: imageUrl.trim(), order: nextOrder, isActive: true,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      toast.success('Certification added!');
      onAdded(); onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add certification');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border-2 border-border shadow-2xl w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted"><X className="w-5 h-5" /></button>
        <h3 className="text-lg font-bold mb-4">Add Certification</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Year</label>
            <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2020"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ISO 9001:2015 Certified"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Issuer</label>
            <input value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="Ghana Standards Authority"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Certificate Image URL</label>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…/cert.png"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border font-mono text-sm" />
            <p className="text-[11px] text-muted-foreground mt-1">
              Upload the certificate to Supabase storage, then paste its public URL here.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border-2 border-border font-semibold">Cancel</button>
          <button onClick={handleAdd} disabled={saving}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold inline-flex items-center gap-2 disabled:opacity-50">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Add Certification
          </button>
        </div>
      </div>
    </div>
  );
}

function ImagePreviewDialog({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"><X className="w-6 h-6" /></button>
      <img src={url} alt="Preview" className="max-w-full max-h-full rounded-lg" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

