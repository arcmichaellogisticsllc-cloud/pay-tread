import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import getUserFromReq from '../../../../../lib/getUserFromReq';

export async function POST(req: Request, { params }: { params: { loadId: string } }) {
  try {
    const { loadId } = params;
    const body = await req.json().catch(() => ({} as any));
    const { carrierEmail } = body;
    if (!loadId) return NextResponse.json({ error: 'missing_load' }, { status: 400 });
    if (!carrierEmail) return NextResponse.json({ error: 'missing_carrier_email' }, { status: 400 });

    const carrier = await prisma.user.findUnique({ where: { email: carrierEmail } });
    if (!carrier) return NextResponse.json({ error: 'carrier_not_found' }, { status: 404 });

  const user = await getUserFromReq(req);
  const actorId = user?.id ?? null;

  const updated = await prisma.load.update({ where: { id: loadId }, data: { carrierId: carrier.id, status: 'ASSIGNED' } });

  // create a notification for carrier
  await prisma.notification.create({ data: { forUserId: carrier.id, type: 'LOAD_ASSIGNED', message: `You were assigned to load ${updated.reference ?? updated.externalRef ?? updated.id}`, link: `/loads/${updated.id}`, } });

  // audit
  await prisma.auditLog.create({ data: { actorId: actorId, actionType: 'LOAD_ASSIGN', targetType: 'Load', targetId: loadId, payload: JSON.stringify({ carrierId: carrier.id }) } });

  return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_assign', message }, { status: 500 });
  }
}
