import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import requireAdmin from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json({ error: auth.message || 'unauthorized' }, { status: auth.status || 401 });

    const rows = await prisma.payout.findMany({ take: 200, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ data: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed', message }, { status: 500 });
  }
}
