/**
 * App Router — customer app on `*`, every staff portal nested under
 * `/home/portal/...` so the public URL space gives no hint that an internal
 * console exists. Each portal is role-gated against the `staffAccounts`
 * Firestore collection; an unauthorised visit silently redirects to `/` so
 * outsiders can't probe path validity.
 *
 * URL map (all under the same domain):
 *   /                                            customer app
 *   /branches, /branches/:slug                   customer-facing branch directory
 *   /home/portal/branch/:slug/(login)            branch manager dashboard + login
 *   /home/portal/branch/:slug/settings           branch manager settings
 *   /home/portal/rider/(login)                   rider/driver dashboard + login
 *   /home/portal/helpdesk/(login)                showroom front-desk dashboard + login
 *   /home/portal/{OBSCURED_DEV_KEY}              developer console (extra obscured)
 *
 * Nothing in the public app links to these. They are entered by direct URL
 * only and the role guard returns the customer site if the visitor is not
 * the expected staff role.
 */

import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { lazy, Suspense, type LazyExoticComponent, type ComponentType } from 'react';

const PORTAL_BASE = '/home/portal';
const DEVELOPER_ROUTE = '/developer-portal';

import App from './App';
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext';
import { PortalLogin } from './components/portal/PortalLogin';
import { PortalShell } from './components/portal/PortalShell';
import { RequireStaffRole } from './components/portal/RequireStaffRole';
import { BranchDashboard } from './components/portal/BranchDashboard';
import { RiderDashboard } from './components/portal/RiderDashboard';
import { FrontDeskDashboard } from './components/portal/FrontDeskDashboard';
import { BranchSettingsPage } from './components/portal/BranchSettings';
import { BranchesPage } from './pages/BranchesPage';
import { BranchDetailPage } from './pages/BranchDetailPage';
import { getBranchBySlug } from '../lib/branches';

const DeveloperPortalRoute = lazy(() =>
  import('./pages/DeveloperPortal/DeveloperPortalRoute').then(m => ({ default: m.DeveloperPortalRoute }))
);

const PrivacyPage = lazy(() => import('./pages/site/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/site/TermsPage'));
const AboutPage = lazy(() => import('./pages/site/AboutPage'));
const ContactPage = lazy(() => import('./pages/site/ContactPage'));
const SupportPage = lazy(() => import('./pages/site/SupportPage'));
const CareersPage = lazy(() => import('./pages/site/CareersPage'));

function SitePage({ Page }: { Page: LazyExoticComponent<ComponentType> }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Page />
    </Suspense>
  );
}

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Shared base for every internal portal. Changing this single constant moves
// the entire console tree, which is useful if the URL ever leaks publicly.

function PortalProvider({ children }: { children: React.ReactNode }) {
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
}

// --- Branch portal --------------------------------------------------------
function BranchLoginPage() {
  const { slug = '' } = useParams();
  const branch = getBranchBySlug(slug);
  if (!branch) return <Navigate to="/" replace />;
  return (
    <PortalLogin
      portalTitle={`${branch.name} — Staff Login`}
      expectedRole="branch_manager"
      expectedBranchSlug={branch.slug}
      successPath={`${PORTAL_BASE}/branch/${branch.slug}`}
    />
  );
}

function BranchPortalPage() {
  const { slug = '' } = useParams();
  const branch = getBranchBySlug(slug);
  if (!branch) return <Navigate to="/" replace />;
  return (
    <RequireStaffRole role="branch_manager" branchSlug={branch.slug} loginPath={`${PORTAL_BASE}/branch/${branch.slug}/login`}>
      <PortalShell title={`${branch.name}`} subtitle={`${branch.city} · ${branch.address}`}>
        <BranchDashboard branchSlug={branch.slug} />
      </PortalShell>
    </RequireStaffRole>
  );
}

function BranchSettingsRoute() {
  const { slug = '' } = useParams();
  const branch = getBranchBySlug(slug);
  if (!branch) return <Navigate to="/" replace />;
  return (
    <RequireStaffRole role="branch_manager" branchSlug={branch.slug} loginPath={`${PORTAL_BASE}/branch/${branch.slug}/login`}>
      <PortalShell title={`${branch.name} — Settings`} subtitle="Customer-facing contact & hours">
        <BranchSettingsPage branchSlug={branch.slug} />
      </PortalShell>
    </RequireStaffRole>
  );
}

