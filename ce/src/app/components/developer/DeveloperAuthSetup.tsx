/**
 * Developer Console 3-Layer Authentication Setup Wizard
 * First-time setup for TOTP + Security PIN
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Smartphone,
  Lock,
  CheckCircle2,
  Copy,
  Download,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import QRCode from 'qrcode';
import {
  generateTOTPSecret,
  generateQRCodeData,
  verifyTOTP,
  hashPIN,
  initializeDeveloperAuth,
} from '../../../lib/developer-auth-service';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import toast from 'react-hot-toast';

interface Props {
  onComplete: () => void;
}

export function DeveloperAuthSetup({ onComplete }: Props) {
  const { firebaseUser } = useFirebaseAuth();
  const [step, setStep] = useState(1);
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [saving, setSaving] = useState(false);

  // Step 1: Generate TOTP secret and QR code
  const initializeSetup = async () => {
    if (!firebaseUser?.email) {
      toast.error('User email not found');
      return;
    }

    const secret = generateTOTPSecret();
    setTotpSecret(secret);

    const otpauthUrl = generateQRCodeData(firebaseUser.email, secret);
    try {
      const qrUrl = await QRCode.toDataURL(otpauthUrl);
      setQrCodeUrl(qrUrl);
      setStep(2);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  // Step 2: Verify TOTP setup
  const verifyTOTPSetup = () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    if (!verifyTOTP(totpSecret, verificationCode)) {
      toast.error('Invalid verification code. Please try again.');
      return;
    }

    toast.success('Authenticator verified!');
    setStep(3);
  };

  // Step 3: Set security PIN
  const setupPIN = async () => {
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      toast.error('PIN must be exactly 6 digits');
      return;
    }

    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    if (!firebaseUser?.uid) {
      toast.error('User not authenticated');
      return;
    }

    setSaving(true);
    try {
      const pinHash = hashPIN(pin);
      await initializeDeveloperAuth(firebaseUser.uid, totpSecret, pinHash);

      toast.success('Security setup completed!');
      setStep(4);

      // Complete after showing success
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast.error('Failed to save security settings');
    } finally {
      setSaving(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(totpSecret);
    toast.success('Secret key copied to clipboard');
  };

  const downloadRecoveryCodes = () => {
    const codes = [
      'Recovery codes - Save these in a secure location',
      '',
      `TOTP Secret: ${totpSecret}`,
      '',
      'If you lose access to your authenticator app,',
      'you can use this secret to set it up again.',
      '',
      `Generated: ${new Date().toLocaleString()}`,
      `Email: ${firebaseUser?.email}`,
    ].join('\n');

    const blob = new Blob([codes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cofkans-developer-recovery.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Recovery codes downloaded');
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border-2 border-border shadow-2xl w-full max-w-2xl p-8"
      >
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  step >= s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                  <Shield className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  Developer Console Security Setup
                </h2>
                <p className="text-muted-foreground">
                  Set up 3-layer authentication to protect your highest-privilege access
                </p>
              </div>

              <div className="space-y-4 bg-muted/50 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Lock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Layer 1: Password</h3>
                    <p className="text-sm text-muted-foreground">
                      Your existing Firebase email/password ✓
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Smartphone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Layer 2: Authenticator App</h3>
                    <p className="text-sm text-muted-foreground">
                      Time-based one-time password (TOTP) via Google Authenticator or Authy
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Lock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Layer 3: Security PIN</h3>
                    <p className="text-sm text-muted-foreground">
                      6-digit PIN for final verification
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/40">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-900 dark:text-amber-200">
                    Security Notice
                  </p>
                  <p className="text-amber-800 dark:text-amber-300">
                    After 3 failed authentication attempts, your account will be locked for 15 minutes
                    and your IP address will be blocked. You will receive an email/SMS alert.
                  </p>
                </div>
              </div>

              <button
                onClick={initializeSetup}
                className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 flex items-center justify-center gap-2"
              >
                Begin Setup
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Step 2: TOTP Setup */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  Set Up Authenticator App
                </h2>
                <p className="text-muted-foreground">
                  Scan this QR code with Google Authenticator or Authy
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                {qrCodeUrl && (
                  <div className="p-4 bg-white rounded-2xl">
                    <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                  </div>
                )}

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Can't scan? Enter this code manually:
                  </p>
                  <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg font-mono text-sm">
                    <code>{totpSecret}</code>
                    <button
                      onClick={copySecret}
                      className="p-1 hover:bg-background rounded"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={downloadRecoveryCodes}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-border font-semibold hover:bg-muted text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Recovery Codes
                </button>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-semibold mb-1 block">
                    Enter 6-digit verification code from your app
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="000000"
                    className="w-full px-4 py-3 rounded-lg bg-background border-2 border-border text-center text-2xl font-mono tracking-widest focus:border-primary outline-none"
                  />
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 rounded-lg border-2 border-border font-semibold hover:bg-muted flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={verifyTOTPSetup}
                  disabled={verificationCode.length !== 6}
                  className="flex-1 py-3 px-4 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Verify & Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: PIN Setup */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Create Security PIN</h2>
                <p className="text-muted-foreground">
                  Choose a 6-digit PIN as your final authentication layer
                </p>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold mb-1 block">
                    Enter 6-digit PIN
                  </span>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
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
                </label>

                <label className="block">
                  <span className="text-sm font-semibold mb-1 block">
                    Confirm PIN
                  </span>
                  <input
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={6}
                    value={confirmPin}
                    onChange={(e) =>
                      setConfirmPin(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="000000"
                    className="w-full px-4 py-3 rounded-lg bg-background border-2 border-border text-center text-2xl font-mono tracking-widest focus:border-primary outline-none"
                  />
                </label>

                {pin && confirmPin && pin !== confirmPin && (
                  <p className="text-sm text-destructive">PINs do not match</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border-2 border-blue-500/40">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  💡 <strong>Tip:</strong> Choose a PIN you can remember but others
                  can't guess. Avoid sequences like 123456 or repeated digits.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 px-4 rounded-lg border-2 border-border font-semibold hover:bg-muted flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={setupPIN}
                  disabled={
                    pin.length !== 6 ||
                    confirmPin.length !== 6 ||
                    pin !== confirmPin ||
                    saving
                  }
                  className="flex-1 py-3 px-4 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? 'Saving...' : 'Complete Setup'}
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/10 mb-4"
              >
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold mb-2">Setup Complete!</h2>
                <p className="text-muted-foreground">
                  Your developer console is now protected with 3-layer authentication
                </p>
              </div>

              <div className="bg-muted/50 rounded-xl p-6 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Password</span>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Authenticator App</span>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Security PIN</span>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Redirecting to developer console...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
