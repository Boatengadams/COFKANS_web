import { Wrench, MessageCircle, Phone } from 'lucide-react';
import { SiteShell, useSiteContent, RichBody } from './SiteShell';

function digits(n: string) { return n.replace(/[^\d]/g, ''); }

export function InstallationPage() {
  const { installation, contact } = useSiteContent();
  const waLink = `https://wa.me/${digits(contact.whatsapp)}?text=${encodeURIComponent("Hi Cofkans — I'd like to book an installation. ")}`;
  return (
    <SiteShell eyebrow="Book an install" title={installation.title} subtitle={installation.subtitle}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <a href={waLink} target="_blank" rel="noreferrer" className="rounded-2xl border-2 border-border bg-card p-4 flex items-center gap-3 hover:border-emerald-500 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm">WhatsApp</div>
            <div className="text-xs text-muted-foreground">Fastest — send photos</div>
          </div>
        </a>
        <a href={`tel:${digits(contact.phone)}`} className="rounded-2xl border-2 border-border bg-card p-4 flex items-center gap-3 hover:border-primary transition-colors">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm">Call</div>
            <div className="text-xs text-muted-foreground">{contact.phone}</div>
          </div>
        </a>
        <div className="rounded-2xl border-2 border-border bg-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm">12-month guarantee</div>
            <div className="text-xs text-muted-foreground">On all workmanship</div>
          </div>
        </div>
      </div>
      <RichBody source={installation.body} />
    </SiteShell>
  );
}
export default InstallationPage;
