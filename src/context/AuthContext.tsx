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

    // Check active session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(mapSupabaseUserToProfile(session.user));
      } else {
        setUser(createGuestUser());
      }
    });

    // Listen for state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(mapSupabaseUserToProfile(session.user));
      } else {
        setUser(createGuestUser());
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        if (
          error.message.toLowerCase().includes('invalid login credentials') ||
          error.message.toLowerCase().includes('invalid credentials')
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
        // If guest completed an audit before logging in, ensure their free account accounts for it
        const guestUsed = typeof window !== 'undefined' ? Number(localStorage.getItem('auditpay_guest_audits') || 0) : 0;
        if (guestUsed > 0 && mapped.plan === 'free' && mapped.auditsUsedThisMonth === 0) {
          mapped.auditsUsedThisMonth = 1;
          supabase.auth.updateUser({ data: { audits_used_this_month: 1 } }).catch(() => {});
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auditpay_guest_audits');
          }
        }
        setUser(mapped);
        closeAuthModal();
        return { success: true };
      }

      return { success: false, error: 'Failed to retrieve user session.' };
    } catch (err: any) {
      console.error('Supabase login error:', err);
      return { success: false, error: err.message || 'Network error occurred during login.' };
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
        if (
          error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('already exists')
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

      // Check if user session was automatically established or if email confirmation is required
      if (data.session && data.user) {
        setUser(mapSupabaseUserToProfile(data.user));
      }

      return { success: true };
    } catch (err: any) {
      console.error('Supabase signup error:', err);
      return { success: false, error: err.message || 'Network error occurred during registration.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out', e);
    } finally {
      setUser(createGuestUser());
    }
  };

  const upgradePlan = async (plan: PlanType) => {
    if (!user) return;
    const isPaid = plan !== 'free';
    const auditsLimit = PLAN_LIMITS[plan];

    // Optimistically update UI
    setUser((prev) => (prev ? {
      ...prev,
      plan,
      isPaid,
      auditsLimit,
    } : null));

    // Persist to Supabase cloud metadata
    try {
      await supabase.auth.updateUser({
        data: {
          plan,
          is_paid: isPaid,
          audits_limit: auditsLimit,
        },
      });
    } catch (err) {
      console.error('Failed to sync plan upgrade to Supabase:', err);
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
    setUser((prev) => (prev ? {
      ...prev,
      auditsUsedThisMonth: newCount,
    } : null));

    // Persist to Supabase cloud metadata
    try {
      await supabase.auth.updateUser({
        data: {
          audits_used_this_month: newCount,
        },
      });
    } catch (err) {
      console.error('Failed to sync audit count to Supabase:', err);
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
