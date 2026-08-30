import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api, ApiError } from '../services/examApi';
import type { AdminAccount } from '../types';

interface AuthContextValue {
  admin: AdminAccount | null;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [admin, setAdmin] = useState<AdminAccount | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const account = await api.adminLogin(email, password);
      setAdmin(account);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const logout = useCallback(() => setAdmin(null), []);
  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: admin !== null,
      isSubmitting,
      error,
      login,
      logout,
      clearError
    }),
    [admin, isSubmitting, error, login, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}