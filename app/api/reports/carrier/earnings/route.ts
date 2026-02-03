import { NextResponse, type NextRequest } from 'next/server';
import prisma from '../../../../../lib/prisma';
import getUserFromReq from '../../../../../lib/getUserFromReq';

function toCSV(rows: any[]) {
  const header = ['LoadReference','LoadId','GrossCents','FeesCents','PayoutsCents','NetAfterFeesCents','ApprovalAt','PayoutAt'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push([
      `"${(r.reference ?? '')}"`,
      r.loadId,
      String(r.grossAmount ?? 0),
      String(r.totalFees ?? 0),
      String(r.totalPayouts ?? 0),
      String(r.netAfterFees ?? 0),
      r.approvalAt ? new Date(r.approvalAt).toISOString() : '',
      r.payoutAt ? new Date(r.payoutAt).toISOString() : '',
    ].join(','));
  }
  return lines.join('\n');
}

export async function GET(req: NextRequest) {
  try {
    const actor = await getUserFromReq(req);
    if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    // support month/year or explicit start/end as ISO dates
    const url = new URL(req.url);
    const month = url.searchParams.get('month'); // '2026-02'
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');
    const format = url.searchParams.get('format') ?? 'json';

    const where: any = { carrierId: actor.id };
    if (month) {
      const [y, m] = month.split('-').map(Number);
      if (!y || !m) return NextResponse.json({ error: 'invalid_month' }, { status: 400 });
      const s = new Date(Date.UTC(y, m - 1, 1));
      const e = new Date(Date.UTC(y, m, 1));
      where.createdAt = { gte: s, lt: e };
    } else if (start || end) {
      where.createdAt = {} as any;
      if (start) where.createdAt.gte = new Date(start);
      if (end) where.createdAt.lt = new Date(end);
    }

    const loads = await prisma.load.findMany({ where, orderBy: { createdAt: 'asc' } });

    const rows: any[] = [];
    for (const load of loads) {
      const loadId = load.id;
      const rowsTx: any[] = await prisma.walletTransaction.findMany({ where: { loadId }, orderBy: { createdAt: 'asc' } });
      const approvalTx = rowsTx.find(t => String(t.type ?? '').toUpperCase().includes('LOAD_GROSS'));
      const payouts = await prisma.payout.findMany({ where: { loadId }, orderBy: { processedAt: 'asc' } });
      const payoutAt = payouts.length ? (payouts[payouts.length - 1].processedAt ?? payouts[payouts.length - 1].createdAt) : null;
      const payoutsAgg = await prisma.payout.aggregate({ where: { loadId }, _sum: { amountCents: true } });
      const totalPayouts = payoutsAgg._sum?.amountCents ?? 0;
      const feeTxs: any[] = await prisma.walletTransaction.findMany({ where: { loadId, type: { contains: 'FEE' } } });
      const totalFees = feeTxs.reduce((s, t) => s + Math.abs(t.amountCents || 0), 0);

      const gross = load.grossAmount ?? 0;
      const netAfterFees = gross - totalFees;

      rows.push({
        loadId,
        reference: load.reference ?? load.externalRef ?? '',
        grossAmount: gross,
        totalFees,
        totalPayouts,
        netAfterFees,
        approvalAt: approvalTx?.createdAt ?? null,
        payoutAt,
      });
    }

    if (format === 'csv') {
      const csv = toCSV(rows);
      return new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="carrier-earnings.csv"' } });
    }

    return NextResponse.json({ data: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed', message }, { status: 500 });
  }
}
