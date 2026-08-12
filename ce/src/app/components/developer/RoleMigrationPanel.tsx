/**
 * Role Migration & Management Panel
 * View all users, their roles, and manage role assignments
 */

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import type { FirestoreUser } from '../../../lib/firestore-schema';
import type { UserRole } from '../../types';
import {
  Users,
  Shield,
  Crown,
  Truck,
  User,
  Headphones,
  Search,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Filter,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

const ROLES: Array<{
  value: UserRole;
  label: string;
  icon: any;
  color: string;
  description: string;
}> = [
  {
    value: 'customer',
    label: 'Customer',
    icon: User,
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/40',
    description: 'Regular customers who can browse and purchase products',
  },
  {
    value: 'technician',
    label: 'Technician',
    icon: Shield,
    color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/40',
    description: 'Technical staff who handle installations and repairs',
  },
  {
    value: 'driver',
    label: 'Driver',
    icon: Truck,
    color: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/40',
    description: 'Delivery drivers who transport orders to customers',
  },
  {
    value: 'management_support',
    label: 'Management & Support',
    icon: Headphones,
    color: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/40',
    description: 'Management and customer support staff with product and order management access',
  },
  {
    value: 'manager',
    label: 'Manager',
    icon: Crown,
    color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/40',
    description: 'Senior managers with comprehensive system access and operational controls',
  },
];

interface UserWithChanges extends FirestoreUser {
  newRole?: UserRole;
  newIsDeveloper?: boolean;
}

export function RoleMigrationPanel() {
  const [users, setUsers] = useState<UserWithChanges[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all' | 'developer'>('all');
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
      })) as UserWithChanges[];

      setUsers(data);

      // Calculate stats
      const roleStats: Record<string, number> = {
        customer: 0,
        technician: 0,
        driver: 0,
        support_agent: 0,
        admin: 0,
        developer: 0,
      };

      data.forEach(user => {
        if (user.role) roleStats[user.role]++;
        if (user.isDeveloper) roleStats.developer++;
      });

      setStats(roleStats);
      toast.success(`Loaded ${data.length} users`);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        u =>
          u.email?.toLowerCase().includes(search) ||
          u.displayName?.toLowerCase().includes(search) ||
          u.uid.toLowerCase().includes(search)
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      if (filterRole === 'developer') {
        filtered = filtered.filter(u => u.isDeveloper);
      } else {
        filtered = filtered.filter(u => u.role === filterRole);
      }
    }

    return filtered;
  }, [users, searchTerm, filterRole]);

  const updateUserField = (uid: string, field: 'newRole' | 'newIsDeveloper', value: any) => {
    setUsers(prev =>
      prev.map(u => (u.uid === uid ? { ...u, [field]: value } : u))
    );
  };

  const saveUser = async (user: UserWithChanges) => {
    const updates: any = {};
    let changed = false;

    if (user.newRole && user.newRole !== user.role) {
      updates.role = user.newRole;
      changed = true;
    }

    if (typeof user.newIsDeveloper === 'boolean' && user.newIsDeveloper !== user.isDeveloper) {
      updates.isDeveloper = user.newIsDeveloper;
      changed = true;
    }

    if (!changed) {
      toast('No changes to save', { icon: '⚠️' });
      return;
    }

    setSaving(user.uid);
    try {
      updates.updatedAt = serverTimestamp();
      await updateDoc(doc(db, 'users', user.uid), updates);
      toast.success(`Updated ${user.displayName || user.email}`);
      await loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(null);
    }
  };

  const hasChanges = (user: UserWithChanges) => {
    return (
      (user.newRole && user.newRole !== user.role) ||
      (typeof user.newIsDeveloper === 'boolean' && user.newIsDeveloper !== user.isDeveloper)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Role Management</h2>
          <p className="text-sm text-muted-foreground">
            View and manage user roles and permissions
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-border font-semibold hover:bg-muted"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {ROLES.map(role => {
          const Icon = role.icon;
          const count = stats[role.value] || 0;
          return (
            <motion.div
              key={role.value}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl border-2 ${role.color} cursor-pointer`}
              onClick={() => setFilterRole(role.value)}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {role.label}
                </span>
              </div>
              <div className="text-2xl font-bold">{count}</div>
            </motion.div>
          );
        })}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl border-2 bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/40 cursor-pointer"
          onClick={() => setFilterRole('developer')}
        >
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Developer
            </span>
          </div>
          <div className="text-2xl font-bold">{stats.developer || 0}</div>
        </motion.div>
      </div>

      {/* Available Roles Info */}
      <div className="p-4 rounded-xl border-2 border-border bg-card">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Available Roles
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {ROLES.map(role => {
            const Icon = role.icon;
            return (
              <div key={role.value} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${role.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{role.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {role.description}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-700 dark:text-red-300 border-2 border-red-500/40">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">Developer</div>
              <div className="text-xs text-muted-foreground">
                Special flag for highest-privilege access to developer console and system controls
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or UID..."
            className="w-full pl-10 pr-3 py-2 rounded-lg bg-background border-2 border-border focus:border-primary outline-none text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value as any)}
            className="px-3 py-2 rounded-lg bg-background border-2 border-border text-sm font-semibold"
          >
            <option value="all">All Roles</option>
            {ROLES.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
            <option value="developer">Developer</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border-2 border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr className="text-left">
                <th className="p-3 font-semibold text-xs uppercase tracking-wider">
                  User
                </th>
                <th className="p-3 font-semibold text-xs uppercase tracking-wider">
                  Current Role
                </th>
                <th className="p-3 font-semibold text-xs uppercase tracking-wider">
                  New Role
                </th>
                <th className="p-3 font-semibold text-xs uppercase tracking-wider text-center">
                  Developer
                </th>
                <th className="p-3 font-semibold text-xs uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const currentRole = ROLES.find(r => r.value === user.role);
                const Icon = currentRole?.icon || User;
                const changed = hasChanges(user);

                return (
                  <tr
                    key={user.uid}
                    className={`border-t border-border ${changed ? 'bg-amber-500/5' : ''}`}
                  >
                    <td className="p-3">
                      <div className="font-semibold">{user.displayName || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {user.email}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border-2 ${currentRole?.color || 'bg-muted'}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {currentRole?.label || user.role}
                      </div>
                    </td>
                    <td className="p-3">
                      <select
                        value={user.newRole || user.role}
                        onChange={e =>
                          updateUserField(user.uid, 'newRole', e.target.value as UserRole)
                        }
                        className="px-3 py-1.5 rounded-lg bg-background border-2 border-border text-sm font-semibold"
                      >
                        {ROLES.map(role => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={
                          typeof user.newIsDeveloper === 'boolean'
                            ? user.newIsDeveloper
                            : user.isDeveloper || false
                        }
                        onChange={e =>
                          updateUserField(user.uid, 'newIsDeveloper', e.target.checked)
                        }
                        className="w-5 h-5 rounded border-2 border-border accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => saveUser(user)}
                        disabled={saving === user.uid || !changed}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs ${
                          changed
                            ? 'bg-primary text-primary-foreground hover:opacity-90'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                        } disabled:opacity-50`}
                      >
                        {saving === user.uid ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-muted-foreground">
                    No users match the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} total users
      </div>
    </div>
  );
}
