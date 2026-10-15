'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  UploadCloud, 
  SearchCheck, 
  FileSpreadsheet, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight, 
  Layers, 
  Ghost, 
  Repeat, 
  TrendingDown, 
  FileCheck2, 
  Sparkles,
  Zap,
  HelpCircle
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';

export default function HowItWorksPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: '01',
      title: 'Export Settlement Statements',
      shortDesc: 'Download your weekly or monthly deduction ledger directly from Blinkit Partner Hub, Zepto Seller Portal, or Swiggy Instamart.',
      icon: UploadCloud,
      color: 'bg-emerald-500',
      tag: 'Step 1 • 30 Seconds',
      detail: 'AuditPay automatically accepts raw .xlsx, .xls, and .csv formats with zero manual data entry or formula formatting required.',
    },
    {
      step: '02',
      title: 'AI Fuzzy Matching & Deduction Radar',
      shortDesc: 'Our engine parses every line item against warehouse inwards and previous payout cycles using multi-column fuzzy algorithms.',
      icon: SearchCheck,
      color: 'bg-amber-500',
      tag: 'Step 2 • Automated Scan',
      detail: 'Flags Ghost RTV returns (debited on portal but never physically received), duplicate debit notes, and unapproved ad-spend offsets.',
    },
    {
      step: '03',
      title: 'One-Click Dispute Package Generation',
      shortDesc: 'Export a structured Excel claim ledger and pre-drafted SLA resolution emails tailored for partner vendor desks.',
      icon: FileSpreadsheet,
      color: 'bg-teal-500',
      tag: 'Step 3 • Instant Recovery',
      detail: 'Attach the exported dispute workbook directly to your Blinkit or Zepto ticket for immediate claim approval and payout recovery.',
    },
  ];

  const leakTypes = [
    {
      title: 'Ghost / Phantom RTV Returns',
      badge: 'High Impact',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: Ghost,
      iconColor: 'bg-rose-500',
      desc: 'Quick-commerce platforms deduct 100% value for customer returns or damages, yet goods are never physically delivered back to the brand warehouse.',
      solution: 'AuditPay cross-references gate passes & inward logs to calculate exactly how much money was deducted for unreturned inventory.',
    },
    {
      title: 'Duplicate Debit Notes',
      badge: 'Silent Leakage',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Repeat,
      iconColor: 'bg-amber-500',
      desc: 'The same debit note ID or order reference is charged across multiple payment disbursement cycles due to dark-store ERP synchronization errors.',
      solution: 'Historical cycle memory flags any recurring debit note reference and highlights exact duplicate deduction amounts.',
    },
    {
      title: 'Short Inward Count Deficits',
      badge: 'High Frequency',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: TrendingDown,
      iconColor: 'bg-sky-500',
      desc: 'Dark stores claim short delivery on purchase orders (POs) even when delivery trucks handed over full quantities with signed gate entry passes.',
      solution: 'Reconciles physical delivery receipts against PO claims to identify unverified shortage penalizations.',
    },
  ];

  return (
    <div className="min-h-screen bg-subtle-canvas text-slate-800 flex flex-col selection:bg-emerald-500/10">
      
      {/* Universal Navigation */}
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16">
        
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Automated Quick-Commerce Auditing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            How AuditPay Protects Your Margins & <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              Recovers Disputed Deductions
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            D2C brands lose 3% to 8% of payout revenue to untracked dark-store debits. Here is how AuditPay automates 100% of the audit in under 60 seconds.
          </p>
        </div>

        {/* Interactive Video / Product Simulation Showcase */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-slate-900 text-white shadow-2xl border border-slate-800 overflow-hidden">
          
          {/* Mock Browser Top Bar */}
          <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-[11px] font-mono text-slate-400 ml-2 hidden sm:inline">auditpay.in • Live Simulation Demo</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Interactive Preview
              </span>
            </div>
          </div>

          {/* Video / Interactive Simulation Stage */}
          <div className="p-6 sm:p-10 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center text-center relative overflow-hidden">
            
            {/* Background Accent Blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl w-full space-y-6">
              
              {/* Animated Progress Indicator */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                {['1. Upload File', '2. Auto-Scan & Match', '3. Export Claim Package'].map((label, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 ${
                      activeStep === idx ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                      activeStep === idx ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Step Simulation View */}
              {activeStep === 0 && (
                <div className="p-8 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4 animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                    <UploadCloud className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Drag & Drop Settlement File</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Supports direct exports from Blinkit Partner Hub (`.xlsx`), Zepto Partner Portal, and Swiggy Instamart invoices.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-left font-mono text-[11px] text-slate-300 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      <span>Blinkit_Settlement_Cycle_Oct.csv</span>
                    </div>
                    <span className="text-emerald-400 text-[10px] uppercase font-bold">1,420 Lines Loaded</span>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="p-8 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4 animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                    <SearchCheck className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Detecting Hidden Discrepancies</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Matches debit note IDs across payout cycles. Flags 0 physical units, duplicate charges, and unauthorized deductions.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-rose-400 font-bold block uppercase">Disputed Leakage</span>
                      <strong className="text-sm font-black text-white">₹1,84,320 Found</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-amber-400 font-bold block uppercase">Ghost Returns</span>
                      <strong className="text-sm font-black text-white">18 Line Items</strong>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="p-8 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4 animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-400 flex items-center justify-center mx-auto shadow-sm">
                    <FileSpreadsheet className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Generate Official Dispute Dossier</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      AuditPay compiles itemized evidence with debit note codes, SKU mapping, and dark store locations ready for vendor dispute submission.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Excel Dispute Sheet Ready</span>
                    </span>
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>SLA Vendor Email Formatted</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Demo Stepper Controls */}
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => setActiveStep((prev) => (prev + 1) % 3)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>Next Demo Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* 3 Step Visual Process Cards */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Three Simple Steps to Recovery
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              No technical setup, no developer integration required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((st) => {
              const IconComponent = st.icon;
              return (
                <div
                  key={st.step}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {st.tag}
                      </span>
                      <span className="text-xl font-black text-slate-300 font-mono">{st.step}</span>
                    </div>

                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 stroke-[2.3]" />
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base mb-1.5">{st.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{st.shortDesc}</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed font-medium">
                    {st.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* The 3 Core Leakage Types Discovered */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm space-y-8">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Audit Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              What Discrepancies Does AuditPay Catch?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Dark store logistics are fast-paced, leading to frequent manual accounting mistakes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {leakTypes.map((leak, idx) => {
              const LeakIcon = leak.icon;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl p-6 bg-slate-50 border border-slate-200/80 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs">
                        <LeakIcon className="w-5 h-5 text-emerald-600 stroke-[2.3]" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${leak.badgeColor}`}>
                        {leak.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{leak.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{leak.desc}</p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-[11px] text-emerald-900 space-y-1">
                    <strong className="text-emerald-700 block font-semibold">How AuditPay Fixes It:</strong>
                    <span className="leading-relaxed text-slate-600 block">{leak.solution}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Ready to Scan Your Quick-Commerce Statements?</h3>
            <p className="text-xs text-emerald-100 max-w-xl">
              Upload a settlement file now. See your exact recoverable deduction leakage in under 60 seconds.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-50 shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Audit a Statement Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 py-6 text-center text-xs text-slate-400 bg-white">
        <p>AuditPay • Protect Quick-Commerce Payouts & Recover Deduction Leakage for Indian Brands.</p>
      </footer>

    </div>
  );
}
