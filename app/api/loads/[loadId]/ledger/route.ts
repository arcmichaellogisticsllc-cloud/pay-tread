import { NextResponse, type NextRequest } from 'next/server';
import prisma from '../../../../../lib/prisma';
import type { WalletTransaction, Load } from '@prisma/client';

type RouteContext = { params?: Record<string, unknown> | Promise<Record<string, unknown>> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    // loadId from route param or query
    let loadId: string | undefined;
    if (context && context.params) {
      const maybeParams = context.params;
      const params = (maybeParams && typeof (maybeParams as Promise<Record<string, unknown>>).then === 'function') ? await (maybeParams as Promise<Record<string, unknown>>) : (maybeParams as Record<string, unknown> | undefined);
      loadId = params?.loadId as string | undefined;
    }
    if (!loadId) loadId = new URL(req.url).searchParams.get('loadId') ?? undefined;
    if (!loadId) return NextResponse.json({ error: 'missing_load_id' }, { status: 400 });

    const load = (await prisma.load.findUnique({ where: { id: loadId } })) ?? (await prisma.load.findUnique({ where: { externalRef: loadId } }));
    if (!load) return NextResponse.json({ error: 'load_not_found' }, { status: 404 });

    // ledger rows tied to this load (immutable records)
    const rows = await prisma.walletTransaction.findMany({ where: { loadId: load.id }, orderBy: { createdAt: 'asc' } }) as WalletTransaction[];

    // compute gross, fees, payouts, advances
    const payoutsAgg = await prisma.payout.aggregate({ where: { loadId: load.id }, _sum: { amountCents: true } });
    const advancesAgg = await prisma.advance.aggregate({ where: { loadId: load.id }, _sum: { amountCents: true } });

    const totalPayouts = payoutsAgg._sum?.amountCents ?? 0;
    const totalAdvances = advancesAgg._sum?.amountCents ?? 0;

    // fees are recorded as wallet transactions of type containing 'FEE' (e.g., 'PAYOUT_FEE')
    const feeTxs = await prisma.walletTransaction.findMany({ where: { loadId: load.id, type: { contains: 'FEE' } } }) as WalletTransaction[];
    const totalFees = feeTxs.reduce((s, t) => s + Math.abs(t.amountCents ?? 0), 0);

    // approval timestamp: first LOAD_GROSS txn
    const approvalTx = rows.find((r) => String(r.type ?? '').toUpperCase().includes('LOAD_GROSS'));
    const approvalAt = approvalTx?.createdAt ?? null;

    // payout timestamp: last payout (use payout.processedAt if available)
    const payouts = await prisma.payout.findMany({ where: { loadId: load.id }, orderBy: { processedAt: 'asc' } });
    const payoutAt = payouts.length ? (payouts[payouts.length - 1].processedAt ?? payouts[payouts.length - 1].createdAt) : null;

    const gross = (load as Load).grossAmount;
    const netAfterFees = gross - totalFees;
    const netRemaining = gross - totalPayouts - totalAdvances;

    return NextResponse.json({ data: {
      loadId: load.id,
      reference: load.reference ?? load.externalRef ?? null,
      grossAmount: gross,
      totalFees,
      totalPayouts,
      totalAdvances,
      netAfterFees,
      netRemaining,
      approvalAt,
      payoutAt,
      ledgerRows: rows,
    }});
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed', message }, { status: 500 });
  }
}
