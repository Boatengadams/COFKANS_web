import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { MapPin, Phone, Clock, ArrowRight, Store } from 'lucide-react';
import { db } from '@/lib/firebase';
import { DEMO_MODE } from '@/lib/demo-mode';
import { SEED_BRANCHES as BRANCHES, type Branch } from '@/lib/branches';

interface BranchSettingsDoc {
  contactPhone?: string;
  contactEmail?: string;
  whatsapp?: string;
  hours?: string;
  address?: string;
  pickupNotes?: string;
  deliveryNotes?: string;
}

export function BranchesPage() {
  const [settings, setSettings] = useState<Record<string, BranchSettingsDoc>>({});

  useEffect(() => {
    if (DEMO_MODE) return;
    const unsub = onSnapshot(collection(db, 'branchSettings'), snap => {
      const map: Record<string, BranchSettingsDoc> = {};
      snap.docs.forEach(d => { map[d.id] = d.data() as BranchSettingsDoc; });
      setSettings(map);
    }, () => {});
    return unsub;
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Store className="w-7 h-7" /> Our Branches</h1>
        <p className="text-muted-foreground mt-2">
          Pick up in-store from any branch, or have your nearest branch deliver to you.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BRANCHES.map(b => (
          <BranchCard key={b.slug} branch={b} settings={settings[b.slug]} />
        ))}
      </div>
    </div>
  );
}

function BranchCard({ branch, settings }: { branch: Branch; settings?: BranchSettingsDoc }) {
  const phone = settings?.contactPhone ?? branch.phone;
  const hours = settings?.hours ?? branch.hours;
  const address = settings?.address ?? branch.address;
  return (
    <a
      href={`/branches/${branch.slug}`}
      className="block bg-card border-2 border-border rounded-2xl p-5 hover:border-primary/60 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-lg">{branch.name}</h3>
        <ArrowRight className="w-5 h-5 text-muted-foreground" />
      </div>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" />{address}</li>
        <li className="flex items-center gap-2"><Phone className="w-4 h-4" />{phone}</li>
        <li className="flex items-center gap-2"><Clock className="w-4 h-4" />{hours}</li>
      </ul>
    </a>
  );
}
