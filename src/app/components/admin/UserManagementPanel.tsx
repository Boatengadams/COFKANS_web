import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { promoteUserRole, demoteUser, isDeveloper } from '@/lib/admin-service';
import { hasDeveloperClaim } from '@/lib/auth-claims';
import { requireDevPasscode } from '@/lib/dev-passcode';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { sanitizeInput } from '@/lib/security-service';
import toast from 'react-hot-toast';
import {
  Users,
  Shield,
  Search,
  ChevronDown,
  UserCog,
  Crown,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserPlus,
  Upload,
  Sparkles,
} from 'lucide-react';
import type { UserRole } from '../../types';
import type { FirestoreUser } from '@/lib/firestore-schema';
import { WorkerCreationWizard } from './WorkerCreationWizard';
import { BulkWorkerUpload } from './BulkWorkerUpload';
import { RecentWorkersList } from './RecentWorkersList';
import { UserActivityModal } from './UserActivityModal';
import { Activity } from 'lucide-react';

interface UserWithId extends FirestoreUser {
  id: string;
}

const ROLE_COLORS = {
  customer: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  technician: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  driver: 'bg-green-500/10 text-green-600 dark:text-green-400',
  admin: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

const ROLE_ICONS = {
  customer: Users,
  technician: UserCog,
  driver: UserCog,
  admin: Shield,
};

export function UserManagementPanel() {
  const { user: currentUser } = useFirebaseAuth();
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showRecentWorkers, setShowRecentWorkers] = useState(false);
  const [activityUser, setActivityUser] = useState<UserWithId | null>(null);

  const [isCurrentUserDeveloper, setIsCurrentUserDeveloper] = useState(false);
  useEffect(() => {
    let cancelled = false;
    hasDeveloperClaim(true).then((v) => { if (!cancelled) setIsCurrentUserDeveloper(v); }).catch(() => {});
    return () => { cancelled = true; };
  }, [currentUser?.uid]);

  // Load users from Firestore
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(usersQuery);
      const userData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserWithId[];

      setUsers(userData);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Unable to load user list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteUser = async (userId: string, email: string, newRole: 'admin' | 'technician' | 'driver') => {
    if (!currentUser?.uid) return;
    if (!isCurrentUserDeveloper) {
      toast.error('Only developers can promote users.');
      return;
    }

    const ok = await requireDevPasscode(`Promote ${email} → ${newRole}`);
    if (!ok) return;

    try {
      setPromotingUserId(userId);

      const result = await promoteUserRole(
        currentUser.uid,
        userId,
        newRole
      );

      if (result.success) {
        toast.success(`User promoted to ${newRole} successfully`);
        await loadUsers(); // Reload to show updated data
      } else {
        toast.error(result.error || 'Failed to promote user');
      }
    } catch (error) {
      console.error('Promotion error:', error);
      toast.error('An error occurred while promoting the user');
    } finally {
      setPromotingUserId(null);
    }
  };

  const handleDemoteUser = async (userId: string, email: string) => {
    if (!currentUser?.uid) return;
    if (!isCurrentUserDeveloper) {
      toast.error('Only developers can demote users.');
      return;
    }

    // Prevent demoting developer
    if (isDeveloper(email)) {
      toast.error('Cannot demote the developer');
      return;
    }

    const ok = await requireDevPasscode(`Demote ${email} → customer`);
    if (!ok) return;

    try {
      setPromotingUserId(userId);

      const result = await demoteUser(currentUser.uid, userId);

      if (result.success) {
        toast.success('User demoted to customer successfully');
        await loadUsers();
      } else {
        toast.error(result.error || 'Failed to demote user');
      }
    } catch (error) {
      console.error('Demotion error:', error);
      toast.error('An error occurred while demoting the user');
    } finally {
      setPromotingUserId(null);
    }
  };

  const handleWorkerCreated = () => {
    loadUsers();
    setShowRecentWorkers(true);
  };

  // Sanitize search input
  const handleSearchChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    setSearchQuery(sanitized);
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  // Group filtered users by role so the list reads as clear sections instead of
  // one flat scroll. Order: highest privilege first.
  const USER_GROUPS: { key: UserRole; label: string }[] = [
    { key: 'admin', label: 'Admins & Developers' },
    { key: 'technician', label: 'Technicians' },
    { key: 'driver', label: 'Drivers' },
    { key: 'customer', label: 'Customers' },
  ];
  const groupedUsers = USER_GROUPS
    .map(g => ({ ...g, members: filteredUsers.filter(u => (u.role || 'customer') === g.key) }))
    .filter(g => g.members.length > 0);

  const renderUserCard = (user: UserWithId) => {
    const RoleIcon = ROLE_ICONS[user.role || 'customer'];
    const isDeveloperUser = isDeveloper(user.email || '');
    const isProcessing = promotingUserId === user.id;

    return (
      <motion.div
        key={user.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background border-2 border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
      >
        <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
          {/* User Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0 w-full sm:w-auto">
            <div className="p-2 bg-muted rounded-lg flex-shrink-0">
              <RoleIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold truncate">
                  {user.displayName || 'No Name'}
                </h3>
                {isDeveloperUser && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-primary to-secondary rounded-full flex-shrink-0">
                    <Crown className="w-3 h-3 text-white" />
                    <span className="text-xs font-bold text-white whitespace-nowrap">DEVELOPER</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${ROLE_COLORS[user.role || 'customer']}`}>
                  <RoleIcon className="w-3 h-3" />
                  {user.role?.toUpperCase()}
                </span>
                {user.emailVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold">
                    <CheckCircle className="w-3 h-3" />
                    <span className="hidden sm:inline">Verified</span>
                    <span className="sm:hidden">✓</span>
                  </span>
                )}
                {user.isLocked && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold">
                    <XCircle className="w-3 h-3" />
                    Locked
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col flex-wrap gap-2 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActivityUser(user)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
            >
              <Activity className="w-3 h-3" />
              View Activity
            </motion.button>
          </div>
          {!isDeveloperUser && (
            <div className="flex sm:flex-col flex-wrap gap-2 w-full sm:w-auto">
              {user.role !== 'admin' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePromoteUser(user.id, user.email || '', 'admin')}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isProcessing ? 'Processing...' : '→ Admin'}
                </motion.button>
              )}
              {user.role !== 'technician' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePromoteUser(user.id, user.email || '', 'technician')}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isProcessing ? 'Processing...' : '→ Tech'}
                </motion.button>
              )}
              {user.role !== 'driver' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePromoteUser(user.id, user.email || '', 'driver')}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isProcessing ? 'Processing...' : '→ Driver'}
                </motion.button>
              )}
              {user.role !== 'customer' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDemoteUser(user.id, user.email || '')}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isProcessing ? 'Processing...' : '↓ Customer'}
                </motion.button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (!isCurrentUserDeveloper) {
    return (
      <div className="bg-card border-2 border-border rounded-2xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Developer Only</h3>
          <p className="text-muted-foreground">
            User management requires developer privileges.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <Users className="w-6 h-6 text-purple-600" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-sm text-muted-foreground">
            Promote and manage staff members (Developer only)
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={async () => {
            const ok = await requireDevPasscode('Open Create Worker wizard');
            if (ok) setShowWizard(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:shadow-lg transition-shadow"
        >
          <Sparkles className="w-5 h-5" />
          <span>Create Worker</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={async () => {
            const ok = await requireDevPasscode('Open Bulk Worker Upload');
            if (ok) setShowBulkUpload(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-foreground text-background rounded-xl font-bold hover:shadow-lg transition-shadow"
        >
          <Upload className="w-5 h-5" />
          <span>Bulk Upload</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowRecentWorkers(s => !s)}
          className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-border hover:border-primary rounded-xl font-bold hover:bg-muted transition-all"
        >
          <UserPlus className="w-5 h-5" />
          <span>{showRecentWorkers ? 'Hide' : 'Recent Workers'}</span>
        </motion.button>
      </div>

      {/* Recent Workers */}
      {showRecentWorkers && currentUser?.uid && (
        <div className="mb-6">
          <RecentWorkersList creatorUserId={currentUser.uid} />
        </div>
      )}

      {/* Filters */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as UserRole | 'all')}
            className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="technician">Technicians</option>
            <option value="driver">Drivers</option>
            <option value="admin">Admins</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* User List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
          {groupedUsers.map((group) => (
            <div key={group.key}>
              <div className="flex items-center gap-2 mb-3 sticky top-0 bg-card/95 backdrop-blur-sm py-1 z-10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {group.members.length}
                </span>
              </div>
              <div className="space-y-3">
                {group.members.map(renderUserCard)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t-2 border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{users.length}</div>
          <div className="text-xs text-muted-foreground">Total Users</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {users.filter(u => u.role === 'customer').length}
          </div>
          <div className="text-xs text-muted-foreground">Customers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {users.filter(u => u.role === 'technician').length}
          </div>
          <div className="text-xs text-muted-foreground">Technicians</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {users.filter(u => u.role === 'driver').length}
          </div>
          <div className="text-xs text-muted-foreground">Drivers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div className="text-xs text-muted-foreground">Admins</div>
        </div>
      </div>

      {/* Modals */}
      {showWizard && currentUser?.uid && (
        <WorkerCreationWizard
          creatorUserId={currentUser.uid}
          onComplete={handleWorkerCreated}
          onClose={() => setShowWizard(false)}
        />
      )}

      {showBulkUpload && currentUser?.uid && (
        <BulkWorkerUpload
          creatorUserId={currentUser.uid}
          onComplete={handleWorkerCreated}
          onClose={() => setShowBulkUpload(false)}
        />
      )}

      {activityUser && (
        <UserActivityModal
          userId={activityUser.id}
          userEmail={activityUser.email}
          userName={activityUser.displayName}
          onClose={() => setActivityUser(null)}
        />
      )}
    </div>
  );
}
