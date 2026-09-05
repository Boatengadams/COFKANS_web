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
  Phone,
  MapPin,
  Calendar,
  StickyNote,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { createWorkerAccount, generateTempPassword } from '@/lib/create-worker';
import { useBranches } from '@/lib/branches';
import { requireDevPasscode } from '@/lib/dev-passcode';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { PhoneInputGH } from '../common/PhoneInputGH';
import toast from 'react-hot-toast';

interface WorkerCreationWizardProps {
  creatorUserId: string;
  onComplete: () => void;
  onClose: () => void;
}

type WizardStep = 'info' | 'contact' | 'role' | 'assignment' | 'password' | 'review' | 'complete';

const ROLE_OPTIONS = [
  { value: 'technician' as const, label: 'Technician', description: 'Field service, installations, and technical support', icon: '🔧' },
  { value: 'driver' as const, label: 'Driver', description: 'Delivery and logistics operations', icon: '🚚' },
  { value: 'manager' as const, label: 'Manager', description: 'Full access to staff and operations management', icon: '👑' },
];

export function WorkerCreationWizard({ creatorUserId, onComplete, onClose }: WorkerCreationWizardProps) {
  const branches = useBranches(true);

  const [currentStep, setCurrentStep] = useState<WizardStep>('info');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const phoneValid = /^\+233[2-9]\d{8}$/.test(phone);
  const [role, setRole] = useState<'manager' | 'technician' | 'driver'>('technician');
  const [branchSlug, setBranchSlug] = useState<string>('');
  const [employeeId, setEmployeeId] = useState('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendCredentials, setSendCredentials] = useState(true);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{
    email: string;
    password: string;
    displayName: string;
    delivery?: { email: boolean; sms: boolean; errors?: string[] };
  } | null>(null);

  const steps: WizardStep[] = ['info', 'contact', 'role', 'assignment', 'password', 'review', 'complete'];
  const currentStepIndex = steps.indexOf(currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case 'info':
        return username.trim().length > 0 && displayName.trim().length > 0;
      case 'contact':
        return phoneValid || phone.trim().length === 0; // phone optional
      case 'role':
        return true;
      case 'assignment':
        return true; // all assignment fields optional
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
      if (nextIndex < steps.length) setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) setCurrentStep(steps[prevIndex]);
  };

  const handleCreateWorker = async () => {
    const ok = await requireDevPasscode(`Create worker "${displayName}"`);
    if (!ok) {
      toast.error('Action cancelled — passcode required.');
      return;
    }

    setCreating(true);
    try {
      const result = await createWorkerAccount({
        creatorUserId,
        username,
        displayName,
        role,
        password,
        phone: phone || undefined,
        branchSlug: branchSlug || null,
        employeeId: employeeId || undefined,
        startDate: startDate || undefined,
        notes: notes || undefined,
        sendCredentials,
      });

      if (result.success && result.email && result.password) {
        toast.success('Worker account created');
        setCreated({
          email: result.email,
          password: result.password,
          displayName,
          delivery: result.delivery,
        });
        setCurrentStep('complete');
        onComplete();
      } else {
        toast.error(result.error || 'Failed to create worker');
      }
    } catch (err: any) {
      console.error('[WorkerCreationWizard]', err);
      toast.error(err?.message || 'An error occurred while creating the worker');
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
  const selectedBranch = branches.find(b => b.slug === branchSlug);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border-2 border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
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
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

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

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {currentStep === 'info' && (
              <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
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
                      <span className="px-4 text-sm text-muted-foreground select-none">@cofkanselectricals.com</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">This will be their email address for signing in</p>
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
                    <p className="text-xs text-muted-foreground mt-1">Full name that will appear in the system</p>
                  </label>
                </div>
              </motion.div>
            )}

            {currentStep === 'contact' && (
              <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Contact Number</h3>
                  <p className="text-muted-foreground">Used to SMS the temporary password and for ops contact</p>
                </div>
                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-bold">Phone (optional)</span>
                  </div>
                  <PhoneInputGH value={phone} onChange={setPhone} />
                  <p className="text-xs text-muted-foreground mt-1">Enter 9 digits — leading 0 is rejected. Leave blank to skip SMS delivery.</p>
                </label>
              </motion.div>
            )}

            {currentStep === 'role' && (
              <motion.div key="role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Select Role</h3>
                  <p className="text-muted-foreground">Choose the appropriate role for this worker</p>
                </div>
                <div className="space-y-3">
                  {ROLE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setRole(option.value)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${role === option.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{option.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold">{option.label}</h4>
                            {role === option.value && <CheckCircle className="w-4 h-4 text-primary" />}
                          </div>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 'assignment' && (
              <motion.div key="assignment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Assignment</h3>
                  <p className="text-muted-foreground">Branch, employee ID, and start date (all optional)</p>
                </div>

                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-bold">Branch</span>
                  </div>
                  <select
                    value={branchSlug}
                    onChange={e => setBranchSlug(e.target.value)}
                    className="w-full px-4 py-3 bg-muted rounded-xl border-2 border-border focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="">— Not assigned —</option>
                    {branches.map(b => (
                      <option key={b.slug} value={b.slug}>{b.name} ({b.city})</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-bold">Employee ID</span>
                  </div>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value.toUpperCase())}
                    placeholder="e.g. CE-2026-042"
                    className="w-full px-4 py-3 bg-muted rounded-xl border-2 border-border focus:border-primary focus:outline-none font-mono transition-colors"
                  />
                </label>

                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-bold">Start Date</span>
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-muted rounded-xl border-2 border-border focus:border-primary focus:outline-none transition-colors"
                  />
                </label>

                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <StickyNote className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-bold">Internal notes</span>
                  </div>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Visible only to developers / admins"
                    className="w-full px-4 py-3 bg-muted rounded-xl border-2 border-border focus:border-primary focus:outline-none transition-colors resize-none"
                  />
                </label>
              </motion.div>
            )}

            {currentStep === 'password' && (
              <motion.div key="password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
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
                      <button type="button" onClick={() => setShowPassword(s => !s)} className="px-3 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPassword(generateTempPassword()); setShowPassword(true); }}
                        className="px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10 rounded-r-xl flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> Generate
                      </button>
                    </div>
                  </label>
                  <PasswordStrengthIndicator password={password} />
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      <strong>Note:</strong> The worker will be required to change this password on first login.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'review' && (
              <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Review & Confirm</h3>
                  <p className="text-muted-foreground">Verify all details before creating the account</p>
                </div>

                <div className="bg-muted/50 border-2 border-border rounded-xl p-6 space-y-4">
                  <ReviewRow icon={<Mail className="w-5 h-5" />} label="Email">
                    <span className="font-mono text-sm">{username}@cofkanselectricals.com</span>
                  </ReviewRow>
                  <ReviewRow icon={<User className="w-5 h-5" />} label="Display name">
                    <span className="font-semibold">{displayName}</span>
                  </ReviewRow>
                  <ReviewRow icon={<Phone className="w-5 h-5" />} label="Phone">
                    <span className="font-mono text-sm">{phone || '— not provided —'}</span>
                  </ReviewRow>
                  <ReviewRow icon={<Shield className="w-5 h-5" />} label="Role">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{selectedRole?.icon}</span>
                      <span className="font-semibold">{selectedRole?.label}</span>
                    </div>
                  </ReviewRow>
                  <ReviewRow icon={<MapPin className="w-5 h-5" />} label="Branch">
                    <span className="font-semibold">{selectedBranch ? `${selectedBranch.name} (${selectedBranch.city})` : '— not assigned —'}</span>
                  </ReviewRow>
                  <ReviewRow icon={<Shield className="w-5 h-5" />} label="Employee ID">
                    <span className="font-mono text-sm">{employeeId || '—'}</span>
                  </ReviewRow>
                  <ReviewRow icon={<Calendar className="w-5 h-5" />} label="Start date">
                    <span className="font-mono text-sm">{startDate || '—'}</span>
                  </ReviewRow>
                  <ReviewRow icon={<Lock className="w-5 h-5" />} label="Temporary password">
                    <span className="font-mono text-sm">{password}</span>
                  </ReviewRow>
                </div>

                <label className="flex items-start gap-3 p-4 bg-primary/5 border-2 border-primary/20 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={sendCredentials}
                    onChange={e => setSendCredentials(e.target.checked)}
                    className="mt-1 w-5 h-5 accent-primary cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-bold">
                      <Send className="w-4 h-4" /> Auto-send credentials
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Email the worker at {username}@cofkanselectricals.com{phone ? ` and SMS ${phone}` : ' (no SMS — phone not set)'}.
                    </p>
                  </div>
                </label>
              </motion.div>
            )}

            {currentStep === 'complete' && created && (
              <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Account Created</h3>
                  <p className="text-muted-foreground">The worker account for {created.displayName} is ready</p>
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

                {created.delivery && (
                  <div className="space-y-2">
                    <p className="text-sm font-bold">Delivery</p>
                    <div className="grid grid-cols-2 gap-2">
                      <DeliveryBadge label="Email" ok={created.delivery.email} />
                      <DeliveryBadge label="SMS" ok={created.delivery.sms} />
                    </div>
                    {created.delivery.errors && created.delivery.errors.length > 0 && (
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-orange-800 dark:text-orange-300">
                          <AlertTriangle className="w-3 h-3" /> Delivery issues
                        </div>
                        {created.delivery.errors.map((e, i) => (
                          <p key={i} className="text-xs text-orange-800 dark:text-orange-300">• {e}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-bold">Share manually (fallback):</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={copyCredentials} className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-bold hover:opacity-90 transition-opacity">
                      <Copy className="w-4 h-4" /> Copy
                    </button>
                    <a href={`https://wa.me/${phone ? phone.replace('+', '') : ''}?text=${encodeURIComponent(credentialMessage)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors">
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                    <a href={`mailto:${created.email}?subject=${encodeURIComponent('Your Cofkans Electricals account')}&body=${encodeURIComponent(credentialMessage)}`} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">
                      <Mail className="w-4 h-4" /> Email
                    </a>
                  </div>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                  <p className="text-xs text-orange-800 dark:text-orange-300">
                    <strong>Important:</strong> This password is shown once and cannot be recovered.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {currentStep !== 'complete' && (
          <div className="p-6 border-t-2 border-border flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStepIndex === 0 || creating}
              className="px-4 py-2 border-2 border-border rounded-lg font-bold hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed() || creating}
              className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {creating ? 'Creating…' : currentStep === 'review' ? 'Create Account' : (<>Next <ChevronRight className="w-4 h-4" /></>)}
            </button>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="p-6 border-t-2 border-border">
            <button onClick={onClose} className="w-full px-6 py-3 bg-foreground text-background rounded-xl font-bold hover:opacity-90 transition-opacity">
              Close
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ReviewRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase text-muted-foreground mb-1">{label}</p>
        {children}
      </div>
    </div>
  );
}

function DeliveryBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 ${ok ? 'border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300' : 'border-border bg-muted text-muted-foreground'}`}>
      {ok ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
      <span className="text-sm font-bold">{label} {ok ? 'sent' : 'skipped'}</span>
    </div>
  );
}
