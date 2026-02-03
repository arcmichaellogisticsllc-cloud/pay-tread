import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import getUserFromReq from '../../../../lib/getUserFromReq';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const email = body.email || null;
    const roleName = body.role ?? 'CARRIER';

    if (!email) return NextResponse.json({ error: 'missing_email' }, { status: 400 });

    // ensure role exists
    let role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      role = await prisma.role.create({ data: { name: roleName } });
    }

    // create or return existing user - dev signup is idempotent
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email, roleId: role.id } });
      // ensure wallet exists
      await prisma.wallet.create({ data: { ownerId: user.id, balanceCents: 0, pendingCents: 0, clearedCents: 0 } });
    }

    // lightweight audit
    await prisma.auditLog.create({ data: { actorId: (await getUserFromReq(req))?.id ?? null, actionType: 'USER_SIGNUP', targetType: 'User', targetId: user.id, payload: JSON.stringify({ email }) } });

    return NextResponse.json({ data: { id: user.id, email: user.email, roleId: user.roleId } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'signup_failed', message }, { status: 500 });
  }
}
