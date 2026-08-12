import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { SessionManager, AuditLogger } from '../utils/security';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (provider: 'google' | 'apple' | 'microsoft', credentials?: any) => Promise<void>;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = SessionManager.getSession();
    if (session?.userData) {
      setUser(session.userData);
      AuditLogger.log('session_restored', 'auth', { userId: session.userData.id });
    }
    setIsLoading(false);
  }, []);

  const signIn = async (provider: 'google' | 'apple' | 'microsoft', credentials?: any) => {
    try {
      const mockUser: User = {
        id: `user_${Date.now()}`,
        name: credentials?.name || 'User',
        email: credentials?.email || `user@${provider}.com`,
        phone: credentials?.phone,
        avatar: credentials?.avatar,
        role: credentials?.role || 'customer',
        provider,
        verified: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        permissions: credentials?.permissions || []
      };

      SessionManager.createSession(mockUser.id, mockUser);
      setUser(mockUser);
      AuditLogger.log('user_login', 'auth', { userId: mockUser.id, provider, role: mockUser.role });
      localStorage.setItem('cofkans_user', JSON.stringify(mockUser));
    } catch (error) {
      AuditLogger.log('login_failed', 'auth', { provider, error: String(error) });
      throw error;
    }
  };

  const signOut = () => {
    if (user) AuditLogger.log('user_logout', 'auth', { userId: user.id });
    SessionManager.clearSession();
    localStorage.removeItem('cofkans_user');
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    SessionManager.createSession(user.id, updatedUser);
    localStorage.setItem('cofkans_user', JSON.stringify(updatedUser));
    AuditLogger.log('user_updated', 'auth', { userId: user.id });
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role || user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signIn, signOut, updateUser, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
