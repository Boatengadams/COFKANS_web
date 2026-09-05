import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  User,
  Lock,
  Bell,
  MapPin,
  CreditCard,
  Shield,
  Mail,
  Phone,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { updateProfile, updatePassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEMO_MODE } from '@/lib/demo-mode';
import toast from 'react-hot-toast';
import { sanitizeInput } from '@/lib/security-service';
import { SavedPaymentMethods } from '../payments/SavedPaymentMethods';
import { PrivacySettings } from '../privacy/PrivacySettings';
import { SignedInDevices } from './SignedInDevices';
import { SecurityActivity } from './SecurityActivity';
import { requireFreshAuth } from '@/lib/session-service';
import { checkPasswordPwned } from '@/lib/auth-hardening';

export function UserSettings() {
  const { user, updateUserProfile } = useFirebaseAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'notifications' | 'addresses' | 'payments' | 'privacy'>('profile');
  const [loading, setLoading] = useState(false);

  // Profile form
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');

  // Security form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(true);

  const handleUpdateProfile = async () => {
    if (!user) return;

    const sanitizedName = sanitizeInput(displayName);
    const sanitizedPhone = sanitizeInput(phoneNumber);

    if (DEMO_MODE) {
      setLoading(true);
      await updateUserProfile({ displayName: sanitizedName, phoneNumber: sanitizedPhone });
      setLoading(false);
      return;
    }

    if (!auth.currentUser) return;

    try {
      setLoading(true);
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: sanitizedName,
      });

      // Update Firestore user document
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: sanitizedName,
        phoneNumber: sanitizedPhone,
        updatedAt: new Date(),
      });

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Unable to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (DEMO_MODE) {
      setLoading(true);
      await new Promise(r => setTimeout(r, 300));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('(Demo) Password updated');
      setLoading(false);
      return;
    }

    if (!auth.currentUser) return;

    try {
      setLoading(true);

      // Block known-leaked passwords via HaveIBeenPwned (k-anonymity).
      const pwnedCount = await checkPasswordPwned(newPassword);
      if (pwnedCount > 0) {
        toast.error(`This password has appeared in ${pwnedCount.toLocaleString()} known data breaches. Please choose a different one.`);
        setLoading(false);
        return;
      }

      const fresh = await requireFreshAuth({ password: currentPassword });
      if (!fresh) {
        toast.error('Please re-enter your current password to confirm this change.');
        setLoading(false);
        return;
      }
      await updatePassword(auth.currentUser, newPassword);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Failed to update password:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please sign out and sign in again to change your password');
      } else {
        toast.error('Unable to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    if (!user) return;

    if (DEMO_MODE) {
      setLoading(true);
      await new Promise(r => setTimeout(r, 200));
      toast.success('(Demo) Notification preferences saved');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', user.uid), {
        notificationPreferences: {
          email: emailNotifications,
          sms: smsNotifications,
          orderUpdates,
          promotions,
        },
        updatedAt: new Date(),
      });

      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Failed to update notifications:', error);
      toast.error('Unable to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'addresses' as const, label: 'Addresses', icon: MapPin },
    { id: 'payments' as const, label: 'Payment methods', icon: CreditCard },
    { id: 'privacy' as const, label: 'Privacy', icon: Shield },
  ];

  // Only show certain sections based on role
  const visibleSections = sections.filter(section => {
    if (user?.role === 'customer') {
      return true; // Customers see all
    }
    if (user?.role === 'technician' || user?.role === 'driver') {
      return ['profile', 'security', 'notifications'].includes(section.id);
    }
    return true; // Admins see all
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Settings className="w-6 h-6 text-primary" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-sm text-muted-foreground">Manage your account preferences</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[250px_1fr] gap-6">
        {/* Sidebar Navigation */}
        <div className="bg-card border-2 border-border rounded-2xl p-4">
          <nav className="space-y-2">
            {visibleSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  whileHover={{ x: 4 }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer text-left
                    ${isActive
                      ? 'bg-primary text-white'
                      : 'text-foreground hover:bg-muted'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" strokeWidth={2.5} />
                  <span>{section.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-card border-2 border-border rounded-2xl p-8">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Profile Information</h3>
                <p className="text-sm text-muted-foreground">
                  Update your personal information
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-3 bg-muted border-2 border-border rounded-xl cursor-not-allowed opacity-60"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                      placeholder="+233 XX XXX XXXX"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Security Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Update your password and security preferences
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdatePassword}
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Updating...' : 'Update Password'}
                </motion.button>

                <div className="p-4 bg-amber-500/10 border-2 border-amber-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-bold text-amber-600 dark:text-amber-400 mb-1">
                        Password Requirements
                      </div>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• At least 8 characters long</li>
                        <li>• Mix of uppercase and lowercase letters recommended</li>
                        <li>• Include numbers and special characters for security</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-border">
                  <SignedInDevices />
                </div>

                <div className="pt-6 border-t-2 border-border">
                  <SecurityActivity />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Notification Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Choose how you want to be notified
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background border-2 border-border rounded-xl">
                  <div>
                    <div className="font-bold mb-1">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </div>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      emailNotifications ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        emailNotifications ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-background border-2 border-border rounded-xl">
                  <div>
                    <div className="font-bold mb-1">SMS Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive notifications via SMS
                    </div>
                  </div>
                  <button
                    onClick={() => setSmsNotifications(!smsNotifications)}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      smsNotifications ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        smsNotifications ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-background border-2 border-border rounded-xl">
                  <div>
                    <div className="font-bold mb-1">Order Updates</div>
                    <div className="text-sm text-muted-foreground">
                      Get notified about order status changes
                    </div>
                  </div>
                  <button
                    onClick={() => setOrderUpdates(!orderUpdates)}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      orderUpdates ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        orderUpdates ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-background border-2 border-border rounded-xl">
                  <div>
                    <div className="font-bold mb-1">Promotions & Offers</div>
                    <div className="text-sm text-muted-foreground">
                      Receive special offers and discounts
                    </div>
                  </div>
                  <button
                    onClick={() => setPromotions(!promotions)}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      promotions ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        promotions ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdateNotifications}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Preferences'}
                </motion.button>
              </div>
            </div>
          )}

          {/* Addresses Section */}
          {activeSection === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Saved Addresses</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your delivery addresses
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Add Address
                </motion.button>
              </div>

              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No addresses saved</h3>
                <p className="text-muted-foreground">
                  Add an address to make checkout faster
                </p>
              </div>
            </div>
          )}

          {activeSection === 'payments' && <SavedPaymentMethods />}
          {activeSection === 'privacy' && <PrivacySettings />}
        </div>
      </div>
    </div>
  );
}
