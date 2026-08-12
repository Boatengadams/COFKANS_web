/**
 * Unified Media Manager
 * Combines Hero Section + Collections image management
 * Shows current images, URLs, titles, and descriptions
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  RefreshCw,
  FolderOpen,
  Sparkles,
  Edit3,
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

interface Collection {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  productCount?: number;
  updatedAt?: any;
}

type Section = 'hero' | 'collections';

export default function MediaManager() {
  const [section, setSection] = useState<Section>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Hero state
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [showAddHero, setShowAddHero] = useState(false);

  // Collections state
  const [collections, setCollections] = useState<Collection[]>([]);

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (section === 'hero') {
      loadHeroSlides();
    } else {
      loadCollections();
    }
  }, [section]);

  const loadHeroSlides = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'heroSlides'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as HeroSlide[];
      setHeroSlides(data);
      toast.success(`Loaded ${data.length} hero slides`);
    } catch (error) {
      console.error('Error loading hero slides:', error);
      toast.error('Failed to load hero slides');
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Collection[];
      setCollections(data);
      toast.success(`Loaded ${data.length} collections`);
    } catch (error) {
      console.error('Error loading collections:', error);
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const saveHeroSlide = async (slide: HeroSlide) => {
    setSaving(slide.id);
    try {
      await updateDoc(doc(db, 'heroSlides', slide.id), {
        ...slide,
        updatedAt: serverTimestamp(),
      });
      toast.success('Hero slide updated!');
      await loadHeroSlides();
    } catch (error) {
      console.error('Error saving hero slide:', error);
      toast.error('Failed to save hero slide');
    } finally {
      setSaving(null);
    }
  };

  const deleteHeroSlide = async (id: string) => {
    if (!confirm('Delete this hero slide?')) return;
    try {
      await deleteDoc(doc(db, 'heroSlides', id));
      toast.success('Hero slide deleted');
      await loadHeroSlides();
    } catch (error) {
      console.error('Error deleting hero slide:', error);
      toast.error('Failed to delete hero slide');
    }
  };

  const moveHeroSlide = async (index: number, direction: 'up' | 'down') => {
    const newSlides = [...heroSlides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    newSlides[index].order = index;
    newSlides[targetIndex].order = targetIndex;

    try {
      await Promise.all([
        updateDoc(doc(db, 'heroSlides', newSlides[index].id), { order: index }),
        updateDoc(doc(db, 'heroSlides', newSlides[targetIndex].id), { order: targetIndex }),
      ]);
      setHeroSlides(newSlides);
      toast.success('Order updated');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const updateHeroField = (id: string, field: keyof HeroSlide, value: any) => {
    setHeroSlides(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const saveCollection = async (coll: Collection) => {
    setSaving(coll.id);
    try {
      await updateDoc(doc(db, 'categories', coll.id), {
        imageUrl: coll.imageUrl || '',
        updatedAt: serverTimestamp(),
      });
      toast.success(`Updated ${coll.name}`);
      await loadCollections();
    } catch (error) {
      console.error('Error saving collection:', error);
      toast.error('Failed to save collection');
    } finally {
      setSaving(null);
    }
  };

  const updateCollectionImageUrl = (id: string, url: string) => {
    setCollections(prev =>
      prev.map(c => (c.id === id ? { ...c, imageUrl: url } : c))
    );
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
      {/* Header with Section Tabs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Media Manager</h2>
            <p className="text-sm text-muted-foreground">
              Manage hero carousel and collection images
            </p>
          </div>
          <button
            onClick={() => {
              if (section === 'hero') loadHeroSlides();
              else loadCollections();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-border font-semibold hover:bg-muted"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setSection('hero')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              section === 'hero'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Hero Carousel ({heroSlides.length})
          </button>
          <button
            onClick={() => setSection('collections')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              section === 'collections'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Collections ({collections.length})
          </button>
        </div>
      </div>

      {/* Hero Section */}
      {section === 'hero' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddHero(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Add Hero Slide
            </button>
          </div>

          {heroSlides.map((slide, index) => (
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
                    <div className="relative w-40 h-24 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={slide.url}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
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
                    <div className="w-40 h-24 rounded-lg bg-muted flex items-center justify-center">
                      <Video className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">
                        Type
                      </label>
                      <select
                        value={slide.type}
                        onChange={(e) =>
                          updateHeroField(slide.id, 'type', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg bg-background border-2 border-border text-sm"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">
                        Title
                      </label>
                      <input
                        value={slide.title}
                        onChange={(e) =>
                          updateHeroField(slide.id, 'title', e.target.value)
                        }
                        placeholder="Main heading"
                        className="w-full px-3 py-2 rounded-lg bg-background border-2 border-border text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={slide.url}
                        onChange={(e) =>
                          updateHeroField(slide.id, 'url', e.target.value)
                        }
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 rounded-lg bg-background border-2 border-border text-sm font-mono"
                      />
                      {slide.url && (
                        <a
                          href={slide.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-lg border-2 border-border hover:bg-muted"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Subtitle
                    </label>
                    <input
                      value={slide.subtitle}
                      onChange={(e) =>
                        updateHeroField(slide.id, 'subtitle', e.target.value)
                      }
                      placeholder="Supporting text"
                      className="w-full px-3 py-2 rounded-lg bg-background border-2 border-border text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        slide.isActive
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {slide.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => moveHeroSlide(index, 'up')}
                    disabled={index === 0}
                    className="p-2 rounded-lg border-2 border-border hover:bg-muted disabled:opacity-40"
                    title="Move up"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveHeroSlide(index, 'down')}
                    disabled={index === heroSlides.length - 1}
                    className="p-2 rounded-lg border-2 border-border hover:bg-muted disabled:opacity-40"
                    title="Move down"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      updateHeroField(slide.id, 'isActive', !slide.isActive)
                    }
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
                    onClick={() => saveHeroSlide(slide)}
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
                    onClick={() => deleteHeroSlide(slide.id)}
                    className="p-2 rounded-lg border-2 border-destructive/40 text-destructive hover:bg-destructive/10"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {heroSlides.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No hero slides yet. Click "Add Hero Slide" to create one.
            </div>
          )}
        </div>
      )}

      {/* Collections Section */}
      {section === 'collections' && (
        <div className="space-y-4">
          {collections.map((coll) => (
            <motion.div
              key={coll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border-2 border-border bg-card"
            >
              <div className="flex gap-4">
                {/* Preview */}
                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-muted">
                    {coll.imageUrl ? (
                      <>
                        <img
                          src={coll.imageUrl}
                          alt={coll.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <button
                          onClick={() => setPreviewUrl(coll.imageUrl!)}
                          className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Eye className="w-5 h-5 text-white" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg">{coll.name}</h3>
                    {coll.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {coll.description}
                      </p>
                    )}
                    {typeof coll.productCount === 'number' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {coll.productCount} products
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={coll.imageUrl || ''}
                        onChange={(e) =>
                          updateCollectionImageUrl(coll.id, e.target.value)
                        }
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 rounded-lg bg-background border-2 border-border text-sm font-mono"
                      />
                      {coll.imageUrl && (
                        <a
                          href={coll.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-lg border-2 border-border hover:bg-muted"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-center">
                  <button
                    onClick={() => saveCollection(coll)}
                    disabled={saving === coll.id}
                    className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    title="Save"
                  >
                    {saving === coll.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {collections.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No collections found. Create categories in your Firestore database.
            </div>
          )}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            onClick={() => setPreviewUrl(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Add Hero Modal */}
      {showAddHero && (
        <AddHeroSlideDialog
          onClose={() => setShowAddHero(false)}
          onAdded={loadHeroSlides}
          nextOrder={heroSlides.length}
        />
      )}
    </div>
  );
}

// Add Hero Slide Dialog Component
function AddHeroSlideDialog({
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
      toast.success('Hero slide added!');
      onAdded();
      onClose();
    } catch (error) {
      console.error('Error adding hero slide:', error);
      toast.error('Failed to add hero slide');
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
