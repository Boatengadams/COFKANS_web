import { collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

export interface MigrationResult {
  scanned: number;
  flippedRoles: number;
  flaggedDevelopers: number;
  errors: string[];
}

const LEGACY_ROLE = 'super_admin';
const NEW_ROLE = 'admin';

export async function migrateLegacySuperAdmins(): Promise<MigrationResult> {
  const result: MigrationResult = { scanned: 0, flippedRoles: 0, flaggedDevelopers: 0, errors: [] };
  try {
    const snap = await getDocs(query(collection(db, 'users'), where('role', '==', LEGACY_ROLE)));
    result.scanned = snap.size;
    if (snap.empty) return result;
    const batch = writeBatch(db);
    snap.docs.forEach(d => {
      batch.update(d.ref, { role: NEW_ROLE, isDeveloper: true, migratedAt: new Date() });
      result.flippedRoles += 1;
      result.flaggedDevelopers += 1;
    });
    await batch.commit();
  } catch (e: any) {
    result.errors.push(e?.message || 'Unknown error');
  }
  return result;
}
