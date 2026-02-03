import { NextResponse } from 'next/server';
import getUserFromReq from '../../../../../../../lib/getUserFromReq';
import { approvePodCanonical } from '../../../../../../../lib/pod/approve';
import { canApprovePodViaUi } from '../../../../../../../lib/permissions';
import prisma from '../../../../../../../lib/prisma';
import { sendNotification } from '../../../../../../../lib/notifications';

export async function POST(req: Request, context: any) {
  try {
    const { loadId, podId } = (context && (context.params ?? {})) as any;
    if (!loadId || !podId) return NextResponse.json({ error: 'Missing route parameters' }, { status: 400 });

    const user = await getUserFromReq(req);
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    // Ensure the actor can view and approve this load
    const load = await prisma.load.findUnique({ where: { id: loadId } });
    if (!load) return NextResponse.json({ error: 'load_not_found' }, { status: 404 });

    const allowedToApprove = await canApprovePodViaUi(user, load) || (user.id === load.carrierId);
    if (!allowedToApprove) return NextResponse.json({ error: 'forbidden', message: 'not_authorized_to_approve_pod' }, { status: 403 });

    const actorId = user.id;
    const result = await approvePodCanonical(podId, actorId);
    if (result.alreadyApproved) return NextResponse.json({ message: 'POD already approved', existing: result.txn });
    // notify broker and carrier
    try {
      if (load.brokerId) await sendNotification(load.brokerId, 'POD_APPROVED', `POD approved for load ${load.reference ?? load.externalRef}`, `/loads/${load.id}`);
      if (load.carrierId) await sendNotification(load.carrierId, 'POD_APPROVED', `POD approved for load ${load.reference ?? load.externalRef}`, `/loads/${load.id}`);
    } catch (e) { /* ignore */ }

    return NextResponse.json({ message: 'POD approved', txn: result.txn });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Failed to approve POD', message }, { status: 500 });
  }
}
