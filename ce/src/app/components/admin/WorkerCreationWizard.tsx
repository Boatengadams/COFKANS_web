import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Mail,
  Shield,
  Lock,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Copy,
  MessageCircle,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { createWorkerAccount, generateTempPassword } from '@/lib/create-worker';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import toast from 'react-hot-toast';

interface WorkerCreationWizardProps {
  creatorUserId: string;
  onComplete: () => void;
  onClose: () => void;
}

type WizardStep = 'info' | 'role' | 'password' | 'review' | 'complete';

const ROLE_OPTIONS = [
  {
    value: 'technician' as const,
    label: 'Technician',
    description: 'Field service, installations, and technical support',
    icon: '🔧',
    color: 'blue',
  },
  {
    value: 'driver' as const,
    label: 'Driver',
    description: 'Delivery and logistics operations',
    icon: '🚚',
    color: 'green',
  },
  {
    value: 'manager' as const,
    label: 'Manager',
    description: 'Full access to staff and operations management',
    icon: '👑',
    color: 'purple',
  },
];

export function WorkerCreationWizard({ creatorUserId, onComplete, onClose }: WorkerCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('info');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'manager' | 'technician' | 'driver'>('technician');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string; displayName: string } | null>(null);

  const steps: WizardStep[] = ['info', 'role', 'password', 'review', 'complete'];
  const currentStepIndex = steps.indexOf(currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case 'info':
        return username.trim().length > 0 && displayName.trim().length > 0;
      case 'role':
        return true;
      case 'password':
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 'review') {
      handleCreateWorker();
    } else {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex]);
      }
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleCreateWorker = async () => {
    setCreating(true);
    try {
      const result = await createWorkerAccount({
        creatorUserId,
        username,
        displayName,
        role,
        password,
      });

      if (result.success && result.email && result.password) {
        toast.success('Worker account created successfully');
        setCreated({ email: result.email, password: result.password, displayName });
        setCurrentStep('complete');
        onComplete();
      } else {
        toast.error(result.error || 'Failed to create worker');
      }
    } catch (error) {
      toast.error('An error occurred while creating the worker');
    } finally {
      setCreating(false);
    }
  };

  const credentialMessage = created
    ? `Hi ${created.displayName}, your Cofkans Electricals account is ready.\n\nEmail: ${created.email}\nTemporary password: ${created.password}\n\nSign in at https://cofkanselectricals.web.app and change your password on first login.`
    : '';

  const copyCredentials = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(credentialMessage);
      toast.success('Credentials copied to clipboard');
    } catch {
      toast.error('Could not copy. Select the text manually.');
    }
  };

  const selectedRole = ROLE_OPTIONS.find(r => r.value === role);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border-2 border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b-2 border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Create Worker Account</h2>
              <p className="text-sm text-muted-foreground">Step {currentStepIndex + 1} of {steps.length}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-primary to-secondary"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {currentStep === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-2">Basic Information</h3>
                  <p className="text-muted-foreground">Let's start with the worker's details</p>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-bold">Username</span>
                    </div>
                    <div className="flex items-center bg-muted rounded-xl border-2 border-border focus-within:border-primary transition-colors">
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                        placeholder="kwame"
                        className="flex-1 px-4 py-3 bg-transparent focus:outline-none font-semibold"
                        autoFocus
                      />
                      <span className="px-4 text-sm text-muted-foreground select-none">
                        @cofkanselectricals.com
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This will be their email address for signing in
                    </p>
                  </label>

                  <label className="block">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-bold">Display Name</span>
                    </div>
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Kwame Mensah"
                      className="w-full px-4 py-3 bg-muted rounded-xl border-2 border-border focus:border-primary focus:outline-none font-semibold transition-colors"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Full name that will appear in the system
                    </p>
                  </label>
                </div>
              </motion.div>
            )}

            {currentStep === 'role' && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-2">Select Role</h3>
                  <p className="text-muted-foreground">Choose the appropriate role for this worker</p>
                </div>

                <div className="space-y-3">
                  {ROLE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRole(option.value)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        role === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{option.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold">{option.label}</h4>
                            {role === option.value && (
                              <CheckCircle className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-2">Temporary Password</h3>
                  <p className="text-muted-foreground">Create a secure temporary password for first-time login</p>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-bold">Password</span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted rounded-xl border-2 border-border focus-within:border-primary transition-colors">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter password (min 8 characters)"
                        className="flex-1 px-4 py-3 bg-transparent focus:outline-none font-mono"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(s => !s)}
                        className="px-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPassword(generateTempPassword());
                          setShowPassword(true);
                        }}
                        className="px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10 rounded-r-xl flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> Generate
                      </button>
                    </div>
                  </label>

                  <PasswordStrengthIndicator password={password} />

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      <strong>Note:</strong> The worker will be required to change this password on their first login for security.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-2">Review & Confirm</h3>
                  <p className="text-muted-foreground">Please verify all details before creating the account</p>
                </div>

                <div className="bg-muted/50 border-2 border-border rounded-xl p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Email Address</p>
                      <p className="font-mono text-sm">{username}@cofkanselectricals.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Display Name</p>
                      <p className="font-semibold">{displayName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Role</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{selectedRole?.icon}</span>
                        <span className="font-semibold">{selectedRole?.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{selectedRole?.description}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Temporary Password</p>
                      <p className="font-mono text-sm">{password}</p>
                      <p className="text-xs text-muted-foreground mt-1">Must be changed on first login</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'complete' && created && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Account Created Successfully!</h3>
                  <p className="text-muted-foreground">
                    The worker account for {created.displayName} is ready to use
                  </p>
                </div>

                <div className="bg-muted/50 border-2 border-border rounded-xl p-6 space-y-3">
                  <div className="flex items-center justify-between gap-2 bg-background px-3 py-2 rounded-lg border border-border">
                    <span className="text-xs uppercase font-bold text-muted-foreground">Email</span>
                    <span className="font-mono text-sm truncate">{created.email}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-background px-3 py-2 rounded-lg border border-border">
                    <span className="text-xs uppercase font-bold text-muted-foreground">Password</span>
                    <span className="font-mono text-sm truncate">{created.password}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-bold">Share credentials with the worker:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={copyCredentials}
                      className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-bold hover:opacity-90 transition-opacity"
                    >
                      <Copy className="w-4 h-4" /> Copy
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(credentialMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                    <a
                      href={`mailto:?subject=${encodeURIComponent('Your Cofkans Electricals account')}&body=${encodeURIComponent(credentialMessage)}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    >
                      <Mail className="w-4 h-4" /> Email
                    </a>
                  </div>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                  <p className="text-xs text-orange-800 dark:text-orange-300">
                    <strong>Important:</strong> This password is shown once and cannot be recovered. Make sure to share it with the worker before closing this window.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {currentStep !== 'complete' && (
          <div className="p-6 border-t-2 border-border flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStepIndex === 0 || creating}
              className="px-4 py-2 border-2 border-border rounded-lg font-bold hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed() || creating}
              className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {creating ? (
                'Creating...'
              ) : currentStep === 'review' ? (
                'Create Account'
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="p-6 border-t-2 border-border">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-foreground text-background rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
