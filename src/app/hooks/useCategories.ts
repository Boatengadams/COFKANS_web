import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface FirestoreCategory {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  productCount?: number;
}

export function useCategories() {
  const [categories, setCategories] = useState<FirestoreCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const unsub = onSnapshot(q, snapshot => {
      setCategories(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreCategory)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  return { categories, loading };
}