// --- Rider portal ---------------------------------------------------------
function RiderLoginPage() {
  return (
    <PortalLogin
      portalTitle="Rider & Driver Portal"
      expectedRole="rider"
      successPath={`${PORTAL_BASE}/rider`}
    />
  );
}

function RiderPortalPage() {
  return (
    <RequireStaffRole role="rider" loginPath={`${PORTAL_BASE}/rider/login`}>
      <PortalShell title="Rider & Driver Portal" subtitle="Pick up ready deliveries from your branch">
        <RiderDashboard />
      </PortalShell>
    </RequireStaffRole>
  );
}

// --- Helpdesk (front desk) portal ----------------------------------------
function HelpdeskLoginPage() {
  return (
    <PortalLogin
      portalTitle="Showroom Helpdesk"
      expectedRole="front_desk"
      successPath={`${PORTAL_BASE}/helpdesk`}
    />
  );
}

function HelpdeskPortalPage() {
  return (
    <RequireStaffRole role="front_desk" loginPath={`${PORTAL_BASE}/helpdesk/login`}>
      <PortalShell title="Showroom Helpdesk" subtitle="Customer support, enquiries, walk-ins">
        <FrontDeskDashboard />
      </PortalShell>
    </RequireStaffRole>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* New developer portal — gated by Cloudflare WAF (edge), developer
            custom claim, and per-session TOTP. Any /developer-portal/* path
            resolves to the same component so outsiders can't enumerate. */}
        <Route
          path="/developer-portal/*"
          element={
            <Suspense fallback={<PageFallback />}>
              <DeveloperPortalRoute />
            </Suspense>
          }
        />

        {/* Branch manager portal */}
        <Route path={`${PORTAL_BASE}/branch/:slug/login`} element={<PortalProvider><BranchLoginPage /></PortalProvider>} />
        <Route path={`${PORTAL_BASE}/branch/:slug`} element={<PortalProvider><BranchPortalPage /></PortalProvider>} />
        <Route path={`${PORTAL_BASE}/branch/:slug/settings`} element={<PortalProvider><BranchSettingsRoute /></PortalProvider>} />

        {/* Rider / driver portal */}
        <Route path={`${PORTAL_BASE}/rider/login`} element={<PortalProvider><RiderLoginPage /></PortalProvider>} />
        <Route path={`${PORTAL_BASE}/rider`} element={<PortalProvider><RiderPortalPage /></PortalProvider>} />

        {/* Showroom helpdesk / front desk */}
        <Route path={`${PORTAL_BASE}/helpdesk/login`} element={<PortalProvider><HelpdeskLoginPage /></PortalProvider>} />
        <Route path={`${PORTAL_BASE}/helpdesk`} element={<PortalProvider><HelpdeskPortalPage /></PortalProvider>} />

        {/* Any other guess inside /home/portal silently falls through to
            the customer app — outsiders cannot tell which sub-paths exist. */}
        <Route path={`${PORTAL_BASE}/*`} element={<Navigate to="/" replace />} />

        {/* Public marketing & legal pages (Firestore-backed, editable from developer portal) */}
        <Route path="/privacy" element={<SitePage Page={PrivacyPage} />} />
        <Route path="/terms" element={<SitePage Page={TermsPage} />} />
        <Route path="/about" element={<SitePage Page={AboutPage} />} />
        <Route path="/contact" element={<SitePage Page={ContactPage} />} />
        <Route path="/support" element={<SitePage Page={SupportPage} />} />
        <Route path="/careers" element={<SitePage Page={CareersPage} />} />

        {/* Customer-facing branch directory (reads branchSettings) */}
        <Route path="/branches" element={<PortalProvider><BranchesPage /></PortalProvider>} />
        <Route path="/branches/:slug" element={<PortalProvider><BranchDetailPage /></PortalProvider>} />

        {/* Customer app — catch-all; App.tsx supplies its own FirebaseAuthProvider */}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}

export { DEVELOPER_ROUTE, PORTAL_BASE };
