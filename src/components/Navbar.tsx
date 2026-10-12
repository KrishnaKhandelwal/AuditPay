'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, UploadCloud, LayoutDashboard, Home as HomeIcon, Tag } from 'lucide-react';
import { useAudit } from '@/context/AuditContext';

interface NavbarProps {
  onUploadClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onUploadClick }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { hasData, currentView, setCurrentView, resetAudit } = useAudit();

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    resetAudit();
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!hasData) return;
    setCurrentView('dashboard');
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const isHomeActive = pathname === '/' && (!hasData || currentView === 'upload');
  const isDashboardActive = pathname === '/' && hasData && currentView === 'dashboard';
  const isPricingActive = pathname === '/pricing';

  return (
    <header className="border-b border-slate-200/80 bg-white/75 backdrop-blur-xl sticky top-0 z-50 shadow-xs">
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
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Audit<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Pay</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Protect Payouts • Recover Deduction Leakage</p>
          </div>
        </Link>

        {/* Center/Right Nav Links & Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Home Link */}
          <button
            onClick={handleHomeClick}
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              isHomeActive
                ? 'text-emerald-700 bg-emerald-50 font-bold border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HomeIcon className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {/* Conditional Dashboard Link - shown whenever a file is uploaded so user can return from Pricing */}
          {hasData && (
            <button
              onClick={handleDashboardClick}
              className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                isDashboardActive
                  ? 'text-emerald-700 bg-emerald-50 font-bold border border-emerald-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          )}

          {/* Pricing Link */}
          <Link
            href="/pricing"
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              isPricingActive
                ? 'text-emerald-700 bg-emerald-50 font-bold border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Pricing</span>
          </Link>

          {/* Upload Another Statement Button (Shown when data is present) */}
          {hasData && onUploadClick && (
            <button
              onClick={onUploadClick}
              className="ml-2 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-[0_3px_10px_rgba(5,150,105,0.25)] hover:shadow-[0_4px_14px_rgba(5,150,105,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-emerald-100 stroke-[2.4]" />
              <span className="hidden sm:inline">Upload Another Statement</span>
              <span className="sm:hidden">Upload</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
