import prisma from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = req.headers.get('x-user-email') || url.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'missing_user' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 });

  const notifs = await prisma.notification.findMany({ where: { forUserId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 });
  return NextResponse.json({ data: notifs });
}

export async function POST(req: Request) {
  // mark one notification as read: { id }
  try {
    const body = await req.json().catch(() => ({} as any));
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });
    const updated = await prisma.notification.update({ where: { id }, data: { isRead: true } });
    return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_mark', message }, { status: 500 });
  }
}
