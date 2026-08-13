import { Phone, MessageCircle, Mail, LifeBuoy } from 'lucide-react';
import { SiteShell, useSiteContent, RichBody } from './SiteShell';

function digits(n: string) { return n.replace(/[^\d]/g, ''); }

export function SupportPage() {
  const { support, contact } = useSiteContent();
  const waLink = `https://wa.me/${digits(contact.whatsapp)}?text=${encodeURIComponent('Hi Cofkans support, I need help with ')}`;
  return (
    <SiteShell eyebrow="Help & support" title={support.title} subtitle={support.subtitle}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <a href={waLink} target="_blank" rel="noreferrer" className="bg-card border-2 border-border hover:border-emerald-500 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><MessageCircle className="w-6 h-6" /></div>
          <div>
            <div className="font-bold text-sm">WhatsApp</div>
            <div className="text-xs text-muted-foreground">Fastest reply</div>
          </div>
        </a>
        <a href={`tel:${digits(contact.phone)}`} className="bg-card border-2 border-border hover:border-primary rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Phone className="w-6 h-6" /></div>
          <div>
            <div className="font-bold text-sm">Call</div>
            <div className="text-xs text-muted-foreground">{contact.phone}</div>
          </div>
        </a>
        <a href={`mailto:${contact.supportEmail}`} className="bg-card border-2 border-border hover:border-primary rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Mail className="w-6 h-6" /></div>
          <div>
            <div className="font-bold text-sm">Email</div>
            <div className="text-xs text-muted-foreground break-all">{contact.supportEmail}</div>
          </div>
        </a>
      </div>

      <div className="prose-cofkans max-w-none">
        <RichBody source={support.body} />
      </div>

      <div className="mt-12 bg-primary/6 border-2 border-primary/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"><LifeBuoy className="w-5 h-5 text-primary" /></div>
          <div>
            <div className="font-bold mb-1">Still stuck?</div>
            <p className="text-muted-foreground">Walk into our Asuoyeboa-IPT showroom during business hours — bring the product and the receipt and the team will help on the spot.</p>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
export default SupportPage;
