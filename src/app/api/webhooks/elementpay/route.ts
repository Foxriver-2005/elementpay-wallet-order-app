import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import crypto from 'crypto';
import { webhookStore } from '@/lib/webhookStore';

const FIVE_MINUTES = 300; // seconds

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signatureHeader = req.headers.get('x-webhook-signature');

  if (!signatureHeader) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 });
  }

  const [timestampPart, sigPart] = signatureHeader.split(',');

  const t = timestampPart?.split('=')[1];
  const v1 = sigPart?.split('=')[1];

  if (!t || !v1) {
    return NextResponse.json({ error: 'invalid_signature_format' }, { status: 400 });
  }

  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(t, 10);

  if (Math.abs(now - ts) > FIVE_MINUTES) {
    return NextResponse.json({ error: 'signature_expired' }, { status: 401 });
  }

  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'missing_secret' }, { status: 500 });
  }

  const message = `${t}.${rawBody}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(message);
  const expectedSig = hmac.digest('base64');

  const valid = crypto.timingSafeEqual(
    Buffer.from(expectedSig),
    Buffer.from(v1)
  );

  if (!valid) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 403 });
  }

  // Webhook is verified
  const body = JSON.parse(rawBody);
  console.log('Valid webhook received:', body);

  const { order_id, status } = body.data;
    if (status === 'settled' || status === 'failed') {
    webhookStore.save(order_id, status);
    }

  return NextResponse.json({ success: true });
}
