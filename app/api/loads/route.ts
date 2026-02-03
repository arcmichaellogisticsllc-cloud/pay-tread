import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import getUserFromReq from '../../../lib/getUserFromReq';
import { getRoleNameForUser } from '../../../lib/permissions';

export async function GET(req: Request) {
  try {
    // enforce load-level visibility rules: admins see everything; others only see loads where they participate
    // resolve actor (dev header or query)
    // Note: we accept that this is a best-effort convenience for dev; production auth should be used.
  const actor = await getUserFromReq(req).catch(() => null);
    const roleName = await getRoleNameForUser(actor);

    if (roleName === 'ADMIN') {
      const loads = await prisma.load.findMany({ take: 100, orderBy: { createdAt: 'desc' }, include: { pods: true } });
      return NextResponse.json({ data: loads });
    }

    if (!actor) {
      // unauthenticated devs get empty set
      return NextResponse.json({ data: [] });
    }

    // only loads where actor is shipper, carrier, receiver or broker
    // Use a typed-escape hatch because dev Prisma client types in this workspace
    // sometimes lag when schema is edited during iterative development.
    const whereAny: any = { OR: [ { shipperId: actor.id }, { carrierId: actor.id }, { brokerId: actor.id }, { receiverId: actor.id } ] };
    const loads = await prisma.load.findMany({ where: whereAny, take: 200, orderBy: { createdAt: 'desc' }, include: { pods: true } });

    return NextResponse.json({ data: loads });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to list loads", message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
  const { reference, shipperEmail, receiverEmail, carrierEmail, grossAmount, currency, rateCents, paymentMethod } = body;

    if (!reference || !shipperEmail || !grossAmount) {
      return NextResponse.json({ error: 'missing_fields', message: 'reference, shipperEmail and grossAmount are required' }, { status: 400 });
    }

  // Resolve users by email when provided (dev convenience)
  const shipper = shipperEmail ? await prisma.user.findUnique({ where: { email: shipperEmail } }) : null;
  const receiver = receiverEmail ? await prisma.user.findUnique({ where: { email: receiverEmail } }) : null;
  const carrier = carrierEmail ? await prisma.user.findUnique({ where: { email: carrierEmail } }) : null;

    const user = await getUserFromReq(req);

    // Build create data with optional connects for relations
    const createData: any = {
      externalRef: reference,
      reference,
      grossAmount: grossAmount,
      rateCents: rateCents ?? null,
      currency: currency ?? 'USD',
      status: 'CREATED',
      paymentMethod: paymentMethod ?? 'ACH',
    };
    if (shipper) createData.shipper = { connect: { id: shipper.id } };
    if (receiver) createData.receiver = { connect: { id: receiver.id } };
    if (carrier) createData.assignedCarrier = { connect: { id: carrier.id } };

    const load = await prisma.load.create({ data: createData });

    // audit: who created the load
    await prisma.auditLog.create({ data: { actorId: user?.id ?? null, actionType: 'LOAD_CREATE', targetType: 'Load', targetId: load.id, payload: JSON.stringify({ reference, grossAmount }) } });

    return NextResponse.json({ data: load }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_create_load', message }, { status: 500 });
  }
}
