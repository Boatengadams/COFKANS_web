import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Image as NativeImage } from 'react-native';
import cofkansLogo from '../../imports/cofkans.png';
import type { UserRole } from '../types';
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
  onSignIn: (provider: 'google' | 'apple' | 'microsoft') => void;
  onEmailSignUp: (email: string, password: string, displayName: string, role?: UserRole) => Promise<void>;
  onEmailSignIn: (email: string, password: string) => Promise<void>;
  onPasswordReset: (email: string) => Promise<void>;
  initialMode?: 'signup' | 'signin';
}

/** Customer authentication: one quick Ghana phone OTP flow for sign-up and sign-in. */
export function EnhancedAuthModal({ isOpen, onClose, onSignIn, initialMode = 'signup' }: EnhancedAuthModalProps) {
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>(initialMode);

  useEffect(() => {
    if (isOpen) setAuthMode(initialMode);
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] flex items-end justify-center overflow-y-auto bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={event => event.stopPropagation()}
          className="relative max-h-[95vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-2 border-border bg-card p-5 shadow-2xl sm:rounded-3xl sm:p-8 md:p-10"
        >
          <button
            type="button"
            aria-label="Close sign in"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full p-2 transition-colors hover:bg-muted sm:right-6 sm:top-6"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>

          <div className="mb-7 text-center sm:mb-8">
            <div className="mx-auto mb-5 flex h-[76px] w-[178px] items-center justify-center rounded-xl bg-[#f5deb3] px-4 py-2 shadow-lg ring-1 ring-[#c9a96e]/40 dark:bg-slate-950 dark:ring-white/15">
              <img
                src={cofkansLogoUrl}
                alt="Cofkans Electricals"
                className="h-12 w-auto object-contain"
              />
            </div>
            <h2 className="mb-2 text-2xl font-bold sm:text-3xl" style={{ fontFamily: 'var(--font-luxury)' }}>
              {authMode === 'signup' ? 'Join Cofkans' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              {authMode === 'signup'
                ? 'Create your customer account in seconds with your Ghana phone number.'
                : 'Sign in quickly with your Ghana phone number.'}
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => onSignIn('google')}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-border bg-background px-4 py-3 font-semibold text-foreground shadow-sm transition hover:border-primary hover:shadow-md"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => onSignIn('apple')}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-foreground bg-foreground px-4 py-3 font-semibold text-background shadow-sm transition hover:opacity-90"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple / iCloud
            </button>
            <button
              type="button"
              onClick={() => onSignIn('microsoft')}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-border bg-background px-4 py-3 font-semibold text-foreground shadow-sm transition hover:border-primary hover:shadow-md"
            >
              <svg className="h-5 w-5" viewBox="0 0 23 23" aria-hidden="true">
                <path fill="#f25022" d="M1 1h10v10H1z" />
                <path fill="#7fba00" d="M12 1h10v10H12z" />
                <path fill="#00a4ef" d="M1 12h10v10H1z" />
                <path fill="#ffb900" d="M12 12h10v10H12z" />
              </svg>
              Continue with Microsoft
            </button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>or phone</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <PhoneSignIn onDone={onClose} />

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setAuthMode(mode => mode === 'signup' ? 'signin' : 'signup')}
              className="font-semibold text-primary hover:underline"
            >
              {authMode === 'signup' ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
