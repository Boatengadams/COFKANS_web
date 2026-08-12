import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

interface PasswordResetFormProps {
  onResetPassword: (email: string) => Promise<void>;
  onBack: () => void;
}

export function PasswordResetForm({ onResetPassword, onBack }: PasswordResetFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await onResetPassword(email.trim());
      setEmailSent(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Check Your Email</h3>
          <p className="text-gray-600 text-sm">
            We've sent password reset instructions to:
          </p>
          <p className="text-gray-900 font-medium mt-1">{email}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <p className="text-sm text-blue-900">
            <strong>Next steps:</strong>
          </p>
          <ol className="text-sm text-blue-800 mt-2 space-y-1 list-decimal list-inside">
            <li>Check your inbox (and spam folder)</li>
            <li>Click the reset link in the email</li>
            <li>Create a new password</li>
            <li>Sign in with your new password</li>
          </ol>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              setEmailSent(false);
              setEmail('');
            }}
            className="w-full py-2.5 text-primary hover:text-primary-dark font-medium transition-colors"
          >
            Send to a different email
          </button>

          <button
            onClick={onBack}
            className="w-full py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Reset Your Password</h3>
        <p className="text-gray-600 text-sm">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Email"
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Sending...' : 'Send Reset Instructions'}
        </motion.button>

        {/* Back to Sign In */}
        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </button>
      </form>
    </div>
  );
}
