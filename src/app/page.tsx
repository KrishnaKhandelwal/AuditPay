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
import { CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useAudit } from '@/context/AuditContext';

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
    }
    setIsFetching(false);
  };

  return (
    <div className="min-h-screen bg-subtle-canvas text-slate-800 flex flex-col selection:bg-emerald-500/10">
      
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* State 1: 10-Second "Fetching Data" Screen */}
        {isFetching ? (
          <LoadingScreen 
            fileName={activeFileName} 
            onFinish={handleLoadingFinish} 
          />
        ) : (!hasData || currentView === 'upload') ? (
          /* State 2: Initial Dropzone Screen */
          <div>
            <FileUploadSection onAuditReady={handleAuditReady} />

            {/* Feature Highlights */}
            <div className="mt-14 pt-10 border-t border-slate-200/60 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              
              <div className="p-6 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A]/80 shadow-[0_4px_14px_rgba(245,158,11,0.06)] hover:shadow-[0_6px_18px_rgba(245,158,11,0.12)] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center mb-4 shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
                  <ShieldCheck className="w-5 h-5 stroke-[2.4]" />
                </div>
                <h3 className="font-bold text-[#78350F] text-base mb-1">Detect Phantom Deductions</h3>
                <p className="text-xs text-[#92400E] leading-relaxed">
                  Scans for untracked RTV returns, unverified damages, and arbitrary shelf-life expiry debits.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3]/80 shadow-[0_4px_14px_rgba(244,63,94,0.06)] hover:shadow-[0_6px_18px_rgba(244,63,94,0.12)] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#F43F5E] text-white flex items-center justify-center mb-4 shadow-[0_2px_8px_rgba(244,63,94,0.3)]">
                  <Zap className="w-5 h-5 stroke-[2.4]" />
                </div>
                <h3 className="font-bold text-[#881337] text-base mb-1">Catch Duplicate Debit Notes</h3>
                <p className="text-xs text-[#9F1239] leading-relaxed">
                  Identifies identical debit note numbers and reference IDs charged multiple times across payout cycles.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]/80 shadow-[0_4px_14px_rgba(16,185,129,0.06)] hover:shadow-[0_6px_18px_rgba(16,185,129,0.12)] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#10B981] text-white flex items-center justify-center mb-4 shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.4]" />
                </div>
                <h3 className="font-bold text-[#064E3B] text-base mb-1">Instant Dispute Package</h3>
                <p className="text-xs text-[#065F46] leading-relaxed">
                  Automatically generates dispute claim Excel workbooks and vendor support emails tailored for SLA rules.
                </p>
              </div>

            </div>
          </div>
        ) : (
          /* State 3: Audited Dashboard */
          <div className="space-y-6">
            {/* Subtle Pastel KPI Cards */}

            {/* Subtle Pastel KPI Cards */}
            {summary && <SummaryCards summary={summary} />}

            {/* Discrepancy Table */}
            <DiscrepancyTable 
              discrepancies={discrepancies} 
              detectedPlatform={detectedPlatform} 
            />

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 py-6 text-center text-xs text-slate-400">
        <p>AuditPay • Protect Quick-Commerce Payouts & Recover Deduction Leakage for Indian Brands.</p>
      </footer>

    </div>
  );
}
