import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import getUserFromReq from '../../../../lib/getUserFromReq';

// Returns a small Inertia-like payload { component: string, props: {} }
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = url.searchParams.get('page') || 'Broker';

    // actor convenience: header or query
    const actor = await getUserFromReq(req);
    const actorEmail = actor?.email ?? url.searchParams.get('email') ?? 'broker@example.com';
    const user = await prisma.user.findUnique({ where: { email: actorEmail } });

    // Provide simple props for Broker and Carrier
    if (page === 'Broker') {
      // Broker: return recent loads the broker participates in
      const loads = await prisma.load.findMany({ where: { brokerId: user?.id ?? undefined }, take: 100, orderBy: { createdAt: 'desc' }, include: { pods: true } });
      return NextResponse.json({ component: 'Broker', props: { user: { id: user?.id, email: user?.email }, loads } }, { status: 200 });
    }

    if (page === 'Carrier') {
      // Carrier: return wallet and recent loads where carrier is assigned
      const wallet = await prisma.wallet.findFirst({ where: { ownerId: user?.id } });
      const loads = await prisma.load.findMany({ where: { carrierId: user?.id }, take: 100, orderBy: { createdAt: 'desc' }, include: { pods: true } });
      return NextResponse.json({ component: 'Carrier', props: { user: { id: user?.id, email: user?.email }, wallet, loads } }, { status: 200 });
    }

    return NextResponse.json({ component: 'NotFound', props: { message: `Unknown inertia page: ${page}` } }, { status: 404 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'inertia_error', message }, { status: 500 });
  }
}
