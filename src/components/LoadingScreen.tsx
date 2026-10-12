'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

interface LoadingScreenProps {
  onFinish: () => void;
  fileName?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinish, fileName }) => {
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Parsing settlement lines & verifying file integrity...',
    'Matching debit note IDs against platform catalogs...',
    'Scanning for duplicate deductions across billing cycles...',
    'Cross-referencing RTV & damage claims...',
    'Calculating total recoverable leakage amount...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            onFinish();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, [onFinish]);

  const progressPercent = Math.round(((10 - secondsLeft) / 10) * 100);

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 flex flex-col items-center justify-center text-center">
      
      {/* Animated Glowing Spinner */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin stroke-[2]" />
        </div>
      </div>

      {/* Main Label */}
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-3">
        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
        <span>Fetching Data ({secondsLeft}s)</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
        Fetching Data...
      </h2>

      <p className="text-sm text-slate-600 max-w-md mb-6">
        {steps[currentStep]}
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-md bg-slate-200 rounded-full h-2.5 overflow-hidden mb-4 shadow-inner">
        <div 
          className="bg-gradient-to-r from-emerald-600 to-teal-500 h-2.5 rounded-full transition-all duration-1000 ease-linear shadow-sm"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between w-full max-w-md text-xs text-slate-500">
        <span>Processing {fileName || 'statement'}</span>
        <span className="font-mono text-emerald-700 font-bold">{progressPercent}%</span>
      </div>

      {/* Security note */}
      <div className="mt-12 text-xs text-slate-500 flex items-center space-x-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />
        <span>Local reconciliation engine executing in memory</span>
      </div>

    </div>
  );
};
