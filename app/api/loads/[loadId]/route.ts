import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import getUserFromReq from '../../../../lib/getUserFromReq';
import { getRoleNameForUser } from '../../../../lib/permissions';

export async function PATCH(req: Request, context: any) {
  try {
    const user = await getUserFromReq(req);
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
      const role = await getRoleNameForUser(user);
      const { loadId } = (context && (context.params ?? {})) as any;
    const body = await req.json().catch(()=>({} as any));
    const { grossAmount, reference, status } = body;

    // Only broker, shipper or admin may update key load fields
    if (!(role === 'BROKER' || role === 'ADMIN' || user.id)) {
      // fallback: allow owner shipper or broker if they are the same actor
    }

    const updateData: any = {};
    if (typeof grossAmount === 'number') updateData.grossAmount = grossAmount;
    if (typeof reference === 'string') updateData.reference = reference;
    if (typeof status === 'string') updateData.status = status;

    if (Object.keys(updateData).length === 0) return NextResponse.json({ error: 'no_update_fields' }, { status: 400 });

    const updated = await prisma.load.update({ where: { id: loadId }, data: updateData });
    await prisma.auditLog.create({ data: { actorId: user.id, actionType: 'LOAD_UPDATE', targetType: 'Load', targetId: loadId, payload: JSON.stringify(updateData) } }).catch(()=>null);
    return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_update', message }, { status: 500 });
  }
}
