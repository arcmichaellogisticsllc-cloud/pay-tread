import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import getUserFromReq from '../../../lib/getUserFromReq';

export async function GET() {
  try {
    const loads = await prisma.load.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: { pods: true },
    });

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

    const load = await prisma.load.create({ data: {
      externalRef: reference,
      reference,
  shipperId: shipper?.id ?? null,
  receiverId: receiver?.id ?? null,
  carrierId: carrier?.id ?? null,
      grossAmount: grossAmount,
      rateCents: rateCents ?? null,
      currency: currency ?? 'USD',
      status: 'CREATED',
      paymentMethod: paymentMethod ?? 'ACH'
    } });

    // audit: who created the load
    await prisma.auditLog.create({ data: { actorId: user?.id ?? null, actionType: 'LOAD_CREATE', targetType: 'Load', targetId: load.id, payload: JSON.stringify({ reference, grossAmount }) } });

    return NextResponse.json({ data: load }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_create_load', message }, { status: 500 });
  }
}
