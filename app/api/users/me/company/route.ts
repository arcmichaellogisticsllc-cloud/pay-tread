import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import getUserFromReq from '@/lib/getUserFromReq';

export async function GET(req: Request) {
  const user = await getUserFromReq(req);
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ data: { profile: dbUser.profile ? JSON.parse(dbUser.profile) : null } });
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromReq(req);
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    const body = await req.json().catch(() => ({} as any));
    const profile = body.profile ?? {};
    await prisma.user.update({ where: { id: user.id }, data: { profile: JSON.stringify(profile) } });
    await prisma.auditLog.create({ data: { actorId: user.id, actionType: 'UPDATE_PROFILE', targetType: 'User', targetId: user.id, payload: JSON.stringify({ profile }) } }).catch(()=>null);
    return NextResponse.json({ data: { profile } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_update', message }, { status: 500 });
  }
}
