import React, { useState, useEffect, useRef, lazy, Suspense, startTransition } from 'react';
import { Platform } from 'react-native';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from './components/ThemeToggle';
import { ProductCatalog } from './components/ProductCatalog';
import { useCategories } from './hooks/useCategories';
import { MobileContactCta, useSiteContent } from './pages/site/SiteShell';
import { DEFAULT_HERO_SLIDES, useHeroSlides } from '@/lib/hero-slides';
import { resolveImageUrl } from '@/lib/product-image-map';
import { PersonalizedRecommendations } from './components/PersonalizedRecommendations';
import { ForYouRail } from './components/personalization/ForYouRail';
import { csvProducts } from './data/csvProducts';
import { LuxuryMegaMenu } from './components/LuxuryMegaMenu';
import { SupportWidget } from './components/support/SupportWidget';
import { MustChangePasswordBanner } from './components/auth/MustChangePasswordBanner';
import { UserProfile } from './components/UserProfile';
import { EnhancedAuthModal } from './components/EnhancedAuthModal';
import { BlackFridayDeals } from './components/BlackFridayDeals';
import { CartButton } from './components/cart/CartButton';
import { CartDrawer } from './components/cart/CartDrawer';
import { BottomTabBar } from './components/BottomTabBar';
import { DashboardOverlay } from './components/DashboardOverlay';
import { EmailVerificationBanner } from './components/EmailVerificationBanner';
import { HoverProvider } from './contexts/HoverContext';
import { FirebaseAuthProvider, useFirebaseAuth as useAuth } from './contexts/FirebaseAuthContext';
import { useCartStore } from '@/stores/cart-store';
import type { UserRole } from './types';
import { Toaster } from 'react-hot-toast';
import { Zap, Home, Building2, Lightbulb, ArrowRight, Award, Sparkles, Package, Star, Menu, X, ChevronLeft, ChevronRight, Shield, CheckCircle, Crown, Tag, Sun, Fan, Grid3x3, ChevronDown } from 'lucide-react';
import { setupPwa, watchInstallPrompt } from './utils/pwa';
import Seo from './seo/Seo';
import { SOCIAL_LINKS, SocialLinks } from './components/SocialLinks';

const cofkansLogoUrl = '/images/brand/cofkans.png';
const cofkanFavIconUrl = '/images/brand/Cofkans_FavIcon.png';

