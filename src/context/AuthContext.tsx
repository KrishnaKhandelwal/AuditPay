'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type PlanType = 'free' | 'starter' | 'growth' | 'enterprise';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  brandName: string;
  plan: PlanType;
  auditsUsedThisMonth: number;
  auditsLimit: number;
  joinedAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalReason: string;
  isPaywallModalOpen: boolean;
  paywallFeatureName: string;
  login: (email: string, name?: string, brandName?: string, plan?: PlanType) => void;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState('');
  const [isPaywallModalOpen, setIsPaywallModalOpen] = useState(false);
  const [paywallFeatureName, setPaywallFeatureName] = useState('');

  // Hydrate user session from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('auditpay_user_session');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Default guest user on free plan with 0 audits used
        const guestUser: UserProfile = {
          id: 'guest_' + Math.random().toString(36).substring(2, 8),
          name: 'Guest Merchant',
          email: 'founder@d2cbrand.com',
          brandName: 'My D2C Brand',
          plan: 'free',
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

  const login = (email: string, name?: string, brandName?: string, plan: PlanType = 'free') => {
    const newUser: UserProfile = {
      id: 'usr_' + Date.now().toString(36),
      name: name || email.split('@')[0],
      email: email.trim().toLowerCase(),
      brandName: brandName || 'My D2C Brand',
      plan,
      auditsUsedThisMonth: user?.auditsUsedThisMonth || 0,
      auditsLimit: PLAN_LIMITS[plan],
      joinedAt: new Date().toISOString(),
    };
    saveUserSession(newUser);
    closeAuthModal();
  };

  const signup = (name: string, email: string, brandName: string) => {
    const newUser: UserProfile = {
      id: 'usr_' + Date.now().toString(36),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      brandName: brandName.trim() || 'My D2C Brand',
      plan: 'free',
      auditsUsedThisMonth: user?.auditsUsedThisMonth || 0,
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
      auditsUsedThisMonth: 0,
      auditsLimit: PLAN_LIMITS.free,
      joinedAt: new Date().toISOString(),
    };
    saveUserSession(guestUser);
  };

  const upgradePlan = (plan: PlanType) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      plan,
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

  const canPerformAudit = () => {
    if (!user) return true;
    if (user.plan === 'enterprise' || user.plan === 'growth' || user.plan === 'starter') return true;
    return user.auditsUsedThisMonth < user.auditsLimit;
  };

  const canExportDisputePackage = () => {
    if (!user) return false;
    return user.plan !== 'free';
  };

  const canViewAllDiscrepancies = () => {
    if (!user) return false;
    return user.plan !== 'free';
  };

  const canGenerateDisputeEmail = () => {
    if (!user) return false;
    return user.plan !== 'free';
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

  const isAuthenticated = user !== null && !user.id.startsWith('guest_');

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
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
