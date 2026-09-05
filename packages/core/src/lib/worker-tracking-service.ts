/**
 * Worker Tracking Service
 *
 * Tracks recently created worker accounts for credential management.
 * Note: Passwords are only stored temporarily during the session for
 * credential sharing. They are NOT permanently stored for security.
 */

import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { FirestoreUser } from './firestore-schema';

export interface RecentWorker {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'technician' | 'driver';
  createdAt: Date;
  createdBy: string;
  mustChangePassword: boolean;
}

/**
 * Get recently created workers (last 30 days)
 */
export async function getRecentWorkers(creatorUserId: string, days: number = 30): Promise<RecentWorker[]> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const workersQuery = query(
      collection(db, 'users'),
      where('createdBy', '==', creatorUserId),
      where('mustChangePassword', '==', true),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(workersQuery);

    return snapshot.docs
      .map(doc => {
        const data = doc.data() as FirestoreUser;
        const createdAt = data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date();

        return {
          uid: doc.id,
          email: data.email,
          displayName: data.displayName,
          role: data.role as 'admin' | 'technician' | 'driver',
          createdAt,
          createdBy: data.createdBy || '',
          mustChangePassword: data.mustChangePassword || false,
        };
      })
      .filter(worker => worker.createdAt >= cutoffDate);
  } catch (error) {
    console.error('Failed to get recent workers:', error);
    return [];
  }
}

/**
 * Get all workers created by a specific admin (regardless of password change status)
 */
export async function getAllWorkersByCreator(creatorUserId: string): Promise<RecentWorker[]> {
  try {
    const workersQuery = query(
      collection(db, 'users'),
      where('createdBy', '==', creatorUserId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const snapshot = await getDocs(workersQuery);

    return snapshot.docs.map(doc => {
      const data = doc.data() as FirestoreUser;
      const createdAt = data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date();

      return {
        uid: doc.id,
        email: data.email,
        displayName: data.displayName,
        role: data.role as 'admin' | 'technician' | 'driver',
        createdAt,
        createdBy: data.createdBy || '',
        mustChangePassword: data.mustChangePassword || false,
      };
    });
  } catch (error) {
    console.error('Failed to get workers by creator:', error);
    return [];
  }
}

/**
 * Format time ago for display
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}
