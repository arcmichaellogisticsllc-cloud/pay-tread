import { NextResponse } from 'next/server';
import prisma from '../../../../../../../lib/prisma';
import getUserFromReq from '../../../../../../../lib/getUserFromReq';
import type { User } from '@prisma/client';

type RouteContext = { params?: Record<string, unknown> | Promise<Record<string, unknown>> };

export async function POST(_req: Request, context: RouteContext) {
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

    // If the User model doesn't contain a kycStatus field in this schema, persist a UserFlag instead.
    const actor = await getUserFromReq(_req);
    const flag = await prisma.userFlag.create({ data: { userId, type: 'KYC_VERIFIED', reason: 'admin_verified', createdBy: actor?.id ?? null } }).catch(() => null);
    await prisma.auditLog.create({ data: { actorId: actor?.id ?? null, actionType: 'KYC_VERIFY', targetType: 'User', targetId: userId, payload: JSON.stringify({ by: actor?.email ?? null }) } });

    return NextResponse.json({ data: { id: userId, verifiedFlagId: flag?.id ?? null } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_verify', message }, { status: 500 });
  }
}
