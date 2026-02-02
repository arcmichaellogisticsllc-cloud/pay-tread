import { NextResponse } from 'next/server';
import getUserFromReq from '../../../../../../../lib/getUserFromReq';
import { approvePodCanonical } from '../../../../../../../lib/pod/approve';

export async function POST(req: Request, { params }: { params: { loadId: string; podId: string } }) {
  try {
    const { loadId, podId } = params;
    if (!loadId || !podId) return NextResponse.json({ error: 'Missing route parameters' }, { status: 400 });

    const user = await getUserFromReq(req);
    const actorId = user?.id ?? undefined;

    const result = await approvePodCanonical(podId, actorId);
    if (result.alreadyApproved) return NextResponse.json({ message: 'POD already approved', existing: result.txn });
    return NextResponse.json({ message: 'POD approved', txn: result.txn });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Failed to approve POD', message }, { status: 500 });
  }
}
