import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { MapPin, Phone, Clock, Mail, MessageCircle, Store, Truck, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/firebase';
import { DEMO_MODE } from '@/lib/demo-mode';
import { useBranches } from '@/lib/branches';

interface BranchSettingsDoc { contactPhone?: string; contactEmail?: string; whatsapp?: string; hours?: string; address?: string; pickupNotes?: string; deliveryNotes?: string; }

export function BranchDetailPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug ?? '';
  const branches = useBranches(true);
  const branch = branches.find(item => item.slug === slug);
  const [settings, setSettings] = useState<BranchSettingsDoc>({});

  useEffect(() => {
    if (!branch || DEMO_MODE) return;
    return onSnapshot(doc(db, 'branchSettings', branch.slug), snapshot => {
      setSettings(snapshot.exists() ? snapshot.data() as BranchSettingsDoc : {});
    }, () => setSettings({}));
  }, [branch]);

  if (!branch) {
    router.replace('/branches' as never);
    return null;
  }
  const phone = settings.contactPhone ?? branch.phone;
  const hours = settings.hours ?? branch.hours;
  const address = settings.address ?? branch.address;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${branch.address}, ${branch.city}`)}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <button onClick={() => router.replace('/branches' as never)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> All branches</button>
      <header><h1 className="text-3xl font-bold">{branch.name}</h1><p className="mt-1 text-muted-foreground">{branch.city}, {branch.region}</p></header>
      <section className="grid gap-4 rounded-2xl border-2 border-border bg-card p-5 sm:grid-cols-2">
        <Info icon={<MapPin className="h-4 w-4" />} label="Address" value={address} />
        <Info icon={<Clock className="h-4 w-4" />} label="Hours" value={hours} />
        <Info icon={<Phone className="h-4 w-4" />} label="Phone" value={<a className="underline" href={`tel:${phone}`}>{phone}</a>} />
        {settings.contactEmail && <Info icon={<Mail className="h-4 w-4" />} label="Email" value={<a className="underline" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>} />}
        {settings.whatsapp && <Info icon={<MessageCircle className="h-4 w-4" />} label="WhatsApp" value={<a className="underline" href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{settings.whatsapp}</a>} />}
      </section>
      {(settings.pickupNotes || settings.deliveryNotes) && <section className="grid gap-4 sm:grid-cols-2">{settings.pickupNotes && <NoteCard icon={<Store className="h-4 w-4 text-amber-500" />} title="Pickup" text={settings.pickupNotes} />}{settings.deliveryNotes && <NoteCard icon={<Truck className="h-4 w-4 text-violet-500" />} title="Delivery" text={settings.deliveryNotes} />}</section>}
      <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-bold text-white"><MapPin className="h-4 w-4" /> Open in Google Maps</a>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) { return <div><div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">{icon}{label}</div><div className="mt-1 text-sm">{value}</div></div>; }
function NoteCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="rounded-2xl border-2 border-border bg-card p-4"><div className="mb-1 flex items-center gap-2 text-sm font-bold">{icon}{title}</div><p className="whitespace-pre-wrap text-sm text-muted-foreground">{text}</p></div>; }
