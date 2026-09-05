import { Calendar, MapPin, Award, Users } from 'lucide-react';
import { SiteShell, useSiteContent, RichBody } from './SiteShell';
import LegacyTimeline from '@/app/components/LegacyTimeline';

const ABOUT_GALLERY_IMAGES = [
  '2bc3c526-8abe-42fb-988c-9e921084bc26.png',
  '2c08c08c-fddb-4f13-ba5d-23ad19bf7c5d.png',
  '477a75df-5b81-4970-91e2-69759880c272.jpeg',
  '685eb378-7e95-4909-bc6b-49649b0bf758.png',
  '7651408f-aefa-498f-883b-2a19d6221684.png',
  '78fd1576-6417-4921-8d91-c0a203d05d2a.png',
  '8c93936e-a210-4d90-b2f4-f358ae5429cc.png',
  '949608ae-57da-452e-8857-ac701298e30c.png',
  '99bbc385-8bdb-43ab-b053-ddcdea017d79.png',
  'a226ca82-7dde-460a-87e9-072fe99943f2.png',
  'a83fabac-a804-48a8-8e68-b256506f5224.png',
  'cofkans.png',
  'cofkans1.png',
  'cofkans3.png',
  'e3db684a-6056-401c-870b-967e6ba41893.png',
  'e8fa7559-9d5c-475a-9fd4-3d315ae15f56.jpeg',
];

const ABOUT_BUILDING_IMAGE = '/images/about/cofkans3.png';
const ABOUT_GROUP_IMAGE = '/images/about/Cofkans_group.png';

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
      <LegacyTimeline
        images={{
          [String(about.foundedYear)]: { src: ABOUT_GROUP_IMAGE, alt: 'Cofkans Electricals team group photo' },
          '1995': { src: ABOUT_BUILDING_IMAGE, alt: 'Cofkans Electricals building in Kumasi' },
          '2025': { src: ABOUT_BUILDING_IMAGE, alt: 'Cofkans Electricals building in Kumasi' },
        }}
      />

      <section className="mt-12" aria-labelledby="about-gallery-title">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Inside Cofkans</p>
          <h2 id="about-gallery-title" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Our gallery</h2>
          <p className="mt-2 text-sm text-muted-foreground">A look at our products, people, and electrical solutions.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {ABOUT_GALLERY_IMAGES.map((image, index) => (
            <figure key={image} className={`overflow-hidden rounded-2xl border-2 border-border bg-card ${index % 7 === 0 ? 'sm:row-span-2' : ''}`}>
              <img
                src={`/images/about/${image}`}
                alt={`Cofkans Electricals gallery image ${index + 1}`}
                loading={index < 4 ? 'eager' : 'lazy'}
                decoding="async"
                className={`h-full min-h-40 w-full object-cover transition-transform duration-500 hover:scale-105 ${index % 7 === 0 ? 'sm:min-h-[21rem]' : 'min-h-40'}`}
              />
            </figure>
          ))}
        </div>
      </section>

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
