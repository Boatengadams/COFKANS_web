/**
 * Landing Page panel — edits the public homepage copy (hero description, the
 * primary CTA label, and the Collections + Legacy section headers). Saves into
 * the same `siteContent/main` Firestore doc under the `landing` key, so changes
 * go live instantly with no redeploy.
 *
 * Hero slide images remain bundled assets in App.tsx; the per-slide titles and
 * subtitles rotate from that list.
 */
import { useEffect, useState } from 'react';
import { Loader2, Save, RotateCcw, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchSiteContent, saveSiteContent, SITE_CONTENT_DEFAULTS,
  type SiteContent, type SiteLanding,
} from '../../../../lib/site-content';

export function LandingPanel() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { fetchSiteContent().then(setContent); }, []);

  const setLanding = (patch: Partial<SiteLanding>) => {
    if (!content) return;
    setContent({ ...content, landing: { ...content.landing, ...patch } });
    setDirty(true);
  };

  const save = async () => {
    if (!content) return;
    setSaving(true);
    try {
      await saveSiteContent({ landing: content.landing });
      toast.success('Saved — live on the homepage');
      setDirty(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    if (!content) return;
    if (!confirm('Restore the landing page copy to the seeded defaults? Unsaved changes will be lost.')) return;
    setContent({ ...content, landing: SITE_CONTENT_DEFAULTS.landing });
    setDirty(true);
  };

  if (!content) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground p-8">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading landing content…
      </div>
    );
  }

  const l = content.landing;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Sparkles className="w-6 h-6 text-primary" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Landing Page</h2>
            <p className="text-sm text-muted-foreground">
              Edit the homepage hero description, the main button and the section headers. Changes go live immediately.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-border text-sm font-bold hover:bg-muted">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={save} disabled={saving || !dirty}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white font-bold text-sm disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save changes
          </button>
        </div>
      </div>

      <Card title="Hero section">
        <Field label="Description paragraph (under the rotating headline)">
          <textarea className="ed-field" rows={2} value={l.heroDescription} onChange={e => setLanding({ heroDescription: e.target.value })} />
        </Field>
        <Field label="Primary button label">
          <input className="ed-field" value={l.heroPrimaryCta} onChange={e => setLanding({ heroPrimaryCta: e.target.value })} />
        </Field>
        <p className="text-xs text-muted-foreground">
          The rotating hero headline and the small badge above it are the per-slide title/subtitle from the hero image list.
        </p>
      </Card>

      <Card title="Collections section header">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Eyebrow label">
            <input className="ed-field" value={l.collectionsEyebrow} onChange={e => setLanding({ collectionsEyebrow: e.target.value })} />
          </Field>
          <Field label="Heading">
            <input className="ed-field" value={l.collectionsTitle} onChange={e => setLanding({ collectionsTitle: e.target.value })} />
          </Field>
        </div>
        <Field label="Subtitle">
          <textarea className="ed-field" rows={2} value={l.collectionsSubtitle} onChange={e => setLanding({ collectionsSubtitle: e.target.value })} />
        </Field>
      </Card>

      <Card title="“A Legacy of Excellence” header">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Badge label">
            <input className="ed-field" value={l.legacyBadge} onChange={e => setLanding({ legacyBadge: e.target.value })} />
          </Field>
          <Field label="Heading">
            <input className="ed-field" value={l.legacyTitle} onChange={e => setLanding({ legacyTitle: e.target.value })} />
          </Field>
        </div>
        <Field label="Subtitle paragraph">
          <textarea className="ed-field" rows={3} value={l.legacySubtitle} onChange={e => setLanding({ legacySubtitle: e.target.value })} />
        </Field>
      </Card>

      <style>{`
        .ed-field { width: 100%; padding: 0.55rem 0.75rem; border-radius: 0.625rem; background: var(--background); border: 2px solid var(--border); font-size: 0.875rem; outline: none; color: var(--foreground); }
        .ed-field:focus { border-color: var(--primary); }
      `}</style>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border-2 border-border rounded-2xl p-5 space-y-3">
      <h3 className="font-bold">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</span>
      {children}
    </label>
  );
}

export default LandingPanel;
