import { useEffect, useState } from 'react';
import { Loader2, Save, RotateCcw, FileText, Phone, Briefcase, Info, LifeBuoy, ShieldCheck, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchSiteContent, saveSiteContent, SITE_CONTENT_DEFAULTS,
  type SiteContent, type SitePage, type SiteContact, type SiteCareers,
} from '@/lib/site-content';

export function SiteContentPanel() { return <SiteContentEditor />; }

type Section = 'contact' | 'about' | 'privacy' | 'terms' | 'support' | 'careers';

const SECTIONS: { id: Section; label: string; icon: typeof FileText }[] = [
  { id: 'contact', label: 'Contact details', icon: Phone },
  { id: 'about', label: 'About page', icon: Info },
  { id: 'support', label: 'Support page', icon: LifeBuoy },
  { id: 'careers', label: 'Careers', icon: Briefcase },
  { id: 'privacy', label: 'Privacy policy', icon: ShieldCheck },
  { id: 'terms', label: 'Terms of service', icon: FileText },
];

export function SiteContentEditor() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [section, setSection] = useState<Section>('contact');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { fetchSiteContent().then(c => setContent(c)); }, []);

  const update = <K extends Section>(key: K, value: SiteContent[K]) => {
    if (!content) return;
    setContent({ ...content, [key]: value });
    setDirty(true);
  };

  const save = async () => {
    if (!content) return;
    setSaving(true);
    try {
      await saveSiteContent(content);
      toast.success('Saved — live on the public pages');
      setDirty(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const resetSection = () => {
    if (!content) return;
    if (!confirm('Restore this section to the seeded default? Unsaved changes will be lost.')) return;
    setContent({ ...content, [section]: SITE_CONTENT_DEFAULTS[section] as any });
    setDirty(true);
  };

  if (!content) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground p-8">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading site content…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold">Site content</h2>
          <p className="text-sm text-muted-foreground">Edit the public Privacy, Terms, About, Contact, Support and Careers pages. Changes go live immediately.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetSection}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-border text-sm font-bold hover:bg-muted"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset section
          </button>
          <button
            onClick={save} disabled={saving || !dirty}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white font-bold text-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save changes
          </button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b-2 border-border -mb-px">
        {SECTIONS.map(s => {
          const Icon = s.icon;
          const active = section === s.id;
          return (
            <button
              key={s.id} onClick={() => setSection(s.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 ${
                active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" /> {s.label}
            </button>
          );
        })}
      </div>

      <div className="bg-card border-2 border-border rounded-2xl p-5">
        {section === 'contact' && (
          <ContactEditor value={content.contact} onChange={v => update('contact', v)} />
        )}
        {section === 'about' && (
          <PageEditor
            value={content.about}
            onChange={v => update('about', { ...content.about, ...v })}
            extras={
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Field label="Founded year">
                  <input type="number" className="ed-field"
                    value={content.about.foundedYear}
                    onChange={e => update('about', { ...content.about, foundedYear: Number(e.target.value) })} />
                </Field>
                <Field label="Founded date (long form)">
                  <input className="ed-field"
                    value={content.about.foundedDate}
                    onChange={e => update('about', { ...content.about, foundedDate: e.target.value })} />
                </Field>
              </div>
            }
          />
        )}
        {section === 'privacy' && (
          <PageEditor value={content.privacy} onChange={v => update('privacy', { ...content.privacy, ...v })} />
        )}
        {section === 'terms' && (
          <PageEditor value={content.terms} onChange={v => update('terms', { ...content.terms, ...v })} />
        )}
        {section === 'support' && (
          <PageEditor value={content.support} onChange={v => update('support', { ...content.support, ...v })} />
        )}
        {section === 'careers' && (
          <CareersEditor value={content.careers} onChange={v => update('careers', v)} />
        )}
      </div>

      <style>{`
        .ed-field { width: 100%; padding: 0.55rem 0.75rem; border-radius: 0.625rem; background: var(--background); border: 2px solid var(--border); font-size: 0.875rem; outline: none; color: var(--foreground); }
        .ed-field:focus { border-color: var(--primary); }
        .ed-area { min-height: 260px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; line-height: 1.5; }
      `}</style>
    </div>
  );
}

/* ---------------- contact ---------------- */
function ContactEditor({ value, onChange }: { value: SiteContact; onChange: (v: SiteContact) => void }) {
  const set = <K extends keyof SiteContact>(k: K, v: SiteContact[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Primary phone"><input className="ed-field" value={value.phone} onChange={e => set('phone', e.target.value)} /></Field>
        <Field label="WhatsApp number"><input className="ed-field" value={value.whatsapp} onChange={e => set('whatsapp', e.target.value)} /></Field>
        <Field label="Public email"><input className="ed-field" value={value.email} onChange={e => set('email', e.target.value)} /></Field>
        <Field label="Support email"><input className="ed-field" value={value.supportEmail} onChange={e => set('supportEmail', e.target.value)} /></Field>
        <Field label="Careers email"><input className="ed-field" value={value.careersEmail} onChange={e => set('careersEmail', e.target.value)} /></Field>
        <Field label="Business hours"><input className="ed-field" value={value.hours} onChange={e => set('hours', e.target.value)} /></Field>
      </div>
      <Field label="Address">
        <textarea className="ed-field" rows={2} value={value.address} onChange={e => set('address', e.target.value)} />
      </Field>
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Socials</div>
          <button
            onClick={() => set('socials', [...value.socials, { label: '', url: '' }])}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {value.socials.map((s, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input className="ed-field flex-1" placeholder="Label (e.g. YouTube)" value={s.label}
                onChange={e => set('socials', value.socials.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
              <input className="ed-field flex-[2]" placeholder="https://…" value={s.url}
                onChange={e => set('socials', value.socials.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} />
              <button onClick={() => set('socials', value.socials.filter((_, j) => j !== i))}
                className="p-2 rounded-lg border-2 border-border hover:bg-muted text-muted-foreground">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- page (privacy/terms/about/support) ---------------- */
function PageEditor({
  value, onChange, extras,
}: {
  value: SitePage;
  onChange: (v: Partial<SitePage>) => void;
  extras?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Page title"><input className="ed-field" value={value.title} onChange={e => onChange({ title: e.target.value })} /></Field>
        <Field label="Subtitle"><input className="ed-field" value={value.subtitle ?? ''} onChange={e => onChange({ subtitle: e.target.value })} /></Field>
      </div>
      {extras}
      <Field label="Body (blank line = new paragraph · '## ' = heading · **bold**)">
        <textarea className="ed-field ed-area" value={value.body} onChange={e => onChange({ body: e.target.value })} />
      </Field>
      {value.updatedAt && (
        <p className="text-xs text-muted-foreground">Last published {new Date(value.updatedAt).toLocaleString()}</p>
      )}
    </div>
  );
}

/* ---------------- careers ---------------- */
function CareersEditor({ value, onChange }: { value: SiteCareers; onChange: (v: SiteCareers) => void }) {
  const set = <K extends keyof SiteCareers>(k: K, v: SiteCareers[K]) => onChange({ ...value, [k]: v });
  const addOpening = () => set('openings', [...value.openings, { title: '', location: 'Kumasi', type: 'Full-time', description: '' }]);
  return (
    <div className="space-y-4">
      <Field label="Intro paragraph">
        <textarea className="ed-field" rows={3} value={value.intro} onChange={e => set('intro', e.target.value)} />
      </Field>
      <Field label="How to apply (supports **bold**)">
        <textarea className="ed-field" rows={3} value={value.applyHowTo} onChange={e => set('applyHowTo', e.target.value)} />
      </Field>
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Open roles</div>
          <button onClick={addOpening} className="inline-flex items-center gap-1 text-xs font-bold text-primary">
            <Plus className="w-3.5 h-3.5" /> Add role
          </button>
        </div>
        {value.openings.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No open roles. The Careers page will show a 'send your CV' CTA.</p>
        ) : (
          <div className="space-y-3">
            {value.openings.map((r, i) => (
              <div key={i} className="bg-background border-2 border-border rounded-xl p-3 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input className="ed-field" placeholder="Title" value={r.title}
                    onChange={e => set('openings', value.openings.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
                  <input className="ed-field" placeholder="Location" value={r.location}
                    onChange={e => set('openings', value.openings.map((x, j) => j === i ? { ...x, location: e.target.value } : x))} />
                  <input className="ed-field" placeholder="Type (Full-time / Contract …)" value={r.type}
                    onChange={e => set('openings', value.openings.map((x, j) => j === i ? { ...x, type: e.target.value } : x))} />
                </div>
                <textarea className="ed-field" rows={3} placeholder="Description" value={r.description}
                  onChange={e => set('openings', value.openings.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} />
                <button onClick={() => set('openings', value.openings.filter((_, j) => j !== i))}
                  className="text-xs text-rose-500 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove role</button>
              </div>
            ))}
          </div>
        )}
      </div>
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

export default SiteContentEditor;

