'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function openRazorpayCheckout({
  planName,
  amount,
  priceDisplay,
  onSuccess,
  onError,
}: {
  planName: string;
  amount: number;
  priceDisplay: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (err: string) => void;
}) {
  const loadScript = () => {
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

  loadScript().then(async (loaded) => {
    if (!loaded) {
      if (onError) onError('Could not load Razorpay payment gateway.');
      return;
    }

    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName,
          amount,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.orderId) {
        if (onError) onError(orderData.error || 'Failed to initiate order');
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'AuditPay',
        description: `${planName} Plan Subscription (₹${priceDisplay}/mo)`,
        order_id: orderData.orderId,
        theme: {
          color: '#059669', // Emerald tone
        },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              if (onSuccess) onSuccess(response.razorpay_payment_id);
            } else {
              if (onError) onError(verifyData.error || 'Payment signature verification failed.');
            }
          } catch (e: any) {
            if (onError) onError(e?.message || 'Verification failed');
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      if (onError) onError(err?.message || 'Payment initiation failed');
    }
  });
}
