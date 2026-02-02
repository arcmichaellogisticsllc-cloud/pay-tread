import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET() {
  try {
    // Aggregate wallets with owner email for quick display
    const wallets = await prisma.wallet.findMany({ include: { owner: true }, take: 200 });
  const data = wallets.map((w: any) => ({ id: w.id, balanceCents: w.balanceCents, ownerEmail: w.owner?.email ?? null }));
    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_fetch_wallets', message }, { status: 500 });
  }
}
