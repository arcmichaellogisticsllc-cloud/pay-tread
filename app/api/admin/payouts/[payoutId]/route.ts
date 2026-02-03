import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import requireAdmin from '@/lib/adminAuth';
import worker from '@/lib/worker/payments';

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json({ error: auth.message || 'unauthorized' }, { status: auth.status || 401 });

    const payoutId = String(req.nextUrl.pathname.split('/').pop());
    const body = (await req.json().catch(() => ({}))) as { action?: string; status?: string; note?: string };
    const { action } = body;
    const payout = await prisma.payout.findUnique({ where: { id: payoutId } });
    if (!payout) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    if (action === 'freeze') {
      const updated = await prisma.payout.update({ where: { id: payoutId }, data: { status: 'FROZEN' } });
      await prisma.auditLog.create({ data: { actorId: null, actionType: 'ADMIN_PAYOUT_FREEZE', targetType: 'Payout', targetId: payoutId, payload: JSON.stringify({ previous: payout.status }) } });
      return NextResponse.json({ data: updated });
    }

    if (action === 'unfreeze') {
      const updated = await prisma.payout.update({ where: { id: payoutId }, data: { status: 'REQUESTED' } });
      await prisma.auditLog.create({ data: { actorId: null, actionType: 'ADMIN_PAYOUT_UNFREEZE', targetType: 'Payout', targetId: payoutId, payload: JSON.stringify({ previous: payout.status }) } });
      return NextResponse.json({ data: updated });
    }

    if (action === 'retry') {
      // enqueue for retry in the dev worker
      try {
        worker.enqueuePayoutForSettlement(payoutId);
        await prisma.auditLog.create({ data: { actorId: null, actionType: 'ADMIN_PAYOUT_RETRY', targetType: 'Payout', targetId: payoutId, payload: JSON.stringify({ previous: payout.status }) } });
        return NextResponse.json({ data: { ok: true } });
      } catch (e) {
        return NextResponse.json({ error: 'enqueue_failed' }, { status: 500 });
      }
    }

    if (action === 'set_status' && body.status) {
      const updated = await prisma.payout.update({ where: { id: payoutId }, data: { status: body.status } });
      await prisma.auditLog.create({ data: { actorId: null, actionType: 'ADMIN_PAYOUT_SET_STATUS', targetType: 'Payout', targetId: payoutId, payload: JSON.stringify({ previous: payout.status, status: body.status, note: body.note }) } });
      return NextResponse.json({ data: updated });
    }

    return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed', message }, { status: 500 });
  }
}
