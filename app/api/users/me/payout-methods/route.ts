import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import getUserFromReq from '@/lib/getUserFromReq';
import { logAccess } from '@/lib/accessLog';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const actor = await getUserFromReq(req);
    if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    const methods = await prisma.payoutMethod.findMany({
      where: { ownerId: actor.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: methods });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed', message }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const actor = await getUserFromReq(req);
    if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { type?: string; details?: any; last4?: string };
  const { type, details, last4 } = body;
    if (!type) return NextResponse.json({ error: 'missing_type' }, { status: 400 });

    // Sanitize sensitive fields (don't store raw PAN/CVV in dev DB)
    let detailsToStore: string | undefined = undefined;
    if (details && typeof details === 'object') {
      const copy = { ...details };
      // remove commonly sensitive fields
      for (const k of Object.keys(copy)) {
        if (/card|pan|cvv|cvc|security_code|number|expiry|exp|ssn/i.test(k)) {
          delete copy[k];
        }
      }
      detailsToStore = JSON.stringify(copy);
    } else if (details) {
      detailsToStore = String(details);
    }

    const created = await prisma.payoutMethod.create({ data: { ownerId: actor.id, type, details: detailsToStore, last4: last4 ?? null } });

    await prisma.auditLog.create({ data: { actorId: actor.id, actionType: 'PAYOUT_METHOD_ADD', targetType: 'User', targetId: actor.id, payload: JSON.stringify({ methodId: created.id, type }) } });
    // Access log
    await logAccess(actor.id, 'PAYOUT_METHOD_ADD', { payoutMethodId: created.id, type });

    return NextResponse.json({ data: created });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed', message }, { status: 500 });
  }
}
