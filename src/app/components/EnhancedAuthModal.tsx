import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle } from 'lucide-react';
import { Image as NativeImage } from 'react-native';
import cofkansLogo from '../../imports/cofkans.png';
import type { UserRole } from '../types';
import { EmailSignUpForm } from './auth/EmailSignUpForm';
import { EmailSignInForm } from './auth/EmailSignInForm';
import { PasswordResetForm } from './auth/PasswordResetForm';
import { PhoneSignIn } from './auth/PhoneSignIn';

function assetUrl(asset: unknown): string {
  if (typeof asset === 'string') return asset;
  if (typeof asset === 'object' && asset !== null && 'uri' in asset) {
    const uri = (asset as { uri?: unknown }).uri;
    if (typeof uri === 'string') return uri;
  }
  const imageApi = NativeImage as unknown as {
    resolveAssetSource?: (source: number | { uri: string }) => { uri?: string } | null;
  };
  try {
    return imageApi.resolveAssetSource?.(asset as number | { uri: string })?.uri ?? '';
  } catch {
    return '';
  }
}

const cofkansLogoUrl = assetUrl(cofkansLogo);

interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (provider: 'google' | 'apple' | 'microsoft') => void; // OAuth always creates customers
  onEmailSignUp: (email: string, password: string, displayName: string, role?: UserRole) => Promise<void>;
  onEmailSignIn: (email: string, password: string) => Promise<void>;
  onPasswordReset: (email: string) => Promise<void>;
  initialMode?: 'signup' | 'signin';
}

