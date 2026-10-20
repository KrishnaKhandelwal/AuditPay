'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type PlanType = 'free' | 'starter' | 'growth' | 'enterprise';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  brandName: string;
  plan: PlanType;
  isPaid: boolean;
  auditsUsedThisMonth: number;
  auditsLimit: number;
  joinedAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isPaidUser: boolean;
  isAuthModalOpen: boolean;
  authModalReason: string;
  isPaywallModalOpen: boolean;
  paywallFeatureName: string;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, brandName: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  upgradePlan: (plan: PlanType) => Promise<void>;
  incrementAuditCount: () => Promise<boolean>;
  canPerformAudit: () => boolean;
  canExportDisputePackage: () => boolean;
  canViewAllDiscrepancies: () => boolean;
  canGenerateDisputeEmail: () => boolean;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;
  openPaywallModal: (featureName?: string) => void;
  closePaywallModal: () => void;
}

const PLAN_LIMITS: Record<PlanType, number> = {
  free: 1,
  starter: 8,
  growth: 40,
  enterprise: 999,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fallback guest user template
const createGuestUser = (): UserProfile => {
  const guestUsed = typeof window !== 'undefined' ? Number(localStorage.getItem('auditpay_guest_audits') || 0) : 0;
  return {
    id: 'guest_' + Math.random().toString(36).substring(2, 8),
    name: 'Guest Merchant',
    email: 'founder@d2cbrand.com',
    brandName: 'My D2C Brand',
    plan: 'free',
    isPaid: false,
    auditsUsedThisMonth: guestUsed,
    auditsLimit: PLAN_LIMITS.free,
    joinedAt: new Date().toISOString(),
  };
};

interface LocalStoredAccount {
  id: string;
  name: string;
  email: string;
  brandName: string;
  passwordHash: string;
  plan: PlanType;
  isPaid: boolean;
  auditsUsedThisMonth: number;
  auditsLimit: number;
  joinedAt: string;
}

const getLocalAccounts = (): LocalStoredAccount[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('auditpay_registered_accounts');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalAccounts = (accounts: LocalStoredAccount[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('auditpay_registered_accounts', JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save local accounts', e);
  }
};

const loadFallbackSession = (): UserProfile => {
  if (typeof window === 'undefined') return createGuestUser();
  try {
    const raw = localStorage.getItem('auditpay_active_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) return parsed;
    }
  } catch {}
  return createGuestUser();
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState('');
  const [isPaywallModalOpen, setIsPaywallModalOpen] = useState(false);
  const [paywallFeatureName, setPaywallFeatureName] = useState('');

  // Map Supabase User to AuditPay UserProfile
  const mapSupabaseUserToProfile = (sbUser: SupabaseUser): UserProfile => {
    const meta = sbUser.user_metadata || {};
    const plan: PlanType = (meta.plan as PlanType) || 'free';
    const isPaid = Boolean(meta.is_paid && plan !== 'free');
    const auditsLimit = Number(meta.audits_limit) || PLAN_LIMITS[plan];
    const auditsUsedThisMonth = Number(meta.audits_used_this_month) || 0;

    return {
      id: sbUser.id,
      name: meta.name || sbUser.email?.split('@')[0] || 'Merchant',
      email: sbUser.email || '',
      brandName: meta.brand_name || 'My D2C Brand',
      plan,
      isPaid,
      auditsUsedThisMonth,
      auditsLimit,
      joinedAt: sbUser.created_at || new Date().toISOString(),
    };
  };

  // Synchronize session on load and listen for real-time auth changes across tabs/devices
  useEffect(() => {
    let mounted = true;

    // Check active session from Supabase (or fallback to local session if cloud is unreachable)
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(mapSupabaseUserToProfile(session.user));
        } else {
          setUser(loadFallbackSession());
        }
      })
      .catch((err) => {
        console.warn('Supabase getSession failed, using local session:', err);
        if (mounted) {
          setUser(loadFallbackSession());
        }
      });

    // Listen for state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(mapSupabaseUserToProfile(session.user));
      } else {
        setUser(loadFallbackSession());
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginWithLocalFallback = (cleanEmail: string, password: string): { success: boolean; error?: string } => {
    const localAccs = getLocalAccounts();
    const found = localAccs.find(a => a.email.toLowerCase() === cleanEmail);
    if (!found) {
      return {
        success: false,
        error: 'Account does not exist with this email. Please sign up first.',
      };
    }
    if (found.passwordHash !== password) {
      return {
        success: false,
        error: 'Incorrect password. Please verify and try again.',
      };
    }

    const sessionProfile: UserProfile = {
      id: found.id,
      name: found.name,
      email: found.email,
      brandName: found.brandName,
      plan: found.plan,
      isPaid: found.isPaid,
      auditsUsedThisMonth: found.auditsUsedThisMonth,
      auditsLimit: found.auditsLimit,
      joinedAt: found.joinedAt,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('auditpay_active_session', JSON.stringify(sessionProfile));
      localStorage.removeItem('auditpay_guest_audits');
    }
    setUser(sessionProfile);
    closeAuthModal();
    return { success: true };
  };

  const signupWithLocalFallback = (
    name: string,
    cleanEmail: string,
    brandName: string,
    password: string,
    initialAuditsUsed: number
  ): { success: boolean; error?: string } => {
    const localAccs = getLocalAccounts();
    const existing = localAccs.find(a => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        error: 'An account with this email already exists. Please sign in with your credentials.',
      };
    }

    const newAcc: LocalStoredAccount = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: name.trim() || 'Merchant',
      email: cleanEmail,
      brandName: brandName.trim() || 'My D2C Brand',
      passwordHash: password,
      plan: 'free',
      isPaid: false,
      auditsUsedThisMonth: initialAuditsUsed,
      auditsLimit: PLAN_LIMITS.free,
      joinedAt: new Date().toISOString(),
    };

    saveLocalAccounts([...localAccs, newAcc]);

    const sessionProfile: UserProfile = {
      id: newAcc.id,
      name: newAcc.name,
      email: newAcc.email,
      brandName: newAcc.brandName,
      plan: newAcc.plan,
      isPaid: newAcc.isPaid,
      auditsUsedThisMonth: newAcc.auditsUsedThisMonth,
      auditsLimit: newAcc.auditsLimit,
      joinedAt: newAcc.joinedAt,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('auditpay_active_session', JSON.stringify(sessionProfile));
      localStorage.removeItem('auditpay_guest_audits');
    }

    setUser(sessionProfile);
    closeAuthModal();
    return { success: true };
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        const errLower = error.message.toLowerCase();
        // If Supabase cloud is unreachable or paused, fall back to local authentication
        if (errLower.includes('failed to fetch') || errLower.includes('network') || errLower.includes('fetch')) {
          return loginWithLocalFallback(cleanEmail, password);
        }

        if (
          errLower.includes('invalid login credentials') ||
          errLower.includes('invalid credentials')
        ) {
          return {
            success: false,
            error: 'Account does not exist with this email or password is incorrect. Please sign up first.',
          };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        const mapped = mapSupabaseUserToProfile(data.user);
        const guestUsed = typeof window !== 'undefined' ? Number(localStorage.getItem('auditpay_guest_audits') || 0) : 0;
        if (guestUsed > 0 && mapped.plan === 'free' && mapped.auditsUsedThisMonth === 0) {
          mapped.auditsUsedThisMonth = 1;
          supabase.auth.updateUser({ data: { audits_used_this_month: 1 } }).catch(() => {});
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auditpay_guest_audits');
          }
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('auditpay_active_session', JSON.stringify(mapped));
        }
        setUser(mapped);
        closeAuthModal();
        return { success: true };
      }

      return { success: false, error: 'Failed to retrieve user session.' };
    } catch (err: any) {
      console.warn('Supabase login error, attempting fallback:', err);
      return loginWithLocalFallback(cleanEmail, password);
    }
  };

  const signup = async (
    name: string,
    email: string,
    brandName: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const guestUsed = typeof window !== 'undefined' ? Number(localStorage.getItem('auditpay_guest_audits') || 0) : 0;
    const initialAuditsUsed = (user?.auditsUsedThisMonth && user.auditsUsedThisMonth > 0) || guestUsed > 0 ? 1 : 0;

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: name.trim(),
            brand_name: brandName.trim() || 'My D2C Brand',
            plan: 'free',
            is_paid: false,
            audits_used_this_month: initialAuditsUsed,
            audits_limit: PLAN_LIMITS.free,
          },
        },
      });

      if (error) {
        const errLower = error.message.toLowerCase();
        // If Supabase cloud is unreachable or paused, fall back to local account registration
        if (errLower.includes('failed to fetch') || errLower.includes('network') || errLower.includes('fetch')) {
          return signupWithLocalFallback(name, cleanEmail, brandName, password, initialAuditsUsed);
        }

        if (
          errLower.includes('already registered') ||
          errLower.includes('already exists')
        ) {
          return {
            success: false,
            error: 'An account with this email already exists. Please sign in with your credentials.',
          };
        }
        return { success: false, error: error.message };
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem('auditpay_guest_audits');
      }

      // Check if user session was automatically established
      if (data.session && data.user) {
        const mapped = mapSupabaseUserToProfile(data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('auditpay_active_session', JSON.stringify(mapped));
        }
        setUser(mapped);
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Supabase signup error, attempting fallback:', err);
      return signupWithLocalFallback(name, cleanEmail, brandName, password, initialAuditsUsed);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out', e);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auditpay_active_session');
      }
      setUser(createGuestUser());
    }
  };

  const upgradePlan = async (plan: PlanType) => {
    if (!user) return;
    const isPaid = plan !== 'free';
    const auditsLimit = PLAN_LIMITS[plan];

    const updatedUser = {
      ...user,
      plan,
      isPaid,
      auditsLimit,
    };

    // Optimistically update UI
    setUser(updatedUser);

    if (typeof window !== 'undefined') {
      localStorage.setItem('auditpay_active_session', JSON.stringify(updatedUser));
      const localAccs = getLocalAccounts();
      const idx = localAccs.findIndex(a => a.id === user.id);
      if (idx !== -1) {
        localAccs[idx].plan = plan;
        localAccs[idx].isPaid = isPaid;
        localAccs[idx].auditsLimit = auditsLimit;
        saveLocalAccounts(localAccs);
      }
    }

    // Persist to Supabase cloud metadata if reachable
    try {
      await supabase.auth.updateUser({
        data: {
          plan,
          is_paid: isPaid,
          audits_limit: auditsLimit,
        },
      });
    } catch (err) {
      console.warn('Could not sync plan upgrade to Supabase (offline/paused):', err);
    }
  };

  const incrementAuditCount = async (): Promise<boolean> => {
    if (!user) return false;

    // If user is guest, persist in localStorage and optimistic state
    if (user.id.startsWith('guest_')) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auditpay_guest_audits', '1');
      }
      setUser((prev) => (prev ? {
        ...prev,
        auditsUsedThisMonth: 1,
      } : null));
      return true;
    }

    if (user.auditsUsedThisMonth >= user.auditsLimit && user.plan === 'free') {
      return false;
    }

    const newCount = user.auditsUsedThisMonth + 1;

    // Optimistically update UI
    const updatedUser = {
      ...user,
      auditsUsedThisMonth: newCount,
    };
    setUser(updatedUser);

    if (typeof window !== 'undefined') {
      localStorage.setItem('auditpay_active_session', JSON.stringify(updatedUser));
      const localAccs = getLocalAccounts();
      const idx = localAccs.findIndex(a => a.id === user.id);
      if (idx !== -1) {
        localAccs[idx].auditsUsedThisMonth = newCount;
        saveLocalAccounts(localAccs);
      }
    }

    // Persist to Supabase cloud metadata if reachable
    try {
      await supabase.auth.updateUser({
        data: {
          audits_used_this_month: newCount,
        },
      });
    } catch (err) {
      console.warn('Could not sync audit count to Supabase (offline/paused):', err);
    }

    return true;
  };

  const isAuthenticated = user !== null && !user.id.startsWith('guest_');
  const isPaidUser = Boolean(isAuthenticated && user && user.isPaid && user.plan !== 'free');

  const canPerformAudit = () => {
    if (!user) return true;
    if (isPaidUser) return true;
    if (!isAuthenticated) {
      const guestUsed = typeof window !== 'undefined' ? Number(localStorage.getItem('auditpay_guest_audits') || 0) : 0;
      const count = Math.max(user.auditsUsedThisMonth, guestUsed);
      return count < 1;
    }
    return user.auditsUsedThisMonth < user.auditsLimit;
  };

  const canExportDisputePackage = () => {
    return isPaidUser;
  };

  const canViewAllDiscrepancies = () => {
    // Authenticated users (both free and paid) can view all rows of their audited statement
    return isAuthenticated;
  };

  const canGenerateDisputeEmail = () => {
    return isPaidUser;
  };

  const openAuthModal = (reason: string = '') => {
    setAuthModalReason(reason);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason('');
  };

  const openPaywallModal = (featureName: string = 'Premium Feature') => {
    setPaywallFeatureName(featureName);
    setIsPaywallModalOpen(true);
  };

  const closePaywallModal = () => {
    setIsPaywallModalOpen(false);
    setPaywallFeatureName('');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isPaidUser,
        isAuthModalOpen,
        authModalReason,
        isPaywallModalOpen,
        paywallFeatureName,
        login,
        signup,
        logout,
        upgradePlan,
        incrementAuditCount,
        canPerformAudit,
        canExportDisputePackage,
        canViewAllDiscrepancies,
        canGenerateDisputeEmail,
        openAuthModal,
        closeAuthModal,
        openPaywallModal,
        closePaywallModal,
      }}
    >
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
