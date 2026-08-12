import { Briefcase, MapPin, Clock, Mail, Send } from 'lucide-react';
import { SiteShell, useSiteContent } from './SiteShell';

export function CareersPage() {
  const { careers, contact } = useSiteContent();
  return (
    <SiteShell eyebrow="Join the team" title="Careers at Cofkans" subtitle="Build a career powering Ghana.">
      <p className="text-base text-foreground/90 leading-relaxed mb-8">{careers.intro}</p>

      <section className="mb-10">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" /> Open roles</h2>
        {careers.openings.length === 0 ? (
          <div className="bg-card border-2 border-dashed border-border rounded-2xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No open positions right now — but we're always glad to hear from strong candidates. Send us your CV using the details below.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {careers.openings.map((r, i) => (
              <li key={i} className="bg-card border-2 border-border rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-bold">{r.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{r.location}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{r.type}</span>
                    </div>
                  </div>
                  <a
                    href={`mailto:${contact.careersEmail}?subject=${encodeURIComponent(`Application — ${r.title}`)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold"
                  >
                    <Send className="w-3.5 h-3.5" /> Apply
                  </a>
                </div>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{r.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> How to apply</h2>
        <p className="text-sm text-foreground/90 leading-relaxed mb-4">{careers.applyHowTo}</p>
        <a
          href={`mailto:${contact.careersEmail}?subject=${encodeURIComponent('Career enquiry')}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-bold text-sm"
        >
          <Send className="w-4 h-4" /> Send your CV
        </a>
      </section>
    </SiteShell>
  );
}
export default CareersPage;