export function EnhancedAuthModal({ isOpen, onClose, onSignIn, onEmailSignUp, onEmailSignIn, onPasswordReset, initialMode = 'signup' }: EnhancedAuthModalProps) {
  const [authTab, setAuthTab] = useState<'oauth' | 'email' | 'phone'>('oauth');
  const [authMode, setAuthMode] = useState<'signup' | 'signin' | 'reset'>(initialMode);

  // Reset mode whenever modal is reopened so the device-aware default applies again
  useEffect(() => {
    if (isOpen) setAuthMode(initialMode);
  }, [isOpen, initialMode]);

  const handleProviderSignIn = (provider: 'google' | 'apple' | 'microsoft') => {
    // OAuth sign-ups automatically create customer accounts. No role selection needed.
    onSignIn(provider);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        className="fixed inset-0 bg-black z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.9)), url("${cofkansLogoUrl}")`,
            backgroundPosition: 'center',
            backgroundSize: 'cover, 70% auto',
            backgroundRepeat: 'no-repeat',
          }}
          className="bg-card rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 md:p-12 max-w-md w-full border-2 border-border relative max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">

          <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full hover:bg-muted transition-colors cursor-pointer z-10">
            <X className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>

          <div className="text-center mb-6 sm:mb-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 sm:mb-6 inline-block px-5 py-3 rounded-2xl bg-black dark:bg-transparent">
              <img src={cofkansLogoUrl} alt="Welcome to Cofkans"
                className="h-10 sm:h-14 w-auto object-contain
                  [filter:contrast(1.3)_saturate(1.5)_brightness(1.15)_drop-shadow(0_2px_8px_rgba(212,175,55,0.4))]
                  dark:[filter:contrast(1.25)_saturate(1.6)_brightness(1.3)_drop-shadow(0_0_2px_rgba(255,215,130,0.7))_drop-shadow(0_2px_16px_rgba(255,200,80,0.6))_drop-shadow(0_0_24px_rgba(255,180,60,0.4))]" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-luxury)' }}>
              {authMode === 'reset' ? 'Reset Password' : authMode === 'signup' ? 'Join Cofkans' : 'Welcome Back'}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {authMode === 'reset' ? 'We\'ll help you reset your password' : authMode === 'signup' ? 'Sign up with Google or Apple' : 'Sign in to your account'}
            </p>
          </div>

          {/* Auth Method Tabs - Only show for sign-in mode */}
          {authMode === 'signin' && (
            <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-xl">
              {(['oauth', 'email', 'phone'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setAuthTab(t)}
                  className={`flex-1 py-3 text-sm rounded-lg font-semibold transition-all ${
                    authTab === t
                      ? 'bg-white dark:bg-card shadow-md text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t === 'oauth' ? 'Quick' : t === 'email' ? 'Email' : 'Phone'}
                </button>
              ))}
            </div>
          )}

          {/* Sign-up Mode: OAuth Only - Auto Customer Role */}
          {authMode === 'signup' && (
            <div className="space-y-3">
              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleProviderSignIn('google')}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-card/80 border-2 border-gray-300 dark:border-border rounded-xl font-semibold text-sm sm:text-base text-gray-700 dark:text-foreground flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-lg cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Sign Up with Google</span>
              </motion.button>

              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleProviderSignIn('apple')}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 border-2 border-black dark:border-white rounded-xl font-semibold text-sm sm:text-base text-white dark:text-black flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-lg cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span>Sign Up with Apple</span>
              </motion.button>

              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleProviderSignIn('microsoft')}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-card/80 border-2 border-gray-300 dark:border-border rounded-xl font-semibold text-sm sm:text-base text-gray-700 dark:text-foreground flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-lg cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#f25022" d="M1 1h10v10H1z"/>
                  <path fill="#7fba00" d="M12 1h10v10H12z"/>
                  <path fill="#00a4ef" d="M1 12h10v10H1z"/>
                  <path fill="#ffb900" d="M12 12h10v10H12z"/>
                </svg>
                <span>Sign Up with Microsoft</span>
              </motion.button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign In
                </button>
              </p>
            </div>
          )}

          {/* Sign-in Mode: OAuth Tab - Auto Customer Role */}
          {authMode === 'signin' && authTab === 'oauth' && (
            <div className="space-y-3">
              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleProviderSignIn('google')}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-card/80 border-2 border-gray-300 dark:border-border rounded-xl font-semibold text-sm sm:text-base text-gray-700 dark:text-foreground flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-lg cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </motion.button>

              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleProviderSignIn('apple')}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 border-2 border-black dark:border-white rounded-xl font-semibold text-sm sm:text-base text-white dark:text-black flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-lg cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span>Continue with Apple</span>
              </motion.button>

              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleProviderSignIn('microsoft')}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-card/80 border-2 border-gray-300 dark:border-border rounded-xl font-semibold text-sm sm:text-base text-gray-700 dark:text-foreground flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-lg cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#f25022" d="M1 1h10v10H1z"/>
                  <path fill="#7fba00" d="M12 1h10v10H12z"/>
                  <path fill="#00a4ef" d="M1 12h10v10H1z"/>
                  <path fill="#ffb900" d="M12 12h10v10H12z"/>
                </svg>
                <span>Continue with Microsoft</span>
              </motion.button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign Up
                </button>
              </p>
            </div>
          )}

          {/* Sign-in Mode: Email/Password Tab */}
          {authMode === 'signin' && authTab === 'email' && (
            <EmailSignInForm
              onSignIn={onEmailSignIn}
              onSwitchToSignUp={() => setAuthMode('signup')}
              onForgotPassword={() => setAuthMode('reset')}
            />
          )}

          {/* Sign-in Mode: Phone OTP Tab */}
          {authMode === 'signin' && authTab === 'phone' && (
            <PhoneSignIn onDone={onClose} />
          )}

          {/* Password Reset */}
          {authMode === 'reset' && (
            <PasswordResetForm
              onResetPassword={onPasswordReset}
              onBack={() => setAuthMode('signin')}
            />
          )}

          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-secondary" /><span>Secure Sign-In</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-secondary" /><span>Privacy Protected</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-secondary" /><span>Fast Checkout</span></div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
