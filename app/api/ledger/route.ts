import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Prisma client is undefined" },
        { status: 500 }
      );
    }

    // Check that the generated model exists on the client
    const hasModel = (prisma as any).walletTransaction !== undefined;
    if (!hasModel) {
      // Return available top-level keys on the client for debugging
      const keys = Object.keys(prisma as any).slice(0, 200);
      return NextResponse.json(
        {
          error: "Model 'walletTransaction' not available on Prisma client",
          prismaKeys: keys,
        },
        { status: 500 }
      );
    }

    const rows = await (prisma as any).walletTransaction.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to read ledger", message }, { status: 500 });
  }
}
