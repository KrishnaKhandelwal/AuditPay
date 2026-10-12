'use client';

import React, { useState } from 'react';
import { load } from '@cashfreepayments/cashfree-js';
import { Loader2, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    name: string;
    price: string;
    amount: number;
    auditsLimit: string;
    platformsLimit: string;
  } | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ orderId: string; planName: string } | null>(null);

  if (!isOpen || !plan) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // 1. Call our Next.js API route to create the Cashfree order
      const res = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: plan.name,
          amount: plan.amount,
          customerName: customerName.trim() || 'D2C Merchant',
          customerEmail: customerEmail.trim() || 'billing@d2cbrand.com',
          customerPhone: customerPhone.trim() || '9999999999',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // If in sandbox mode without API keys, simulate successful flow & guide user
      if (data.mock) {
        setSuccessInfo({
          orderId: data.orderId,
          planName: plan.name,
        });
        setLoading(false);
        return;
      }

      // 2. Initialize Cashfree JS SDK
      const cashfreeEnv = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
      const cashfree = await load({
        mode: cashfreeEnv,
      });

      if (!cashfree) {
        throw new Error('Could not load Cashfree checkout SDK');
      }

      // 3. Launch Checkout Drop-in / Modal
      const checkoutOptions = {
        paymentSessionId: data.paymentSessionId,
        redirectTarget: '_modal' as const, // opens Cashfree overlay modal
      };

      await cashfree.checkout(checkoutOptions);
    } catch (err: any) {
      console.error('Payment error:', err);
      setErrorMsg(err.message || 'Something went wrong while initiating payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">Secure Cashfree Checkout</h3>
              <p className="text-[11px] text-emerald-100">AuditPay Subscription</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successInfo ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-slate-900">Order Initiated Successfully!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Plan: <span className="font-bold text-slate-800">{successInfo.planName}</span> (₹{plan.price})
                </p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">Order ID: {successInfo.orderId}</p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-800 space-y-1">
                <p className="font-bold">Sandbox Mode Activated:</p>
                <p className="text-[11px] leading-relaxed">
                  To accept real UPI/Card payments, provide your `CASHFREE_APP_ID` and `CASHFREE_SECRET_KEY` in <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[10px]">.env.local</code>.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-4">
              {/* Selected Plan Summary Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Selected Tier</span>
                  <h4 className="text-base font-extrabold text-slate-900">{plan.name} Plan</h4>
                  <p className="text-xs text-slate-500">{plan.auditsLimit}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">₹{plan.price}</span>
                  <span className="text-[11px] text-slate-400 block font-medium">/ month</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Billing Info Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand / Contact Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar (Acme Foods)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email (for Tax Invoices)</label>
                  <input
                    type="email"
                    required
                    placeholder="finance@brand.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (UPI / OTP)</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      placeholder="9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-r-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods Info */}
              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
                <span>Supports UPI, NetBanking, Cards, & EMI</span>
                <span className="font-semibold text-emerald-700">100% Encrypted</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Cashfree...</span>
                  </>
                ) : (
                  <span>Proceed to Pay ₹{plan.price}</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
