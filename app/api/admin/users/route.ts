import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import requireAdmin from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json({ error: auth.message || 'unauthorized' }, { status: auth.status || 401 });

    const users = await prisma.user.findMany({ include: { wallets: true } });
    // load flags separately to avoid requiring a regenerated Prisma client in this workspace
    const userIds = users.map(u => u.id);
    const flags = userIds.length ? await (prisma as any).userFlag.findMany({ where: { userId: { in: userIds } } }) : [];
    const out = users.map(u => ({ id: u.id, email: u.email, kycStatus: (u as any).kycStatus ?? 'UNVERIFIED', profile: u.profile, roleId: u.roleId, wallets: (u as any).wallets ?? [], flags: flags.filter((f: any) => f.userId === u.id) }));
    return NextResponse.json({ data: out });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed', message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json({ error: auth.message || 'unauthorized' }, { status: auth.status || 401 });

    const body = (await req.json().catch(() => ({}))) as { userId?: string; action?: string; kycStatus?: string; freeze?: boolean; roleId?: number };
    const { userId, action } = body;
    if (!userId) return NextResponse.json({ error: 'missing_userId' }, { status: 400 });

    if (action === 'setKYC') {
      const kycStatus = body.kycStatus || 'UNVERIFIED';
      // use a raw update call to avoid Prisma client type mismatch in dev workspace
      const updated = await (prisma as any).user.update({ where: { id: userId }, data: { kycStatus } });
      await prisma.auditLog.create({ data: { actorId: null, actionType: 'ADMIN_SET_KYC', targetType: 'User', targetId: userId, payload: JSON.stringify({ kycStatus }) } });
      return NextResponse.json({ data: updated });
    }

    if (action === 'freeze') {
      // toggle frozen flag inside profile JSON string
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 });
      let profileObj: any = {};
      try { profileObj = user.profile ? JSON.parse(user.profile) : {}; } catch (e) { profileObj = {}; }
      profileObj.frozen = !!body.freeze;
      const updated = await prisma.user.update({ where: { id: userId }, data: { profile: JSON.stringify(profileObj) } });
      await prisma.auditLog.create({ data: { actorId: null, actionType: 'ADMIN_FREEZE_USER', targetType: 'User', targetId: userId, payload: JSON.stringify({ frozen: profileObj.frozen }) } });
      return NextResponse.json({ data: updated });
    }

    if (action === 'setRole') {
      const roleId = body.roleId;
      if (typeof roleId !== 'number') return NextResponse.json({ error: 'missing_roleId' }, { status: 400 });
      const updated = await prisma.user.update({ where: { id: userId }, data: { roleId } });
      await prisma.auditLog.create({ data: { actorId: null, actionType: 'ADMIN_SET_ROLE', targetType: 'User', targetId: userId, payload: JSON.stringify({ roleId }) } });
      return NextResponse.json({ data: updated });
    }

    return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed', message }, { status: 500 });
  }
}
// Note: GET implemented above at top of this file. PATCH handles admin actions.
