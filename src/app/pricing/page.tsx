'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Check, Building2, HelpCircle, Zap, ShieldCheck } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { openRazorpayCheckout } from '@/lib/razorpayCheckout';
import { useAuth, PlanType } from '@/context/AuthContext';

export default function PricingPage() {
  const [successPaymentId, setSuccessPaymentId] = useState<string | null>(null);
  const [activePlanName, setActivePlanName] = useState<string | null>(null);
  const { user, upgradePlan } = useAuth();
  const router = useRouter();

  const plans = [
    {
      name: 'Starter',
      planKey: 'starter' as PlanType,
      badge: 'Emerging D2C Brands',
      price: '2,499',
      amount: 2499,
      period: 'per month',
      description: 'Ideal for early-stage brands looking to stop silent deduction leakages on their top channels.',
      platformsLimit: '2 Platforms (Blinkit / Zepto / Instamart or any marketplace)',
      auditsLimit: '8 Audits / month',
      features: [
        'Automated RTV & Phantom Return Matching',
        'Duplicate Debit Note Radar',
        'Discrepancy Line-Item Audit Table',
        'Excel Dispute Package Export',
        'Official SLA Dispute Email Generator',
        'Standard Email Support',
      ],
      buttonText: 'Get Started with Starter',
      buttonStyle: 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 shadow-2xs',
      popular: false,
    },
    {
      name: 'Growth',
      planKey: 'growth' as PlanType,
      badge: 'Most Popular',
      price: '4,999',
      amount: 4999,
      period: 'per month',
      description: 'Comprehensive deduction defense across all major quick-commerce partner networks.',
      platformsLimit: 'All Platforms (Blinkit + Zepto + Instamart & Marketplaces)',
      auditsLimit: '40 Audits / month',
      features: [
        'Everything in Starter',
        'Multi-Platform Cross-Reconciliation',
        'Advanced Dark-Store City Breakdown',
        'Unapproved Co-Op Ad Offset Detection',
        'Short Inward vs Gate Entry Verification',
        'Priority Partner SLA Resolution Desk',
        'Dedicated WhatsApp Support for KAMs',
      ],
      buttonText: 'Claim Growth Plan',
      buttonStyle: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20',
      popular: true,
    },
    {
      name: 'Enterprise',
      planKey: 'enterprise' as PlanType,
      badge: 'High-Volume & Agencies',
      price: '14,999',
      amount: 14999,
      period: 'per month',
      description: 'For high-scale FMCG brands, multi-brand aggregators, and 3PL fulfillment agencies.',
      platformsLimit: 'All Platforms + Custom 3PL / ERP Integrations',
      auditsLimit: 'Unlimited Audits',
      features: [
        'Everything in Growth',
        'Unlimited Statement Uploads & Audits',
        'Multi-Brand / Multi-Entity Management',
        'Custom Warehouse & ERP Column Parsers',
        'Automated Monthly Payout Audit Summary Dossier',
        'Quarterly Platform Penalty Audit Consultation',
        'Dedicated Account Manager & Phone Support',
      ],
      buttonText: 'Choose Enterprise',
      buttonStyle: 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-800 dark:border-slate-700 shadow-xs',
      popular: false,
    },
  ];

  const handleTestActivation = (planName: string, planKey: PlanType) => {
    upgradePlan(planKey);
    setActivePlanName(planName);
    setSuccessPaymentId('test_sub_' + Math.random().toString(36).substring(2, 9));
  };

  return (
    <div className="min-h-screen bg-subtle-canvas text-slate-800 dark:text-slate-100 flex flex-col selection:bg-emerald-500/10 transition-colors duration-200">
      
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#ECFDF5] dark:bg-emerald-950/50 border border-[#A7F3D0] dark:border-emerald-800/60 text-[#065F46] dark:text-emerald-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Transparent, High-ROI Plans</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Stop Margin Erosion. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
              Recover Lost Cash in Week 1.
            </span>
          </h1>

          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Choose a plan tailored to your sales volume. Recover thousands in disputed deductions with ready-to-submit claim dossiers.
          </p>

          {/* Current Plan Indicator if logged in */}
          {user && (
            <div className="mt-4 inline-flex items-center space-x-2 px-3.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span>Your Active Plan:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 uppercase font-black">{user.plan}</strong>
              <span>•</span>
              <span>{user.auditsUsedThisMonth} of {user.auditsLimit === 999 ? '∞' : user.auditsLimit} audits used</span>
            </div>
          )}
        </div>

        {/* 3-Tier Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 items-stretch">
          {plans.map((plan) => {
            const isCurrentPlan = user?.plan === plan.planKey;

            return (
              <div
                key={plan.name}
                className={`rounded-3xl p-7 flex flex-col justify-between transition-all relative ${
                  plan.popular
                    ? 'bg-white dark:bg-slate-900 border-2 border-emerald-500 dark:border-emerald-500 shadow-xl shadow-emerald-500/10 lg:-translate-y-2'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-lg dark:hover:border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                    Recommended
                  </div>
                )}

                <div>
                  {/* Plan Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      plan.popular
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[36px] mb-5 leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Price Display */}
                  <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-xl font-bold text-slate-600 dark:text-slate-400">₹</span>
                      <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{plan.price}</span>
                      <span className="text-xs text-slate-400 font-medium ml-1.5">/ month</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                      Direct invoice expensable with corporate GST credit
                    </p>
                  </div>

                  {/* Highlighted Limits Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 mb-6 space-y-2">
                    <div className="text-xs">
                      <span className="text-slate-400 font-medium block">Platform Coverage:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{plan.platformsLimit}</strong>
                    </div>
                    <div className="text-xs pt-1.5 border-t border-slate-200/50 dark:border-slate-800">
                      <span className="text-slate-400 font-medium block">Auditing Capacity:</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{plan.auditsLimit}</strong>
                    </div>
                  </div>

                  {/* Feature Bullet Points */}
                  <div className="space-y-3 mb-8">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">
                      What&apos;s Included:
                    </span>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </div>
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div>
                  <button
                    disabled={isCurrentPlan}
                    onClick={() => {
                      openRazorpayCheckout({
                        planName: plan.name,
                        amount: plan.amount,
                        priceDisplay: plan.price,
                        onSuccess: (paymentId) => {
                          upgradePlan(plan.planKey);
                          setActivePlanName(plan.name);
                          setSuccessPaymentId(paymentId);
                        },
                        onError: (err) => {
                          alert(`Razorpay checkout notice: ${err}\n\nTip: You can use the '⚡ Test / Activate Instantly' button below for quick sandbox activation.`);
                        },
                      });
                    }}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                      isCurrentPlan 
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : plan.buttonStyle
                    }`}
                  >
                    {isCurrentPlan ? '✓ Current Active Plan' : plan.buttonText}
                  </button>

                  {/* Instant Test Mode button */}
                  {!isCurrentPlan && (
                    <button
                      type="button"
                      onClick={() => handleTestActivation(plan.name, plan.planKey)}
                      className="w-full text-center py-2 text-[11px] text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold transition cursor-pointer mt-1"
                    >
                      ⚡ Test / Activate Instantly (Sandbox)
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-950/50">
        <p>AuditPay • Protect Quick-Commerce Payouts & Recover Deduction Leakage for Indian Brands.</p>
      </footer>

      {/* Payment Success Confirmation Popup */}
      {successPaymentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Subscription Activated!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You are now subscribed to the <span className="font-bold text-slate-800 dark:text-slate-200">{activePlanName}</span> Plan.
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Reference ID: {successPaymentId}
              </p>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 p-2.5 rounded-xl">
              Audit quota is refreshed. All line items, Excel dispute packages, and email generators are now unlocked.
            </p>
            <button
              onClick={() => {
                setSuccessPaymentId(null);
                router.push('/');
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
            >
              Back to Audit Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
