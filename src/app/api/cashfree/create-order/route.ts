import { NextResponse } from 'next/server';
import { getCashfree } from '@/lib/cashfree';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planName, amount, customerPhone, customerEmail, customerName } = body;

    if (!planName || !amount) {
      return NextResponse.json(
        { error: 'Plan name and amount are required' },
        { status: 400 }
      );
    }

    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const cleanPhone = (customerPhone || '9999999999').replace(/[^0-9]/g, '').slice(-10) || '9999999999';
    const cleanEmail = customerEmail || 'billing@d2cbrand.com';
    const cleanName = customerName || 'D2C Merchant';

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    // If keys are not yet configured in .env.local, return a friendly informative response
    if (!appId || !secretKey) {
      return NextResponse.json({
        mock: true,
        message: 'Cashfree credentials not configured yet in .env.local',
        orderId,
        orderAmount: amount,
        planName,
        paymentSessionId: `mock_session_${orderId}`,
      });
    }

    const cashfree = getCashfree();

    const orderRequest = {
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id: `CUST_${cleanPhone}`,
        customer_phone: cleanPhone,
        customer_email: cleanEmail,
        customer_name: cleanName,
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?order_id={order_id}&status=success`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cashfree/webhook`,
        payment_methods: 'cc,dc,upi,nb,wallet',
      },
      order_note: `Subscription plan: ${planName} • AuditPay`,
    };

    // Cashfree PG createOrder
    const response = await cashfree.PGCreateOrder(orderRequest);
    const data = response.data;

    return NextResponse.json({
      success: true,
      orderId: data.order_id,
      paymentSessionId: data.payment_session_id,
      orderStatus: data.order_status,
    });
  } catch (error: any) {
    console.error('Cashfree order creation error:', error?.response?.data || error);
    return NextResponse.json(
      {
        error: error?.response?.data?.message || error?.message || 'Failed to initialize Cashfree payment',
      },
      { status: 500 }
    );
  }
}
