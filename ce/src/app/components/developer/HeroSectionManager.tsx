
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  Save,
  Loader2,
  Eye,
  X,
  MoveUp,
  MoveDown,
} from 'lucide-react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import toast from 'react-hot-toast';

interface HeroSlide {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  subtitle: string;
  order: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export default function HeroSectionManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'heroSlides'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as HeroSlide[];
      setSlides(data);
    } catch (error) {
      console.error('Error loading hero slides:', error);
      toast.error('Failed to load hero slides');
    } finally {
      setLoading(false);
    }
  };

  const saveSlide = async (slide: HeroSlide) => {
    setSaving(slide.id);
    try {
      await updateDoc(doc(db, 'heroSlides', slide.id), {
        ...slide,
        updatedAt: serverTimestamp(),
      });
      toast.success('Slide updated!');
      await loadSlides();
    } catch (error) {
      console.error('Error saving slide:', error);
      toast.error('Failed to save slide');
    } finally {
      setSaving(null);
    }
  };

  const deleteSlide = async (id: string) => {
    if (!confirm('Delete this hero slide?')) return;
    try {
      await deleteDoc(doc(db, 'heroSlides', id));
      toast.success('Slide deleted');
      await loadSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error('Failed to delete slide');
    }
  };

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    // Swap orders
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    // Update order values
    newSlides[index].order = index;
    newSlides[targetIndex].order = targetIndex;

    // Save both
    try {
      await Promise.all([
        updateDoc(doc(db, 'heroSlides', newSlides[index].id), { order: index }),
        updateDoc(doc(db, 'heroSlides', newSlides[targetIndex].id), { order: targetIndex }),
      ]);
      setSlides(newSlides);
      toast.success('Order updated');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const updateField = (id: string, field: keyof HeroSlide, value: any) => {
    setSlides(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const toggleActive = async (slide: HeroSlide) => {
    const updated = { ...slide, isActive: !slide.isActive };
    await saveSlide(updated);
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
          <h2 className="text-xl font-bold">Hero Section Manager</h2>
          <p className="text-sm text-muted-foreground">
            Manage carousel images and videos for the homepage hero section
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </button>
      </div>

      <div className="grid gap-4">
        {slides.map((slide, index) => (
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border-2 border-border bg-card"
          >
            <div className="flex gap-4">
              {/* Preview */}
              <div className="flex-shrink-0">
                {slide.type === 'image' ? (
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <button
                      onClick={() => setPreviewUrl(slide.url)}
                      className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Eye className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-20 rounded-lg bg-muted flex items-center justify-center">
                    <Video className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Type
                  </label>
                  <select
                    value={slide.type}
                    onChange={(e) =>
                      updateField(slide.id, 'type', e.target.value)
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border text-sm"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Title
                  </label>
                  <input
                    value={slide.title}
                    onChange={(e) =>
                      updateField(slide.id, 'title', e.target.value)
                    }
                    placeholder="Main heading"
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">
                    {slide.type === 'image' ? 'Image' : 'Video'} URL
                  </label>
                  <input
                    value={slide.url}
                    onChange={(e) =>
                      updateField(slide.id, 'url', e.target.value)
                    }
                    placeholder="https://..."
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border text-sm font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Subtitle
                  </label>
                  <input
                    value={slide.subtitle}
                    onChange={(e) =>
                      updateField(slide.id, 'subtitle', e.target.value)
                    }
                    placeholder="Supporting text"
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border text-sm"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => moveSlide(index, 'up')}
                  disabled={index === 0}
                  className="p-2 rounded-lg border-2 border-border hover:bg-muted disabled:opacity-40"
                  title="Move up"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveSlide(index, 'down')}
                  disabled={index === slides.length - 1}
                  className="p-2 rounded-lg border-2 border-border hover:bg-muted disabled:opacity-40"
                  title="Move down"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleActive(slide)}
                  className={`p-2 rounded-lg border-2 ${
                    slide.isActive
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-border hover:bg-muted'
                  }`}
                  title={slide.isActive ? 'Active' : 'Inactive'}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => saveSlide(slide)}
                  disabled={saving === slide.id}
                  className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  title="Save"
                >
                  {saving === slide.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => deleteSlide(slide.id)}
                  className="p-2 rounded-lg border-2 border-destructive/40 text-destructive hover:bg-destructive/10"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {slides.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No hero slides yet. Click "Add Slide" to create one.
          </div>
        )}
      </div>

      {showAdd && (
        <AddSlideDialog
          onClose={() => setShowAdd(false)}
          onAdded={loadSlides}
          nextOrder={slides.length}
        />
      )}

      {previewUrl && (
        <ImagePreviewDialog
          url={previewUrl}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </div>
  );
}

function AddSlideDialog({
  onClose,
  onAdded,
  nextOrder,
}: {
  onClose: () => void;
  onAdded: () => void;
  nextOrder: number;
}) {
  const [type, setType] = useState<'image' | 'video'>('image');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!url.trim() || !title.trim()) {
      toast.error('URL and title are required');
      return;
    }

    setSaving(true);
    try {
      const id = `hero-${Date.now()}`;
      await setDoc(doc(db, 'heroSlides', id), {
        id,
        type,
        url: url.trim(),
        title: title.trim(),
        subtitle: subtitle.trim(),
        order: nextOrder,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Slide added!');
      onAdded();
      onClose();
    } catch (error) {
      console.error('Error adding slide:', error);
      toast.error('Failed to add slide');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border-2 border-border shadow-2xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold mb-4">Add Hero Slide</h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'image' | 'video')}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              {type === 'image' ? 'Image' : 'Video'} URL
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border font-mono text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Main heading"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Subtitle
            </label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Supporting text"
              className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border-2 border-border font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold inline-flex items-center gap-2 disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Slide
          </button>
        </div>
      </div>
    </div>
  );
}

function ImagePreviewDialog({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
      >
        <X className="w-6 h-6" />
      </button>
      <img
        src={url}
        alt="Preview"
        className="max-w-full max-h-full rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
