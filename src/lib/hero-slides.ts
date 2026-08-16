/**
 * Hero carousel slides for the landing page.
 *
 * Slides are managed from the Developer Console → Hero Section tab and stored in
 * the `heroSlides` Firestore collection. The landing page consumes them live via
 * `useHeroSlides()`. If the collection is empty or unreachable, the seeded
 * defaults below keep the hero looking complete.
 */
import { useEffect, useState } from 'react';
import { Image as NativeImage } from 'react-native';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import { DEMO_MODE, IS_WEB } from './demo-mode';
import hero1 from '../imports/5769454295303527144.jpg';
import hero2 from '../imports/5769454295303527145.jpg';
import hero3 from '../imports/5769454295303527146.jpg';
import hero4 from '../imports/5769454295303527147.jpg';
import hero5 from '../imports/5769454295303527148.jpg';
import hero6 from '../imports/5769454295303527149.jpg';
import hero7 from '../imports/5769454295303527150.jpg';
import hero8 from '../imports/5769454295303527151.jpg';
import hero9 from '../imports/5769454295303527152.jpg';

const assetUrl = (asset: unknown): string => {
  if (typeof asset === 'string') return asset;
  if (typeof asset === 'object' && asset !== null && 'uri' in asset) {
    const uri = (asset as { uri?: unknown }).uri;
    if (typeof uri === 'string') return uri;
  }

  // react-native-web may expose Image as a wrapper without this method.
  const imageApi = NativeImage as unknown as {
    resolveAssetSource?: (source: number | { uri: string }) => { uri?: string } | null;
  };
  if (typeof imageApi.resolveAssetSource !== 'function') return '';

  try {
    return imageApi.resolveAssetSource(asset as number | { uri: string })?.uri ?? '';
  } catch {
    return '';
  }
};

const localHeroImages = [hero1, hero2, hero3, hero4, hero5, hero6, hero7, hero8, hero9].map(assetUrl);

export interface HeroSlide {
  img: string;
  title: string;
  subtitle: string;
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  { img: localHeroImages[0], title: 'Premium Showroom Experience', subtitle: 'Luxury Lighting Collections' },
  { img: localHeroImages[1], title: 'Illuminate Your World', subtitle: 'Designer Chandeliers & Fixtures' },
  { img: localHeroImages[2], title: 'Luxury Meets Technology', subtitle: 'Crystal Chandeliers & Smart Automation' },
  { img: localHeroImages[3], title: 'Exquisite Craftsmanship', subtitle: 'Premium Pendant Collections' },
  { img: localHeroImages[4], title: "Ghana's Premier Excellence", subtitle: 'Trusted by Architects & Developers' },
  { img: localHeroImages[5], title: 'Architectural Brilliance', subtitle: 'Modern Lighting Solutions' },
  { img: localHeroImages[6], title: 'Sophisticated Elegance', subtitle: 'Curated Designer Pieces' },
  { img: localHeroImages[7], title: 'Innovation & Style', subtitle: 'Contemporary Lighting Design' },
  { img: localHeroImages[8], title: 'Timeless Luxury', subtitle: 'High-End Electrical Solutions' },
];

interface HeroSlideDoc {
  type?: 'image' | 'video';
  url?: string;
  title?: string;
  subtitle?: string;
  order?: number;
  isActive?: boolean;
}

/**
 * Live subscription to the active hero slides. Falls back to
 * DEFAULT_HERO_SLIDES whenever the collection is empty or unreachable so the
 * hero is never blank.
 */
export function useHeroSlides(): HeroSlide[] {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);

  // Warm the browser cache before the carousel ever advances. This prevents
  // the active slide from briefly rendering the section's dark background.
  useEffect(() => {
    if (!IS_WEB || typeof window === 'undefined') return;
    slides.forEach(({ img }) => {
      const preload = new window.Image();
      preload.src = img;
    });
  }, [slides]);

  useEffect(() => {
    if (DEMO_MODE) return;
    let unsub: (() => void) | undefined;
    try {
      unsub = onSnapshot(
        query(collection(db, 'heroSlides'), orderBy('order', 'asc')),
        (snap) => {
          const rows = snap.docs
            .map((d) => d.data() as HeroSlideDoc)
            // Only image slides render in the carousel; videos are skipped for now.
            .filter((s) => s.isActive !== false && s.type !== 'video' && !!s.url)
            .map((s) => ({
              img: s.url as string,
              title: s.title || '',
              subtitle: s.subtitle || '',
            }));
          // Keep the complete local catalogue visible when the console only
          // contains a partial set of slides. Remote rows override the
          // matching positions; the shared local catalogue fills the rest.
          const merged = DEFAULT_HERO_SLIDES.map((fallback, index) => rows[index] ? { ...fallback, ...rows[index] } : fallback);
          setSlides(rows.length ? [...merged, ...rows.slice(DEFAULT_HERO_SLIDES.length)] : DEFAULT_HERO_SLIDES);
        },
        () => setSlides(DEFAULT_HERO_SLIDES),
      );
    } catch {
      setSlides(DEFAULT_HERO_SLIDES);
    }
    return () => unsub?.();
  }, []);

  return slides;
}
