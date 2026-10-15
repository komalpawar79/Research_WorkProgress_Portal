import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types/database.types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        // If not logged in, auto-login demo user initially so the user immediately experiences the dashboard
        if (!currentUser) {
          localStorage.setItem('rf_auth', 'true');
          const demo = await authService.getCurrentUser();
          setUser(demo);
        } else {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Failed to restore session', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const { user: authedUser, error } = await authService.login(email, pass);
    if (error || !authedUser) {
      return { success: false, error: error || 'Login failed' };
    }
    setUser(authedUser);
    return { success: true };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

