import { Phone, MessageCircle, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';
import { SiteShell, useSiteContent } from './SiteShell';

const SOCIAL_ICON: Record<string, string> = {
  youtube: 'YT',
  tiktok: 'TT',
  facebook: 'FB',
  instagram: 'IG',
  linkedin: 'IN',
  twitter: 'X',
};

function digits(n: string) { return n.replace(/[^\d]/g, ''); }

export function ContactPage() {
  const { contact } = useSiteContent();
  const waLink = `https://wa.me/${digits(contact.whatsapp)}?text=${encodeURIComponent('Hi Cofkans, I have a question about ')}`;
  return (
    <SiteShell eyebrow="Get in touch" title="Contact us" subtitle="We answer fastest on WhatsApp or by phone during business hours.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        <a href={`tel:${digits(contact.phone)}`} className="group bg-card border-2 border-border hover:border-primary rounded-2xl p-5 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Phone className="w-5 h-5" /></div>
            <div className="font-bold">Call us</div>
          </div>
          <div className="text-lg font-bold">{contact.phone}</div>
          <div className="text-xs text-muted-foreground mt-1">Tap to dial · {contact.hours.split('·')[0].trim()}</div>
        </a>
        <a href={waLink} target="_blank" rel="noreferrer" className="group bg-card border-2 border-border hover:border-emerald-500 rounded-2xl p-5 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><MessageCircle className="w-5 h-5" /></div>
            <div className="font-bold">WhatsApp</div>
          </div>
          <div className="text-lg font-bold">{contact.whatsapp}</div>
          <div className="text-xs text-muted-foreground mt-1">Opens WhatsApp with a starter message</div>
        </a>
        <a href={`mailto:${contact.email}`} className="bg-card border-2 border-border hover:border-primary rounded-2xl p-5 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Mail className="w-5 h-5" /></div>
            <div className="font-bold">Email</div>
          </div>
          <div className="text-lg font-bold break-all">{contact.email}</div>
          <div className="text-xs text-muted-foreground mt-1">Replies within one business day</div>
        </a>
        <div className="bg-card border-2 border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center"><MapPin className="w-5 h-5" /></div>
            <div className="font-bold">Visit the showroom</div>
          </div>
          <div className="text-sm">{contact.address}</div>
          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Clock className="w-3 h-3" /> {contact.hours}</div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
            target="_blank" rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary"
          >
            Open in Maps <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {contact.socials.length > 0 && (
        <section className="bg-card border-2 border-border rounded-2xl p-5">
          <div className="font-bold mb-3 text-sm">Follow us</div>
          <div className="flex flex-wrap gap-2">
            {contact.socials.map(s => (
              <a key={s.url} href={s.url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-border hover:bg-muted text-sm font-semibold">
                <span className="w-6 h-6 rounded-md bg-foreground/5 text-[10px] font-bold flex items-center justify-center">
                  {SOCIAL_ICON[s.label.toLowerCase()] ?? s.label.slice(0, 2).toUpperCase()}
                </span>
                {s.label}
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </a>
            ))}
          </div>
        </section>
      )}
    </SiteShell>
  );
}
export default ContactPage;
