import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

const ALLOWED = ['FLEET', 'OWNER_OPERATOR'];

export async function PATCH(req: Request, context: any) {
  try {
    const { userId } = (context && (context.params ?? {})) as any;
    if (!userId) return NextResponse.json({ error: 'missing_user' }, { status: 400 });
    const body = await req.json().catch(() => ({} as any));

    // fetch user with role
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 });

    const updates: any = {};
    if (body.carrierType !== undefined) {
      if (user.role?.name !== 'CARRIER') {
        return NextResponse.json({ error: 'invalid_role', message: 'carrierType only applicable to users with role CARRIER' }, { status: 400 });
      }
      if (!ALLOWED.includes(body.carrierType)) {
        return NextResponse.json({ error: 'invalid_carrier_type', message: `carrierType must be one of: ${ALLOWED.join(', ')}` }, { status: 400 });
      }
      updates.carrierType = body.carrierType;
    }

    // allow updating kycStatus via admin too
    if (body.kycStatus !== undefined) updates.kycStatus = body.kycStatus;

    // Ensure carriers have a carrierType set — require it on update if role is CARRIER
    if (user.role?.name === 'CARRIER') {
      const wouldBe = updates.carrierType ?? (user as any).carrierType ?? null;
      if (!wouldBe) {
        return NextResponse.json({ error: 'carrier_type_required', message: 'Users with role CARRIER must have carrierType set (FLEET or OWNER_OPERATOR)' }, { status: 400 });
      }
      if (!ALLOWED.includes(wouldBe)) {
        return NextResponse.json({ error: 'invalid_carrier_type', message: `carrierType must be one of: ${ALLOWED.join(', ')}` }, { status: 400 });
      }
    }

    if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 });

  const updated = await prisma.user.update({ where: { id: userId }, data: updates });
  // audit
  await prisma.auditLog.create({ data: { actorId: null, actionType: 'ADMIN_USER_UPDATE', targetType: 'User', targetId: userId, payload: JSON.stringify(updates) } });
  return NextResponse.json({ data: { id: updated.id, email: updated.email, carrierType: (updated as any).carrierType ?? null, kycStatus: (updated as any).kycStatus } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_update', message }, { status: 500 });
  }
}
