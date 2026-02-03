import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Prisma client is undefined" },
        { status: 500 }
      );
    }
    // Check that the generated model exists on the client
    const clientRecord = prisma as unknown as Record<string, unknown>;
    const wtClient = clientRecord['walletTransaction'] as { findMany?: (opts?: unknown) => Promise<unknown[]> } | undefined;
    if (!wtClient || typeof wtClient.findMany !== 'function') {
      const keys = Object.keys(clientRecord).slice(0, 200);
      return NextResponse.json({ error: "Model 'walletTransaction' not available on Prisma client", prismaKeys: keys }, { status: 500 });
    }

    const rows = await wtClient.findMany({ take: 50, orderBy: { createdAt: 'desc' } } as unknown);

    return NextResponse.json({ data: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to read ledger", message }, { status: 500 });
  }
}
