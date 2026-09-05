import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, X, RefreshCw } from 'lucide-react';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';

export function EmailVerificationBanner() {
  const { user, isEmailVerified, sendVerificationEmail, reloadUser } = useFirebaseAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  // Don't show if no user or email is already verified or banner is dismissed
  if (!user || isEmailVerified || isDismissed) {
    return null;
  }

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      await sendVerificationEmail();
    } catch (error) {
      console.error('Failed to send verification email:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleReloadUser = async () => {
    setIsReloading(true);
    try {
      await reloadUser();
      // If email is now verified, the banner will automatically hide
    } catch (error) {
      console.error('Failed to reload user:', error);
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-r from-orange-600 to-red-600 text-white"
      >
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Mail className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  Please verify your email address to complete your registration
                </p>
                <p className="text-xs opacity-90 mt-0.5">
                  Check your inbox for the verification link
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReloadUser}
                disabled={isReloading}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">I've verified</span>
              </button>

              <button
                onClick={handleSendEmail}
                disabled={isSending}
                className="px-4 py-2 bg-white text-orange-600 hover:bg-white/90 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isSending ? 'Sending...' : 'Resend Email'}
              </button>

              <button
                onClick={() => setIsDismissed(true)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
