/**
 * Multi-Branch Module — mock staff users and branch assignments (DEMO_MODE).
 *
 * Aligns with the existing demo accounts (Aban = Manager, Ama = Front Desk,
 * Yaw = Driver, Twum = Technician) and adds per-branch staff so every location
 * has a plausible team. `managerId` values here match branches.mock.
 */
import type { UserBranch, UserBranchProfile, BranchRole } from '../types/user-branch';

const nowIso = new Date().toISOString();
const avatar = (seed: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

/** A flat staff record for pickers / display. */
export interface MockUser {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  role: BranchRole;
  /** Home branch slug. */
  branchSlug: string;
  photoURL: string;
  isActive: boolean;
}

export const MOCK_USERS: MockUser[] = [
  // Manager — company-wide authority, based at the showroom.
  { id: 'usr-aban', displayName: 'Aban Cofie', email: 'aban@cofkanselectricals.com', phone: '024-738 1219', role: 'manager', branchSlug: 'kumasi-asuoyeboa', photoURL: avatar('aban'), isActive: true },

  // Front desk — showroom counter + inter-branch stock control.
  { id: 'usr-ama', displayName: 'Ama Serwaa', email: 'ama@cofkanselectricals.com', phone: '055 329 8335', role: 'front_desk', branchSlug: 'kumasi-asuoyeboa', photoURL: avatar('ama'), isActive: true },
  { id: 'usr-akua', displayName: 'Akua Boateng', email: 'akua@cofkanselectricals.com', phone: '024-419 0087', role: 'front_desk', branchSlug: 'accra-opera-square', photoURL: avatar('akua'), isActive: true },

  // Drivers — move stock between branches + customer deliveries.
  { id: 'usr-yaw', displayName: 'Yaw Mensah', email: 'yaw@cofkanselectricals.com', phone: '020-812 4471', role: 'driver', branchSlug: 'kumasi-asuoyeboa', photoURL: avatar('yaw'), isActive: true },
  { id: 'usr-fiifi', displayName: 'Fiifi Owusu', email: 'fiifi@cofkanselectricals.com', phone: '026-554 7130', role: 'driver', branchSlug: 'accra-weija-barrier', photoURL: avatar('fiifi'), isActive: true },

  // Technician.
  { id: 'usr-twum', displayName: 'Twum Barima', email: 'twum@cofkanselectricals.com', phone: '054-901 2288', role: 'technician', branchSlug: 'kumasi-adum', photoURL: avatar('twum'), isActive: true },

  // Branch managers / counter staff (also referenced as managerId in branches.mock).
  { id: 'usr-kwabena', displayName: 'Kwabena Adu', email: 'kwabena@cofkanselectricals.com', phone: '024-738 1219', role: 'front_desk', branchSlug: 'kumasi-adum', photoURL: avatar('kwabena'), isActive: true },
  { id: 'usr-yaa', displayName: 'Yaa Asantewaa', email: 'yaa@cofkanselectricals.com', phone: '020-812 4471', role: 'front_desk', branchSlug: 'kumasi-pampaso', photoURL: avatar('yaa'), isActive: true },
  { id: 'usr-kofi', displayName: 'Kofi Nti', email: 'kofi.b@cofkanselectricals.com', phone: '054-901 2288', role: 'front_desk', branchSlug: 'kumasi-abuakwa', photoURL: avatar('kofib'), isActive: true },
  { id: 'usr-adjoa', displayName: 'Adjoa Frimpong', email: 'adjoa@cofkanselectricals.com', phone: '026-554 7130', role: 'front_desk', branchSlug: 'kumasi-nkawie', photoURL: avatar('adjoa'), isActive: true },
  { id: 'usr-mensah', displayName: 'Kojo Mensah', email: 'kojo@cofkanselectricals.com', phone: '030-266 1042', role: 'front_desk', branchSlug: 'accra-opera-square', photoURL: avatar('kojo'), isActive: true },
  { id: 'usr-esi', displayName: 'Esi Quaye', email: 'esi@cofkanselectricals.com', phone: '055-712 6690', role: 'front_desk', branchSlug: 'accra-weija-barrier', photoURL: avatar('esi'), isActive: true },
  { id: 'usr-nana', displayName: 'Nana Yaw', email: 'nana@cofkanselectricals.com', phone: '024-880 5514', role: 'front_desk', branchSlug: 'obuasi-bediem', photoURL: avatar('nana'), isActive: true },
  { id: 'usr-yaw-b', displayName: 'Yaw Boakye', email: 'boakye@cofkanselectricals.com', phone: '020-334 7781', role: 'front_desk', branchSlug: 'obuasi-central', photoURL: avatar('boakye'), isActive: false },
];

/** Explicit user↔branch assignments. Manager is assigned to every branch. */
export const MOCK_USER_BRANCHES: UserBranch[] = [
  // Manager oversees all nine branches.
  ...[
    'kumasi-asuoyeboa', 'kumasi-adum', 'kumasi-pampaso', 'kumasi-abuakwa',
    'kumasi-nkawie', 'accra-opera-square', 'accra-weija-barrier',
    'obuasi-bediem', 'obuasi-central',
  ].map((slug, i) => ({
    id: `ub-aban-${i}`,
    userId: 'usr-aban',
    branchSlug: slug,
    role: 'manager' as BranchRole,
    isPrimary: slug === 'kumasi-asuoyeboa',
    isActive: true,
    assignedBy: 'system',
    assignedAt: nowIso,
  })),
  // Everyone else assigned to their home branch.
  ...MOCK_USERS.filter((u) => u.id !== 'usr-aban').map((u, i) => ({
    id: `ub-${u.id}-${i}`,
    userId: u.id,
    branchSlug: u.branchSlug,
    role: u.role,
    isPrimary: true,
    isActive: u.isActive,
    assignedBy: 'usr-aban',
    assignedAt: nowIso,
  })),
];

/** Denormalized per-user profiles with their assignments. */
export const MOCK_USER_PROFILES: UserBranchProfile[] = MOCK_USERS.map((u) => ({
  userId: u.id,
  displayName: u.displayName,
  email: u.email,
  assignments: MOCK_USER_BRANCHES.filter((a) => a.userId === u.id),
  primaryBranch: u.branchSlug,
}));

/** Look up a mock user by id. */
export function mockUser(id: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}
