'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

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
  login: (email: string, name?: string, brandName?: string) => void;
  signup: (name: string, email: string, brandName: string, password?: string) => void;
  logout: () => void;
  upgradePlan: (plan: PlanType) => void;
  incrementAuditCount: () => boolean;
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

// Helper to access paid account registry in localStorage
const getPaidRegistry = (): Record<string, { plan: PlanType; paidAt: string }> => {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem('auditpay_paid_registry');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const savePaidRegistry = (email: string, plan: PlanType) => {
  if (typeof window === 'undefined') return;
  try {
    const registry = getPaidRegistry();
    registry[email.toLowerCase().trim()] = {
      plan,
      paidAt: new Date().toISOString(),
    };
    localStorage.setItem('auditpay_paid_registry', JSON.stringify(registry));
  } catch (e) {
    console.error('Failed to save paid registry', e);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState('');
  const [isPaywallModalOpen, setIsPaywallModalOpen] = useState(false);
  const [paywallFeatureName, setPaywallFeatureName] = useState('');

  // Hydrate user session from localStorage with strict payment verification
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('auditpay_user_session');
      if (savedUser) {
        const parsed: UserProfile = JSON.parse(savedUser);
        
        // If guest or no email or guest ID, strictly reset to free and unpaid
        if (!parsed.id || parsed.id.startsWith('guest_') || !parsed.email) {
          parsed.id = 'guest_' + Math.random().toString(36).substring(2, 8);
          parsed.name = 'Guest Merchant';
          parsed.email = 'founder@d2cbrand.com';
          parsed.brandName = 'My D2C Brand';
          parsed.plan = 'free';
          parsed.isPaid = false;
          parsed.auditsLimit = PLAN_LIMITS.free;
        } else {
          // Verify with paid registry to prevent unauthorized plan state
          const registry = getPaidRegistry();
          const paidRecord = registry[parsed.email.toLowerCase().trim()];
          if (paidRecord && paidRecord.plan !== 'free') {
            parsed.plan = paidRecord.plan;
            parsed.isPaid = true;
            parsed.auditsLimit = PLAN_LIMITS[paidRecord.plan];
          } else {
            parsed.plan = 'free';
            parsed.isPaid = false;
            parsed.auditsLimit = PLAN_LIMITS.free;
          }
        }
        setUser(parsed);
        localStorage.setItem('auditpay_user_session', JSON.stringify(parsed));
      } else {
        // Default guest user on free plan with 0 audits used
        const guestUser: UserProfile = {
          id: 'guest_' + Math.random().toString(36).substring(2, 8),
          name: 'Guest Merchant',
          email: 'founder@d2cbrand.com',
          brandName: 'My D2C Brand',
          plan: 'free',
          isPaid: false,
          auditsUsedThisMonth: 0,
          auditsLimit: PLAN_LIMITS.free,
          joinedAt: new Date().toISOString(),
        };
        setUser(guestUser);
        localStorage.setItem('auditpay_user_session', JSON.stringify(guestUser));
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    }
  }, []);

  const saveUserSession = (updatedUser: UserProfile | null) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem('auditpay_user_session', JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem('auditpay_user_session');
    }
  };

  const login = (email: string, name?: string, brandName?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const registry = getPaidRegistry();
    const paidRecord = registry[cleanEmail];
    const plan: PlanType = (paidRecord && paidRecord.plan) || 'free';
    const isPaid = Boolean(paidRecord && paidRecord.plan !== 'free');

    const newUser: UserProfile = {
      id: 'usr_' + Date.now().toString(36),
      name: name || cleanEmail.split('@')[0],
      email: cleanEmail,
      brandName: brandName || 'My D2C Brand',
      plan,
      isPaid,
      auditsUsedThisMonth: 0,
      auditsLimit: PLAN_LIMITS[plan],
      joinedAt: new Date().toISOString(),
    };
    saveUserSession(newUser);
    closeAuthModal();
  };

  const signup = (name: string, email: string, brandName: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const newUser: UserProfile = {
      id: 'usr_' + Date.now().toString(36),
      name: name.trim(),
      email: cleanEmail,
      brandName: brandName.trim() || 'My D2C Brand',
      plan: 'free',
      isPaid: false,
      auditsUsedThisMonth: 0,
      auditsLimit: PLAN_LIMITS.free,
      joinedAt: new Date().toISOString(),
    };
    saveUserSession(newUser);
    closeAuthModal();
  };

  const logout = () => {
    const guestUser: UserProfile = {
      id: 'guest_' + Math.random().toString(36).substring(2, 8),
      name: 'Guest Merchant',
      email: 'founder@d2cbrand.com',
      brandName: 'My D2C Brand',
      plan: 'free',
      isPaid: false,
      auditsUsedThisMonth: 0,
      auditsLimit: PLAN_LIMITS.free,
      joinedAt: new Date().toISOString(),
    };
    saveUserSession(guestUser);
  };

  const upgradePlan = (plan: PlanType) => {
    if (!user) return;
    const isPaid = plan !== 'free';
    if (isPaid && user.email && !user.id.startsWith('guest_')) {
      savePaidRegistry(user.email, plan);
    }
    const updated: UserProfile = {
      ...user,
      plan,
      isPaid,
      auditsLimit: PLAN_LIMITS[plan],
    };
    saveUserSession(updated);
  };

  const incrementAuditCount = (): boolean => {
    if (!user) return false;
    if (user.auditsUsedThisMonth >= user.auditsLimit && user.plan === 'free') {
      return false;
    }
    const updated: UserProfile = {
      ...user,
      auditsUsedThisMonth: user.auditsUsedThisMonth + 1,
    };
    saveUserSession(updated);
    return true;
  };

  const isAuthenticated = user !== null && !user.id.startsWith('guest_');
  const isPaidUser = Boolean(isAuthenticated && user && user.isPaid && user.plan !== 'free');

  const canPerformAudit = () => {
    if (!user) return true;
    if (isPaidUser) return true;
    return user.auditsUsedThisMonth < user.auditsLimit;
  };

  const canExportDisputePackage = () => {
    return isPaidUser;
  };

  const canViewAllDiscrepancies = () => {
    return isPaidUser;
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