const DashboardPro = lazy(() => import('./components/dashboard-pro/DashboardPro').then(m => ({ default: m.DashboardPro })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const ProductPage = lazy(() => import('./pages/ProductPage').then(m => ({ default: m.default })));

const CookieConsent = lazy(() => import('./components/privacy/CookieConsent').then(m => ({ default: m.CookieConsent })));
const TargetedPromo = lazy(() => import('./components/personalization/TargetedPromo').then(m => ({ default: m.TargetedPromo })));
const AboutPage = lazy(() => import('./pages/site/AboutPage'));
const CareersPage = lazy(() => import('./pages/site/CareersPage'));
const ContactPage = lazy(() => import('./pages/site/ContactPage'));
const FaqPage = lazy(() => import('./pages/site/FaqPage'));
const InstallationPage = lazy(() => import('./pages/site/InstallationPage'));
const PrivacyPage = lazy(() => import('./pages/site/PrivacyPage'));
const ShippingPage = lazy(() => import('./pages/site/ShippingPage'));
const SupportPage = lazy(() => import('./pages/site/SupportPage'));
const TermsPage = lazy(() => import('./pages/site/TermsPage'));
const WarrantyPage = lazy(() => import('./pages/site/WarrantyPage'));
const BranchesPage = lazy(() => import('./pages/BranchesPage').then((module) => ({ default: module.BranchesPage })));
const BranchDetailPage = lazy(() => import('./pages/BranchDetailPage').then((module) => ({ default: module.BranchDetailPage })));
const CheckoutCompletePage = lazy(() => import('./pages/CheckoutCompletePage'));
const ThankYouPage = lazy(() => import('./pages/ThankYouPage'));

const NavbarLogo = React.memo(function NavbarLogo({ onPress }: { onPress: () => void }) {
  return (
    <motion.button
      onClick={onPress}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="flex h-16 w-[154px] shrink-0 items-center relative group cursor-pointer sm:h-[80px] sm:w-[210px]"
      aria-label="Return to the Cofkans home page"
    >
        <div className="relative flex h-16 w-[154px] shrink-0 items-center px-2 py-1 rounded-xl bg-slate-950/95 shadow-[0_6px_18px_rgba(15,23,42,.12)] transition-all duration-300 sm:h-[80px] sm:w-[210px] sm:px-3 sm:py-1.5">
        <img
          src={cofkansLogoUrl}
          alt="Cofkans Electricals"
          width={146}
          height={64}
          decoding="async"
          className="block h-16 w-[146px] shrink-0 object-contain relative z-10 sm:h-[80px] sm:w-[198px]"
        />
      </div>
    </motion.button>
  );
});

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// All product categories (derived from real catalogue data), one card each.
// Internal/back-office buckets are hidden from shoppers.
const HIDDEN_CATEGORIES = new Set(['Pending Review', 'Uncategorized']);

function pickCategoryIcon(name: string): React.ElementType {
  const n = name.toLowerCase();
  if (/(control|protection|panel.*protect|electrical control)/.test(n)) return Shield;
  if (/(outdoor|garden|street|flood|bollard|lantern)/.test(n)) return Sun;
  if (/(light|lamp|bulb|chandelier|pendant|sconce|downlight|indoor)/.test(n)) return Lightbulb;
  if (/(cable|wir|conduit)/.test(n)) return Zap;
  if (/(socket|plug|switch)/.test(n)) return Grid3x3;
  return Package;
}

const MAX_CATEGORY_IMAGES = 6;

const CATEGORY_CARDS = (() => {
  const map = new Map<string, { title: string; images: string[]; count: number; icon: React.ElementType }>();
  for (const p of csvProducts.filter((item) => !/^Product Image \d+$/i.test(item.name))) {
    if (!p.category || HIDDEN_CATEGORIES.has(p.category)) continue;
    let entry = map.get(p.category);
    if (!entry) {
      entry = { title: p.category, images: [], count: 0, icon: pickCategoryIcon(p.category) };
      map.set(p.category, entry);
    }
    entry.count++;
    // Collect several distinct product images per category for the auto-rotating preview.
    if (p.image && entry.images.length < MAX_CATEGORY_IMAGES && !entry.images.includes(resolveImageUrl(p.image))) {
      entry.images.push(resolveImageUrl(p.image));
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
})();

// Auto-rotating image preview for a category card. Pro touches:
// • true overlapping crossfade + slow Ken Burns zoom
// • only rotates while on-screen (IntersectionObserver) and pauses on hover
// • honours prefers-reduced-motion, preloads images, randomised start frame
function CategoryImageRotator({ images, alt, delayMs = 0 }: { images: string[]; alt: string; delayMs?: number }) {
  const [idx, setIdx] = useState(() => (images.length ? Math.floor(Math.random() * images.length) : 0));
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const reducedMotion = useRef(false);
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    reducedMotion.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }, []);

  // Preload all frames so crossfades never flash a blank.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    images.forEach(src => { const im = new Image(); im.src = src; });
  }, [images]);

  // Pause rotation when the card is off-screen.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const playing = inView && !hovered && images.length > 1 && !reducedMotion.current;

  useEffect(() => {
    if (!playing) return;
    let interval: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      interval = setInterval(() => setIdx(i => (i + 1) % images.length), 3200);
    }, delayMs);
    return () => { clearTimeout(start); clearInterval(interval); };
  }, [playing, images.length, delayMs]);

  if (images.length === 0) return null;

  return (
    <div
      ref={ref}
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={images[idx]}
          src={images[idx]}
          alt={alt}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1.12 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1, ease: 'easeInOut' },
            scale: { duration: 6, ease: 'linear' },
          }}
          className="absolute inset-0 block !w-full !h-full max-w-none object-cover object-center"
        />
      </AnimatePresence>

      {images.length > 1 && (
        <div className="absolute top-3 right-3 z-20 flex gap-1">
          {images.map((src, i) => (
            <span
              key={src}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Hero showroom images

function AppContent() {
  const { user, signInWithProvider, signUpWithEmail, signInWithEmail, resetPassword, signOut, isLoading } = useAuth();
  const { initializeCart } = useCartStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [currentView, _setCurrentView] = useState<'home' | 'dashboard' | 'deals' | 'user-dashboard' | 'checkout'>('home');
  const setCurrentView = (v: typeof currentView) => startTransition(() => _setCurrentView(v));
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'orders' | 'wishlist' | 'settings' | null>(null);
  const [navCategory, setNavCategory] = useState<string>('all');
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const { categories: firestoreCategories } = useCategories();
  // Editable landing-page copy + hero slides (managed from the Developer Console).
  const { landing } = useSiteContent();
  const heroSlides = useHeroSlides();
  const categoryRailRef = useRef<HTMLDivElement>(null);
  const pathname = window.location.pathname.replace(/\/$/, '') || '/';

  const scrollCategories = (direction: 'next' | 'previous') => {
    const rail = categoryRailRef.current;
    if (!rail) return;
    const firstCard = rail.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap || '0');
    const step = (firstCard?.offsetWidth ?? rail.clientWidth / 5) + gap;
    const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
    const target = direction === 'previous'
      ? Math.max(0, rail.scrollLeft - step)
      : atEnd ? 0 : rail.scrollLeft + step;
    rail.scrollTo({ left: target, behavior: 'smooth' });
  };

  // Auto-scroll the same native horizontal rail that users can drag manually.
  useEffect(() => {
    if (typeof window === 'undefined' || CATEGORY_CARDS.length < 2) return;
    const timer = window.setInterval(() => {
      const rail = categoryRailRef.current;
      if (!rail) return;
      const firstCard = rail.firstElementChild as HTMLElement | null;
      const gap = parseFloat(getComputedStyle(rail).columnGap || '0');
      const step = (firstCard?.offsetWidth ?? rail.clientWidth / 5) + gap;
      const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
      rail.scrollTo({ left: atEnd ? 0 : rail.scrollLeft + step, behavior: 'smooth' });
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  const routedPage = getCustomerRoute(pathname);
  if (routedPage) {
    return (
      <>
        <Suspense fallback={<PageFallback />}>
          {routedPage}
        </Suspense>
      </>
    );
  }

  // Unknown pathname: keep the customer app's own 404 instead of silently
  // rendering the storefront at a URL that does not exist.
  if (pathname !== '/') {
    return (
      <>
        <CustomerNotFound />
      </>
    );
  }

  const CAT_ICON_MAP: Record<string, React.ElementType> = {
    luxury: Lightbulb,
    solar: Sun,
    wiring: Zap,
    industrial: Building2,
    appliances: Fan,
  };

  const handleNavCategory = (id: string) => {
    setNavCategory(id);
    setCollectionsOpen(false);
    setMobileMenuOpen(false);
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const openUserDashboard = (tab?: 'overview' | 'orders' | 'wishlist' | 'settings') => {
    setDashboardTab(tab ?? null);
    setCurrentView('user-dashboard');
  };

  // Initialize cart when user logs in
  useEffect(() => {
    if (user?.uid) {
      initializeCart(user.uid);
    }
  }, [user?.uid, initializeCart]);

  const collectionsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!collectionsOpen) return;
    const close = (e: MouseEvent) => {
      if (collectionsRef.current && !collectionsRef.current.contains(e.target as Node)) {
        setCollectionsOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [collectionsOpen]);

  // Customers see UserDashboard; admin/technician/driver/manager/management_support see RoleBasedDashboard.
  useEffect(() => {
    if (!user) return;

    const role = user.role as UserRole | undefined;
    const staff = role === 'manager' || role === 'technician' || role === 'driver' || role === 'management_support';
    if (staff && currentView === 'user-dashboard' && !dashboardTab) setCurrentView('dashboard');
    if (!staff && currentView === 'dashboard') setCurrentView('user-dashboard');
  }, [user?.email, user?.role, currentView, dashboardTab]);

  const handleSignIn = async (provider: 'google' | 'apple' | 'microsoft') => {
    try {
      await (signInWithProvider as (value: typeof provider) => Promise<void>)(provider);
      setShowAuthModal(false);
      setCurrentView('user-dashboard');
    } catch (error) {
      console.error('Sign in failed:', error);
      // Error toast is shown by FirebaseAuthContext
    }
  };

  const handleEmailSignUp = async (email: string, password: string, displayName: string, role?: UserRole) => {
    try {
      await signUpWithEmail(email, password, displayName, role);
      setShowAuthModal(false);
      setCurrentView('user-dashboard');
    } catch (error) {
      console.error('Email sign up failed:', error);
      // Error toast is shown by FirebaseAuthContext
    }
  };

  const handleEmailSignIn = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
      setShowAuthModal(false);
      setCurrentView('user-dashboard');
    } catch (error) {
      console.error('Email sign in failed:', error);
      // Error toast is shown by FirebaseAuthContext
    }
  };

  const handlePasswordReset = async (email: string) => {
    try {
      await resetPassword(email);
      // Success toast is shown by FirebaseAuthContext
    } catch (error) {
      console.error('Password reset failed:', error);
      // Error toast is shown by FirebaseAuthContext
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentView('home');
  };

  // Dashboard CartView dispatches this event to start checkout.
  useEffect(() => {
    const onCheckout = () => {
      setShowCartDrawer(false);
      setDashboardTab(null);
      setCurrentView('checkout');
    };
    window.addEventListener('cofkans:checkout', onCheckout);
    return () => window.removeEventListener('cofkans:checkout', onCheckout);
  }, []);

  // Hash-based product page handler (keeps main routing unchanged). When
  // the URL hash is `#product/<id>` the full ProductPage is shown.
  const [productHash, setProductHash] = useState<string | null>(null);
  useEffect(() => {
    const parse = () => {
      const h = (window.location.hash || '').replace(/^#/, '');
      if (h.startsWith('product/')) {
        setProductHash(h.split('/')[1] || null);
      } else {
        setProductHash(null);
      }
    };
    parse();
    window.addEventListener('hashchange', parse);
    return () => window.removeEventListener('hashchange', parse);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Keep the active slide index valid if the slide count changes (e.g. a
  // developer removes a slide while the page is open).
  useEffect(() => {
    if (currentSlide >= heroSlides.length) setCurrentSlide(0);
  }, [heroSlides.length, currentSlide]);

  useEffect(() => {
    const handleScroll = (event?: Event) => {
      const source = event?.target as HTMLElement | Document | null;
      const nestedScrollTop =
        source && source !== (document as unknown as HTMLElement) && 'scrollTop' in source
          ? Number((source as HTMLElement).scrollTop || 0)
          : 0;
      const y = Math.max(
        window.scrollY || 0,
        document.documentElement.scrollTop || 0,
        document.body.scrollTop || 0,
        document.scrollingElement?.scrollTop || 0,
        nestedScrollTop,
      );
      setScrolled(y > 20);
      if (y <= 20) {
        setHeaderVisible(true);
      } else if (y > lastScrollY.current + 4) {
        setHeaderVisible(false);
      } else if (y < lastScrollY.current - 4) {
        setHeaderVisible(true);
      }
      lastScrollY.current = y;
      // Drive parallax via CSS custom property — zero React re-renders
      document.documentElement.style.setProperty('--scroll-y', `${y}px`);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  useEffect(() => {
    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = cofkanFavIconUrl;
      favicon.sizes.value = '512x512';
      favicon.type = 'image/png';
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.href = cofkanFavIconUrl;
      newFavicon.sizes.value = '512x512';
      newFavicon.type = 'image/png';
      document.head.appendChild(newFavicon);
    }

    // Update document title
    document.title = 'Cofkans Electricals - Premium Lighting & Electrical Solutions';

    // Make the app installable (PWA) and safe-area aware. Injected at runtime
    // because the preview auto-generates the HTML entrypoint.
    setupPwa(cofkanFavIconUrl);
    const stopWatchingInstall = watchInstallPrompt();
    return () => stopWatchingInstall();
  }, []);

  // Show Black Friday Deals
  if (currentView === 'deals') {
    return (
      <HoverProvider>
        <div className="min-h-screen w-full bg-background text-foreground antialiased">
          <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-3xl border-b border-border-light shadow-sm">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
              <div className="flex items-center justify-between h-20">
                <button onClick={() => setCurrentView('home')}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <img src={cofkansLogoUrl} alt="Cofkans" width={150} height={61} className="h-[61px] w-[150px] object-contain" />
                  <span className="font-bold text-lg">Black Friday Deals</span>
                </button>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCurrentView('home')}
                    className="px-4 py-2 rounded-lg hover:bg-muted transition-colors font-bold text-sm"
                  >
                    Back to Home
                  </button>
                  <ThemeToggle />
                  {user ? (
                    <UserProfile
                      user={user}
                      onSignIn={() => {}}
                      onSignOut={handleSignOut}
                      onOpenDashboard={openUserDashboard}
                    />
                  ) : isLoading ? (
                    <div aria-label="Loading account" className="h-10 w-24 rounded-lg bg-muted animate-pulse" />
                  ) : (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.nav>
          <div className="pt-20">
            <BlackFridayDeals />
          </div>
          <SupportWidget />
        </div>
      </HoverProvider>
    );
  }

  // Show Checkout
  if (currentView === 'checkout' && user) {
    return (
      <HoverProvider>
        <div className="min-h-screen w-full bg-background text-foreground antialiased">
          <Suspense fallback={<PageFallback />}>
            <CheckoutPage
              onBack={() => {
                useCartStore.getState().clearBuyNow();
                setCurrentView('home');
              }}
              onComplete={() => {
                useCartStore.getState().clearBuyNow();
                setCurrentView('user-dashboard');
              }}
            />
          </Suspense>
        </div>
      </HoverProvider>
    );
  }

  // user-dashboard and dashboard now render as overlays on top of the home page (below).

  // If the URL contains a product hash (e.g. #product/<id>), render the
  // standalone ProductPage. This keeps routing additive and doesn't require
  // modifying the existing router configuration used by other hosts.
  if (productHash) {
    return (
      <HoverProvider>
        <Suspense fallback={<PageFallback />}>
          <ProductPage productId={productHash} onClose={() => { window.history.back(); }} />
        </Suspense>
      </HoverProvider>
    );
  }

  // Developer access is handled via secure route in AppRouter.tsx

  // 'dashboard' view also rendered as overlay (see bottom of home tree).

  return (
    <HoverProvider>
    <div className="min-h-screen w-full bg-background text-foreground antialiased pb-16 lg:pb-0">
      {/* Premium Navigation */}
      <motion.nav
        initial={false}
        style={{
          transform: headerVisible ? 'translateY(0)' : 'translateY(-110%)',
          opacity: headerVisible ? 1 : 0,
          pointerEvents: headerVisible ? 'auto' : 'none',
          willChange: 'transform, opacity',
          transition: 'transform 350ms cubic-bezier(0.19, 1, 0.22, 1), opacity 250ms ease',
        }}
        className={`fixed top-0 left-0 right-0 z-50 ${
          scrolled
            ? 'bg-background/70 backdrop-blur-3xl border-b border-border-light shadow-[0_1px_0_0_rgba(0,0,0,0.02)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-22">
            <NavbarLogo onPress={scrollToTop} />

            <div className="hidden lg:flex items-center gap-10">
              {/* Categories dropdown */}
              <div className="relative" ref={collectionsRef}>
                <button
                  onClick={() => setCollectionsOpen(o => !o)}
                  className="flex items-center gap-1 text-[15px] font-medium text-foreground/70 hover:text-foreground hover:scale-105 transition-all duration-200 relative group cursor-pointer"
                >
                  Categories
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${collectionsOpen ? 'rotate-180' : ''}`} />
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                </button>
                <AnimatePresence>
                  {collectionsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      {firestoreCategories.map((cat, i) => {
                        const Icon = CAT_ICON_MAP[cat.id] ?? Grid3x3;
                        return (
                          <button
                            key={cat.id || `category-${i}`}
                            onClick={() => handleNavCategory(cat.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary ${navCategory === cat.id ? 'text-primary bg-primary/5' : 'text-foreground/80'}`}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                            {cat.name}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {['Products', 'Wholesale'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    scrollToSection(item === 'Wholesale' ? 'products' : item.toLowerCase());
                  }}
                  className="text-[15px] font-medium text-foreground/70 hover:text-foreground hover:scale-105 transition-all duration-200 relative group cursor-pointer"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="hidden lg:flex items-center gap-4">
                <motion.button
                  onClick={() => setCurrentView('deals')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 relative overflow-hidden group"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Tag className="w-4 h-4 fill-current" />
                  </motion.div>
                  <span>Black Friday</span>
                  <span className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-bl-lg">
                    30% OFF
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                </motion.button>
                {user && (
                  <button onClick={() => setCurrentView('dashboard')}
                    className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-semibold transition-colors">
                    My Dashboard
                  </button>
                )}
                {(!user || user.role === 'customer') && (
                  <CartButton onClick={() => setShowCartDrawer(true)} />
                )}
                <UserProfile
                  user={user}
                  onSignIn={() => setShowAuthModal(true)}
                  onSignOut={handleSignOut}
                  onOpenDashboard={openUserDashboard}
                  isAuthLoading={isLoading}
                />
              </div>
              <div className="lg:hidden flex items-center gap-1">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-xl hover:bg-muted transition-colors"
                  aria-label="Open menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

        </div>
      </motion.nav>

      {/* Mobile side-drawer — rendered outside nav so it's truly full-screen */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer-panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 36 }}
              className="fixed top-0 left-0 bottom-0 z-[56] w-[80vw] max-w-xs bg-background border-r border-border shadow-2xl flex flex-col lg:hidden overflow-y-auto"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                <div className="rounded-lg bg-slate-950 px-2 py-1 shadow-sm ring-1 ring-white/10">
                  <img
                    src={cofkansLogoUrl}
                    alt="Cofkans"
                    className="h-12 w-auto object-contain [filter:contrast(1.08)_saturate(1.08)_brightness(1.04)]"
                  />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 px-4 py-5 space-y-1">

                {/* Black Friday CTA */}
                <motion.button
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
                  onClick={() => { setCurrentView('deals'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3.5 mb-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl font-bold shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    <Tag className="w-4 h-4 fill-current" />
                    Black Friday Deals
                  </span>
                  <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-lg">50% OFF</span>
                </motion.button>

                {/* Dashboard shortcut */}
                {user && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
                    onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 mb-3 bg-primary/10 text-primary rounded-2xl font-bold"
                  >
                    <Crown className="w-4 h-4" />
                    My Dashboard
                  </motion.button>
                )}

                {/* Section label */}
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-foreground/40 uppercase tracking-[0.15em]">Categories</p>

                {/* Category items */}
                {firestoreCategories.map((cat, i) => {
                  const Icon = CAT_ICON_MAP[cat.id] ?? Grid3x3;
                  return (
                    <motion.button
                      key={cat.id || `category-${i}`}
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 + i * 0.04 }}
                      onClick={() => handleNavCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-all duration-200 ${navCategory === cat.id ? 'text-primary bg-primary/10 shadow-sm' : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'}`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={navCategory === cat.id ? 2.5 : 1.5} />
                      {cat.name}
                      {navCategory === cat.id && <ChevronRight className="w-4 h-4 ml-auto text-primary" />}
                    </motion.button>
                  );
                })}

                {/* Section label */}
                <p className="px-4 pt-4 pb-1 text-[10px] font-bold text-foreground/40 uppercase tracking-[0.15em]">Navigate</p>

                {/* Nav items */}
                {[
                  { label: 'Products', action: () => { scrollToSection('products'); setMobileMenuOpen(false); } },
                  { label: 'Wholesale', action: () => { scrollToSection('products'); setMobileMenuOpen(false); } },
                  { label: 'Contact', action: () => { document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); } },
                ].map(({ label, action }, i) => (
                  <motion.button
                    key={label}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 + i * 0.04 }}
                    onClick={action}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[15px] font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                  >
                    {label}
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </motion.button>
                ))}
              </div>

              {/* Drawer footer */}
              <div className="px-5 py-4 border-t border-border shrink-0">
                <p className="text-xs text-muted-foreground text-center">Cofkans Electricals © 2026</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Email Verification Banner */}
      <EmailVerificationBanner />

      {/* Cinematic Hero */}
      <section className="relative h-[100svh] min-h-[100svh] sm:min-h-[680px] w-full overflow-hidden bg-[#080d18] dark:bg-foreground">
        {heroSlides.map((slide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{
              opacity: currentSlide === index ? 1 : 0,
              scale: currentSlide === index ? 1 : 1.05,
            }}
            transition={{ duration: 1.6, ease: [0.19, 1, 0.22, 1] }}
            className="absolute inset-0 will-change-transform"
            style={{
              transform: currentSlide === index
                ? 'translateY(calc(var(--scroll-y, 0px) * 0.35))'
                : 'translateY(0)',
            }}
          >
            {/* Subtle dark gradient only at bottom for text readability */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,18,.78),rgba(4,8,18,.18)_55%,rgba(4,8,18,.48)),linear-gradient(180deg,rgba(4,8,18,.2),transparent_40%,rgba(4,8,18,.72)] z-10" />
            <img
              src={slide.img}
              alt={slide.title}
              onError={(event) => {
                const fallback = DEFAULT_HERO_SLIDES[index % DEFAULT_HERO_SLIDES.length]?.img;
                if (fallback && event.currentTarget.src !== fallback) {
                  event.currentTarget.src = fallback;
                }
              }}
              className="w-full h-full object-cover bg-muted"
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'low'}
              decoding="async"
            />
          </motion.div>
        ))}

        <div
          className="absolute inset-0 flex items-center justify-center pt-20 px-6 z-20"
          style={{
            transform: 'translateY(calc(var(--scroll-y, 0px) * 0.2))',
            opacity: 'calc(1 - clamp(0, calc(var(--scroll-y, 0px) / 500), 1))',
            willChange: 'transform, opacity',
          }}
        >
          <div className="max-w-6xl mx-auto text-center px-2">
            {/* Eyebrow trust badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 border border-white/20 backdrop-blur-md"
            >
              <Crown className="w-4 h-4 text-primary" strokeWidth={2.5} />
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">{landing.heroEyebrow}</span>
            </motion.div>

            <motion.h1
              key={`title-${currentSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1, ease: [0.19, 1, 0.22, 1] }}
              className="mb-6 text-white leading-[.98] tracking-[-.035em] font-semibold"
              style={{
                fontFamily: 'var(--font-luxury)',
                fontSize: 'clamp(1.8rem, 7vw, 7rem)',
                textShadow: '0 2px 40px rgba(0,0,0,0.3)'
              }}
            >
              {heroSlides[currentSlide].title}
            </motion.h1>

            <motion.p
              key={`desc-${currentSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1, ease: [0.19, 1, 0.22, 1] }}
              className="text-sm sm:text-lg text-white/80 mb-8 sm:mb-10 max-w-2xl mx-auto leading-[1.7] px-4 sm:px-0 font-medium"
            >
              {landing.heroDescription}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1, ease: [0.19, 1, 0.22, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.button
                onClick={() => scrollToSection('products')}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="group relative px-10 py-5 bg-gradient-gold rounded-full font-bold text-[15px] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(122,90,22,0.35),0_8px_30px_rgba(212,175,55,0.40)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(122,90,22,0.4),0_18px_50px_rgba(212,175,55,0.60)] transition-all duration-300 flex items-center gap-3 overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative">{landing.heroPrimaryCta}</span>
                <ChevronRight className="relative w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" strokeWidth={2.5} />
              </motion.button>

              <motion.button
                onClick={() => scrollToSection('collections')}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="px-10 py-5 rounded-full font-bold text-[15px] text-white border-2 border-white/40 hover:border-white/80 backdrop-blur-md hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                {landing.heroSecondaryCta}
              </motion.button>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/85"
            >
              {landing.trustSignals.map((label, i) => {
                const TrustIcon = [Shield, CheckCircle, Package, Award][i] ?? Shield;
                return (
                  <div key={`${label}-${i}`} className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                    <TrustIcon className="w-4 h-4 text-primary" strokeWidth={2.5} />
                    {label}
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-muted/40 via-muted/10 to-transparent z-20" />

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {heroSlides.map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.2 }}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                currentSlide === index
                  ? 'w-12 bg-gradient-gold shadow-[0_0_12px_rgba(212,175,55,0.6)]'
                  : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Premium Collections */}
      <section id="collections" className="relative pt-10 sm:pt-16 pb-10 sm:pb-16 px-4 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

        <div className="max-w-[1400px] mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-gold-subtle border lux-hairline mb-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{landing.collectionsEyebrow}</span>
            </div>
            <h2
              className="lux-gold-text text-3xl sm:text-4xl lg:text-6xl font-semibold tracking-tight mb-3 sm:mb-4"
              style={{ fontFamily: 'var(--font-luxury)' }}
            >
              {landing.collectionsTitle}
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {landing.collectionsSubtitle}
            </p>
          </motion.div>

          <div className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-white/35 dark:bg-white/[0.035] p-3 sm:p-5 lg:p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="pointer-events-none absolute -left-24 top-8 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:32px_32px]" />

            <button
              type="button"
              aria-label="Previous categories"
              onClick={() => scrollCategories('previous')}
              className="absolute left-1 sm:left-2 lg:left-3 top-1/2 z-30 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary sm:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next categories"
              onClick={() => scrollCategories('next')}
              className="absolute right-1 sm:right-2 lg:right-3 top-1/2 z-30 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary sm:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {[25, 75].map((position, row) => (
              <div
                key={row}
                className="pointer-events-none absolute inset-x-0 z-30 flex -translate-y-1/2 items-center justify-between px-1 sm:hidden"
                style={{ top: `${position}%` }}
              >
                <button
                  type="button"
                  aria-label={`Previous mobile category row ${row + 1}`}
                  onClick={() => scrollCategories('previous')}
                  className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white shadow-lg backdrop-blur-md transition hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Next mobile category row ${row + 1}`}
                  onClick={() => scrollCategories('next')}
                  className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white shadow-lg backdrop-blur-md transition hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ))}

            <div
              ref={categoryRailRef}
              className="relative grid grid-flow-col grid-rows-2 auto-cols-[calc(50%-0.375rem)] gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex sm:flex-nowrap sm:gap-4 lg:gap-5"
              aria-label="Browse product categories"
            >
              {CATEGORY_CARDS.map((collection, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: Math.min(i * 0.05, 0.5), duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
                whileHover={{ y: -12 }}
                className="group min-w-0 w-full shrink-0 snap-start sm:w-auto sm:basis-[calc(33.333%-0.667rem)] lg:basis-[calc(20%-1rem)]"
              >
                <button
                  onClick={() => handleNavCategory(collection.title)}
                  className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-card shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-700 block border border-border-light hover:border-border w-full text-left cursor-pointer"
                >
                  <div className="relative aspect-[4/5] min-h-[260px] w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-transparent z-10 group-hover:opacity-70 transition-opacity duration-700" />

                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                      className="absolute inset-0"
                    >
                      <CategoryImageRotator images={collection.images} alt={collection.title} delayMs={(i % 5) * 500} />
                    </motion.div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-5 text-white z-20">
                      <h3 className="text-sm sm:text-lg lg:text-xl font-semibold mb-1 sm:mb-2 tracking-tight leading-tight" style={{ fontFamily: 'var(--font-luxury)' }}>
                        {collection.title}
                      </h3>
                      <p className="hidden sm:block text-white/90 mb-3 text-xs lg:text-sm leading-relaxed">{collection.count} {collection.count === 1 ? 'product' : 'products'}</p>

                      <div className="inline-flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm lg:text-base font-bold">
                        <span>Explore</span>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      {user && (
        <section className="py-16 px-6 bg-[var(--color-surface-hover)]">
          <div className="max-w-[1600px] mx-auto">
            <PersonalizedRecommendations
              user={user}
              onRequireAuth={() => setShowAuthModal(true)}
            />
          </div>
        </section>
      )}

      {/* Personalised "For You" rail — honours cookie consent */}
      <ForYouRail
        products={csvProducts.filter((p) => !/^Product Image \d+$/i.test(p.name)).map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price, image: resolveImageUrl(p.image) }))}
        onSelect={() => {
          const el = document.getElementById('products');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Complete Product Catalog */}
      <section id="products" className="pb-40 px-3 sm:px-6">
        <div className="max-w-[1600px] mx-auto min-w-0">
          <ProductCatalog
            user={user}
            onRequireAuth={() => setShowAuthModal(true)}
            initialCategory={navCategory}
          />
        </div>
      </section>

      {/* Legacy of Excellence */}
      <section
        aria-labelledby="legacy-heading"
        className="relative w-full overflow-hidden bg-background py-20 text-foreground sm:py-24 lg:py-32"
      >
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-primary/[0.035] via-white to-primary/[0.045]" />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(124,58,237,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.13) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-6 hidden select-none justify-center text-[8~rem] font-black leading-none text-primary/[0.15] sm:flex lg:top-0 lg:text-[12rem]"
          style={{ fontFamily: 'var(--font-luxury)' }}
        >
          1989
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary shadow-sm shadow-primary/5 backdrop-blur sm:tracking-[0.22em]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b87333]" />
              {landing.legacyBadge || 'Established February 1989'}
            </div>
            <h2
              id="legacy-heading"
              className="text-4xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl sm:leading-[0.98] lg:text-7xl"
              style={{ fontFamily: 'var(--font-luxury)' }}
            >
              {(landing.legacyTitle || 'A legacy of excellence').replace(/excellence/i, '')}
              <span className="italic text-[#b87333]">excellence</span>
            </h2>
            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
              {landing.legacySubtitle || 'Illuminating spaces with dependable electrical solutions since February 1989.'}
            </p>
          </motion.div>

          <div className="relative mx-auto mt-16 max-w-6xl lg:mt-24">
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-4 top-0 w-px bg-gradient-to-b from-transparent via-primary/65 to-transparent lg:left-1/2"
            />

            {[
              {
                year: 'EST. 1989',
                label: 'The Beginning',
                title: 'A dependable electrical foundation',
                description: 'Cofkans Electricals has served customers with lighting and electrical solutions since February 1989.',
                Icon: Lightbulb,
              },
              {
                year: 'Catalogue',
                label: 'Product Range',
                title: 'Lighting and electrical goods in one place',
                description: 'The current catalogue brings together real Cofkans product categories for easier discovery and comparison.',
                Icon: Package,
              },
              {
                year: 'Today',
                label: 'Digital Storefront',
                title: 'A modern way to browse Cofkans',
                description: 'Customers can explore products, review details, add items to cart, buy online, or contact a branch from the same storefront.',
                Icon: Zap,
              },
            ].map((era, idx) => (
              <motion.article
                key={era.label}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.65, delay: idx * 0.08, ease: [0.19, 1, 0.22, 1] }}
                className="relative grid gap-5 pb-12 pl-12 last:pb-0 lg:grid-cols-2 lg:gap-16 lg:pl-0 lg:pb-20"
              >
                <div
                  aria-hidden="true"
                  className="absolute left-4 top-8 z-10 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-[5px] border-background bg-primary shadow-[0_0_0_8px_rgba(124,58,237,0.12)] lg:left-1/2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b87333]" />
                </div>

                <div className={`${idx % 2 === 0 ? 'lg:pr-16' : 'lg:col-start-2 lg:pl-16'}`}>
                  <div className="overflow-hidden rounded-[28px] border border-primary/10 bg-card shadow-[0_24px_70px_rgba(124,58,237,0.10)]">
                    <div className="relative aspect-[4/3] overflow-hidden bg-primary/[0.035]">
                      <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            'radial-gradient(circle at 24px 24px, rgba(124,58,237,0.16) 2px, transparent 2px), linear-gradient(135deg, rgba(124,58,237,0.14), rgba(184,115,51,0.10) 48%, transparent 72%)',
                          backgroundSize: '42px 42px, 100% 100%',
                        }}
                      />
                      <div className="absolute inset-6 rounded-[22px] border border-primary/15" aria-hidden="true" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-primary/15 bg-white/85 text-primary shadow-xl shadow-primary/10 backdrop-blur">
                          <era.Icon className="h-11 w-11" strokeWidth={1.6} aria-hidden="true" />
                        </div>
                      </div>
                      <div className="absolute bottom-5 left-5 max-w-[calc(100%-2.5rem)] rounded-full border border-white/20 bg-slate-950/90 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-primary/10 backdrop-blur">
                        {era.year}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`flex items-center ${idx % 2 === 0 ? 'lg:pl-16' : 'lg:col-start-1 lg:row-start-1 lg:pr-16 lg:text-right'}`}>
                  <div className="rounded-[28px] border border-primary/10 bg-card/95 p-6 shadow-[0_18px_55px_rgba(124,58,237,0.08)] backdrop-blur sm:p-8">
                    <div className={`mb-4 flex items-center gap-3 ${idx % 2 === 0 ? '' : 'lg:justify-end'}`}>
                      <span className="h-px w-10 bg-[#b87333]" aria-hidden="true" />
                      <span className="text-xs font-black uppercase tracking-[0.24em] text-[#8a4b20]">{era.label}</span>
                    </div>
                    <h3
                      className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl"
                      style={{ fontFamily: 'var(--font-luxury)' }}
                    >
                      {era.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                      {era.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mx-auto mt-6 max-w-5xl rounded-[30px] border border-primary/10 bg-card/95 p-6 shadow-[0_24px_70px_rgba(124,58,237,0.10)] backdrop-blur sm:p-8 lg:mt-10">
            <div className="mb-8 text-center">
              <div className="text-xs font-black uppercase tracking-[0.24em] text-[#8a4b20]">Since February 1989</div>
              <h3
                className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl"
                style={{ fontFamily: 'var(--font-luxury)' }}
              >
                Trusted Excellence
              </h3>
            </div>
            <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4">
              {[
                { value: '1989', label: 'Established' },
                { value: csvProducts.filter((p) => !/^Product Image \d+$/i.test(p.name)).length.toLocaleString(), label: 'Catalogue Products' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-primary/10 bg-primary/[0.035] p-5 text-center">
                  <div className="text-3xl font-black tracking-tight text-primary sm:text-4xl">{stat.value}</div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-3xl text-center">
            <div className="mx-auto mb-6 h-14 w-px bg-[#b87333]" aria-hidden="true" />
            <p
              className="text-2xl italic leading-snug text-foreground/80 sm:text-3xl"
              style={{ fontFamily: 'var(--font-luxury)' }}
            >
              Every product reflects the trust Cofkans has built since 1989.
            </p>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-gradient-to-b from-background to-muted/30">

        <div className="max-w-[1400px] mx-auto relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 md:gap-16 mb-12 sm:mb-20">
            <div>
              <div className="mb-8 inline-block rounded-xl bg-slate-950 px-4 py-2 shadow-sm ring-1 ring-white/10">
                <img
                  src={cofkansLogoUrl}
                  alt="Cofkans Logo"
                  className="h-12 w-auto object-contain [filter:contrast(1.08)_saturate(1.08)_brightness(1.04)]"
                />
              </div>
              <p className="text-[15px] text-muted-foreground leading-relaxed font-medium">
                Illuminating spaces with dependable electrical solutions since February 1989
              </p>
              <div className="mt-6">
                <SocialLinks links={SOCIAL_LINKS} />
              </div>
            </div>

            {[
              {
                title: 'Collections',
                links: [
                  { name: 'Architectural Lighting', section: 'collections' },
                  { name: 'Luxury Lighting', section: 'collections' },
                  { name: 'Industrial Solutions', section: 'products' },
                  { name: 'Accessories', section: 'products' }
                ],
              },
              {
                title: 'Services',
                links: [
                  { name: 'Wholesale Portal', section: 'products' },
                  { name: 'Installation', href: '/support' },
                  { name: 'Consultation', href: '/contact' },
                ],
              },
              {
                title: 'Connect',
                links: [
                  { name: 'Contact Us', href: '/contact' },
                  { name: 'Support', href: '/support' },
                  { name: 'About Cofkans', href: '/about' },
                  { name: 'Careers', href: '/careers' }
                ],
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-bold mb-8 text-[15px] text-foreground tracking-wide">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link: any, j: number) => (
                    <li key={j}>
                      {link.href ? (
                        <a
                          href={link.href}
                          className="text-[15px] text-muted-foreground hover:text-foreground hover:translate-x-1 inline-block transition-all duration-200 font-medium cursor-pointer"
                        >
                          {link.name}
                        </a>
                      ) : (
                        <button
                          onClick={() => scrollToSection(link.section)}
                          className="text-[15px] text-muted-foreground hover:text-foreground hover:translate-x-1 inline-block transition-all duration-200 font-medium cursor-pointer"
                        >
                          {link.name}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-12 border-t border-border-light flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[14px] text-muted-foreground font-medium">
              © 2026 Cofkans Electricals. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6 text-[13px] sm:text-[14px] text-muted-foreground font-medium">
              <a href="/faq" className="hover:text-foreground transition-colors cursor-pointer">FAQ</a>
              <a href="/shipping" className="hover:text-foreground transition-colors cursor-pointer">Delivery</a>
              <a href="/warranty" className="hover:text-foreground transition-colors cursor-pointer">Warranty</a>
              <a href="/installation" className="hover:text-foreground transition-colors cursor-pointer">Installation</a>
              <a href="/terms" className="hover:text-foreground transition-colors cursor-pointer">Terms</a>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-primary font-semibold">Online</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Components */}
      <MustChangePasswordBanner />
      <SupportWidget />
      <MobileContactCta />

      {/* Authentication Modal */}
      <EnhancedAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={handleSignIn}
        onEmailSignUp={handleEmailSignUp}
        onEmailSignIn={handleEmailSignIn}
        onPasswordReset={handlePasswordReset}
        initialMode={(() => { try { return localStorage.getItem('cofkans_known_device') ? 'signin' : 'signup'; } catch { return 'signup'; } })()}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={showCartDrawer}
        onClose={() => setShowCartDrawer(false)}
        onCheckout={() => {
          setShowCartDrawer(false);
          setCurrentView('checkout');
        }}
      />

      {/* Unified Pro Dashboard — overlay (role-aware) */}
      <DashboardOverlay
        open={(currentView === 'user-dashboard' || currentView === 'dashboard') && !!user}
        onClose={() => { setDashboardTab(null); setCurrentView('home'); }}
        title="Dashboard"
      >
        {user && (
          <Suspense fallback={<PageFallback />}>
            <DashboardPro
              user={user}
              initialTab={dashboardTab}
              onClose={() => { setDashboardTab(null); setCurrentView('home'); }}
              onSignOut={handleSignOut}
            />
          </Suspense>
        )}
      </DashboardOverlay>

      {/* Mobile bottom navigation — only on mobile (lg:hidden inside component) */}
      <BottomTabBar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'home') { setCurrentView('home'); scrollToTop(); }
          else if (view === 'products') { setCurrentView('home'); setTimeout(() => scrollToSection('products'), 50); }
          else if (view === 'cart') setShowCartDrawer(true);
          else if (view === 'account') { if (user) setCurrentView('user-dashboard'); else setShowAuthModal(true); }
        }}
      />
    </div>
    </HoverProvider>
  );
}

function getCustomerRoute(pathname: string): React.ReactNode | null {
  const routes: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
    '/about': AboutPage,
    '/careers': CareersPage,
    '/contact': ContactPage,
    '/faq': FaqPage,
    '/installation': InstallationPage,
    '/privacy': PrivacyPage,
    '/shipping': ShippingPage,
    '/support': SupportPage,
    '/terms': TermsPage,
    '/warranty': WarrantyPage,
    '/branches': BranchesPage,
    '/checkout/complete': CheckoutCompletePage,
    '/thank-you': ThankYouPage,
  };
  const Page = routes[pathname];
  if (Page) return <Page />;
  if (pathname.startsWith('/branches/')) return <BranchDetailPage />;
  if (pathname.startsWith('/product/')) {
    const productId = decodeURIComponent(pathname.slice('/product/'.length));
    return <ProductPage productId={productId} onClose={() => window.history.back()} />;
  }
  return null;
}

function CustomerNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 text-center text-foreground">
      <div className="max-w-lg">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-primary">404</p>
        <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-3 text-muted-foreground">The Cofkans Electricals page you requested does not exist.</p>
        <a href="/" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-white hover:opacity-90">Return to the shop</a>
      </div>
    </main>
  );
}

export default function App() {
  if (Platform.OS !== 'web') return null;

  return (
    <FirebaseAuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
          success: {
            iconTheme: {
              primary: 'var(--primary)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          },
        }}
      />
      <Seo />
      <AppContent />
      <Suspense fallback={null}>
        <CookieConsent />
        <TargetedPromo />
      </Suspense>
    </FirebaseAuthProvider>
  );
}
