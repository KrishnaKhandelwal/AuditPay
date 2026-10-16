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
  CreditCard,
  Menu,
  X
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
  const { user, isAuthenticated, isPaidUser, openAuthModal, logout } = useAuth();
  
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    resetAudit();
    setMobileMenuOpen(false);
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentView('dashboard');
    setMobileMenuOpen(false);
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const isHomeActive = pathname === '/' && currentView === 'upload';
  const isDashboardActive = pathname === '/' && currentView === 'dashboard';
  const isPricingActive = pathname === '/pricing';
  const isHowItWorksActive = pathname === '/how-it-works';

  return (
    <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl sticky top-0 z-50 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link 
          href="/" 
          onClick={handleHomeClick}
          className="flex items-center space-x-2.5 sm:space-x-3 group cursor-pointer shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform shrink-0">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                Audit<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400">Pay</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden xl:block leading-none">Protect Payouts • Recover Deduction Leakage</p>
          </div>
        </Link>

        {/* Desktop Nav Links (Hidden on mobile) */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {/* Home Link */}
          <button
            onClick={handleHomeClick}
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 lg:px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              isHomeActive
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 font-bold border border-emerald-200/60 dark:border-emerald-800/60'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <HomeIcon className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {/* Dashboard Link */}
          <button
            onClick={handleDashboardClick}
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 lg:px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
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
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 lg:px-3 py-1.5 rounded-lg transition-colors ${
              isHowItWorksActive
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 font-bold border border-emerald-200/60 dark:border-emerald-800/60'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How It Works</span>
          </Link>

          {/* Pricing Link */}
          <Link
            href="/pricing"
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 lg:px-3 py-1.5 rounded-lg transition-colors ${
              isPricingActive
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 font-bold border border-emerald-200/60 dark:border-emerald-800/60'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Pricing</span>
          </Link>
        </nav>

        {/* Right Nav Actions (Plan Pill, Theme, Profile, Mobile Hamburger) */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          
          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Persistent Plan Pill */}
          <div>
            {isPaidUser && user ? (
              <Link
                href="/pricing"
                className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-wider uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition shadow-2xs cursor-pointer"
                title={`${user.plan.toUpperCase()} Plan Active • Click to manage`}
              >
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate max-w-[75px] sm:max-w-none">{user.plan.toUpperCase()} PLAN</span>
              </Link>
            ) : (
              <Link
                href="/pricing"
                className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
                title="Current tier: Free Plan. Click to view upgrade options."
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
                <span>FREE PLAN</span>
              </Link>
            )}
          </div>

          {/* Desktop User Account / Profile Section */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            {isAuthenticated ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 bg-slate-50 dark:bg-slate-900 transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[100px]">
                    {user?.brandName || user?.name}
                  </span>
                </div>
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

            {/* Desktop Dropdown Menu */}
            {userDropdownOpen && user && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                </div>

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

          {/* Desktop Upload Statement Button */}
          {hasData && onUploadClick && (
            <button
              onClick={onUploadClick}
              className="hidden lg:inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-emerald-100 stroke-[2.4]" />
              <span>Upload Statement</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>

      </div>

      {/* Mobile Navigation Drawer / Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-950/98 backdrop-blur-2xl px-4 py-5 shadow-2xl animate-in slide-in-from-top-2 duration-200 space-y-4 max-h-[calc(100vh-4.5rem)] overflow-y-auto">
          
          {/* User profile card in mobile drawer if logged in */}
          {isAuthenticated && user ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full shrink-0">
                  {user.brandName}
                </span>
              </div>

              {/* Quota Progress */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Monthly Quota</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {user.auditsUsedThisMonth} / {user.auditsLimit === 999 ? '∞' : user.auditsLimit} used
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, (user.auditsUsedThisMonth / (user.auditsLimit === 999 ? 100 : user.auditsLimit)) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Merchant Account</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Sign in to save statements</p>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('Sign in or register to access full audit records');
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Nav Links */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={handleHomeClick}
              className={`flex items-center space-x-2 p-3 rounded-xl transition cursor-pointer ${
                isHomeActive 
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={handleDashboardClick}
              className={`flex items-center space-x-2 p-3 rounded-xl transition cursor-pointer ${
                isDashboardActive 
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-2 p-3 rounded-xl transition ${
                isHowItWorksActive 
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>How It Works</span>
            </Link>

            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-2 p-3 rounded-xl transition ${
                isPricingActive 
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Pricing</span>
            </Link>
          </div>

          {/* Quick upload statement in mobile menu if data present */}
          {hasData && onUploadClick && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onUploadClick();
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Another Statement</span>
            </button>
          )}

          {/* Bottom row: Theme switcher & Sign out */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span>Theme:</span>
              <ThemeToggle />
            </div>

            {isAuthenticated && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>

        </div>
      )}

    </header>
  );
};
