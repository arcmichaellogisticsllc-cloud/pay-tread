import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import requireAdmin from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json({ error: auth.message || 'unauthorized' }, { status: auth.status || 401 });

    const userId = String(req.nextUrl.searchParams.get('userId') || '');
    if (!userId) return NextResponse.json({ error: 'missing_userId' }, { status: 400 });

    const txs = await prisma.walletTransaction.findMany({ where: { wallet: { ownerId: userId } }, orderBy: { createdAt: 'desc' }, take: 200 });

    const flags: string[] = [];
    const largeTx = txs.find(t => Math.abs(t.amountCents) > 500000); // > $5,000
    if (largeTx) flags.push('LARGE_TRANSACTION');

    if (txs.length > 50) flags.push('HIGH_VOLUME');

    const rapidSmall = txs.filter(t => Math.abs(t.amountCents) > 10000).length; // > $100
    if (rapidSmall > 10) flags.push('MULTIPLE_MEDIUM_TXS');

    // persist flags as UserFlag rows (avoid duplicates for identical type)
    const existing = await (prisma as any).userFlag.findMany({ where: { userId } });
    const toCreate = flags.filter((f: string) => !existing.find((e: any) => e.type === f));
    const created: any[] = [];
    for (const t of toCreate) {
      const row = await (prisma as any).userFlag.create({ data: { userId, type: t, reason: 'automated_heuristic' } });
      created.push(row);
      await prisma.auditLog.create({ data: { actorId: null, actionType: 'AUTOMATED_FLAG_CREATE', targetType: 'UserFlag', targetId: row.id, payload: JSON.stringify({ userId, type: t }) } });
    }

    return NextResponse.json({ data: { flags, txCount: txs.length, created } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed', message }, { status: 500 });
  }
}
