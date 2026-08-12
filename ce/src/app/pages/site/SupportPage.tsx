import { Phone, MessageCircle, Mail, LifeBuoy } from 'lucide-react';
import { SiteShell, useSiteContent, RichBody } from './SiteShell';

function digits(n: string) { return n.replace(/[^\d]/g, ''); }

export function SupportPage() {
  const { support, contact } = useSiteContent();
  const waLink = `https://wa.me/${digits(contact.whatsapp)}?text=${encodeURIComponent('Hi Cofkans support, I need help with ')}`;
  return (
    <SiteShell eyebrow="Help & support" title={support.title} subtitle={support.subtitle}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        <a href={waLink} target="_blank" rel="noreferrer" className="bg-card border-2 border-border hover:border-emerald-500 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><MessageCircle className="w-5 h-5" /></div>
          <div>
            <div className="font-bold text-sm">WhatsApp</div>
            <div className="text-xs text-muted-foreground">Fastest reply</div>
          </div>
        </a>
        <a href={`tel:${digits(contact.phone)}`} className="bg-card border-2 border-border hover:border-primary rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Phone className="w-5 h-5" /></div>
          <div>
            <div className="font-bold text-sm">Call</div>
            <div className="text-xs text-muted-foreground">{contact.phone}</div>
          </div>
        </a>
        <a href={`mailto:${contact.supportEmail}`} className="bg-card border-2 border-border hover:border-primary rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Mail className="w-5 h-5" /></div>
          <div>
            <div className="font-bold text-sm">Email</div>
            <div className="text-xs text-muted-foreground break-all">{contact.supportEmail}</div>
          </div>
        </a>
      </div>
      <RichBody source={support.body} />
      <div className="mt-12 bg-primary/5 border-2 border-primary/20 rounded-2xl p-5 flex items-start gap-3">
        <LifeBuoy className="w-5 h-5 text-primary mt-0.5" />
        <div className="text-sm">
          <div className="font-bold mb-1">Still stuck?</div>
          <p className="text-muted-foreground">Walk into our Asuoyeboa-IPT showroom anytime during business hours — bring the product and the receipt and we'll sort it on the spot.</p>
        </div>
      </div>
    </SiteShell>
  );
}
export default SupportPage;
