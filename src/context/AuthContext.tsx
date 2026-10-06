import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, testConnection } from '../firebase';
import { AgentProfile } from '../types';
import { getOrCreateAgentProfile } from '../services/firestoreService';

interface AuthContextType {
  user: User | null;
  agentProfile: AgentProfile | null;
  loading: boolean;
  isLead: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Known INFAQ Agency Leads / Admins
const LEAD_EMAILS = [
  'afyan.ikhlas@gmail.com',
  'infaq.my@gmail.com',
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const isLead = !!user?.email && LEAD_EMAILS.includes(user.email.toLowerCase().trim());

  const syncProfile = async (currentUser: User) => {
    try {
      const profile = await getOrCreateAgentProfile(
        currentUser.uid,
        currentUser.email || '',
        currentUser.displayName
      );
      setAgentProfile(profile);
    } catch (err) {
      console.error('Failed to sync agent profile:', err);
    }
  };

  useEffect(() => {
    // Initial connection verification test
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setAuthError(null);
        await syncProfile(currentUser);
      } else {
        setAgentProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setAuthError(null);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await syncProfile(result.user);
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      const errorCode = error?.code || '';
      if (errorCode === 'auth/popup-closed-by-user') {
        // Normal user action, no urgent error
        setAuthError('Tetingkap log masuk ditutup sebelum selesai.');
      } else if (errorCode === 'auth/popup-blocked') {
        setAuthError('Tetingkap popup disekat oleh pelayar (browser). Sila benarkan popup untuk laman ini dan cuba lagi.');
      } else if (errorCode === 'auth/unauthorized-domain') {
        setAuthError(`Domain ini (${typeof window !== 'undefined' ? window.location.hostname : 'semasa'}) belum didaftarkan dalam senarai Authorized Domains Firebase.`);
      } else {
        setAuthError(error?.message || 'Ralat tidak diketahui berlaku semasa log masuk.');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAgentProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await syncProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        agentProfile,
        loading,
        isLead,
        authError,
        clearAuthError,
        signInWithGoogle,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
