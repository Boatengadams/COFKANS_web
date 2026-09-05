import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UseIcon =
  | 'home' | 'building' | 'factory' | 'sun' | 'bolt' | 'shield'
  | 'wrench' | 'leaf' | 'lightbulb' | 'plug' | 'fan' | 'sparkles';

export interface ProductUse {
  id: string;
  icon: UseIcon;
  title: string;
  text: string;
}

export interface ProductVideo {
  id: string;
  kind: 'url' | 'file';
  src: string;        // YouTube/Vimeo url, or object URL for uploaded file
  title?: string;
}

export interface ProductMediaOverride {
  images?: string[];
  videos?: ProductVideo[];
  uses?: ProductUse[];
  description?: string;
}

interface ProductMediaState {
  overrides: Record<string, ProductMediaOverride>;
  setOverride: (productId: string, patch: ProductMediaOverride) => void;
  addImage: (productId: string, url: string) => void;
  removeImage: (productId: string, idx: number) => void;
  addVideo: (productId: string, video: Omit<ProductVideo, 'id'>) => void;
  removeVideo: (productId: string, videoId: string) => void;
  addUse: (productId: string, use: Omit<ProductUse, 'id'>) => void;
  updateUse: (productId: string, useId: string, patch: Partial<ProductUse>) => void;
  removeUse: (productId: string, useId: string) => void;
  setDescription: (productId: string, description: string) => void;
  reset: (productId: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useProductMediaStore = create<ProductMediaState>()(
  persist(
    (set) => ({
      overrides: {},

      setOverride: (productId, patch) =>
        set((s) => ({
          overrides: {
            ...s.overrides,
            [productId]: { ...s.overrides[productId], ...patch },
          },
        })),

      addImage: (productId, url) =>
        set((s) => {
          const cur = s.overrides[productId] ?? {};
          const images = [...(cur.images ?? []), url];
          return { overrides: { ...s.overrides, [productId]: { ...cur, images } } };
        }),

      removeImage: (productId, idx) =>
        set((s) => {
          const cur = s.overrides[productId] ?? {};
          const images = (cur.images ?? []).filter((_, i) => i !== idx);
          return { overrides: { ...s.overrides, [productId]: { ...cur, images } } };
        }),

      addVideo: (productId, video) =>
        set((s) => {
          const cur = s.overrides[productId] ?? {};
          const videos = [...(cur.videos ?? []), { ...video, id: uid() }];
          return { overrides: { ...s.overrides, [productId]: { ...cur, videos } } };
        }),

      removeVideo: (productId, videoId) =>
        set((s) => {
          const cur = s.overrides[productId] ?? {};
          const videos = (cur.videos ?? []).filter((v) => v.id !== videoId);
          return { overrides: { ...s.overrides, [productId]: { ...cur, videos } } };
        }),

      addUse: (productId, use) =>
        set((s) => {
          const cur = s.overrides[productId] ?? {};
          const uses = [...(cur.uses ?? []), { ...use, id: uid() }];
          return { overrides: { ...s.overrides, [productId]: { ...cur, uses } } };
        }),

      updateUse: (productId, useId, patch) =>
        set((s) => {
          const cur = s.overrides[productId] ?? {};
          const uses = (cur.uses ?? []).map((u) => (u.id === useId ? { ...u, ...patch } : u));
          return { overrides: { ...s.overrides, [productId]: { ...cur, uses } } };
        }),

      removeUse: (productId, useId) =>
        set((s) => {
          const cur = s.overrides[productId] ?? {};
          const uses = (cur.uses ?? []).filter((u) => u.id !== useId);
          return { overrides: { ...s.overrides, [productId]: { ...cur, uses } } };
        }),

      setDescription: (productId, description) =>
        set((s) => ({
          overrides: {
            ...s.overrides,
            [productId]: { ...s.overrides[productId], description },
          },
        })),

      reset: (productId) =>
        set((s) => {
          const next = { ...s.overrides };
          delete next[productId];
          return { overrides: next };
        }),
    }),
    { name: 'cofkans:product-media' },
  ),
);
