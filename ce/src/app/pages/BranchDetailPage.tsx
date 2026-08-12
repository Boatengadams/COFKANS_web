import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { MapPin, Phone, Clock, Mail, MessageCircle, Store, Truck, ArrowLeft } from 'lucide-react';
import { db } from '../../lib/firebase';
import { getBranchBySlug } from '../../lib/branches';

interface BranchSettingsDoc {
  contactPhone?: string;
  contactEmail?: string;
  whatsapp?: string;
  hours?: string;
  address?: string;
  pickupNotes?: string;
  deliveryNotes?: string;
}

export function BranchDetailPage() {
  const { slug = '' } = useParams();
  const branch = getBranchBySlug(slug);
  const [settings, setSettings] = useState<BranchSettingsDoc | null>(null);

  useEffect(() => {
    if (!branch) return;
    const unsub = onSnapshot(doc(db, 'branchSettings', branch.slug), snap => {
      setSettings(snap.exists() ? (snap.data() as BranchSettingsDoc) : {});
    }, () => setSettings({}));
    return unsub;
  }, [branch]);

  if (!branch) return <Navigate to="/branches" replace />;

  const phone = settings?.contactPhone ?? branch.phone;
  const hours = settings?.hours ?? branch.hours;
  const address = settings?.address ?? branch.address;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${branch.lat},${branch.lng}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <a href="/branches" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> All branches
      </a>

      <header>
        <h1 className="text-3xl font-bold">{branch.name}</h1>
        <p className="text-muted-foreground mt-1">{branch.city}, {branch.region}</p>
      </header>

      <section className="bg-card border-2 border-border rounded-2xl p-5 grid sm:grid-cols-2 gap-4">
        <Info icon={<MapPin className="w-4 h-4" />} label="Address" value={address} />
        <Info icon={<Clock className="w-4 h-4" />} label="Hours" value={hours} />
        <Info icon={<Phone className="w-4 h-4" />} label="Phone" value={<a className="underline" href={`tel:${phone}`}>{phone}</a>} />
        {settings?.contactEmail && (
          <Info icon={<Mail className="w-4 h-4" />} label="Email" value={<a className="underline" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>} />
        )}
        {settings?.whatsapp && (
          <Info icon={<MessageCircle className="w-4 h-4" />} label="WhatsApp" value={<a className="underline" href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{settings.whatsapp}</a>} />
        )}
      </section>

      {(settings?.pickupNotes || settings?.deliveryNotes) && (
        <section className="grid sm:grid-cols-2 gap-4">
          {settings?.pickupNotes && (
            <NoteCard icon={<Store className="w-4 h-4 text-amber-500" />} title="Pickup" text={settings.pickupNotes} />
          )}
          {settings?.deliveryNotes && (
            <NoteCard icon={<Truck className="w-4 h-4 text-violet-500" />} title="Delivery" text={settings.deliveryNotes} />
          )}
        </section>
      )}

      <a
        href={mapUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold"
      >
        <MapPin className="w-4 h-4" /> Open in Google Maps
      </a>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">{icon}{label}</div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

function NoteCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-card border-2 border-border rounded-2xl p-4">
      <div className="font-bold text-sm flex items-center gap-2 mb-1">{icon}{title}</div>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{text}</p>
    </div>
  );
}
