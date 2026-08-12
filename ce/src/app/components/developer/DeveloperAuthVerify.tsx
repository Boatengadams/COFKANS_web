/**
 * Developer Console 3-Layer Authentication Verification
 * Shown on every login to verify TOTP + Security PIN
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  Smartphone,
  Lock,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  getDeveloperAuth,
  verifyTOTP,
  verifyPIN,
  recordFailedAttempt,
  recordSuccessfulAuth,
  isAccountLocked,
  isIPBlocked,
  getClientIP,
} from '../../../lib/developer-auth-service';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import toast from 'react-hot-toast';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export function DeveloperAuthVerify({ onSuccess, onCancel }: Props) {
  const { firebaseUser } = useFirebaseAuth();
  const [step, setStep] = useState<'totp' | 'pin'>('totp');
  const [totpCode, setTotpCode] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState('');
  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    checkLockStatus();
    fetchClientIP();
  }, []);

  const fetchClientIP = async () => {
    const ip = await getClientIP();
    setIpAddress(ip);
  };

  const checkLockStatus = async () => {
    if (!firebaseUser?.uid) return;

    const isLocked = await isAccountLocked(firebaseUser.uid);
    if (isLocked) {
      setLocked(true);
      setLockMessage(
        'Your account is temporarily locked due to multiple failed authentication attempts. Please try again in 15 minutes.'
      );
      return;
    }

    const ipBlocked = await isIPBlocked(firebaseUser.uid, ipAddress);
    if (ipBlocked) {
      setLocked(true);
      setLockMessage(
        'Access from this IP address has been blocked due to security concerns. Please contact support.'
      );
    }
  };

  const verifyTOTPCode = async () => {
    if (totpCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    if (!firebaseUser?.uid || !firebaseUser.email) {
      toast.error('User not authenticated');
      return;
    }

    setVerifying(true);
    try {
      const auth = await getDeveloperAuth(firebaseUser.uid);
      if (!auth || !auth.totpSecret) {
        toast.error('TOTP not set up. Please contact support.');
        return;
      }

      const isValid = verifyTOTP(auth.totpSecret, totpCode);
      if (!isValid) {
        const result = await recordFailedAttempt(
          firebaseUser.uid,
          firebaseUser.email,
          ipAddress,
          'invalid_totp'
        );

        if (result.locked) {
          setLocked(true);
          setLockMessage(
            'Account locked after 3 failed attempts. You will receive an email/SMS alert.'
          );
          toast.error('Account locked. Email/SMS alert sent.');
        } else {
          toast.error('Invalid code. Please try again.');
        }
        setTotpCode('');
        return;
      }

      toast.success('Authenticator verified!');
      setStep('pin');
    } catch (error) {
      console.error('Error verifying TOTP:', error);
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const verifySecurityPIN = async () => {
    if (pin.length !== 6) {
      toast.error('Please enter a 6-digit PIN');
      return;
    }

    if (!firebaseUser?.uid || !firebaseUser.email) {
      toast.error('User not authenticated');
      return;
    }

    setVerifying(true);
    try {
      const auth = await getDeveloperAuth(firebaseUser.uid);
      if (!auth || !auth.pinHash) {
        toast.error('PIN not set up. Please contact support.');
        return;
      }

      const isValid = verifyPIN(pin, auth.pinHash);
      if (!isValid) {
        const result = await recordFailedAttempt(
          firebaseUser.uid,
          firebaseUser.email,
          ipAddress,
          'invalid_pin'
        );

        if (result.locked) {
          setLocked(true);
          setLockMessage(
            'Account locked after 3 failed attempts. You will receive an email/SMS alert.'
          );
          toast.error('Account locked. Email/SMS alert sent.');
        } else {
          toast.error('Invalid PIN. Please try again.');
        }
        setPin('');
        return;
      }

      // All layers verified successfully
      await recordSuccessfulAuth(firebaseUser.uid, firebaseUser.email, ipAddress);
      toast.success('Authentication successful!');
      onSuccess();
    } catch (error) {
      console.error('Error verifying PIN:', error);
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  if (locked) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl border-2 border-destructive shadow-2xl w-full max-w-md p-8"
        >
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-2">Account Locked</h2>
              <p className="text-muted-foreground">{lockMessage}</p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 text-sm text-left">
              <p className="font-semibold mb-2">Security Details:</p>
              <div className="space-y-1 text-muted-foreground">
                <p>• IP Address: {ipAddress}</p>
                <p>• Time: {new Date().toLocaleString()}</p>
                <p>• Lockout Duration: 15 minutes</p>
              </div>
            </div>

            <button
              onClick={onCancel}
              className="w-full py-3 px-4 rounded-lg border-2 border-border font-semibold hover:bg-muted"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border-2 border-border shadow-2xl w-full max-w-md p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Developer Authentication</h2>
          <p className="text-sm text-muted-foreground">
            {step === 'totp'
              ? 'Enter code from your authenticator app'
              : 'Enter your 6-digit security PIN'}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
              step === 'totp'
                ? 'bg-primary text-primary-foreground'
                : 'bg-green-500/10 text-green-700 dark:text-green-300'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Authenticator
          </div>
          <div className="w-8 h-0.5 bg-border" />
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
              step === 'pin'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Lock className="w-4 h-4" />
            Security PIN
          </div>
        </div>

        {/* TOTP Step */}
        {step === 'totp' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <label className="text-sm font-semibold mb-2 block">
                6-Digit Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={totpCode}
                onChange={(e) =>
                  setTotpCode(e.target.value.replace(/\D/g, ''))
                }
                onKeyPress={(e) => handleKeyPress(e, verifyTOTPCode)}
                placeholder="000000"
                autoFocus
                className="w-full px-4 py-3 rounded-lg bg-background border-2 border-border text-center text-2xl font-mono tracking-widest focus:border-primary outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 px-4 rounded-lg border-2 border-border font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={verifyTOTPCode}
                disabled={totpCode.length !== 6 || verifying}
                className="flex-1 py-3 px-4 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* PIN Step */}
        {step === 'pin' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Security PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  onKeyPress={(e) => handleKeyPress(e, verifySecurityPIN)}
                  placeholder="000000"
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg bg-background border-2 border-border text-center text-2xl font-mono tracking-widest focus:border-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded"
                >
                  {showPin ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('totp')}
                className="flex-1 py-3 px-4 rounded-lg border-2 border-border font-semibold hover:bg-muted"
              >
                Back
              </button>
              <button
                onClick={verifySecurityPIN}
                disabled={pin.length !== 6 || verifying}
                className="flex-1 py-3 px-4 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Authenticate'
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Security Notice */}
        <div className="mt-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/40">
          <p className="text-xs text-amber-900 dark:text-amber-200">
            <strong>Security:</strong> After 3 failed attempts, your account will be
            locked for 15 minutes and you'll receive an alert.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
