import { Calendar, MapPin, Award, Users } from 'lucide-react';
import { SiteShell, useSiteContent, RichBody } from './SiteShell';
import LegacyTimeline from '@/app/components/LegacyTimeline';

export function AboutPage() {
  const { about, contact } = useSiteContent();
  const yearsActive = new Date().getFullYear() - about.foundedYear;
  return (
    <SiteShell eyebrow="Our story" title={about.title} subtitle={about.subtitle}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Stat icon={Calendar} label="Founded" value={String(about.foundedYear)} />
        <Stat icon={Award} label="Years serving" value={`${yearsActive}+`} />
        <Stat icon={MapPin} label="Head office" value="Kumasi" />
        <Stat icon={Users} label="Customers" value="10k+" />
      </div>
      <RichBody source={about.body} />

      {/* Insert new Legacy / About timeline section */}
      <LegacyTimeline />

      <div className="mt-12 bg-card border-2 border-border rounded-2xl p-6 text-sm">
        <div className="font-bold mb-2">Visit our showroom</div>
        <p className="text-muted-foreground">{contact.address}</p>
        <p className="text-muted-foreground mt-1">{contact.hours}</p>
      </div>
    </SiteShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="bg-card border-2 border-border rounded-2xl p-4">
      <Icon className="w-4 h-4 text-primary mb-2" />
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-bold mt-0.5">{value}</div>
    </div>
  );
}
export default AboutPage;
