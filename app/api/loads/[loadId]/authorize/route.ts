import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import getUserFromReq from '../../../../../lib/getUserFromReq';
import { getRoleNameForUser } from '../../../../../lib/permissions';
import type { Load } from '@prisma/client';

type RouteContext = { params?: Record<string, unknown> | Promise<Record<string, unknown>> };

// Broker/Admin can authorize payout for a load. This creates a PayoutRequest
// and associates the load with it. It is idempotent per load.
export async function POST(req: Request, context: RouteContext) {
  try {
    const user = await getUserFromReq(req);
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    const role = await getRoleNameForUser(user);
    if (!(role === 'BROKER' || role === 'ADMIN')) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  // support loadId from URL param or fallback to request body/query (helps tests/proxies)
  let paramLoadId: string | undefined = undefined;
  if (context && context.params) {
    const maybeParams = context.params;
    const params = (maybeParams && typeof (maybeParams as Promise<Record<string, unknown>>).then === 'function') ? await (maybeParams as Promise<Record<string, unknown>>) : (maybeParams as Record<string, unknown> | undefined);
    paramLoadId = params?.loadId as string | undefined;
  }
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  let loadId = paramLoadId ?? (body.loadId as string | undefined) ?? (new URL(req.url)).searchParams.get('loadId');
  // If the framework didn't populate params, try to extract from the pathname as a fallback
  if (!loadId) {
    try {
      const path = new URL(req.url).pathname;
      const m = path.match(/\/api\/loads\/([^\/]+)\/authorize/);
      if (m) loadId = decodeURIComponent(m[1]);
    } catch (_) { /* ignore */ }
  }

  // allow callers to pass either the DB id or the externalRef for convenience
  let load: Load | null = null;
  if (loadId) {
    try { load = await prisma.load.findUnique({ where: { id: loadId } }); } catch { load = null; }
    if (!load) {
      try { load = await prisma.load.findUnique({ where: { externalRef: loadId } }); } catch { load = null; }
    }
  }
    if (!load) return NextResponse.json({ error: 'load_not_found' }, { status: 404 });

  // If there's already a payout request that includes this load, mark it APPROVED and return it
  const existingLink = await prisma.payoutRequestToLoad.findFirst({ where: { loadId: load.id } , include: { payoutRequest: true } });
  if (existingLink) {
    const prExisting = existingLink.payoutRequest;
    if (prExisting.status !== 'APPROVED') {
      await prisma.payoutRequest.update({ where: { id: prExisting.id }, data: { status: 'APPROVED' } }).catch(()=>null);
      await prisma.auditLog.create({ data: { actorId: user.id, actionType: 'PAYOUT_APPROVED', targetType: 'PayoutRequest', targetId: prExisting.id, payload: JSON.stringify({ loadId: load.id }) } }).catch(()=>null);
    }
    return NextResponse.json({ data: { existing: { ...prExisting, status: 'APPROVED' } } });
  }

  // Create a payout request for the gross amount and attach this load (mark as APPROVED)
  const pr = await prisma.payoutRequest.create({ data: { ownerId: user.id, amountCents: load.grossAmount, status: 'APPROVED' } });
  await prisma.payoutRequestToLoad.create({ data: { payoutRequestId: pr.id, loadId: load.id } });
  await prisma.auditLog.create({ data: { actorId: user.id, actionType: 'PAYOUT_AUTHORIZED', targetType: 'Load', targetId: loadId, payload: JSON.stringify({ payoutRequestId: pr.id }) } }).catch(()=>null);

    // notify carrier / shipper
    if (load.carrierId) {
      await prisma.notification.create({ data: { forUserId: load.carrierId, type: 'PAYOUT_AUTHORIZED', message: `Payout authorized for load ${load.externalRef ?? load.reference ?? load.id}`, link: `/loads/${load.id}` } }).catch(()=>null);
    }

    return NextResponse.json({ data: { payoutRequest: pr } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_authorize', message }, { status: 500 });
  }
}
