import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { api, ApiError } from '../services/examApi';
import type { AdminAccount, StudentUser } from '../types';

interface AuthContextValue {
  // Student (Google) auth
  studentUser: StudentUser | null;
  isStudentAuthenticated: boolean;
  isSigningInWithGoogle: boolean;
  googleError: string | null;
  signInWithGoogle: () => Promise<void>;
  clearGoogleError: () => void;

  // Admin auth
  admin: AdminAccount | null;
  isAdminAuthenticated: boolean;
  isSubmitting: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  clearError: () => void;

  // Shared
  logout: () => Promise<void>;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Student state
  const [studentUser, setStudentUser] = useState<StudentUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSigningInWithGoogle, setSigningInWithGoogle] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Admin state
  const [admin, setAdmin] = useState<AdminAccount | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listen for Firebase auth state changes (handles page refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const profile = await ensureUserProfile(firebaseUser);
        setStudentUser(profile);
      } else {
        setStudentUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Creates or fetches user profile from Firestore
  const ensureUserProfile = async (firebaseUser: FirebaseUser): Promise<StudentUser> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const profile: StudentUser = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName ?? 'Student',
        email: firebaseUser.email ?? '',
        photoURL: firebaseUser.photoURL,
        createdAt: new Date().toISOString(),
      };
      await setDoc(userRef, { ...profile, createdAt: serverTimestamp() });
      return profile;
    }
    const data = snap.data();
    return {
      uid: firebaseUser.uid,
      name: data.name ?? firebaseUser.displayName ?? 'Student',
      email: data.email ?? firebaseUser.email ?? '',
      photoURL: data.photoURL ?? firebaseUser.photoURL,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    };
  };

  const signInWithGoogle = useCallback(async () => {
    setSigningInWithGoogle(true);
    setGoogleError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await ensureUserProfile(result.user);
      setStudentUser(profile);
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      if (firebaseErr.code === 'auth/popup-closed-by-user') {
        // User dismissed — not an error
      } else {
        setGoogleError('Google sign-in failed. Please try again.');
      }
    } finally {
      setSigningInWithGoogle(false);
    }
  }, []);

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

  const logout = useCallback(async () => {
    if (studentUser) {
      await signOut(auth);
      setStudentUser(null);
    }
    if (admin) {
      setAdmin(null);
    }
  }, [studentUser, admin]);

  const clearError = useCallback(() => setError(null), []);
  const clearGoogleError = useCallback(() => setGoogleError(null), []);

  const value = useMemo(
    () => ({
      studentUser,
      isStudentAuthenticated: studentUser !== null,
      isSigningInWithGoogle,
      googleError,
      signInWithGoogle,
      clearGoogleError,
      admin,
      isAdminAuthenticated: admin !== null,
      isSubmitting,
      error,
      login,
      clearError,
      logout,
      authLoading,
      // Legacy alias for AdminShell guard
      isAuthenticated: admin !== null,
    }),
    [
      studentUser,
      isSigningInWithGoogle,
      googleError,
      signInWithGoogle,
      clearGoogleError,
      admin,
      isSubmitting,
      error,
      login,
      clearError,
      logout,
      authLoading,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}