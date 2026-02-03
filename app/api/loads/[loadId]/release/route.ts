import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import getUserFromReq from '../../../../../lib/getUserFromReq';
import { getRoleNameForUser } from '../../../../../lib/permissions';

export async function POST(req: Request, context: any) {
  try {
    const { loadId } = (context && (context.params ?? {})) as any;
    if (!loadId) return NextResponse.json({ error: 'missing_load' }, { status: 400 });

    const body = await req.json().catch(() => ({} as any));
    const podId: string | undefined = body.podId;
    const approvedBy = body.approvedBy ?? 'shipper';

    const load = await prisma.load.findUnique({ where: { id: loadId } });
    if (!load) return NextResponse.json({ error: 'load_not_found' }, { status: 404 });

    const pod = podId ? await prisma.pod.findUnique({ where: { id: podId } }) : null;
    if (!pod) return NextResponse.json({ error: 'pod_required' }, { status: 400 });
    if (pod.loadId !== loadId) return NextResponse.json({ error: 'pod_not_for_load' }, { status: 400 });

    const actor = await getUserFromReq(req);
    if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    const actorId = actor.id;

    // Only shipper, broker, or admin may release funds
    const roleName = await getRoleNameForUser(actor);
    if (!(actor.id === load.shipperId || actor.id === load.brokerId || roleName === 'ADMIN')) {
      return NextResponse.json({ error: 'forbidden', message: 'not authorized to release funds' }, { status: 403 });
    }

    // Shipments funds held on shipper wallet.pendingCents; ensure pending >= gross
  if (!load.shipperId) return NextResponse.json({ error: 'no_shipper_assigned' }, { status: 400 });
  const shipperWallet = await prisma.wallet.findFirst({ where: { ownerId: load.shipperId } });
    if (!shipperWallet) return NextResponse.json({ error: 'shipper_wallet_not_found' }, { status: 404 });
    if ((shipperWallet.pendingCents ?? 0) < load.grossAmount) return NextResponse.json({ error: 'insufficient_pending', message: 'Not enough held funds' }, { status: 400 });

    // First, ensure pod is approved and carrier is credited (idempotent)
    const { approvePodCanonical } = await import('../../../../../lib/pod/approve');
    await approvePodCanonical(pod.id, actorId ?? undefined);

    // Then decrement shipper pending and record an audit entry
    await prisma.wallet.update({ where: { id: shipperWallet.id }, data: { pendingCents: { decrement: load.grossAmount } } });
    const audit = await prisma.auditLog.create({ data: { actorId: actorId, actionType: 'RELEASE_FUNDS', targetType: 'Load', targetId: loadId, payload: JSON.stringify({ podId: pod.id, amount: load.grossAmount }) } });

    return NextResponse.json({ message: 'Funds released (canonical)', audit });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_release', message }, { status: 500 });
  }
}
