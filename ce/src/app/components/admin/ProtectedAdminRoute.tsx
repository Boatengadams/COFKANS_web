import { ReactNode, useEffect, useState } from 'react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { isDeveloper } from '@/lib/admin-service';
import { motion } from 'motion/react';
import { Shield, AlertTriangle } from 'lucide-react';

interface ProtectedAdminRouteProps {
  children: ReactNode;
  requireDeveloper?: boolean;
}

export function ProtectedAdminRoute({
  children,
  requireDeveloper = false
}: ProtectedAdminRouteProps) {
  const { user, isLoading, signOut } = useFirebaseAuth();
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  // Session activity tracking
  useEffect(() => {
    const resetTimeout = () => {
      setLastActivity(Date.now());
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimeout);
    });

    const timeoutCheck = setInterval(async () => {
      if (Date.now() - lastActivity > SESSION_TIMEOUT) {
        sessionStorage.removeItem('admin_csrf_token');
        try {
          await signOut();
        } catch (err) {
          console.error('Forced sign-out failed', err);
        }
      }
    }, 60000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimeout);
      });
      clearInterval(timeoutCheck);
    };
  }, [lastActivity, signOut]);

  // CSRF Protection: Add token validation
  useEffect(() => {
    const csrfToken = sessionStorage.getItem('admin_csrf_token');
    if (!csrfToken && user?.role === 'admin') {
      // Generate CSRF token for this session
      const token = crypto.randomUUID();
      sessionStorage.setItem('admin_csrf_token', token);
    }
  }, [user]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-card border-2 border-border rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You must be signed in as an administrator to access this page.
          </p>
        </motion.div>
      </div>
    );
  }

  // Not admin
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-card border-2 border-border rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Insufficient Permissions</h2>
          <p className="text-muted-foreground">
            Administrator privileges required to access this page.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Current role: <span className="font-bold text-foreground">{user.role}</span>
          </p>
        </motion.div>
      </div>
    );
  }

  // Super admin check
  if (requireDeveloper && !isDeveloper(user.email || '')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-card border-2 border-border rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Developer Only</h2>
          <p className="text-muted-foreground">
            This action requires developer privileges.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Only the system administrator can access this feature.
          </p>
        </motion.div>
      </div>
    );
  }

  // Authorized - render children
  return <>{children}</>;
}
