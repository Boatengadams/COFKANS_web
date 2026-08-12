import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEMO_MODE } from '@/lib/demo-mode';

export interface FirestoreAward {
  id: string;
  year: string;
  title: string;
  organization: string;
  imageUrl?: string;
  order?: number;
  isActive?: boolean;
}

/**
 * Live-reads the `awards` collection (managed from the Developer Portal).
 * Only active awards are returned, ordered by their `order` field.
 */
export function useAwards() {
  const [awards, setAwards] = useState<FirestoreAward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'awards'), orderBy('order', 'asc'));
    const unsub = onSnapshot(
      q,
      snapshot => {
        const data = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as FirestoreAward))
          .filter(a => a.isActive !== false);
        setAwards(data);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, []);

  return { awards, loading };
}
