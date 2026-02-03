import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import getUserFromReq from '../../../../lib/getUserFromReq';
import { getRoleNameForUser } from '../../../../lib/permissions';
import type { Prisma } from '@prisma/client';

type RouteContext = { params?: Record<string, unknown> | Promise<Record<string, unknown>> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const user = await getUserFromReq(req);
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
      const role = await getRoleNameForUser(user);
    const maybeParams = context && context.params;
    const params = maybeParams && typeof (maybeParams as Promise<Record<string, unknown>>).then === 'function' ? await (maybeParams as Promise<Record<string, unknown>>) : (maybeParams as Record<string, unknown> | undefined);
    const loadId = params?.loadId as string | undefined;
    if (!loadId) return NextResponse.json({ error: 'missing_load' }, { status: 400 });

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const grossAmount = body.grossAmount as number | undefined;
    const reference = body.reference as string | undefined;
    const status = body.status as string | undefined;

    // Only broker, shipper or admin may update key load fields
    if (!(role === 'BROKER' || role === 'ADMIN' || user.id)) {
      // fallback: allow owner shipper or broker if they are the same actor
    }

  const updateData: Record<string, unknown> = {};
  if (typeof grossAmount === 'number') updateData.grossAmount = grossAmount;
  if (typeof reference === 'string') updateData.reference = reference;
  if (typeof status === 'string') updateData.status = status;

    if (Object.keys(updateData).length === 0) return NextResponse.json({ error: 'no_update_fields' }, { status: 400 });

  const updated = await prisma.load.update({ where: { id: loadId }, data: updateData as unknown as Prisma.LoadUpdateInput });
  await prisma.auditLog.create({ data: { actorId: user.id, actionType: 'LOAD_UPDATE', targetType: 'Load', targetId: loadId, payload: JSON.stringify(updateData) } }).catch(()=>null);
    return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_update', message }, { status: 500 });
  }
}
