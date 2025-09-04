import { NextRequest, NextResponse } from 'next/server';
import { webhookStore } from '@/lib/webhookStore';

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('id');
  if (!orderId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const data = webhookStore.get(orderId);
  if (!data) {
    return NextResponse.json({ status: 'unknown' });
  }

  return NextResponse.json({ status: data.status });
}
