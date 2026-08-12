import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle } from 'lucide-react';
import cofkansLogo from '../../imports/cofkans.png';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (provider: 'google' | 'apple' | 'microsoft') => void;
}

export function AuthModal({ isOpen, onClose, onSignIn }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-3xl p-8 md:p-12 max-w-md w-full border-2 border-border shadow-2xl relative"
        >
          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>

          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-8 inline-block px-5 py-3 rounded-2xl bg-black dark:bg-transparent shadow-lg dark:shadow-none"
            >
              <img
                src={cofkansLogo}
                alt="Welcome to Cofkans"
                className="h-14 w-auto object-contain
                  [filter:contrast(1.3)_saturate(1.5)_brightness(1.15)_drop-shadow(0_2px_8px_rgba(212,175,55,0.4))]
                  dark:[filter:contrast(1.25)_saturate(1.6)_brightness(1.3)_drop-shadow(0_0_2px_rgba(255,215,130,0.7))_drop-shadow(0_2px_16px_rgba(255,200,80,0.6))_drop-shadow(0_0_24px_rgba(255,180,60,0.4))]"
              />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-luxury)' }}>
              Welcome Back
            </h2>
            <p className="text-muted-foreground text-base">
              Choose your preferred sign-in method
            </p>
          </div>

          {/* Sign In Options */}
          <div className="space-y-3">
            {/* Google Sign-In */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSignIn('google')}
              className="w-full py-4 px-6 bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-card/80 border-2 border-gray-300 dark:border-border rounded-xl font-semibold text-gray-700 dark:text-foreground flex items-center justify-center gap-3 transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </motion.button>

            {/* Apple Sign-In */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSignIn('apple')}
              className="w-full py-4 px-6 bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 border-2 border-black dark:border-white rounded-xl font-semibold text-white dark:text-black flex items-center justify-center gap-3 transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span>Continue with Apple</span>
            </motion.button>

            {/* Microsoft Sign-In */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSignIn('microsoft')}
              className="w-full py-4 px-6 bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-card/80 border-2 border-gray-300 dark:border-border rounded-xl font-semibold text-gray-700 dark:text-foreground flex items-center justify-center gap-3 transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer group"
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              <span>Continue with Microsoft</span>
            </motion.button>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-secondary" strokeWidth={2.5} />
                <span>Secure Sign-In</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-secondary" strokeWidth={2.5} />
                <span>Privacy Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-secondary" strokeWidth={2.5} />
                <span>Fast Checkout</span>
              </div>
            </div>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By signing in, you agree to our{' '}
            <button className="text-primary hover:underline cursor-pointer">Terms of Service</button>
            {' '}and{' '}
            <button className="text-primary hover:underline cursor-pointer">Privacy Policy</button>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
