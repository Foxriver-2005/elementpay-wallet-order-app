import { NextRequest, NextResponse } from 'next/server';
import { orders } from '../create/route';

export async function GET(
  req: NextRequest,
  context: { params: { order_id: string } }
) {
  const { order_id } = context.params;

  if (!orders.has(order_id)) {
    return NextResponse.json(
      { error: 'order_not_found', message: `No order with id ${order_id}` },
      { status: 404 }
    );
  }

  const order = orders.get(order_id)!;
  const createdAt = new Date(order.created_at).getTime();
  const now = Date.now();
  const elapsedSeconds = Math.floor((now - createdAt) / 1000);

  let status: 'created' | 'processing' | 'settled' | 'failed' = 'created';

  if (elapsedSeconds < 8) {
    status = 'created';
  } else if (elapsedSeconds < 18) {
    status = 'processing';
  } else {
    // After 18 seconds, settled 80%, failed 20%
    if (order.status === 'created' || order.status === 'processing') {
      const finalStatus = Math.random() < 0.8 ? 'settled' : 'failed';
      order.status = finalStatus;
      orders.set(order_id, order);
    }
    status = order.status;
  }

  return NextResponse.json({
    order_id: order.order_id,
    status,
    amount: order.amount,
    currency: order.currency,
    token: order.token,
    created_at: order.created_at,
  });
}
