import { NextResponse } from 'next/server';
import prisma from '../../../../../../../lib/prisma';
import getUserFromReq from '../../../../../../../lib/getUserFromReq';

export async function POST(_req: Request, context: any) {
  try {
    // context.params may be a Promise in the App Router dev/runtime — unwrap if needed
    let userId: string | undefined = undefined;
    if (context && context.params) {
      const maybeParams = context.params as any;
      const params = (maybeParams && typeof maybeParams.then === 'function') ? await maybeParams : maybeParams;
      userId = params?.userId;
    }
    // fallback to query param if not present
    if (!userId) userId = new URL(_req.url).searchParams.get('userId') ?? undefined;
    if (!userId) return NextResponse.json({ error: 'missing_user' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 });

  const updated = await (prisma as any).user.update({ where: { id: userId }, data: { kycStatus: 'VERIFIED' } });

  const actor = await getUserFromReq(_req);
  await prisma.auditLog.create({ data: { actorId: actor?.id ?? null, actionType: 'KYC_VERIFY', targetType: 'User', targetId: userId, payload: JSON.stringify({ by: actor?.email ?? null }) } });

  return NextResponse.json({ data: { id: (updated as any).id, email: (updated as any).email, kycStatus: (updated as any).kycStatus } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_verify', message }, { status: 500 });
  }
}
