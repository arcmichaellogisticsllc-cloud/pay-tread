import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import getUserFromReq from '../../../../../lib/getUserFromReq';
import { canViewLoad } from '../../../../../lib/permissions';

export async function POST(req: Request, context: any) {
  try {
    const { loadId } = (context && (context.params ?? {})) as any;
    if (!loadId) return NextResponse.json({ error: 'missing_load' }, { status: 400 });

    const body = await req.json().catch(() => ({} as any));
    const { status, note } = body;
    if (!status) return NextResponse.json({ error: 'missing_status' }, { status: 400 });

    const load = await prisma.load.findUnique({ where: { id: loadId } });
    if (!load) return NextResponse.json({ error: 'load_not_found' }, { status: 404 });

  // Ensure actor is a participant or admin
  const user = await getUserFromReq(req);
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const canView = await canViewLoad(user, load);
  if (!canView) return NextResponse.json({ error: 'forbidden', message: 'not authorized to update status' }, { status: 403 });

  const updated = await prisma.load.update({ where: { id: loadId }, data: { status } });

    // Notify broker/shipper if present
    const notifyTo = load.brokerId ?? load.shipperId ?? null;
    if (notifyTo) {
      await prisma.notification.create({ data: { forUserId: notifyTo, type: 'LOAD_STATUS_CHANGED', message: `Load ${load.reference ?? load.externalRef ?? load.id} status changed to ${status}`, link: `/loads/${load.id}`, } });
    }

  // Record audit entry (capture actor)
  await prisma.auditLog.create({ data: { actorId: user?.id ?? null, actionType: 'LOAD_STATUS_UPDATE', targetType: 'Load', targetId: loadId, payload: JSON.stringify({ status, note }), } });

    return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_update_status', message }, { status: 500 });
  }
}
