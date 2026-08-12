import { useState, useEffect, lazy, Suspense, startTransition, type ElementType } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from './components/ThemeToggle';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { ProductCatalog } from './components/ProductCatalog';
import { useAwards } from './hooks/useAwards';
import { useCertifications } from './hooks/useCertifications';
import { useSiteContent } from './pages/site/SiteShell';
import { PersonalizedRecommendations } from './components/PersonalizedRecommendations';
import { ForYouRail } from './components/personalization/ForYouRail';
import { csvProducts } from './data/csvProducts';
import { LuxuryMegaMenu } from './components/LuxuryMegaMenu';
import { SupportWidget } from './components/support/SupportWidget';
import { BottomTabBar } from './components/BottomTabBar';
import { MustChangePasswordBanner } from './components/auth/MustChangePasswordBanner';
import { UserProfile } from './components/UserProfile';
import { EnhancedAuthModal } from './components/EnhancedAuthModal';
import { DashboardPro } from './components/dashboard-pro/DashboardPro';
import { isDeveloper } from '@/lib/admin-service';
import { BlackFridayDeals } from './components/BlackFridayDeals';
import { DEVELOPER_ROUTE } from './AppRouter';
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);
import { CartButton } from './components/cart/CartButton';
import { CartDrawer } from './components/cart/CartDrawer';
import { DashboardOverlay } from './components/DashboardOverlay';
import { EmailVerificationBanner } from './components/EmailVerificationBanner';
import { HoverProvider } from './contexts/HoverContext';
// Backend & real auth are paused while DEMO_MODE is on (see /src/lib/demo-mode.ts).
// To re-enable the real backend, swap this back to:
//   import { FirebaseAuthProvider, useFirebaseAuth as useAuth } from './contexts/FirebaseAuthContext';
import { FirebaseAuthProvider, useFirebaseAuth as useAuth } from './contexts/FirebaseAuthContext';
import { DemoBanner } from './components/DemoBanner';
import { CookieConsent } from './components/privacy/CookieConsent';
import { TargetedPromo } from './components/personalization/TargetedPromo';
import { useCartStore } from '@/stores/cart-store';
import type { UserRole } from './types';
import { Toaster } from 'react-hot-toast';
import { Zap, Home, Building2, Lightbulb, ArrowRight, Award, Sparkles, Package, Star, Menu, X, ChevronRight, Trophy, Globe, Shield, CheckCircle, Crown, TrendingUp, Tag, Search } from 'lucide-react';
import cofkansLogo from '../imports/cofkans.png';

// Hero showroom images
import hero1 from '../imports/5769454295303527144.jpg';
import hero2 from '../imports/5769454295303527145.jpg';
import hero3 from '../imports/5769454295303527146.jpg';
import hero4 from '../imports/5769454295303527147.jpg';
import hero5 from '../imports/5769454295303527148.jpg';
import hero6 from '../imports/5769454295303527149.jpg';
import hero7 from '../imports/5769454295303527150.jpg';
import hero8 from '../imports/5769454295303527151.jpg';
import hero9 from '../imports/5769454295303527152.jpg';

