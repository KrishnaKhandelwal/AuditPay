'use client';

import React, { useRef, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { FileUploadSection } from '@/components/FileUploadSection';
import { LoadingScreen } from '@/components/LoadingScreen';
import { SummaryCards } from '@/components/SummaryCards';
import { DiscrepancyTable } from '@/components/DiscrepancyTable';
import { SettlementRow, WarehouseRow, DiscrepancyItem, AuditSummary, PlatformType } from '@/types/audit';
import { runReconciliationAudit } from '@/lib/reconciliationEngine';
import { parseSettlementFile } from '@/lib/fileParsers';
import { CheckCircle2, ShieldCheck, Zap, UserPlus } from 'lucide-react';
import { useAudit } from '@/context/AuditContext';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const {
    hasData,
    summary,
    discrepancies,
    detectedPlatform,
    currentView,
    setCurrentView,
    saveAuditResult,
  } = useAudit();

  const {
    canPerformAudit,
    incrementAuditCount,
    openPaywallModal,
    isAuthenticated,
    openAuthModal,
    user
  } = useAuth();

  const [isFetching, setIsFetching] = useState(false);
  const [activeFileName, setActiveFileName] = useState('');

  const directFileInputRef = useRef<HTMLInputElement>(null);

  const [stagedAudit, setStagedAudit] = useState<{
    summary: AuditSummary;
    discrepancies: DiscrepancyItem[];
    platform: PlatformType;
    fileName: string;
  } | null>(null);

  const handleAuditReady = (
    settlement: SettlementRow[], 
    platform: PlatformType,
    fileName: string
  ) => {
    // 1. If not authenticated, allow 1 free guest audit preview, otherwise ask to sign up
    if (!isAuthenticated) {
      if (!canPerformAudit()) {
        openAuthModal('You have already used your 1 free guest audit preview. Create a free account or sign in to continue.');
        return;
      }
    } else {
      // 2. If authenticated, check user audit quota before running (e.g. Free plan user uploading 2nd time)
      if (!canPerformAudit()) {
        openPaywallModal('Monthly Audit Quota Limit Reached');
        return;
      }
    }

    setActiveFileName(fileName);
    
    const emptyWarehouse: WarehouseRow[] = [];
    const result = runReconciliationAudit(settlement, emptyWarehouse);

    setStagedAudit({
      summary: result.summary,
      discrepancies: result.discrepancies,
      platform,
      fileName,
    });

    setIsFetching(true);
  };

  const handleDirectFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseSettlementFile(file);
      if (parsed.rows && parsed.rows.length > 0) {
        handleAuditReady(parsed.rows, parsed.detectedPlatform, file.name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      e.target.value = '';
    }
  };

  const handleLoadingFinish = () => {
    if (stagedAudit) {
      saveAuditResult(
        stagedAudit.summary,
        stagedAudit.discrepancies,
        stagedAudit.platform,
        stagedAudit.fileName
      );
      incrementAuditCount();
    }
    setIsFetching(false);
  };

  return (
    <div className="min-h-screen bg-subtle-canvas text-slate-800 dark:text-slate-100 flex flex-col selection:bg-emerald-500/10 transition-colors duration-200">
      
      {/* Hidden file input for single-click upload directly from the dashboard */}
      <input 
        type="file" 
        ref={directFileInputRef} 
        accept=".csv, .xlsx, .xls"
        className="hidden" 
        onChange={handleDirectFileSelect}
      />

      {/* Top Bar with "Upload Another Statement" button */}
      <Navbar 
        onUploadClick={() => directFileInputRef.current?.click()} 
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* State 1: 10-Second "Fetching Data" Screen */}
        {isFetching ? (
          <LoadingScreen 
            fileName={activeFileName} 
            onFinish={handleLoadingFinish} 
          />
        ) : currentView === 'upload' ? (
          /* State 2: Initial Dropzone Screen */
          <div>
            <FileUploadSection onAuditReady={handleAuditReady} />

            {/* Feature Highlights */}
            <div className="mt-10 sm:mt-14 pt-8 sm:pt-10 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
              
              <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFBEB] dark:bg-amber-950/25 border border-[#FDE68A]/80 dark:border-amber-900/40 shadow-[0_4px_14px_rgba(245,158,11,0.06)] hover:shadow-[0_6px_18px_rgba(245,158,11,0.12)] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center mb-4 shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
                  <ShieldCheck className="w-5 h-5 stroke-[2.4]" />
                </div>
                <h3 className="font-bold text-[#78350F] dark:text-amber-200 text-base mb-1">Detect Phantom Deductions</h3>
                <p className="text-xs text-[#92400E] dark:text-amber-300/80 leading-relaxed">
                  Scans for untracked RTV returns, unverified damages, and arbitrary shelf-life expiry debits.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-[#FFF1F2] dark:bg-rose-950/25 border border-[#FECDD3]/80 dark:border-rose-900/40 shadow-[0_4px_14px_rgba(244,63,94,0.06)] hover:shadow-[0_6px_18px_rgba(244,63,94,0.12)] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#F43F5E] text-white flex items-center justify-center mb-4 shadow-[0_2px_8px_rgba(244,63,94,0.3)]">
                  <Zap className="w-5 h-5 stroke-[2.4]" />
                </div>
                <h3 className="font-bold text-[#881337] dark:text-rose-200 text-base mb-1">Catch Duplicate Debit Notes</h3>
                <p className="text-xs text-[#9F1239] dark:text-rose-300/80 leading-relaxed">
                  Identifies identical debit note numbers and reference IDs charged multiple times across payout cycles.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/25 border border-[#A7F3D0]/80 dark:border-emerald-900/40 shadow-[0_4px_14px_rgba(16,185,129,0.06)] hover:shadow-[0_6px_18px_rgba(16,185,129,0.12)] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#10B981] text-white flex items-center justify-center mb-4 shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.4]" />
                </div>
                <h3 className="font-bold text-[#064E3B] dark:text-emerald-200 text-base mb-1">Instant Dispute Package</h3>
                <p className="text-xs text-[#065F46] dark:text-emerald-300/80 leading-relaxed">
                  Automatically generates dispute claim Excel workbooks and vendor support emails tailored for SLA rules.
                </p>
              </div>

            </div>
          </div>
        ) : (
          /* State 3: Dashboard */
          <div className="space-y-6">
            
            {/* When not signed in: show clear callout explaining empty state */}
            {!isAuthenticated ? (
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 shadow-xs">
                  <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-1">
                  Sign In to Access Dashboard Data
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-4 px-2">
                  The dashboard is currently empty. Sign in or create a merchant account to upload settlement files and populate your recovery widgets.
                </p>
                <button
                  onClick={() => openAuthModal('Sign in or create an account to view and populate your audit dashboard')}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 sm:py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign In / Create Account</span>
                </button>
              </div>
            ) : !hasData ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
                <span>No settlement file uploaded yet. Drop a CSV or Excel statement to view live reconciliation metrics.</span>
                <button
                  onClick={() => directFileInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer text-center shrink-0"
                >
                  Upload Statement
                </button>
              </div>
            ) : null}

            {/* KPI Cards: strictly null if unauthenticated */}
            <SummaryCards summary={isAuthenticated ? summary : null} />

            {/* Discrepancy Table: strictly empty array if unauthenticated */}
            <DiscrepancyTable 
              discrepancies={isAuthenticated ? discrepancies : []} 
              detectedPlatform={detectedPlatform} 
            />

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-950/50">
        <p>AuditPay • Protect Quick-Commerce Payouts & Recover Deduction Leakage for Indian Brands.</p>
      </footer>

    </div>
  );
}
