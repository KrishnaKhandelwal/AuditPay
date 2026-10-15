'use client';

import React from 'react';
import { IndianRupee, AlertCircle, Ghost, Repeat, TrendingDown } from 'lucide-react';
import { AuditSummary } from '@/types/audit';

interface SummaryCardsProps {
  summary: AuditSummary | null;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const hasValidData = Boolean(summary && summary.totalRowsProcessed > 0);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* 1. Pastel Rose Card - Total Leakage */}
      <div className="rounded-2xl p-5 bg-[#FFF1F2] border border-[#FFE4E6] shadow-[0_4px_12px_rgba(244,63,94,0.06)] hover:shadow-[0_6px_16px_rgba(244,63,94,0.1)] transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9F1239]">
            Total Disputed Leakage
          </span>
          {/* Icon Container: Filled with card theme color, icon is white */}
          <div className="w-8 h-8 rounded-xl bg-[#F43F5E] text-white flex items-center justify-center shadow-[0_2px_6px_rgba(244,63,94,0.3)]">
            <AlertCircle className="w-4 h-4 stroke-[2.4]" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1">
          <span className="text-xl font-bold text-[#E11D48]">₹</span>
          <span className="text-3xl font-extrabold text-[#881337] tracking-tight">
            {hasValidData && summary ? summary.totalLeakageIdentified.toLocaleString('en-IN') : '0'}
          </span>
        </div>

        <div className="mt-3.5 pt-2.5 border-t border-[#FECDD3]/70 flex items-center justify-between text-xs text-[#9F1239]">
          <span className="font-medium">{hasValidData && summary ? `${summary.discrepanciesCount} discrepancies` : 'No data'}</span>
          <span className="font-bold bg-white/80 px-2 py-0.5 rounded-full text-[11px] border border-[#FECDD3] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            {hasValidData && summary ? `${summary.estimatedRecoveryPercent}% of deductions` : 'No data'}
          </span>
        </div>
      </div>

      {/* 2. Pastel Amber / Honey Card - Phantom RTVs */}
      <div className="rounded-2xl p-5 bg-[#FEFCE8] border border-[#FEF08A]/70 shadow-[0_4px_12px_rgba(234,179,8,0.06)] hover:shadow-[0_6px_16px_rgba(234,179,8,0.1)] transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#854D0E]">
            Phantom / Ghost RTVs
          </span>
          {/* Icon Container: Filled with card theme color, icon is white */}
          <div className="w-8 h-8 rounded-xl bg-[#EAB308] text-white flex items-center justify-center shadow-[0_2px_6px_rgba(234,179,8,0.3)]">
            <Ghost className="w-4 h-4 stroke-[2.4]" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1">
          <span className="text-lg font-bold text-[#CA8A04]">₹</span>
          <span className="text-3xl font-extrabold text-[#713F12] tracking-tight">
            {hasValidData && summary ? summary.ghostReturnsAmount.toLocaleString('en-IN') : '0'}
          </span>
        </div>

        <p className="mt-3.5 pt-2.5 border-t border-[#FEF08A]/70 text-xs text-[#854D0E]/90 leading-relaxed font-medium">
          {hasValidData ? 'Deducted by platform, but 0 physical units received at warehouse.' : 'No data (upload CSV to analyze)'}
        </p>
      </div>

      {/* 3. Pastel Sky Blue Card - Short Receipts */}
      <div className="rounded-2xl p-5 bg-[#F0F9FF] border border-[#BAE6FD]/70 shadow-[0_4px_12px_rgba(14,165,233,0.06)] hover:shadow-[0_6px_16px_rgba(14,165,233,0.1)] transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0369A1]">
            Short Inward Receipts
          </span>
          {/* Icon Container: Filled with card theme color, icon is white */}
          <div className="w-8 h-8 rounded-xl bg-[#0EA5E9] text-white flex items-center justify-center shadow-[0_2px_6px_rgba(14,165,233,0.3)]">
            <TrendingDown className="w-4 h-4 stroke-[2.4]" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1">
          <span className="text-lg font-bold text-[#0284C7]">₹</span>
          <span className="text-3xl font-extrabold text-[#0C4A6E] tracking-tight">
            {hasValidData && summary ? summary.shortReceiptsAmount.toLocaleString('en-IN') : '0'}
          </span>
        </div>

        <p className="mt-3.5 pt-2.5 border-t border-[#BAE6FD]/70 text-xs text-[#0369A1]/90 leading-relaxed font-medium">
          {hasValidData ? 'Physical inward count was lower than platform deduction claim.' : 'No data (upload CSV to analyze)'}
        </p>
      </div>

      {/* 4. Pastel Lavender Card - Duplicates & Offsets */}
      <div className="rounded-2xl p-5 bg-[#FAF5FF] border border-[#E9D5FF]/70 shadow-[0_4px_12px_rgba(168,85,247,0.06)] hover:shadow-[0_6px_16px_rgba(168,85,247,0.1)] transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B21A8]">
            Duplicates & Offsets
          </span>
          {/* Icon Container: Filled with card theme color, icon is white */}
          <div className="w-8 h-8 rounded-xl bg-[#A855F7] text-white flex items-center justify-center shadow-[0_2px_6px_rgba(168,85,247,0.3)]">
            <Repeat className="w-4 h-4 stroke-[2.4]" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1">
          <span className="text-lg font-bold text-[#9333EA]">₹</span>
          <span className="text-3xl font-extrabold text-[#581C87] tracking-tight">
            {hasValidData && summary ? (summary.duplicateDeductionsAmount + summary.rateOverchargesAmount).toLocaleString('en-IN') : '0'}
          </span>
        </div>

        <p className="mt-3.5 pt-2.5 border-t border-[#E9D5FF]/70 text-xs text-[#6B21A8]/90 leading-relaxed font-medium">
          {hasValidData ? 'Repeated debit notes or unapproved co-op ad-spend chargebacks.' : 'No data (upload CSV to analyze)'}
        </p>
      </div>

    </div>
  );
};
