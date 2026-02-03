import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(()=>({} as any));
    const email = body.email ?? new URL(req.url).searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'missing_email' }, { status: 400 });
  const u = await (prisma as any).user.update({ where: { email }, data: { kycStatus: 'VERIFIED' } }).catch(()=>null);
  if (!u) return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  return NextResponse.json({ ok: true, user: { id: (u as any).id, email: (u as any).email, kycStatus: (u as any).kycStatus } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed', message }, { status: 500 });
  }
}
