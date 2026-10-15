'use client';

import React, { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, X, ShieldCheck, Zap } from 'lucide-react';

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

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ paymentId: string; planName: string } | null>(null);

  if (!isOpen || !plan) return null;

  // Dynamically load Razorpay standard checkout script if not present
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // 1. Ensure checkout.js is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Unable to connect to Razorpay checkout gateway. Please check your internet connection.');
      }

      // 2. Create order on Next.js backend
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: plan.name,
          amount: plan.amount,
          customerName: customerName.trim() || 'D2C Merchant',
          customerEmail: customerEmail.trim() || 'billing@brand.com',
          customerPhone: customerPhone.trim() || '9999999999',
        }),
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.orderId) {
        throw new Error(orderData.error || 'Failed to initialize payment order');
      }

      // 3. Open Razorpay in-app modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'AuditPay',
        description: `${plan.name} Plan Subscription`,
        order_id: orderData.orderId,
        prefill: {
          name: customerName.trim() || 'D2C Merchant',
          email: customerEmail.trim() || 'finance@brand.com',
          contact: customerPhone.trim() || '9999999999',
        },
        theme: {
          color: '#059669', // Emerald brand tone
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          // 4. Verify payment signature on backend
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setSuccessInfo({
                paymentId: response.razorpay_payment_id,
                planName: plan.name,
              });
            } else {
              setErrorMsg(verifyData.error || 'Payment signature could not be verified.');
            }
          } catch (err: any) {
            setErrorMsg(err.message || 'Verification request failed');
          } finally {
            setLoading(false);
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      setErrorMsg(err.message || 'Something went wrong while initiating payment.');
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
              <h3 className="font-bold text-sm tracking-wide">Razorpay Secure Checkout</h3>
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
                <h4 className="text-lg font-extrabold text-slate-900">Payment Successful!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  You are now subscribed to the <span className="font-bold text-slate-800">{successInfo.planName}</span> Plan.
                </p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Payment ID: {successInfo.paymentId}
                </p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-medium text-[11px]">Audit capacity active for 30 days. Corporate tax invoice sent to email.</span>
              </div>

              <button
                onClick={() => {
                  setSuccessInfo(null);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
              >
                Back to Auditor
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email (for Invoices & Quota)</label>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (UPI / Receipts)</label>
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
                <span>Supports PhonePe, GPay, Paytm, Cards & NetBanking</span>
                <span className="font-semibold text-emerald-700">Live Secure</span>
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
                    <span>Connecting to Razorpay...</span>
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
