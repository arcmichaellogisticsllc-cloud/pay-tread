import { NextResponse } from 'next/server';
import prisma from '../../../../../../../lib/prisma';
import getUserFromReq from '../../../../../../../lib/getUserFromReq';

export async function POST(_req: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;
    if (!userId) return NextResponse.json({ error: 'missing_user' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 });

  const updated = await prisma.user.update({ where: { id: userId }, data: { kycStatus: 'VERIFIED' } });

  const actor = await getUserFromReq(_req);
  await prisma.auditLog.create({ data: { actorId: actor?.id ?? null, actionType: 'KYC_VERIFY', targetType: 'User', targetId: userId, payload: JSON.stringify({ by: actor?.email ?? null }) } });

  return NextResponse.json({ data: { id: updated.id, email: updated.email, kycStatus: updated.kycStatus } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_verify', message }, { status: 500 });
  }
}
