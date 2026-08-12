import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cookie, Settings2, X, Shield, BarChart3, Sparkles, Megaphone, MessageSquare,
  ChevronDown, ExternalLink, History, Check, ShieldCheck, Globe2, FileText,
} from 'lucide-react';
import {
  usePersonalizationStore,
  needsConsent,
  hasGpcSignal,
  CONSENT_VERSION,
} from '@/stores/personalization-store';
import { COOKIE_CATEGORIES, VENDORS, type ConsentCategory } from '@/lib/privacy/cookie-registry';
import { initAnalytics } from '@/lib/firebase';

type Tab = 'overview' | 'categories' | 'vendors' | 'rights' | 'log';

const CATEGORY_ICON: Record<ConsentCategory, React.ComponentType<{ className?: string }>> = {
  essential: Shield,
  analytics: BarChart3,
  personalization: Sparkles,
  marketing: Megaphone,
  sms: MessageSquare,
};

export function CookieConsent() {
  const consent = usePersonalizationStore(s => s.consent);
  useEffect(() => { if (consent.analytics) initAnalytics(); }, [consent.analytics]);
  const bannerVisible = usePersonalizationStore(s => s.bannerVisible);
  const setBannerVisible = usePersonalizationStore(s => s.setBannerVisible);
  const setConsent = usePersonalizationStore(s => s.setConsent);
  const acceptAll = usePersonalizationStore(s => s.acceptAll);
  const rejectAll = usePersonalizationStore(s => s.rejectAll);

  // First-load logic: auto-open banner if a fresh decision is needed.
  // If the browser sends GPC/DNT, honour it automatically (silent reject-all + log).
  useEffect(() => {
    if (!needsConsent(consent)) return;
    if (!consent.decided && hasGpcSignal()) {
      // Record an auto-rejection sourced from GPC and don't show the banner.
      setConsent(
        { analytics: false, personalization: false, marketing: false, sms: false },
        'gpc_auto',
      );
      return;
    }
    setBannerVisible(true);
  }, [consent, setConsent, setBannerVisible]);

  const [mode, setMode] = useState<'banner' | 'center'>('banner');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const dialogRef = useRef<HTMLDivElement>(null);

  // Local draft of toggles (synced from saved consent each open)
  const [draft, setDraft] = useState({
    analytics: consent.analytics,
    personalization: consent.personalization,
    marketing: consent.marketing,
    sms: consent.sms,
  });
  useEffect(() => {
    if (bannerVisible) {
      setDraft({
        analytics: consent.analytics,
        personalization: consent.personalization,
        marketing: consent.marketing,
        sms: consent.sms,
      });
      setMode(consent.decided ? 'center' : 'banner');
      setActiveTab('overview');
    }
  }, [bannerVisible, consent]);

  // Focus trap + Esc handling for the center modal
  useEffect(() => {
    if (!bannerVisible || mode !== 'center') return;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && consent.decided) {
        e.preventDefault();
        setBannerVisible(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previousFocus?.focus?.();
    };
  }, [bannerVisible, mode, consent.decided, setBannerVisible]);

  const gpcDetected = useMemo(() => hasGpcSignal(), []);

  const saveDraft = () => setConsent(draft, 'custom');

  return (
    <>
      {/* Persistent floating "Manage cookies" pill — appears once a decision exists */}
      {consent.decided && !bannerVisible && <ManagePill onClick={() => setBannerVisible(true)} />}

      <AnimatePresence>
        {bannerVisible && (
          <>
            {/* Backdrop (only for center mode, banner stays non-blocking) */}
            {mode === 'center' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => consent.decided && setBannerVisible(false)}
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              />
            )}

            {/* Compact bottom banner (initial visit) */}
            {mode === 'banner' && (
              <motion.div
                key="banner"
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                role="dialog"
                aria-label="Cookie consent"
                aria-modal="false"
                className="fixed bottom-0 left-0 right-0 z-[60] p-3 sm:p-5 pointer-events-none"
              >
                <div className="max-w-5xl mx-auto bg-card border-2 border-border rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
                  {/* gradient hairline */}
                  <div className="h-1 bg-gradient-to-r from-primary via-amber-500 to-emerald-500" />
                  <div className="p-5 sm:p-6 flex flex-col lg:flex-row gap-5 items-start">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Cookie className="w-5 h-5 text-primary" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base flex items-center gap-2 flex-wrap">
                          We respect your privacy
                          {gpcDetected && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold uppercase tracking-wide flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> GPC honoured
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          We use cookies to keep you signed in, remember your cart, and (with your permission)
                          personalise products and offers. Reject and accept are equally easy — your choice
                          is binding for {humanRegion(consent.region)} and applies for 12 months.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:flex-shrink-0 w-full lg:w-auto">
                      <button
                        onClick={() => { setMode('center'); setActiveTab('categories'); }}
                        className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/70 text-sm font-bold flex items-center justify-center gap-1.5"
                      >
                        <Settings2 className="w-4 h-4" /> Customise
                      </button>
                      <button
                        onClick={rejectAll}
                        className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/70 text-sm font-bold"
                      >
                        Reject all
                      </button>
                      <button
                        onClick={acceptAll}
                        className="flex-1 lg:flex-none px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90"
                      >
                        Accept all
                      </button>
                    </div>
                  </div>
                  <div className="px-6 pb-4 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Globe2 className="w-3 h-3" /> {humanRegion(consent.region)}</span>
                    <span>·</span>
                    <span>v{CONSENT_VERSION} policy</span>
                    <span>·</span>
                    <button onClick={() => { setMode('center'); setActiveTab('vendors'); }} className="underline hover:text-foreground font-semibold">
                      Vendors ({VENDORS.length})
                    </button>
                    <span>·</span>
                    <button onClick={() => { setMode('center'); setActiveTab('rights'); }} className="underline hover:text-foreground font-semibold">
                      Your rights
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Full consent center (modal) */}
            {mode === 'center' && (
              <motion.div
                key="center"
                initial={{ scale: 0.96, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                role="dialog"
                aria-label="Cookie & privacy preferences"
                aria-modal="true"
                tabIndex={-1}
                ref={dialogRef}
                className="fixed inset-0 z-[61] flex items-center justify-center p-4 outline-none"
                onClick={e => e.stopPropagation()}
              >
                <div className="bg-card border-2 border-border rounded-3xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center gap-3 p-5 border-b-2 border-border">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Cookie className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-lg">Privacy preferences</h2>
                      <p className="text-xs text-muted-foreground">
                        Granular control over what we collect. Changes save when you press <b>Save</b>.
                      </p>
                    </div>
                    {consent.decided && (
                      <button
                        onClick={() => setBannerVisible(false)}
                        aria-label="Close"
                        className="w-9 h-9 rounded-xl hover:bg-muted flex items-center justify-center"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 px-3 pt-3 overflow-x-auto border-b border-border">
                    {(
                      [
                        ['overview',   'Overview',   Shield],
                        ['categories', 'Categories', Settings2],
                        ['vendors',    'Vendors',    Globe2],
                        ['rights',     'Your rights', FileText],
                        ['log',        'Consent log', History],
                      ] as const
                    ).map(([id, label, Icon]) => (
                      <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`px-3 py-2 text-xs font-bold rounded-t-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${activeTab === id ? 'bg-muted text-foreground border-b-2 border-primary -mb-px' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <Icon className="w-3.5 h-3.5" /> {label}
                      </button>
                    ))}
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-5">
                    {activeTab === 'overview' && (
                      <OverviewTab
                        gpcDetected={gpcDetected}
                        region={humanRegion(consent.region)}
                        draft={draft}
                      />
                    )}
                    {activeTab === 'categories' && (
                      <CategoriesTab draft={draft} setDraft={setDraft} />
                    )}
                    {activeTab === 'vendors' && <VendorsTab />}
                    {activeTab === 'rights'  && <RightsTab />}
                    {activeTab === 'log'     && <LogTab log={consent.log} />}
                  </div>

                  {/* Footer */}
                  <div className="border-t-2 border-border p-4 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                    <p className="text-[11px] text-muted-foreground flex-1">
                      Policy v{CONSENT_VERSION} · Re-asks every 12 months · You can change this anytime
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={rejectAll}
                        className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/70 text-sm font-bold"
                      >
                        Reject all
                      </button>
                      <button
                        onClick={acceptAll}
                        className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/70 text-sm font-bold"
                      >
                        Accept all
                      </button>
                      <button
                        onClick={saveDraft}
                        className="px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90 flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Save choices
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// — — — Tabs — — —

function OverviewTab({ gpcDetected, region, draft }: {
  gpcDetected: boolean;
  region: string;
  draft: { analytics: boolean; personalization: boolean; marketing: boolean; sms: boolean };
}) {
  const enabledCount = Object.values(draft).filter(Boolean).length;
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        We collect only what's needed to run the store and, with your consent, to make Cofkans feel
        tailored to you. Essential cookies (auth, cart, fraud-prevention) are always on. Everything
        else is opt-in.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Pill icon={<Shield className="w-4 h-4" />} label="Essential" value="Always on" tone="emerald" />
        <Pill icon={<BarChart3 className="w-4 h-4" />} label="Analytics" value={draft.analytics ? 'On' : 'Off'} tone={draft.analytics ? 'emerald' : 'muted'} />
        <Pill icon={<Sparkles className="w-4 h-4" />} label="Personalisation" value={draft.personalization ? 'On' : 'Off'} tone={draft.personalization ? 'emerald' : 'muted'} />
        <Pill icon={<Megaphone className="w-4 h-4" />} label="Marketing" value={draft.marketing ? 'On' : 'Off'} tone={draft.marketing ? 'emerald' : 'muted'} />
      </div>

      {gpcDetected && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            Your browser is sending a <b>Global Privacy Control</b> / Do-Not-Track signal.
            We've pre-rejected non-essential cookies on your behalf. You can still opt in below if you want.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <Fact label="Region" value={region} icon={<Globe2 className="w-3.5 h-3.5" />} />
        <Fact label="Active categories" value={`${enabledCount} of 4`} icon={<Check className="w-3.5 h-3.5" />} />
        <Fact label="Vendors" value={`${VENDORS.length} disclosed`} icon={<ExternalLink className="w-3.5 h-3.5" />} />
      </div>
    </div>
  );
}

function CategoriesTab({
  draft, setDraft,
}: {
  draft: { analytics: boolean; personalization: boolean; marketing: boolean; sms: boolean };
  setDraft: (d: typeof draft) => void;
}) {
  const [open, setOpen] = useState<ConsentCategory | null>('essential');
  const setKey = (k: keyof typeof draft, v: boolean) => setDraft({ ...draft, [k]: v });

  const map: Array<{ id: ConsentCategory; key: keyof typeof draft | null }> = [
    { id: 'essential',       key: null },
    { id: 'analytics',       key: 'analytics' },
    { id: 'personalization', key: 'personalization' },
    { id: 'marketing',       key: 'marketing' },
    { id: 'sms',             key: 'sms' },
  ];

  return (
    <div className="space-y-2">
      {map.map(({ id, key }) => {
        const cat = COOKIE_CATEGORIES[id];
        const Icon = CATEGORY_ICON[id];
        const isOpen = open === id;
        const value = key === null ? true : draft[key];
        return (
          <div key={id} className="border-2 border-border rounded-2xl overflow-hidden">
            <div className="flex items-stretch">
              <button
                onClick={() => setOpen(isOpen ? null : id)}
                className="flex-1 flex items-center gap-3 p-4 hover:bg-muted/30 text-left"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${value ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{cat.title}{cat.required && <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-emerald-600">Required</span>}</p>
                  <p className="text-xs text-muted-foreground">{cat.short}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className="flex items-center px-4 border-l border-border">
                <button
                  type="button"
                  role="switch"
                  aria-checked={value}
                  aria-label={`Toggle ${cat.title}`}
                  disabled={cat.required}
                  onClick={() => key && setKey(key, !value)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-primary' : 'bg-muted'} ${cat.required ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </div>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden bg-muted/20 border-t border-border"
                >
                  <div className="p-4 space-y-3">
                    <p className="text-xs leading-relaxed text-muted-foreground">{cat.long}</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-muted-foreground border-b border-border">
                            <th className="py-1.5 font-bold">Key</th>
                            <th className="py-1.5 font-bold">Type</th>
                            <th className="py-1.5 font-bold">Vendor</th>
                            <th className="py-1.5 font-bold">Purpose</th>
                            <th className="py-1.5 font-bold">Retention</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cat.cookies.map(c => (
                            <tr key={c.key} className="border-b border-border last:border-0">
                              <td className="py-1.5 font-mono">{c.key}</td>
                              <td className="py-1.5">{c.type}</td>
                              <td className="py-1.5">{c.vendor}</td>
                              <td className="py-1.5 text-muted-foreground">{c.purpose}</td>
                              <td className="py-1.5">{c.retention}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function VendorsTab() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Third parties that may process your data when relevant categories are enabled. Disabling a
        category prevents data flow to its associated vendors.
      </p>
      <div className="space-y-2">
        {VENDORS.map(v => (
          <div key={v.name} className="p-3 border-2 border-border rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-sm">
              {v.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{v.name}</p>
              <p className="text-xs text-muted-foreground truncate">{v.purpose} · {v.region}</p>
            </div>
            <a
              href={v.policyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 flex-shrink-0"
            >
              Policy <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function RightsTab() {
  const items: { title: string; body: string }[] = [
    { title: 'Right of access', body: 'Request a copy of the personal data we hold about you. Export instantly from Account → Privacy.' },
    { title: 'Right to rectification', body: 'Correct inaccurate data via Account → Profile, or by emailing privacy@cofkanselectricals.com.' },
    { title: 'Right to erasure ("be forgotten")', body: 'Delete your account and associated data from Account → Privacy → Clear personalisation history.' },
    { title: 'Right to object / restrict processing', body: 'Toggle any category off here. We stop processing immediately and keep nothing for marketing.' },
    { title: 'Right to data portability', body: 'Export your full personalisation profile as JSON from Account → Privacy → Export my data.' },
    { title: 'Lodge a complaint', body: 'In Ghana: Data Protection Commission. In the EU/UK: your national supervisory authority.' },
  ];
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Under GDPR, UK-GDPR, CCPA and Ghana's Data Protection Act (Act 843) you have the following rights:
      </p>
      <ul className="space-y-2">
        {items.map(it => (
          <li key={it.title} className="p-3 border-2 border-border rounded-xl">
            <p className="font-bold text-sm">{it.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{it.body}</p>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-muted-foreground pt-2">
        Data controller: <b>Cofkans Electricals</b>, Accra, Ghana. Contact: privacy@cofkanselectricals.com.
      </p>
    </div>
  );
}

function LogTab({ log }: { log: { at: number; method: string; analytics: boolean; personalization: boolean; marketing: boolean; sms: boolean; version: number }[] }) {
  if (log.length === 0) {
    return (
      <div className="text-center py-10">
        <History className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-sm font-semibold">No decisions recorded yet.</p>
        <p className="text-xs text-muted-foreground">Save preferences to start the audit trail.</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        We keep a local audit trail of your consent decisions as proof-of-consent (GDPR Art. 7).
      </p>
      <div className="divide-y divide-border border-2 border-border rounded-xl overflow-hidden">
        {log.map((e, i) => (
          <div key={i} className="p-3 text-xs flex items-center gap-3">
            <span className="font-mono text-muted-foreground tabular-nums">{new Date(e.at).toLocaleString()}</span>
            <span className="px-2 py-0.5 rounded-full bg-muted font-bold text-[10px] uppercase tracking-wide">{e.method.replace('_', ' ')}</span>
            <span className="ml-auto flex items-center gap-1.5">
              <Chip on={e.analytics} label="A" title="Analytics" />
              <Chip on={e.personalization} label="P" title="Personalisation" />
              <Chip on={e.marketing} label="M" title="Marketing" />
              <Chip on={e.sms} label="S" title="SMS" />
            </span>
            <span className="text-muted-foreground">v{e.version}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// — — — Small atoms — — —

function ManagePill({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-label="Manage cookie preferences"
      className="fixed bottom-4 left-4 z-40 w-11 h-11 rounded-full bg-card border-2 border-border shadow-lg hover:shadow-xl flex items-center justify-center group"
      title="Manage cookies"
    >
      <Cookie className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />
    </motion.button>
  );
}

function Pill({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'emerald' | 'muted' }) {
  const cls = tone === 'emerald'
    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
    : 'bg-muted border-border text-muted-foreground';
  return (
    <div className={`p-3 rounded-xl border-2 ${cls}`}>
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide">{icon}{label}</div>
      <p className="font-bold mt-1">{value}</p>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground font-bold">{icon}{label}</div>
      <p className="font-bold mt-0.5">{value}</p>
    </div>
  );
}

function Chip({ on, label, title }: { on: boolean; label: string; title: string }) {
  return (
    <span
      title={`${title}: ${on ? 'on' : 'off'}`}
      className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${on ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}
    >
      {label}
    </span>
  );
}

function humanRegion(r: string | null): string {
  switch (r) {
    case 'EU': return 'EU (GDPR)';
    case 'UK': return 'UK (UK-GDPR)';
    case 'US-CA': return 'California (CCPA)';
    case 'GH': return 'Ghana (Act 843)';
    case 'OTHER': return 'your region';
    default: return 'your region';
  }
}
