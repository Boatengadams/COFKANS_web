/**
 * Collections Manager
 * Manage collection/category images
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Image as ImageIcon,
  Save,
  Loader2,
  Eye,
  X,
  RefreshCw,
} from 'lucide-react';
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import toast from 'react-hot-toast';

interface Collection {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  productCount?: number;
  updatedAt?: any;
}

export default function CollectionsManager() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadCollections();
  }, []);

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

  const saveCollection = async (coll: Collection) => {
    setSaving(coll.id);
    try {
      await updateDoc(doc(db, 'categories', coll.id), {
        imageUrl: coll.imageUrl || '',
        updatedAt: serverTimestamp(),
      });
      toast.success(`Updated ${coll.name}`);
    } catch (error) {
      console.error('Error saving collection:', error);
      toast.error('Failed to save collection');
    } finally {
      setSaving(null);
    }
  };

  const updateImageUrl = (id: string, url: string) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Collections Manager</h2>
          <p className="text-sm text-muted-foreground">
            Manage collection/category images
          </p>
        </div>
        <button
          onClick={loadCollections}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-border font-semibold hover:bg-muted"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-4">
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
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
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

              {/* Fields */}
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-bold text-lg">{coll.name}</h3>
                  {coll.description && (
                    <p className="text-sm text-muted-foreground">
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
                  <label className="text-xs font-semibold text-muted-foreground">
                    Image URL
                  </label>
                  <input
                    value={coll.imageUrl || ''}
                    onChange={(e) =>
                      updateImageUrl(coll.id, e.target.value)
                    }
                    placeholder="https://..."
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-background border-2 border-border text-sm font-mono"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
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

      {previewUrl && (
        <ImagePreviewDialog
          url={previewUrl}
          onClose={() => setPreviewUrl(null)}
        />
      )}
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