function AppContent() {
  const { user, signInWithProvider, signUpWithEmail, signInWithEmail, resetPassword, signOut, isLoading } = useAuth();
  const { initializeCart } = useCartStore();
  const { awards: liveAwards } = useAwards();
  const { certifications: liveCertifications } = useCertifications();
  // Editable landing-page copy (managed from the Developer Portal → Landing page).
  const { landing } = useSiteContent();

  // Uniform shape for an award/certificate shown on the Legacy timeline.
  type TimelineHonor = {
    kind: string; year: string; title: string; organization: string;
    imageUrl?: string; color: string; Icon: ElementType;
  };

  // Bucket each live award/certification into the timeline milestone year it belongs to
  // (the latest milestone whose year is <= the honor's year). Updates from the Developer
  // Portal flow through `useAwards`/`useCertifications` and reflect here instantly.
  const HONOR_MILESTONE_YEARS = [1985, 1995, 2005, 2015, 2020, 2025];
  const bucketHonors = (year: string): number => {
    const y = parseInt(year || '', 10);
    if (Number.isNaN(y)) return HONOR_MILESTONE_YEARS[HONOR_MILESTONE_YEARS.length - 1];
    let target = HONOR_MILESTONE_YEARS[0];
    for (const m of HONOR_MILESTONE_YEARS) {
      if (m <= y) target = m;
      else break;
    }
    return target;
  };
  const liveHonorsByYear: Record<number, TimelineHonor[]> = {};
  HONOR_MILESTONE_YEARS.forEach((y) => { liveHonorsByYear[y] = []; });
  liveAwards.forEach((a) => {
    liveHonorsByYear[bucketHonors(a.year)].push({
      kind: 'Award', year: a.year, title: a.title, organization: a.organization,
      imageUrl: a.imageUrl, color: 'from-primary to-secondary', Icon: Award,
    });
  });
  liveCertifications.forEach((c) => {
    liveHonorsByYear[bucketHonors(c.year)].push({
      kind: 'Certification', year: c.year, title: c.name, organization: c.issuer || 'Compliance & Quality',
      imageUrl: c.imageUrl, color: 'from-primary to-secondary', Icon: Shield,
    });
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [currentView, _setCurrentView] = useState<'home' | 'dashboard' | 'deals' | 'admin' | 'user-dashboard' | 'checkout'>('home');
  const setCurrentView = (v: typeof currentView) => startTransition(() => _setCurrentView(v));
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'orders' | 'wishlist' | 'settings' | null>(null);
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

  // Customers see UserDashboard; admin/technician/driver/manager/management_support see RoleBasedDashboard.
  // Developer email redirects to secure console route.
  useEffect(() => {
    if (!user) return;

    // Redirect developers to secure route
    if (isDeveloper(user.email || '')) {
      window.location.href = DEVELOPER_ROUTE;
      return;
    }

    const staff = user.role === 'manager' || user.role === 'technician' || user.role === 'driver' || user.role === 'management_support';
    if (staff && currentView === 'user-dashboard' && !dashboardTab) setCurrentView('dashboard');
    if (!staff && currentView === 'dashboard') setCurrentView('user-dashboard');
  }, [user?.email, user?.role, currentView, dashboardTab]);

  const handleSignIn = async (provider: 'google' | 'apple' | 'microsoft') => {
    try {
      await signInWithProvider(provider);
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

  const heroSlides = [
    {
      img: hero1,
      title: 'Premium Showroom Experience',
      subtitle: 'Luxury Lighting Collections'
    },
    {
      img: hero2,
      title: 'Illuminate Your World',
      subtitle: 'Designer Chandeliers & Fixtures'
    },
    {
      img: hero3,
      title: 'Luxury Meets Technology',
      subtitle: 'Crystal Chandeliers & Smart Automation'
    },
    {
      img: hero4,
      title: 'Exquisite Craftsmanship',
      subtitle: 'Premium Pendant Collections'
    },
    {
      img: hero5,
      title: 'Ghana\'s Premier Excellence',
      subtitle: 'Trusted by Architects & Developers'
    },
    {
      img: hero6,
      title: 'Architectural Brilliance',
      subtitle: 'Modern Lighting Solutions'
    },
    {
      img: hero7,
      title: 'Sophisticated Elegance',
      subtitle: 'Curated Designer Pieces'
    },
    {
      img: hero8,
      title: 'Innovation & Style',
      subtitle: 'Contemporary Lighting Design'
    },
    {
      img: hero9,
      title: 'Timeless Luxury',
      subtitle: 'High-End Electrical Solutions'
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let lastY = 0;
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setScrollY(y);
      const delta = y - lastY;
      if (y < 80) setHeaderHidden(false);
      else if (delta > 6) setHeaderHidden(true);
      else if (delta < -6) setHeaderHidden(false);
      lastY = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = cofkansLogo;
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.href = cofkansLogo;
      document.head.appendChild(newFavicon);
    }

    // Update document title
    document.title = 'Cofkans Electricals - Premium Lighting & Electrical Solutions';
  }, []);

  // Show Black Friday Deals
  if (currentView === 'deals') {
    return (
      <HoverProvider>
        <div className="min-h-screen w-full bg-background text-foreground antialiased pb-[calc(env(safe-area-inset-bottom)+64px)] md:pb-0">
          <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-3xl border-b border-border-light shadow-sm">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
              <div className="flex items-center justify-between h-20">
                <button onClick={() => setCurrentView('home')}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <img src={cofkansLogo} alt="Cofkans" className="h-10 w-auto" />
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
        <div className="min-h-screen w-full bg-background text-foreground antialiased pb-[calc(env(safe-area-inset-bottom)+64px)] md:pb-0">
          <Suspense fallback={<PageFallback />}>
            <CheckoutPage
              onBack={() => setCurrentView('home')}
              onComplete={() => setCurrentView('user-dashboard')}
            />
          </Suspense>
        </div>
      </HoverProvider>
    );
  }

  // user-dashboard and dashboard now render as overlays on top of the home page (below).

  // Show Admin Panel (only for admins)
  if (currentView === 'admin' && user?.role === 'admin') {
    return (
      <HoverProvider>
        <div className="min-h-screen w-full bg-background text-foreground antialiased pb-[calc(env(safe-area-inset-bottom)+64px)] md:pb-0">
          <Suspense fallback={<PageFallback />}>
            <AdminPage onBack={() => setCurrentView('dashboard')} />
          </Suspense>
          <SupportWidget />
        </div>
      </HoverProvider>
    );
  }

  // Developer access is handled via secure route in AppRouter.tsx

  // 'dashboard' view also rendered as overlay (see bottom of home tree).

  return (
    <HoverProvider>
    <div className="min-h-screen w-full bg-background text-foreground antialiased pb-[calc(env(safe-area-inset-bottom)+64px)] md:pb-0">
      {/* Premium Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: headerHidden ? -100 : 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-[background,backdrop-filter,border] duration-500 ${
          scrolled
            ? 'bg-background/85 backdrop-blur-2xl border-b border-border-light shadow-[0_1px_0_0_rgba(0,0,0,0.02)]'
            : 'bg-background/40 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between gap-2 h-14 sm:h-16 lg:h-20">
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex items-center relative group cursor-pointer"
            >
              <div className="relative px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-black dark:bg-transparent shadow-md dark:shadow-none transition-all duration-300">
                <img
                  src={cofkansLogo}
                  alt="Cofkans Electricals"
                  className="h-7 sm:h-11 md:h-12 w-auto object-contain relative z-10
                    [filter:contrast(1.3)_saturate(1.5)_brightness(1.15)_drop-shadow(0_2px_8px_rgba(212,175,55,0.4))]
                    dark:[filter:contrast(1.25)_saturate(1.6)_brightness(1.3)_drop-shadow(0_0_2px_rgba(255,215,130,0.7))_drop-shadow(0_2px_16px_rgba(255,200,80,0.6))_drop-shadow(0_0_24px_rgba(255,180,60,0.4))]"
                />
                {/* Premium glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 rounded-2xl" />
              </div>
            </motion.button>

            <div className="hidden lg:flex items-center gap-10">
              {['Collections', 'Products', 'Wholesale'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item === 'Wholesale' ? 'products' : item.toLowerCase().replace(' ', '-'))}
                  className="text-[15px] font-medium text-foreground/70 hover:text-foreground hover:scale-105 transition-all duration-200 relative group cursor-pointer"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                </button>
              ))}
            </div>

            {/* Mobile inline search — sits between logo and profile, replaces cart icon */}
            <form
              className="flex-1 lg:hidden mx-1"
              onSubmit={(e) => {
                e.preventDefault();
                const term = mobileSearch.trim();
                if (!term) return;
                window.dispatchEvent(new CustomEvent('cofkans:search', { detail: term }));
                setTimeout(() => {
                  const el = document.getElementById('products');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
              }}
            >
              <label className="relative flex items-center">
                <Search className="absolute left-2.5 w-4 h-4 text-muted-foreground pointer-events-none" strokeWidth={2.2} />
                <input
                  type="search"
                  inputMode="search"
                  value={mobileSearch}
                  onChange={(e) => setMobileSearch(e.target.value)}
                  placeholder="Search products…"
                  className="w-full h-9 pl-8 pr-2 rounded-full bg-muted/70 border border-border/60 text-[13px] focus:outline-none focus:bg-card focus:border-primary placeholder:text-muted-foreground"
                />
              </label>
            </form>

            <div className="flex items-center gap-2 sm:gap-4">
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
                <UserProfile
                  user={user}
                  onSignIn={() => setShowAuthModal(true)}
                  onSignOut={handleSignOut}
                  onOpenDashboard={openUserDashboard}
                  isAuthLoading={isLoading}
                />
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg hover:bg-muted"
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                className="lg:hidden border-t border-border"
              >
                <div className="py-6 space-y-1">
                  <button
                    onClick={() => {
                      setCurrentView('deals');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left block px-4 py-3 mb-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Tag className="w-4 h-4 fill-current" />
                      Black Friday Deals
                    </span>
                    <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                      50% OFF
                    </span>
                  </button>
                  {user && (
                    <button
                      onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }}
                      className="w-full text-left block px-4 py-3 mb-2 bg-primary/10 text-primary rounded-xl font-bold"
                    >
                      My Dashboard
                    </button>
                  )}
                  {['Collections', 'Products', 'Wholesale', 'Contact'].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        if (item === 'Contact') {
                          const footer = document.querySelector('footer');
                          if (footer) {
                            footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        } else if (item === 'Wholesale') {
                          scrollToSection('products');
                        } else {
                          scrollToSection(item.toLowerCase().replace(' ', '-'));
                        }
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left block px-4 py-3 text-[15px] font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200 cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Email Verification Banner */}
      <EmailVerificationBanner />

      {/* Cinematic Hero */}
      <section className="relative h-[68vh] min-h-[460px] sm:h-[80vh] md:h-[100vh] w-full overflow-hidden bg-black dark:bg-foreground">
        {heroSlides.map((slide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{
              opacity: currentSlide === index ? 1 : 0,
              scale: currentSlide === index ? 1 : 1.05,
            }}
            transition={{ duration: 1.6, ease: [0.19, 1, 0.22, 1] }}
            className="absolute inset-0"
            style={{
              transform: currentSlide === index ? `translateY(${scrollY * 0.5}px)` : 'translateY(0)',
            }}
          >
            {/* Subtle dark gradient only at bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 z-10" />
            <img
              src={slide.img}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}

        <div
          className="absolute inset-0 flex items-center justify-center pt-20 px-6 z-20"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
            opacity: Math.max(0, 1 - scrollY / 500),
          }}
        >
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1, ease: [0.19, 1, 0.22, 1] }}
              className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-10 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full bg-black/80 dark:bg-white/10 backdrop-blur-md border border-white/20"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[15px] text-white font-semibold tracking-wide">{heroSlides[currentSlide].subtitle}</span>
            </motion.div>

            <motion.h1
              key={`title-${currentSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1, ease: [0.19, 1, 0.22, 1] }}
              className="mb-4 sm:mb-8 text-white leading-[1.08] tracking-tight"
              style={{
                fontFamily: 'var(--font-luxury)',
                fontSize: 'clamp(2rem, 9vw, 7rem)',
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
              className="hidden sm:block text-xl text-white/80 mb-14 max-w-2xl mx-auto leading-relaxed"
            >
              {landing.heroDescription}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1, ease: [0.19, 1, 0.22, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-5"
            >
              <motion.button
                onClick={() => scrollToSection('products')}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="group relative px-6 sm:px-10 py-3 sm:py-5 bg-gradient-gold rounded-full font-bold text-[14px] sm:text-[15px] text-foreground shadow-[0_8px_30px_rgba(212,175,55,0.35)] hover:shadow-[0_16px_50px_rgba(212,175,55,0.55)] transition-all duration-300 flex items-center gap-2 sm:gap-3 overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative">{landing.heroPrimaryCta}</span>
                <ChevronRight className="relative w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-2" strokeWidth={2.5} />
              </motion.button>
             
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-muted/40 via-muted/10 to-transparent z-20" />

        <div className="absolute bottom-5 sm:bottom-16 left-1/2 -translate-x-1/2 z-30 flex gap-3">
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
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="text-center mb-10 sm:mb-20 lg:mb-28"
          >
            <div className="inline-flex items-center gap-2 mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-gold-subtle border border-primary/20">
              <span className="text-[11px] sm:text-[13px] text-primary font-bold tracking-widest uppercase">{landing.collectionsEyebrow}</span>
            </div>
            <h2 className="mb-3 sm:mb-8 text-3xl sm:text-5xl md:text-7xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60" style={{ fontFamily: 'var(--font-luxury)' }}>
              {landing.collectionsTitle}
            </h2>
            <p className="text-sm sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
              {landing.collectionsSubtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-10">
            {[
              {
                title: 'Luxury Lighting',
                img: 'https://images.unsplash.com/photo-1646764209478-f2fe29b1a4f1?w=800',
                desc: 'Exquisite crystal and gold-plated chandeliers',
                icon: Lightbulb,
                href: '#products',
                accent: 'primary'
              },
              {
                title: 'Solar & Infrastructure',
                img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
                desc: 'Sustainable energy solutions',
                icon: Home,
                href: '#products',
                accent: 'secondary'
              },
              {
                title: 'Industrial Control',
                img: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800',
                desc: 'Professional-grade components',
                icon: Building2,
                href: '#products',
                accent: 'primary'
              },
            ].map((collection, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: i * 0.2, duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
                whileHover={{ y: -12 }}
                className="group"
              >
                <button
                  onClick={() => scrollToSection('products')}
                  className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-card shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-700 block border border-border-light hover:border-border w-full text-left cursor-pointer"
                >
                  <div className="aspect-[3/4] sm:aspect-[4/5] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-transparent z-10 group-hover:opacity-70 transition-opacity duration-700" />

                    <motion.img
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                      src={collection.img}
                      alt={collection.title}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 lg:p-12 text-white z-20">
                      <div className={`inline-flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-${collection.accent}/20 backdrop-blur-sm border border-white/20 mb-2 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-500`}>
                        <collection.icon className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" strokeWidth={1.5} />
                      </div>

                      <h3 className="text-base sm:text-2xl lg:text-4xl font-semibold mb-1 sm:mb-2 lg:mb-4 tracking-tight leading-tight" style={{ fontFamily: 'var(--font-luxury)' }}>
                        {collection.title}
                      </h3>
                      <p className="hidden sm:block text-white/90 mb-3 lg:mb-8 text-sm lg:text-base leading-relaxed">{collection.desc}</p>

                      <div className="inline-flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm lg:text-base font-bold">
                        <span className="hidden sm:inline">Explore Collection</span>
                        <span className="sm:hidden">Explore</span>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover:translate-x-2 transition-transform duration-300" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
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

      {/* Complete Product Catalog — "For You" rail is the first row,
          so personalised picks lead the list instead of sitting in a
          separate section. Honours cookie consent (renders null if off). */}
      <section id="products" className="pb-40 px-6">
        <div className="max-w-[1600px] mx-auto">
          <ForYouRail
            products={csvProducts.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price, image: p.image }))}
            onSelect={() => {
              const el = document.getElementById('products');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
          <ProductCatalog
            user={user}
            onRequireAuth={() => setShowAuthModal(true)}
          />
        </div>
      </section>

      {/* Legacy of Excellence - Comprehensive Section */}
      <section className="relative w-full py-32 bg-white dark:bg-black text-foreground dark:text-white overflow-hidden">
        {/* Premium Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(30deg, transparent 48%, currentColor 48%, currentColor 52%, transparent 52%)',
              backgroundSize: '80px 80px',
            }}
          />
        </div>

        {/* Gold Accent Line */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-20" />

        <div className="max-w-7xl mx-auto px-6 relative">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-full mb-6 backdrop-blur-sm">
              <Crown className="w-4 h-4 text-primary" strokeWidth={2} />
              <span className="text-sm font-bold text-primary">{landing.legacyBadge}</span>
            </div>
            <h2
              className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground dark:from-white dark:via-primary dark:to-white"
              style={{ fontFamily: 'var(--font-luxury)' }}
            >
              {landing.legacyTitle}
            </h2>
            <p className="text-xl text-muted-foreground dark:text-white/70 max-w-3xl mx-auto leading-relaxed">
              {landing.legacySubtitle}
            </p>
          </motion.div>

          {/* Heritage Timeline */}
          <div className="relative mb-32">
            {/* Vertical Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent hidden lg:block" />

            <div className="space-y-24">
              {[
                {
                  year: '1985',
                  title: 'The Beginning',
                  description: 'Cofkans Electricals founded with a vision to bring luxury lighting to Ghana',
                  icon: Star,
                  achievement: 'First premium electrical showroom in Accra',
                  honors: [
                    {
                      kind: 'Certification',
                      year: '1985',
                      title: 'Ghana Standards Authority Approved',
                      organization: 'Compliance & Quality',
                      icon: CheckCircle,
                      color: 'from-green-400 to-green-600',
                    },
                  ],
                },
                {
                  year: '1995',
                  title: 'Expansion Era',
                  description: 'Opened branches in Kumasi and Takoradi, establishing nationwide presence',
                  icon: TrendingUp,
                  achievement: '3 major showrooms across Ghana',
                  honors: [
                    {
                      kind: 'Certification',
                      year: '1995',
                      title: 'Electrical Safety Compliant',
                      organization: 'Compliance & Quality',
                      icon: Shield,
                      color: 'from-blue-400 to-blue-600',
                    },
                  ],
                },
                {
                  year: '2005',
                  title: 'International Recognition',
                  description: 'Partnership with European luxury lighting brands, bringing world-class products',
                  icon: Globe,
                  achievement: 'Exclusive distributor for 15+ premium brands',
                  honors: [
                    {
                      kind: 'Certification',
                      year: '2005',
                      title: 'Authorized Premium Distributor',
                      organization: 'Compliance & Quality',
                      icon: Shield,
                      color: 'from-purple-400 to-purple-600',
                    },
                  ],
                },
                {
                  year: '2015',
                  title: 'Smart Innovation',
                  description: 'Pioneered smart home lighting integration and automation in West Africa',
                  icon: Zap,
                  achievement: 'First smart lighting showroom in Ghana',
                  honors: [
                    {
                      kind: 'Certification',
                      year: '2015',
                      title: 'ISO 9001:2015 Certified',
                      organization: 'Compliance & Quality',
                      icon: CheckCircle,
                      color: 'from-yellow-400 to-yellow-600',
                    },
                  ],
                },
                {
                  year: '2020',
                  title: 'Excellence Awards',
                  description: 'Recognized as Ghana\'s Premier Luxury Electrical Solutions Provider',
                  icon: Award,
                  achievement: 'Best Electrical Retailer Award',
                  honors: [
                    {
                      kind: 'Award',
                      year: '2021',
                      title: 'Customer Satisfaction Leader',
                      organization: 'Consumer Choice Awards',
                      icon: Award,
                      color: 'from-green-400 to-green-600',
                    },
                    {
                      kind: 'Award',
                      year: '2022',
                      title: 'Innovation in Smart Homes',
                      organization: 'Technology Excellence Awards',
                      icon: TrendingUp,
                      color: 'from-purple-400 to-purple-600',
                    },
                    {
                      kind: 'Award',
                      year: '2023',
                      title: 'Premium Service Provider',
                      organization: 'West Africa Trade Awards',
                      icon: Star,
                      color: 'from-blue-400 to-blue-600',
                    },
                    {
                      kind: 'Award',
                      year: '2024',
                      title: 'Best Electrical Retailer',
                      organization: 'Ghana Business Excellence Awards',
                      icon: Trophy,
                      color: 'from-yellow-400 to-yellow-600',
                    },
                  ],
                },
                {
                  year: '2025',
                  title: 'Luxury Leadership',
                  description: 'Celebrating 40 years of illuminating Ghana\'s most prestigious spaces',
                  icon: Crown,
                  achievement: '5000+ projects, 98% satisfaction',
                  honors: [],
                },
              ].map((milestone, idx) => {
                // Prefer live honors managed from the Developer Portal; fall back to the
                // built-in defaults so the timeline is never empty.
                const live = liveHonorsByYear[parseInt(milestone.year, 10)] || [];
                const honors: TimelineHonor[] = live.length > 0
                  ? live
                  : milestone.honors.map((h) => ({
                      kind: h.kind, year: h.year, title: h.title,
                      organization: h.organization, color: h.color, Icon: h.icon,
                    }));
                return (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className={`relative grid lg:grid-cols-2 gap-8 items-center ${
                    idx % 2 === 0 ? '' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Content */}
                  <div className={`${idx % 2 === 0 ? 'lg:text-right lg:pr-16' : 'lg:pl-16 lg:col-start-2'}`}>
                    {/* Year Badge */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`inline-block mb-6 ${idx % 2 === 0 ? 'lg:float-right lg:clear-right' : ''}`}
                    >
                      <div className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-lg shadow-primary/20">
                        <span className="text-3xl font-bold text-white dark:text-white" style={{ fontFamily: 'var(--font-luxury)' }}>
                          {milestone.year}
                        </span>
                      </div>
                    </motion.div>

                    <div className="clear-both">
                      <h3 className="text-3xl font-bold mb-4">{milestone.title}</h3>
                      <p className="text-lg text-muted-foreground dark:text-white/70 mb-4 leading-relaxed">
                        {milestone.description}
                      </p>

                      {/* Achievement Badge */}
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 dark:bg-card border border-white/10 dark:border-border rounded-xl backdrop-blur-sm">
                        <Award className="w-4 h-4 text-primary" strokeWidth={2} />
                        <span className="text-sm font-medium text-foreground dark:text-white/90">
                          {milestone.achievement}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Icon + Awards / Certifications earned in this era */}
                  <div className={`flex flex-col gap-8 ${idx % 2 === 0 ? 'lg:items-end' : 'lg:items-start lg:col-start-1 lg:row-start-1'}`}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      className="relative"
                    >
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/30 relative z-10">
                        <milestone.icon className="w-12 h-12 text-white" strokeWidth={1.5} />
                      </div>
                      {/* Glow Effect */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary blur-xl opacity-50 -z-10" />
                    </motion.div>

                    {honors.length > 0 && (
                      <div className={`w-full flex flex-col gap-4 ${idx % 2 === 0 ? 'lg:items-end' : 'lg:items-start'}`}>
                        {honors.map((honor) => (
                          <motion.div
                            key={`${honor.kind}-${honor.year}-${honor.title}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            whileHover={{ y: -6, scale: 1.02 }}
                            className="group relative w-full max-w-sm bg-white/5 dark:bg-card rounded-3xl p-6 border-2 border-white/10 dark:border-border hover:border-primary transition-all duration-500 shadow-lg hover:shadow-2xl backdrop-blur-sm"
                          >
                            <div className="flex items-center gap-4">
                              {/* Image / Icon container — upload the award or certificate
                                  image URL from the Developer Portal to show it here */}
                              <div className="relative flex-shrink-0">
                                {honor.imageUrl ? (
                                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-muted border border-white/10 dark:border-border shadow-lg">
                                    <ImageWithFallback
                                      src={honor.imageUrl}
                                      alt={`${honor.title} — ${honor.organization}`}
                                      className="w-full h-full object-contain p-1.5"
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${honor.color} flex items-center justify-center shadow-lg`}>
                                      <honor.Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                                    </div>
                                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${honor.color} blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
                                  </>
                                )}
                              </div>

                              {/* Content */}
                              <div className="min-w-0 text-left">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="inline-block px-2.5 py-0.5 bg-primary/20 border border-primary/30 rounded-full text-xs font-bold text-primary">
                                    {honor.year}
                                  </span>
                                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground dark:text-white/50">
                                    {honor.kind}
                                  </span>
                                </div>
                                <h4 className="text-lg font-bold leading-tight">{honor.title}</h4>
                                <p className="text-sm text-muted-foreground dark:text-white/60">{honor.organization}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Center Dot (Desktop only) */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
                    <div className="w-4 h-4 rounded-full bg-primary border-4 border-black dark:border-background shadow-lg shadow-primary/50" />
                  </div>
                </motion.div>
                );
              })}
            </div>
          </div>

          {/* Trusted Excellence Stats */}
          <div className="mb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              className="text-center mb-16"
            >
              <h3 className="text-4xl md:text-5xl font-bold mb-5" style={{ fontFamily: 'var(--font-luxury)' }}>
                Trusted Excellence
              </h3>
              <p className="text-lg text-muted-foreground dark:text-white/70 max-w-2xl mx-auto">
                Four decades of innovation and uncompromising quality
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {[
                { icon: Award, value: '40+', label: 'Years of Excellence' },
                { icon: Package, value: '5000+', label: 'Premium Products' },
                { icon: Building2, value: '500+', label: 'Elite Projects' },
                { icon: Star, value: '1000+', label: 'Happy Clients' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ delay: i * 0.15, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative group text-center p-10 rounded-3xl bg-white/5 dark:bg-card border-2 border-white/10 dark:border-border-light hover:border-primary transition-all duration-500 backdrop-blur-sm"
                >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <stat.icon className="relative w-14 h-14 mx-auto mb-6 text-primary group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                  <div className="relative text-6xl font-semibold mb-4" style={{ fontFamily: 'var(--font-luxury)' }}>
                    {stat.value}
                  </div>
                  <div className="relative text-[15px] text-muted-foreground dark:text-white/70 font-semibold tracking-wide">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-block p-12 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 border-2 border-primary/20 rounded-3xl backdrop-blur-md">
              <h3 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-luxury)' }}>
                Join Our Story
              </h3>
              <p className="text-lg text-muted-foreground dark:text-white/70 mb-8 max-w-2xl">
                Experience the same dedication to excellence that has served Ghana's elite for over four decades
              </p>
              <motion.button
                onClick={() => scrollToSection('collections')}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.92 }}
                className="px-10 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold text-lg shadow-2xl shadow-primary/30 hover:shadow-[0_20px_60px_rgba(212,175,55,0.6)] hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 cursor-pointer"
              >
                Explore Collections
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="relative py-32 px-6 bg-gradient-to-b from-background to-muted/30">
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className="max-w-[1400px] mx-auto relative">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div>
              <div className="mb-8 inline-block px-4 py-2 rounded-xl bg-black dark:bg-transparent shadow-md dark:shadow-none">
                <img
                  src={cofkansLogo}
                  alt="Cofkans Logo"
                  className="h-12 w-auto object-contain
                    [filter:contrast(1.3)_saturate(1.5)_brightness(1.15)_drop-shadow(0_2px_8px_rgba(212,175,55,0.4))]
                    dark:[filter:contrast(1.25)_saturate(1.6)_brightness(1.3)_drop-shadow(0_0_2px_rgba(255,215,130,0.7))_drop-shadow(0_2px_16px_rgba(255,200,80,0.6))_drop-shadow(0_0_24px_rgba(255,180,60,0.4))]"
                />
              </div>
              <p className="text-[15px] text-muted-foreground leading-relaxed font-medium">
                Illuminating luxury spaces with precision engineering since 1985
              </p>
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
                  { name: 'Product Catalog', section: 'products' }
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
            <div className="flex items-center gap-10 text-[14px] text-muted-foreground font-medium">
              <a href="/privacy" className="hover:text-foreground hover:scale-105 transition-all duration-200 cursor-pointer">Privacy Policy</a>
              <a href="/terms" className="hover:text-foreground hover:scale-105 transition-all duration-200 cursor-pointer">Terms of Service</a>
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
      <BottomTabBar
        isAuthed={!!user}
        active={
          showCartDrawer
            ? 'cart'
            : currentView === 'home'
              ? 'home'
              : currentView === 'user-dashboard' || currentView === 'dashboard'
                ? 'account'
                : currentView === 'checkout'
                  ? 'cart'
                  : null
        }
        onHome={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onShop={() => {
          setCurrentView('home');
          setTimeout(() => {
            const el = document.getElementById('products');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 50);
        }}
        onCart={() => setShowCartDrawer(true)}
        onAccount={() => { if (user) { openUserDashboard(); } else { setShowAuthModal(true); } }}
      />

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
          <DashboardPro
            user={user}
            initialTab={dashboardTab}
            onClose={() => { setDashboardTab(null); setCurrentView('home'); }}
            onSignOut={handleSignOut}
          />
        )}
      </DashboardOverlay>
    </div>
    </HoverProvider>
  );
}

export default function App() {
  return (
    <FirebaseAuthProvider>
      <Toaster
        position="top-center"
        containerClassName="cofkans-toaster"
        containerStyle={{
          top: 'calc(env(safe-area-inset-top) + 12px)',
          left: 12,
          right: 12,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '12px 14px',
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: 1.35,
            maxWidth: '100%',
            width: 'min(420px, 96vw)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
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
      <AppContent />
      <DemoBanner />
      <CookieConsent />
      <TargetedPromo />
    </FirebaseAuthProvider>
  );
}
