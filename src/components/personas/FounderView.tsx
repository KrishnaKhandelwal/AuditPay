'use client';

import React from 'react';
import { IndianRupee, TrendingDown, AlertOctagon, CheckCircle2, ArrowRight } from 'lucide-react';
import { AuditSummary, DiscrepancyItem } from '@/types/audit';

interface FounderViewProps {
  summary: AuditSummary;
  discrepancies: DiscrepancyItem[];
  onSwitchToKAM: () => void;
}

export const FounderView: React.FC<FounderViewProps> = ({ summary, discrepancies, onSwitchToKAM }) => {
  // Calculate platform loss breakdown
  const blinkitLoss = discrepancies.filter(d => d.platform === 'Blinkit').reduce((a, b) => a + b.disputedAmount, 0);
  const zeptoLoss = discrepancies.filter(d => d.platform === 'Zepto').reduce((a, b) => a + b.disputedAmount, 0);
  const instamartLoss = discrepancies.filter(d => d.platform === 'Instamart').reduce((a, b) => a + b.disputedAmount, 0);

  return (
    <div className="space-y-6">
      
      {/* Executive Summary Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950/60 via-gray-900 to-gray-900 border border-rose-500/30 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
            Executive Margin Health Brief
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3 leading-tight">
            You are losing <span className="text-rose-400">₹{summary.totalLeakageIdentified.toLocaleString('en-IN')}</span> in silent deduction leakage this month.
          </h2>
          <p className="text-sm text-gray-300 mt-2 leading-relaxed">
            This leakage represents <strong className="text-white">{summary.estimatedRecoveryPercent}%</strong> of your total quick-commerce deductions. Recovering this cash directly expands your EBITDA with zero additional ad spend.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onSwitchToKAM}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-gray-950 shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02]"
            >
              <span>Instruct KAM to File Dispute Claim (₹{summary.totalLeakageIdentified.toLocaleString('en-IN')})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Platform Leakage Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-semibold text-yellow-400">Blinkit Margin Impact</span>
            <span>{discrepancies.filter(d => d.platform === 'Blinkit').length} claims</span>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{blinkitLoss.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Primarily driven by dark store RTV returns with zero warehouse proof.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-semibold text-purple-400">Zepto Margin Impact</span>
            <span>{discrepancies.filter(d => d.platform === 'Zepto').length} claims</span>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{zeptoLoss.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Duplicate settlement debit notes and unapproved co-op ad fees.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-semibold text-orange-400">Swiggy Instamart Impact</span>
            <span>{discrepancies.filter(d => d.platform === 'Instamart').length} claims</span>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{instamartLoss.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Aggressive shelf-life expiry breaches and unverified carton returns.
          </p>
        </div>

      </div>

    </div>
  );
};
