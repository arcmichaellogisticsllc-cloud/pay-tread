import { NextResponse, type NextRequest } from 'next/server';
import prisma from '../../../../../lib/prisma';
import getUserFromReq from '../../../../../lib/getUserFromReq';

function toCSV(rows: any[]) {
  const header = ['LoadReference','LoadId','GrossCents','PayoutsCents','PendingCents','ApprovalAt','PayoutAt'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push([
      `"${(r.reference ?? '')}"`,
      r.loadId,
      String(r.grossAmount ?? 0),
      String(r.totalPayouts ?? 0),
      String(r.pending ?? 0),
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

    const url = new URL(req.url);
    const format = url.searchParams.get('format') ?? 'json';
    const glAccount = url.searchParams.get('glAccount') ?? '4000';

    // broker's loads
    const loads = await prisma.load.findMany({ where: { brokerId: actor.id }, orderBy: { createdAt: 'asc' } });

    const rows: any[] = [];
    for (const load of loads) {
      const loadId = load.id;
      const payoutsAgg = await prisma.payout.aggregate({ where: { loadId }, _sum: { amountCents: true } });
      const totalPayouts = payoutsAgg._sum?.amountCents ?? 0;
      const advancesAgg = await prisma.advance.aggregate({ where: { loadId }, _sum: { amountCents: true } });
      const totalAdvances = advancesAgg._sum?.amountCents ?? 0;
      const totalPaid = totalPayouts;
      const pending = load.grossAmount - totalPaid - totalAdvances;

      const rowsTx: any[] = await prisma.walletTransaction.findMany({ where: { loadId }, orderBy: { createdAt: 'asc' } });
      const approvalTx = rowsTx.find((t: any) => String(t.type ?? '').toUpperCase().includes('LOAD_GROSS'));
      const payouts = await prisma.payout.findMany({ where: { loadId }, orderBy: { processedAt: 'asc' } });
      const payoutAt = payouts.length ? (payouts[payouts.length - 1].processedAt ?? payouts[payouts.length - 1].createdAt) : null;

      rows.push({
        loadId,
        reference: load.reference ?? load.externalRef ?? '',
        grossAmount: load.grossAmount ?? 0,
        totalPayouts: totalPaid,
        pending,
        approvalAt: approvalTx?.createdAt ?? null,
        payoutAt,
      });
    }

    if (format === 'csv') {
      const csv = toCSV(rows);
      return new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="broker-payables.csv"' } });
    }

    if (format === 'qb') {
      // QuickBooks-style CSV: Date,Account,Name,Amount,Memo
      const lines = ['Date,Account,Name,Amount,Memo'];
      for (const r of rows) {
        const date = r.approvalAt ? new Date(r.approvalAt).toISOString().split('T')[0] : '';
        const name = `Load ${r.reference}`;
        const amount = ((r.grossAmount ?? 0) / 100).toFixed(2);
        const memo = `Load ${r.reference} (${r.loadId})`;
        lines.push([date, glAccount, `"${name}"`, amount, `"${memo}"`].join(','));
      }
      return new NextResponse(lines.join('\n'), { status: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="broker-quickbooks.csv"' } });
    }

    return NextResponse.json({ data: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed', message }, { status: 500 });
  }
}
