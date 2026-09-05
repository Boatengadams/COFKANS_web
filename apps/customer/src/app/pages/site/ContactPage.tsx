import { Phone, MessageCircle, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';
import { SiteShell, useSiteContent } from './SiteShell';
import { SOCIAL_LINKS, SocialLinks } from '../../components/SocialLinks';

function digits(n: string) { return n.replace(/[^\d]/g, ''); }

export function ContactPage() {
  const { contact } = useSiteContent();
  const socials = [
    ...contact.socials,
    ...SOCIAL_LINKS.filter((link) => !contact.socials.some((social) => social.label.toLowerCase() === link.label.toLowerCase())),
  ];
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

      <section className="mb-8 overflow-hidden rounded-2xl border-2 border-border bg-card" aria-labelledby="showroom-map-title">
        <div className="p-5 pb-3"><h2 id="showroom-map-title" className="font-bold">Find our showroom</h2><p className="mt-1 text-sm text-muted-foreground">{contact.address}</p></div>
        <iframe title="Map showing Cofkans Electricals showroom in Asuoyeboa, Kumasi" src={`https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`} className="h-64 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        <div className="p-5 pt-3"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-bold text-white">Get directions</a></div>
      </section>

      {socials.length > 0 && (
        <section className="bg-card border-2 border-border rounded-2xl p-5">
          <div className="font-bold mb-4 text-sm">Follow us</div>
          <SocialLinks links={socials} />
        </section>
      )}
    </SiteShell>
  );
}
export default ContactPage;
