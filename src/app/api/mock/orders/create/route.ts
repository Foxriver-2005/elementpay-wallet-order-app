import { NextRequest, NextResponse } from 'next/server';

type Order = {
  order_id: string;
  status: 'created' | 'processing' | 'settled' | 'failed';
  amount: number;
  currency: string;
  token: string;
  note?: string;
  created_at: string;
};

// In-memory store
const orders = new Map<string, Order>();

// Helper to generate order ID
function generateOrderId(): string {
  return `ord_${Math.random().toString(16).slice(2, 10)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { amount, currency, token, note } = body;

    if (
      typeof amount !== 'number' ||
      amount <= 0 ||
      typeof currency !== 'string' ||
      typeof token !== 'string'
    ) {
      return NextResponse.json(
        { error: 'invalid_request', message: 'Invalid order parameters' },
        { status: 400 }
      );
    }

    const order_id = generateOrderId();
    const created_at = new Date().toISOString();

    const order: Order = {
      order_id,
      status: 'created',
      amount,
      currency,
      token,
      note,
      created_at,
    };

    orders.set(order_id, order);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'server_error', message: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export { orders };
