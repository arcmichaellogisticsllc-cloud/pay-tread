import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({ take: 200, orderBy: { createdAt: 'desc' } });
    // expose minimal fields for admin UI
  const data = users.map((u: any) => ({ id: u.id, email: u.email, kycStatus: u.kycStatus || 'UNVERIFIED', role: u.role }));
    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_fetch_users', message }, { status: 500 });
  }
}
