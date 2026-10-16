'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const PaywallModal: React.FC = () => {
  const { isPaywallModalOpen, paywallFeatureName, closePaywallModal } = useAuth();
  const router = useRouter();

  if (!isPaywallModalOpen) return null;

  const handleSelectPlan = (plan: 'starter' | 'growth') => {
    closePaywallModal();
    router.push('/pricing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-8 max-h-[92vh] overflow-y-auto transition-all mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closePaywallModal}
          className="absolute top-4 sm:top-5 right-4 sm:right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-md">
            <Lock className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>Subscription Required</span>
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
              Unlock {paywallFeatureName}
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
          Your free preview revealed recoverable deduction leakages. To export automated claim packages and dispute fees with Blinkit, Zepto, and Instamart, upgrade to a subscription.
        </p>

        {/* Plan Cards Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          
          {/* Starter Plan */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between hover:border-emerald-500 transition-all">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white">Starter</span>
                <span className="text-[10px] text-slate-400">8 audits/mo</span>
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white mb-2">
                ₹2,499 <span className="text-[10px] font-normal text-slate-400">/mo</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Excel Dispute Package</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Dispute Claim Emails</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>2 Platform Channels</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectPlan('starter')}
              className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition cursor-pointer"
            >
              Choose Starter
            </button>
          </div>

          {/* Growth Plan (Recommended) */}
          <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 flex flex-col justify-between shadow-md shadow-emerald-500/10">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400">Growth</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-white uppercase">Popular</span>
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white mb-2">
                ₹4,999 <span className="text-[10px] font-normal text-slate-400">/mo</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>All Platforms (Blinkit + Zepto)</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>40 Audits / Month</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Priority SLA Resolution</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectPlan('growth')}
              className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm cursor-pointer"
            >
              Choose Growth
            </button>
          </div>

        </div>

        <div className="mt-2 text-center">
          <Link
            href="/pricing"
            onClick={closePaywallModal}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center space-x-1"
          >
            <span>View complete plan breakdown and pricing table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
};
