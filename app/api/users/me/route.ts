import prisma from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = req.headers.get('x-user-email') || url.searchParams.get('email') || 'carrier@example.com';

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 });

  const kycStatus = user.kycStatus ?? 'UNVERIFIED';

  // attempt to find a wallet
  const wallet = await prisma.wallet.findFirst({ where: { ownerId: user.id } });

  return NextResponse.json({ data: { email: user.email, roleId: user.roleId, kycStatus, walletId: wallet?.id ?? null } });
}
