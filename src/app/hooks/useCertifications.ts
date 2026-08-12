import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface FirestoreCertification {
  id: string;
  year: string;
  name: string;
  issuer?: string;
  imageUrl?: string;
  order?: number;
  isActive?: boolean;
}

/**
 * Live-reads the `certifications` collection (managed from the Developer Portal).
 * Only active certifications are returned, ordered by their `order` field.
 */
export function useCertifications() {
  const [certifications, setCertifications] = useState<FirestoreCertification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'certifications'), orderBy('order', 'asc'));
    const unsub = onSnapshot(
      q,
      snapshot => {
        const data = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as FirestoreCertification))
          .filter(c => c.isActive !== false);
        setCertifications(data);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, []);

  return { certifications, loading };
}
