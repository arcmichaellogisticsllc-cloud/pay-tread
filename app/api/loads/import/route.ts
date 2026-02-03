import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import getUserFromReq from '../../../../lib/getUserFromReq';

// Simple CSV importer for dev: accepts text/csv body where each row is
// reference,shipperEmail,receiverEmail,carrierEmail,grossAmount
export async function POST(req: Request) {
  try {
    const user = await getUserFromReq(req);
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    const text = await req.text();
    if (!text) return NextResponse.json({ error: 'empty_body' }, { status: 400 });

    const rows = text.split('\n').map(r => r.trim()).filter(Boolean);
    const created: Array<Record<string, unknown>> = [];
    const skipped: Array<Record<string, unknown>> = [];
    for (const row of rows) {
      const parts = row.split(',').map((p) => p.trim());
      const [reference, shipperEmail, receiverEmail, carrierEmail, grossStr] = parts;
      const grossAmount = Number(grossStr || '0');
      if (!reference || !shipperEmail || !grossAmount) continue;
      // Idempotency: skip rows where externalRef already exists
      const exists = await prisma.load.findUnique({ where: { externalRef: reference } });
      if (exists) {
        skipped.push({ reference, loadId: exists.id });
        continue;
      }
      const shipper = await prisma.user.findUnique({ where: { email: shipperEmail } });
      const receiver = receiverEmail ? await prisma.user.findUnique({ where: { email: receiverEmail } }) : null;
      const carrier = carrierEmail ? await prisma.user.findUnique({ where: { email: carrierEmail } }) : null;

      const createData: Record<string, unknown> = { externalRef: reference, reference, grossAmount, currency: 'USD', status: 'CREATED' };
      if (shipper) (createData as any).shipper = { connect: { id: shipper.id } };
      if (receiver) (createData as any).receiver = { connect: { id: receiver.id } };
      if (carrier) (createData as any).assignedCarrier = { connect: { id: carrier.id } };

      const load = await prisma.load.create({ data: createData as any });
      created.push(load as Record<string, unknown>);
      await prisma.auditLog.create({ data: { actorId: user.id, actionType: 'LOAD_IMPORT', targetType: 'Load', targetId: load.id, payload: JSON.stringify({ reference, grossAmount }) } }).catch(()=>null);
    }

  return NextResponse.json({ data: created, skipped });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_import', message }, { status: 500 });
  }
}
