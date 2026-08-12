import { useMemo } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const requirements: PasswordRequirement[] = useMemo(() => {
    return [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
      { label: 'Contains number', met: /[0-9]/.test(password) },
      { label: 'Contains special character (!@#$%^&*)', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
    ];
  }, [password]);

  const metCount = requirements.filter(r => r.met).length;
  const strength = metCount === 0 ? 'none' : metCount <= 2 ? 'weak' : metCount <= 3 ? 'medium' : metCount <= 4 ? 'good' : 'strong';

  const strengthColors = {
    none: { bg: 'bg-gray-200 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400', label: 'No password' },
    weak: { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400', label: 'Weak' },
    medium: { bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', label: 'Medium' },
    good: { bg: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', label: 'Good' },
    strong: { bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400', label: 'Strong' },
  };

  const currentStrength = strengthColors[strength];

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Strength Meter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground">Password Strength</span>
          <span className={`text-xs font-bold ${currentStrength.text}`}>{currentStrength.label}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`flex-1 transition-all duration-300 ${
                i <= metCount ? currentStrength.bg : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1.5">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {req.met ? (
              <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-600 dark:text-green-400" strokeWidth={3} />
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <X className="w-3 h-3 text-gray-400" strokeWidth={3} />
              </div>
            )}
            <span className={`text-xs ${req.met ? 'text-foreground' : 'text-muted-foreground'}`}>
              {req.label}
            </span>
          </div>
        ))}
      </div>

      {/* Security Recommendation */}
      {strength === 'weak' || strength === 'medium' ? (
        <div className="flex items-start gap-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-orange-800 dark:text-orange-300">
            Consider using a stronger password for better security
          </p>
        </div>
      ) : null}
    </div>
  );
}
