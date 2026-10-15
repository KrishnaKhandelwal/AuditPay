'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, ShieldCheck, AlertCircle, ArrowUpRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { parseSettlementFile } from '@/lib/fileParsers';
import { SettlementRow, PlatformType } from '@/types/audit';

interface FileUploadSectionProps {
  onAuditReady: (settlement: SettlementRow[], platform: PlatformType, fileName: string) => void;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({ onAuditReady }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      setErrorMsg('Invalid file format. Please upload a valid CSV or Excel (.xlsx) settlement file.');
      return;
    }

    try {
      setErrorMsg(null);
      const parsed = await parseSettlementFile(file);

      if (!parsed.rows || parsed.rows.length === 0) {
        setErrorMsg('The uploaded file contains no readable rows or headers. Please verify the file.');
        return;
      }

      onAuditReady(parsed.rows, parsed.detectedPlatform, file.name);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to read the file. Please ensure it is a valid Quick Commerce settlement export.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      
      {/* Platform Role Header */}
      <div className="text-center mb-10 pt-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          <span>Quick Commerce Revenue Protection</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
          Stop Losing <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400">3% to 8%</span> of Revenue to Deduction Leakage.
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Drop your raw settlement statement from <strong className="text-slate-800 dark:text-white">Blinkit</strong>, <strong className="text-slate-800 dark:text-white">Zepto</strong>, or <strong className="text-slate-800 dark:text-white">Instamart</strong>. Our radar flags ghost returns, duplicate debit notes, and prepares 1-click dispute dossiers.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 flex items-center space-x-3 text-rose-800 dark:text-rose-200 text-sm shadow-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Hero Drag & Drop File Zone */}
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-3xl p-10 sm:p-14 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer ${
          dragActive 
            ? 'border-2 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 scale-[1.01] shadow-xl' 
            : 'glass-card glass-card-hover border-2 border-dashed border-emerald-300/80 dark:border-emerald-700/60 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-white/95 dark:hover:bg-slate-900/90 bg-white/70 dark:bg-slate-900/60 shadow-sm'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          accept=".csv, .xlsx, .xls"
          className="hidden" 
          onChange={handleFileChange} 
        />

        {/* Ambient Icon Glow */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/25 mb-6 group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[22px] flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <UploadCloud className="w-10 h-10 stroke-[2.3]" />
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
          Drop your Settlement / Debit Note file here
        </h3>
        
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
          Accepts raw CSV or Excel (.xlsx) statements directly from Blinkit Partner Hub, Zepto Partner, or Swiggy Instamart.
        </p>

        <span className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-teal-700 px-6 py-3 rounded-2xl shadow-glow-emerald transition-all hover:scale-[1.02] active:scale-[0.98]">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Select Statement from Computer</span>
        </span>
      </div>

      {/* Helper Links */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
        <a
          href="/sample-50-settlements.csv"
          download="sample-50-settlements.csv"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 shadow-xs transition-all font-bold hover:scale-[1.02]"
        >
          <span>📥 Download 50-Row Test Dataset (CSV)</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
        </a>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        <p className="text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 inline" />
          <span>100% Client-side. Financial figures never touch a cloud server.</span>
        </p>
      </div>

    </div>
  );
};
