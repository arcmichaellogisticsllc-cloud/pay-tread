import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = req.headers.get('x-user-email') || url.searchParams.get('email') || null;
    if (!email) return NextResponse.json({ error: 'missing_email' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 });

    let wallet = await prisma.wallet.findFirst({ where: { ownerId: user.id } });
    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { ownerId: user.id, balanceCents: 0, pendingCents: 0, clearedCents: 0 } });
    }

    return NextResponse.json({ data: { id: wallet.id, balanceCents: wallet.balanceCents, pendingCents: wallet.pendingCents, clearedCents: wallet.clearedCents } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_wallet', message }, { status: 500 });
  }
}
