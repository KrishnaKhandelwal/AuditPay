'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Check, Building2, HelpCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { openRazorpayCheckout } from '@/lib/razorpayCheckout';

export default function PricingPage() {
  const [successPaymentId, setSuccessPaymentId] = useState<string | null>(null);
  const [activePlanName, setActivePlanName] = useState<string | null>(null);

  const plans = [
    {
      name: 'Starter',
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
      buttonStyle: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs',
      popular: false,
    },
    {
      name: 'Growth',
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
      buttonStyle: 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-subtle-canvas text-slate-800 flex flex-col selection:bg-emerald-500/10">
      
      {/* Navigation Header with Home, Dashboard (if hasData), and Pricing */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Transparent, High-ROI Plans</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Stop Margin Erosion. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              Recover Lost Cash in Week 1.
            </span>
          </h1>

          <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Choose a plan tailored to your sales volume. Recover thousands in disputed deductions with ready-to-submit claim dossiers.
          </p>
        </div>

        {/* 3-Tier Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-7 flex flex-col justify-between transition-all relative ${
                plan.popular
                  ? 'bg-white border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 lg:-translate-y-2'
                  : 'bg-white border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-lg'
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
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    plan.popular
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {plan.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-500 min-h-[36px] mb-5 leading-relaxed">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xl font-bold text-slate-600">₹</span>
                    <span className="text-4xl font-black text-slate-900 tracking-tight">{plan.price}</span>
                    <span className="text-xs text-slate-400 font-medium ml-1.5">/ month</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                    Direct invoice expensable with corporate GST credit
                  </p>
                </div>

                {/* Highlighted Limits Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mb-6 space-y-2">
                  <div className="text-xs">
                    <span className="text-slate-400 font-medium block">Platform Coverage:</span>
                    <strong className="text-slate-800 font-semibold">{plan.platformsLimit}</strong>
                  </div>
                  <div className="text-xs pt-1.5 border-t border-slate-200/50">
                    <span className="text-slate-400 font-medium block">Auditing Capacity:</span>
                    <strong className="text-emerald-700 font-bold">{plan.auditsLimit}</strong>
                  </div>
                </div>

                {/* Feature Bullet Points */}
                <div className="space-y-3 mb-8">
                  <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">
                    What&apos;s Included:
                  </span>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-600">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  openRazorpayCheckout({
                    planName: plan.name,
                    amount: plan.amount,
                    priceDisplay: plan.price,
                    onSuccess: (paymentId) => {
                      setActivePlanName(plan.name);
                      setSuccessPaymentId(paymentId);
                    },
                    onError: (err) => {
                      alert(`Payment notice: ${err}`);
                    },
                  });
                }}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Custom Assistance & Enterprise Help CTA Block */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-700/60">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Building2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-base font-bold text-white">Need a Custom Setup or Multi-Brand Audit?</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Dedicated Support
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Managing high volume dark stores, multiple corporate GSTINs, or custom ERP warehouse exports? Talk with our quick-commerce reconciliation specialists.
              </p>
            </div>
          </div>

          <a
            href="mailto:support@auditpay.in?subject=Custom%20Enterprise%20Audit%20Inquiry"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-900 shadow-md whitespace-nowrap transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Talk to an Audit Specialist</span>
          </a>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 py-6 text-center text-xs text-slate-400 bg-white">
        <p>AuditPay • Protect Quick-Commerce Payouts & Recover Deduction Leakage for Indian Brands.</p>
      </footer>

      {/* Payment Success Confirmation Popup */}
      {successPaymentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Subscription Activated!</h3>
              <p className="text-xs text-slate-500 mt-1">
                You are now subscribed to the <span className="font-bold text-slate-800">{activePlanName}</span> Plan.
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Payment ID: {successPaymentId}
              </p>
            </div>
            <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl">
              Audit quota is active for 30 days. GST invoice sent to your email.
            </p>
            <button
              onClick={() => setSuccessPaymentId(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
            >
              Continue to Auditor
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
