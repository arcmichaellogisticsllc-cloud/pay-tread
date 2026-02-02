import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function POST(req: Request, { params }: { params: { userEmail: string } }) {
  try {
    const { userEmail } = params;
    const body = await req.json().catch(() => ({} as any));
    const { docType } = body;
    if (!userEmail) return NextResponse.json({ error: 'missing_user' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 });

    // create a notification and mark KYC as PENDING
    await prisma.notification.create({ data: { forUserId: user.id, type: 'KYC', message: `Submitted ${docType ?? 'documents'}`, link: '/admin/compliance' } });
    const updated = await prisma.user.update({ where: { id: user.id }, data: { kycStatus: 'PENDING' } });

    return NextResponse.json({ data: { id: updated.id, email: updated.email, kycStatus: updated.kycStatus } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_upload_docs', message }, { status: 500 });
  }
}
