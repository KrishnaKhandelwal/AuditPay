'use client';

import React, { useState, useEffect } from 'react';
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
  ArrowLeft,
  Ghost, 
  Repeat, 
  TrendingDown, 
  FileCheck2, 
  Sparkles,
  Zap,
  HelpCircle,
  Copy,
  Check,
  Table,
  Mail,
  FileText
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';

export default function HowItWorksPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // Step 0 interactive state
  const [selectedSampleFile, setSelectedSampleFile] = useState(0);

  // Step 1 interactive state
  const [activeLeakType, setActiveLeakType] = useState(0);

  // Step 2 interactive state
  const [claimTab, setClaimTab] = useState<'excel' | 'email'>('excel');
  const [copied, setCopied] = useState(false);

  // Auto-play loop timer (5000ms per step)
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 60; // 60ms tick for smooth progress
    const stepIncrement = (intervalTime / 5000) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStep((current) => (current + 1) % 3);
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, activeStep]);

  const handleSelectStep = (index: number) => {
    setActiveStep(index);
    setProgress(0);
  };

  const handleNextStep = () => {
    setActiveStep((prev) => (prev + 1) % 3);
    setProgress(0);
  };

  const handlePrevStep = () => {
    setActiveStep((prev) => (prev - 1 + 3) % 3);
    setProgress(0);
  };

  const handleRestart = () => {
    setActiveStep(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleCopyEmail = () => {
    const emailBody = `Subject: Formal Dispute: Discrepant Deductions & Ghost RTV Returns (Settlement Cycle Oct 2026)\n\nDear Partner Support Desk,\n\nWe have reconciled our payment disbursement statement and identified ₹1,84,320 in unverified deductions across 18 line items.\n\nPlease find attached the AuditPay itemized dispute ledger detailing gate pass records and duplicate debit note IDs.\n\nKindly acknowledge within 48 hours as per our vendor SLA.\n\nRegards,\nFinance & Reconciliation Desk`;
    
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(emailBody);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const sampleFiles = [
    {
      name: 'Blinkit_Settlement_Cycle_Oct.csv',
      platform: 'Blinkit',
      lines: '1,420 Lines',
      size: '2.4 MB',
      leakage: '₹1,84,320',
      items: 18,
    },
    {
      name: 'Zepto_Warehouse_Debit_Ledger.xlsx',
      platform: 'Zepto',
      lines: '890 Lines',
      size: '1.6 MB',
      leakage: '₹92,450',
      items: 9,
    },
    {
      name: 'Instamart_Vendor_Payout_Deductions.csv',
      platform: 'Swiggy Instamart',
      lines: '2,150 Lines',
      size: '3.8 MB',
      leakage: '₹2,10,800',
      items: 24,
    },
  ];

  const leakDetections = [
    {
      id: 'ghost',
      name: 'Ghost / Phantom RTV',
      amount: '₹94,200',
      items: '8 SKUs',
      color: 'rose',
      reason: '100% deduction debited on portal for damaged customer returns, yet 0 physical units returned to brand warehouse.',
      evidence: 'Gatepass entry missing at Bhiwandi Central Hub',
      sampleSKU: 'Protein Granola 500g (Batch #BK-902)',
    },
    {
      id: 'duplicate',
      name: 'Duplicate Debit Notes',
      amount: '₹52,120',
      items: '5 Debit Notes',
      color: 'amber',
      reason: 'Same debit note ID billed across both Week 2 and Week 3 payment disbursement cycles due to ERP desync.',
      evidence: 'Debit Note #DN-77412 charged twice (₹26,060 x 2)',
      sampleSKU: 'Dark Store Slotting Fee - Gurgaon Hub 4',
    },
    {
      id: 'shortage',
      name: 'Short Inward Deficit',
      amount: '₹38,000',
      items: '5 POs',
      color: 'sky',
      reason: 'Dark store claimed short delivery on PO #8941 despite signed delivery gatepass acknowledging full truck handover.',
      evidence: 'Signed POD shows 500 units; portal inward shows 440 units',
      sampleSKU: 'Almond Energy Bar Pack of 6 (60 units debited)',
    },
  ];

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
      desc: 'Quick-commerce platforms deduct 100% value for customer returns or damages, yet goods are never physically delivered back to the brand warehouse.',
      solution: 'AuditPay cross-references gate passes & inward logs to calculate exactly how much money was deducted for unreturned inventory.',
    },
    {
      title: 'Duplicate Debit Notes',
      badge: 'Silent Leakage',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Repeat,
      desc: 'The same debit note ID or order reference is charged across multiple payment disbursement cycles due to dark-store ERP synchronization errors.',
      solution: 'Historical cycle memory flags any recurring debit note reference and highlights exact duplicate deduction amounts.',
    },
    {
      title: 'Short Inward Count Deficits',
      badge: 'High Frequency',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: TrendingDown,
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
          <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline border-l border-slate-800 pl-3">
                auditpay.in • Live Interactive Simulation
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Play / Pause Toggle Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                  isPlaying 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                }`}
                title={isPlaying ? 'Click to Pause auto-play' : 'Click to Resume auto-play'}
              >
                {isPlaying ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <Pause className="w-3 h-3 ml-1" />
                    <span>Auto-Playing (5s)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>Paused • Resume</span>
                  </>
                )}
              </button>

              {/* Restart Loop Button */}
              <button
                onClick={handleRestart}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Restart interactive preview"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Stepper Header Navigation with Live Progress Bars */}
          <div className="grid grid-cols-3 bg-slate-950/60 border-b border-slate-800">
            {[
              { id: 0, title: '1. Ingest Statement', desc: 'Accepts raw platform ledgers' },
              { id: 1, title: '2. Fuzzy Scan', desc: 'Identifies phantom deductions' },
              { id: 2, title: '3. Claim Package', desc: 'Excel dispute sheet & emails' },
            ].map((st) => {
              const isCurrent = activeStep === st.id;
              const isPast = activeStep > st.id;

              return (
                <button
                  key={st.id}
                  onClick={() => handleSelectStep(st.id)}
                  className={`relative p-3.5 sm:p-4 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                      isCurrent 
                        ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                        : isPast 
                          ? 'bg-emerald-500/30 text-emerald-400' 
                          : 'bg-slate-800 text-slate-400'
                    }`}>
                      {st.id + 1}
                    </span>
                    <span className={`text-xs font-bold truncate ${
                      isCurrent ? 'text-white' : 'text-slate-400'
                    }`}>
                      {st.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 hidden sm:block mt-1 pl-7 truncate">
                    {st.desc}
                  </span>

                  {/* Progress Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-75"
                      style={{
                        width: isCurrent 
                          ? `${progress}%` 
                          : isPast 
                            ? '100%' 
                            : '0%'
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Simulation Stage */}
          <div className="p-6 sm:p-10 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 relative overflow-hidden min-h-[440px] flex flex-col justify-between">
            
            {/* Background Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Step Content */}
            <div className="relative z-10 w-full max-w-3xl mx-auto space-y-6">

              {/* ---------------- STEP 0: UPLOAD & INGEST ---------------- */}
              {activeStep === 0 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                      <UploadCloud className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Upload Platform Settlement Statement</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Choose a sample statement below or drop your raw exported ledger to test:
                    </p>
                  </div>

                  {/* Interactive Sample File Switcher */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {sampleFiles.map((file, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSampleFile(idx)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          selectedSampleFile === idx
                            ? 'bg-emerald-500/15 border-emerald-500/60 text-white shadow-sm ring-1 ring-emerald-500/40'
                            : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                            {file.platform}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{file.size}</span>
                        </div>
                        <span className="text-xs font-bold truncate mt-1 text-slate-200">
                          {file.name}
                        </span>
                        <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">{file.lines}</span>
                          <span className="text-rose-400 font-bold">{file.items} Flagged</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Simulated Upload Dropzone Card */}
                  <div className="p-4 bg-slate-950/70 rounded-2xl border border-dashed border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 text-left">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <FileCheck2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-mono flex items-center space-x-2">
                          <span>{sampleFiles[selectedSampleFile].name}</span>
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] px-1.5 py-0.5 rounded uppercase font-sans">
                            Ready
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Auto-detected {sampleFiles[selectedSampleFile].lines} • {sampleFiles[selectedSampleFile].platform} deduction format verified
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleNextStep}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md transition-all hover:scale-105 cursor-pointer shrink-0"
                    >
                      Run Instant Scan →
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------- STEP 1: SCAN & MATCH RADAR ---------------- */}
              {activeStep === 1 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                      <SearchCheck className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">AI Deduction Radar In Action</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Click any flagged leakage category below to inspect matched discrepancy proof:
                    </p>
                  </div>

                  {/* Interactive Discrepancy Category Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {leakDetections.map((leak, idx) => {
                      const isSelected = activeLeakType === idx;
                      return (
                        <button
                          key={leak.id}
                          onClick={() => setActiveLeakType(idx)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-sm ring-1 ring-amber-500/40'
                              : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                              {leak.name}
                            </span>
                            <span className="text-[10px] text-slate-400">{leak.items}</span>
                          </div>
                          <strong className="text-sm font-black text-rose-400 mt-1">
                            {leak.amount}
                          </strong>
                          <span className="text-[10px] text-slate-400 mt-1 truncate">
                            {leak.sampleSKU}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Discrepancy Evidence Box */}
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 font-mono">
                        Discrepancy Proof & Audit Trail
                      </span>
                      <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                        Flagged For Recovery
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {leakDetections[activeLeakType].reason}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-emerald-400 font-semibold">Evidence:</span>
                        <span>{leakDetections[activeLeakType].evidence}</span>
                      </div>
                      <span className="text-slate-300 font-mono font-bold">
                        {leakDetections[activeLeakType].amount} Disputed
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- STEP 2: CLAIM DOSSIER EXPORT ---------------- */}
              {activeStep === 2 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-400 flex items-center justify-center mx-auto shadow-sm">
                      <FileSpreadsheet className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">One-Click Dispute Package Ready</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Switch between the Excel Dispute Workbook and Pre-Drafted SLA Resolution Email:
                    </p>
                  </div>

                  {/* Interactive Format Toggle */}
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setClaimTab('excel')}
                      className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        claimTab === 'excel'
                          ? 'bg-teal-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Excel Dispute Sheet (.xlsx)</span>
                    </button>

                    <button
                      onClick={() => setClaimTab('email')}
                      className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        claimTab === 'email'
                          ? 'bg-teal-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>SLA Vendor Email</span>
                    </button>
                  </div>

                  {/* Dynamic Claim Preview Card */}
                  {claimTab === 'excel' ? (
                    <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-left space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>AuditPay_Dispute_Package_Oct2026.xlsx</span>
                        <span className="text-emerald-400 font-bold">18 Rows Auto-Generated</span>
                      </div>

                      {/* Mini Table Preview */}
                      <div className="overflow-x-auto text-[11px] font-mono">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                              <th className="py-1 px-2">Debit Note ID</th>
                              <th className="py-1 px-2">Discrepancy</th>
                              <th className="py-1 px-2">Deducted</th>
                              <th className="py-1 px-2 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900 text-slate-300">
                            <tr>
                              <td className="py-1.5 px-2 text-emerald-400">#DN-88192</td>
                              <td className="py-1.5 px-2">Ghost RTV Return</td>
                              <td className="py-1.5 px-2 text-rose-400 font-bold">₹18,400</td>
                              <td className="py-1.5 px-2 text-right text-emerald-400">Verified Proof</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-2 text-emerald-400">#DN-77412</td>
                              <td className="py-1.5 px-2">Duplicate Billing</td>
                              <td className="py-1.5 px-2 text-rose-400 font-bold">₹26,060</td>
                              <td className="py-1.5 px-2 text-right text-emerald-400">Cycle Overlap</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-2 text-emerald-400">#PO-8941</td>
                              <td className="py-1.5 px-2">Short Inward Deficit</td>
                              <td className="py-1.5 px-2 text-rose-400 font-bold">₹38,000</td>
                              <td className="py-1.5 px-2 text-right text-emerald-400">Signed POD</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-left space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400">
                          To: vendor-desk@platform.com
                        </span>
                        <button
                          onClick={handleCopyEmail}
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied to Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Email Draft</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-line">
                        {`Subject: Disputed Deductions Dispute - October Statement (Audit Reference #AP-9042)

Dear Vendor Desk,
Attached is the itemized dispute dossier with proof of ₹1,84,320 in unreturned items and duplicate debits. Under standard SLA, please credit this balance in the upcoming disbursement cycle.`}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Stepper Footer Controls */}
            <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-4 mt-6">
              <button
                onClick={handlePrevStep}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>

              {/* Progress Dots */}
              <div className="flex items-center space-x-2">
                {[0, 1, 2].map((dot) => (
                  <button
                    key={dot}
                    onClick={() => handleSelectStep(dot)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      activeStep === dot 
                        ? 'w-6 bg-emerald-500' 
                        : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                    title={`Go to step ${dot + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextStep}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all hover:scale-105 cursor-pointer"
              >
                <span>{activeStep === 2 ? 'Loop Back to Step 1' : 'Next Step'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
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
