import { NextResponse } from 'next/server';
import { getRazorpay } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planName, amount, customerEmail, customerPhone } = body;

    if (!planName || !amount) {
      return NextResponse.json(
        { error: 'Plan name and amount are required' },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Razorpay keys are missing from server configuration' },
        { status: 500 }
      );
    }

    const razorpay = getRazorpay();

    // Amount in Razorpay is in paise (₹1 = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);
    const receiptId = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        plan: planName,
        customerEmail: customerEmail || 'guest@d2cbrand.com',
        customerPhone: customerPhone || '',
        platform: 'AuditPay',
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to create Razorpay order',
      },
      { status: 500 }
    );
  }
}
