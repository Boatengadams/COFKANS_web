import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BehaviorEvent =
  | { kind: 'search'; query: string; at: number }
  | { kind: 'view'; productId: string; category?: string; at: number }
  | { kind: 'dwell'; productId: string; ms: number; at: number }
  | { kind: 'wishlist'; productId: string; category?: string; at: number }
  | { kind: 'cart'; productId: string; category?: string; at: number }
  | { kind: 'purchase'; productId: string; category?: string; at: number };

/** Bump when the policy text or cookie categories change — forces a re-prompt. */
export const CONSENT_VERSION = 2;
/** Re-ask for consent after this many days (GDPR best practice: ≤ 12 months). */
export const CONSENT_TTL_DAYS = 365;

export type ConsentMethod = 'accept_all' | 'reject_all' | 'custom' | 'gpc_auto' | 'reopened';

export interface ConsentLogEntry {
  at: number;
  version: number;
  method: ConsentMethod;
  analytics: boolean;
  personalization: boolean;
  marketing: boolean;
  sms: boolean;
}

export interface ConsentState {
  /** Has the user answered the *current version* of the banner? */
  decided: boolean;
  /** The policy version they answered. Mismatch ⇒ re-prompt. */
  version: number;
  /** Strictly necessary — always on. Kept here for completeness. */
  essential: true;
  /** Aggregate analytics (page views, performance). */
  analytics: boolean;
  /** Personalised recommendations & "For You" rails. */
  personalization: boolean;
  /** In-app promotional banners / targeted offers. */
  marketing: boolean;
  /** SMS marketing via Hubtel. */
  sms: boolean;
  decidedAt: number | null;
  /** Last time we showed a *re-confirmation* (TTL refresh). */
  lastReconfirmAt: number | null;
  /** Audit trail for GDPR proof-of-consent. */
  log: ConsentLogEntry[];
  /** Region detected at decision time (informational). */
  region: 'EU' | 'UK' | 'US-CA' | 'GH' | 'OTHER' | null;
}

interface PersonalizationState {
  consent: ConsentState;
  setConsent: (next: Partial<Omit<ConsentState, 'log' | 'version' | 'essential'>>, method?: ConsentMethod) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  reopenConsent: () => void;
  bannerVisible: boolean;
  setBannerVisible: (v: boolean) => void;

  events: BehaviorEvent[];
  categoryScores: Record<string, number>;
  productScores: Record<string, number>;
  recentQueries: string[];

  track: (event: BehaviorEvent) => void;
  clearHistory: () => void;
}

const MAX_EVENTS = 500;
const MAX_QUERIES = 30;
const MAX_LOG = 20;

const DEFAULT_CONSENT: ConsentState = {
  decided: false,
  version: 0,
  essential: true,
  analytics: false,
  personalization: false,
  marketing: false,
  sms: false,
  decidedAt: null,
  lastReconfirmAt: null,
  log: [],
  region: null,
};

