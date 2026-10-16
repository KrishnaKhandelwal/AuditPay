import { NextResponse, type NextRequest } from 'next/server';
import { getCashfree } from '@/lib/cashfree';

export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!appId || !secretKey) {
      return NextResponse.json({
        mock: true,
        orderId,
        orderStatus: 'PAID',
        paymentMessage: 'Test simulated successful verification',
      });
    }

    const cashfree = getCashfree();
    const response = await cashfree.PGOrderFetchPayments(orderId);

    return NextResponse.json({
      success: true,
      orderId,
      payments: response.data,
    });
  } catch (error: any) {
    console.error('Cashfree order verification error:', error?.response?.data || error);
    return NextResponse.json(
      { error: error?.response?.data?.message || error?.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
