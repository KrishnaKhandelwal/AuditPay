'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  UploadCloud, 
  LayoutDashboard, 
  Home as HomeIcon, 
  Tag, 
  HelpCircle,
  User,
  LogOut,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Zap,
  CreditCard
} from 'lucide-react';
import { useAudit } from '@/context/AuditContext';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavbarProps {
  onUploadClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onUploadClick }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { hasData, currentView, setCurrentView, resetAudit } = useAudit();
  const { user, isAuthenticated, openAuthModal, logout, upgradePlan } = useAuth();
  
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    resetAudit();
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentView('dashboard');
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const isHomeActive = pathname === '/' && currentView === 'upload';
  const isDashboardActive = pathname === '/' && currentView === 'dashboard';
  const isPricingActive = pathname === '/pricing';
  const isHowItWorksActive = pathname === '/how-it-works';

  const planBadgeText = user?.plan ? user.plan.toUpperCase() : 'FREE';
  const isPaidUser = user && user.plan !== 'free';

  return (
    <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link 
          href="/" 
          onClick={handleHomeClick}
          className="flex items-center space-x-3 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                Audit<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400">Pay</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Protect Payouts • Recover Deduction Leakage</p>
          </div>
        </Link>

        {/* Center/Right Nav Links & Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Home Link */}
          <button
            onClick={handleHomeClick}
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              isHomeActive
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 font-bold border border-emerald-200/60 dark:border-emerald-800/60'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <HomeIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </button>

          {/* Dashboard Link */}
          <button
            onClick={handleDashboardClick}
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              isDashboardActive
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 font-bold border border-emerald-200/60 dark:border-emerald-800/60'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          {/* How It Works Link */}
          <Link
            href="/how-it-works"
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors ${
              isHowItWorksActive
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 font-bold border border-emerald-200/60 dark:border-emerald-800/60'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">How It Works</span>
          </Link>

          {/* Pricing Link */}
          <Link
            href="/pricing"
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors ${
              isPricingActive
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 font-bold border border-emerald-200/60 dark:border-emerald-800/60'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Pricing</span>
          </Link>

          {/* Theme Toggle (Light / Dark mode switcher) */}
          <div className="pl-1 border-l border-slate-200 dark:border-slate-800 ml-1">
            <ThemeToggle />
          </div>

          {/* User Account / Profile Section */}
          <div className="relative pl-1" ref={dropdownRef}>
            {isAuthenticated ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 p-1 pl-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 bg-slate-50 dark:bg-slate-900 transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[90px]">
                    {user?.brandName || user?.name}
                  </span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  isPaidUser 
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {planBadgeText}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('Sign in to access your audit records and manage subscription')}
                className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:text-emerald-600 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-white dark:bg-slate-900 transition-all shadow-2xs cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Dropdown Menu */}
            {userDropdownOpen && user && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Profile Header */}
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user.email}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                    {user.brandName}
                  </span>
                </div>

                {/* Quota tracker */}
                <div className="py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Audit Quota</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {user.auditsUsedThisMonth} / {user.auditsLimit === 999 ? '∞' : user.auditsLimit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ 
                        width: `${Math.min(100, (user.auditsUsedThisMonth / (user.auditsLimit === 999 ? 100 : user.auditsLimit)) * 100)}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Plan Upgrade / Links */}
                <div className="py-2 space-y-1">
                  <Link
                    href="/pricing"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isPaidUser ? 'Manage Plan' : 'Upgrade to Pro'}</span>
                    </div>
                    {!isPaidUser && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-100 text-emerald-800">
                        Upgrade
                      </span>
                    )}
                  </Link>

                  {/* Fast demo tester switch */}
                  {!isPaidUser && (
                    <button
                      onClick={() => {
                        upgradePlan('growth');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Switch to Demo Growth Plan</span>
                    </button>
                  )}
                </div>

                {/* Log Out */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Another Statement Button (Shown when data is present) */}
          {hasData && onUploadClick && (
            <button
              onClick={onUploadClick}
              className="ml-2 inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-emerald-100 stroke-[2.4]" />
              <span className="hidden sm:inline">Upload Statement</span>
              <span className="sm:hidden">Upload</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