export const usePersonalizationStore = create<PersonalizationState>()(
  persist(
    (set, get) => ({
      consent: DEFAULT_CONSENT,
      bannerVisible: false,
      setBannerVisible: v => set({ bannerVisible: v }),

      setConsent: (next, method = 'custom') => set(s => {
        const merged: ConsentState = {
          ...s.consent,
          ...next,
          essential: true,
          decided: true,
          version: CONSENT_VERSION,
          decidedAt: Date.now(),
          region: s.consent.region ?? detectRegion(),
        };
        const entry: ConsentLogEntry = {
          at: Date.now(),
          version: CONSENT_VERSION,
          method,
          analytics: merged.analytics,
          personalization: merged.personalization,
          marketing: merged.marketing,
          sms: merged.sms,
        };
        return {
          consent: { ...merged, log: [entry, ...merged.log].slice(0, MAX_LOG) },
          bannerVisible: false,
        };
      }),

      acceptAll: () => get().setConsent(
        { analytics: true, personalization: true, marketing: true, sms: true },
        'accept_all',
      ),
      rejectAll: () => get().setConsent(
        { analytics: false, personalization: false, marketing: false, sms: false },
        'reject_all',
      ),

      reopenConsent: () => set({ bannerVisible: true }),

      events: [],
      categoryScores: {},
      productScores: {},
      recentQueries: [],

      track: event => {
        const { consent } = get();
        // Personalisation gates product/category scoring; analytics still allows aggregate views.
        const allowed = event.kind === 'search'
          ? consent.analytics || consent.personalization
          : consent.personalization;
        if (!allowed) return;

        const events = [event, ...get().events].slice(0, MAX_EVENTS);
        const categoryScores = { ...get().categoryScores };
        const productScores = { ...get().productScores };
        const recentQueries = [...get().recentQueries];

        const weight = weightFor(event);
        if ('category' in event && event.category) {
          categoryScores[event.category] = (categoryScores[event.category] ?? 0) + weight;
        }
        if ('productId' in event && event.productId) {
          productScores[event.productId] = (productScores[event.productId] ?? 0) + weight;
        }
        if (event.kind === 'search' && event.query.trim()) {
          const q = event.query.trim().toLowerCase();
          const filtered = recentQueries.filter(x => x !== q);
          filtered.unshift(q);
          recentQueries.length = 0;
          recentQueries.push(...filtered.slice(0, MAX_QUERIES));
        }
        set({ events, categoryScores, productScores, recentQueries });
      },

      clearHistory: () => set({ events: [], categoryScores: {}, productScores: {}, recentQueries: [] }),
    }),
    {
      name: 'cofkans:personalization',
      version: 2,
      migrate: (persisted: any, _from) => {
        if (!persisted) return persisted;
        const c = persisted.consent ?? {};
        // v1 → v2: marketing/sms kept; introduce personalization separate from analytics.
        return {
          ...persisted,
          consent: {
            ...DEFAULT_CONSENT,
            ...c,
            essential: true,
            personalization: c.personalization ?? c.analytics ?? false,
            log: c.log ?? [],
            region: c.region ?? null,
            lastReconfirmAt: c.lastReconfirmAt ?? null,
            version: c.version ?? 0,
          },
        };
      },
    },
  ),
);

function weightFor(e: BehaviorEvent): number {
  switch (e.kind) {
    case 'search': return 1;
    case 'view': return 2;
    case 'dwell': return Math.min(5, Math.round(e.ms / 5000));
    case 'wishlist': return 4;
    case 'cart': return 6;
    case 'purchase': return 10;
  }
}

export function topCategories(scores: Record<string, number>, n = 3): string[] {
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
}

/** True when consent needs to be re-asked (no decision, stale, or version bumped). */
export function needsConsent(c: ConsentState): boolean {
  if (!c.decided) return true;
  if (c.version !== CONSENT_VERSION) return true;
  if (!c.decidedAt) return true;
  const days = (Date.now() - c.decidedAt) / 86_400_000;
  if (days > CONSENT_TTL_DAYS) return true;
  return false;
}

/** Global Privacy Control / Do-Not-Track signal from the browser. */
export function hasGpcSignal(): boolean {
  if (typeof navigator === 'undefined') return false;
  // @ts-expect-error GPC is a non-standard but widely-implemented property
  if (navigator.globalPrivacyControl === true) return true;
  if (navigator.doNotTrack === '1' || (window as any).doNotTrack === '1') return true;
  return false;
}

function detectRegion(): ConsentState['region'] {
  if (typeof Intl === 'undefined') return null;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.startsWith('Europe/London')) return 'UK';
    if (tz.startsWith('Europe/')) return 'EU';
    if (tz === 'America/Los_Angeles') return 'US-CA';
    if (tz === 'Africa/Accra') return 'GH';
    return 'OTHER';
  } catch {
    return null;
  }
}
