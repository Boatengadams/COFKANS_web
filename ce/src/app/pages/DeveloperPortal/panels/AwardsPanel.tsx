/**
 * Awards Panel — manage the homepage Legacy timeline awards.
 * Upload award images, edit title/year/organization, reorder, show/hide.
 * The public site reads these live via the `awards` collection.
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Plus, Trash2, Save, Loader2, Eye, X, MoveUp, MoveDown, Trophy,
} from 'lucide-react';
import {
  collection, doc, getDocs, setDoc, deleteDoc, updateDoc,
  orderBy, query, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface AwardDoc {
  id: string;
  year: string;
  title: string;
  organization: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export function AwardsPanel() {
  const [awards, setAwards] = useState<AwardDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => { loadAwards(); }, []);

  const loadAwards = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'awards'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      setAwards(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as AwardDoc[]);
    } catch (error) {
      console.error('Error loading awards:', error);
      toast.error('Failed to load awards');
    } finally {
      setLoading(false);
    }
  };

  const saveAward = async (award: AwardDoc) => {
    setSaving(award.id);
    try {
      await updateDoc(doc(db, 'awards', award.id), {
        year: award.year,
        title: award.title,
        organization: award.organization,
        imageUrl: award.imageUrl,
        isActive: award.isActive,
        order: award.order,
        updatedAt: serverTimestamp(),
      });
      toast.success('Award updated!');
      await loadAwards();
    } catch (error) {
      console.error('Error saving award:', error);
      toast.error('Failed to save award');
    } finally {
      setSaving(null);
    }
  };

  const deleteAward = async (id: string) => {
    if (!confirm('Delete this award?')) return;
    try {
      await deleteDoc(doc(db, 'awards', id));
      toast.success('Award deleted');
      await loadAwards();
    } catch (error) {
      console.error('Error deleting award:', error);
      toast.error('Failed to delete award');
    }
  };

  const moveAward = async (index: number, direction: 'up' | 'down') => {
    const next = [...awards];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    next[index].order = index;
    next[target].order = target;
    try {
      await Promise.all([
        updateDoc(doc(db, 'awards', next[index].id), { order: index }),
        updateDoc(doc(db, 'awards', next[target].id), { order: target }),
      ]);
      setAwards(next);
      toast.success('Order updated');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const updateField = (id: string, field: keyof AwardDoc, value: unknown) => {
    setAwards(prev => prev.map(a => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const toggleActive = async (award: AwardDoc) => {
    await saveAward({ ...award, isActive: !award.isActive });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Awards Manager</h2>
          <p className="text-sm text-muted-foreground">
            Tag each award with the year earned. It appears beside the matching milestone on the homepage Legacy timeline. Changes appear live.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Add Award
        </button>
      </div>

      <div className="grid gap-4">
        {awards.map((award, index) => (
          <motion.div
            key={award.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border-2 border-border bg-card"
          >
            <div className="flex gap-4">
              {/* Preview */}
              <div className="flex-shrink-0">
                <div className="relative w-32 h-24 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  {award.imageUrl ? (
                    <>
                      <img
                        src={award.imageUrl}
                        alt={award.title}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <button
                        onClick={() => setPreviewUrl(award.imageUrl)}
                        className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Eye className="w-5 h-5 text-white" />
                      </button>
                    </>
                  ) : (
                    <Trophy className="w-7 h-7 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Year</label>
                  <input
                    value={award.year}
                    onChange={(e) => updateField(award.id, 'year', e.target.value)}
                    placeholder="2024"
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Title</label>
                  <input
                    value={award.title}
                    onChange={(e) => updateField(award.id, 'title', e.target.value)}
                    placeholder="Best Electrical Retailer"
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Organization</label>
                  <input
                    value={award.organization}
                    onChange={(e) => updateField(award.id, 'organization', e.target.value)}
                    placeholder="Ghana Business Excellence Awards"
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Award Image URL</label>
                  <input
                    value={award.imageUrl}
                    onChange={(e) => updateField(award.id, 'imageUrl', e.target.value)}
                    placeholder="https://…/award.png"
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border text-sm font-mono"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button onClick={() => moveAward(index, 'up')} disabled={index === 0}
                  className="p-2 rounded-lg border-2 border-border hover:bg-muted disabled:opacity-40" title="Move up">
                  <MoveUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveAward(index, 'down')} disabled={index === awards.length - 1}
                  className="p-2 rounded-lg border-2 border-border hover:bg-muted disabled:opacity-40" title="Move down">
                  <MoveDown className="w-4 h-4" />
                </button>
                <button onClick={() => toggleActive(award)}
                  className={`p-2 rounded-lg border-2 ${award.isActive ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300' : 'border-border hover:bg-muted'}`}
                  title={award.isActive ? 'Visible' : 'Hidden'}>
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => saveAward(award)} disabled={saving === award.id}
                  className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50" title="Save">
                  {saving === award.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </button>
                <button onClick={() => deleteAward(award.id)}
                  className="p-2 rounded-lg border-2 border-destructive/40 text-destructive hover:bg-destructive/10" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {awards.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No awards yet. Click "Add Award" to create one. Until you add awards here,
            the homepage shows the built-in default set.
          </div>
        )}
      </div>

      {showAdd && (
        <AddAwardDialog onClose={() => setShowAdd(false)} onAdded={loadAwards} nextOrder={awards.length} />
      )}

      {previewUrl && (
        <ImagePreviewDialog url={previewUrl} onClose={() => setPreviewUrl(null)} />
      )}
    </div>
  );
}

function AddAwardDialog({ onClose, onAdded, nextOrder }: { onClose: () => void; onAdded: () => void; nextOrder: number }) {
  const [year, setYear] = useState('');
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      const id = `award-${Date.now()}`;
      await setDoc(doc(db, 'awards', id), {
        id,
        year: year.trim(),
        title: title.trim(),
        organization: organization.trim(),
        imageUrl: imageUrl.trim(),
        order: nextOrder,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Award added!');
      onAdded();
      onClose();
    } catch (error) {
      console.error('Error adding award:', error);
      toast.error('Failed to add award');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border-2 border-border shadow-2xl w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold mb-4">Add Award</h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Year</label>
            <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Best Electrical Retailer"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Organization</label>
            <input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Ghana Business Excellence Awards"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Award Image URL</label>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…/award.png"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border font-mono text-sm" />
            <p className="text-[11px] text-muted-foreground mt-1">
              Upload your award photo to Supabase storage (like product images), then paste its public URL here.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border-2 border-border font-semibold">Cancel</button>
          <button onClick={handleAdd} disabled={saving}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold inline-flex items-center gap-2 disabled:opacity-50">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Award
          </button>
        </div>
      </div>
    </div>
  );
}

function ImagePreviewDialog({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
        <X className="w-6 h-6" />
      </button>
      <img src={url} alt="Preview" className="max-w-full max-h-full rounded-lg" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
