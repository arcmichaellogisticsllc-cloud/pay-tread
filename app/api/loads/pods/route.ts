import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import getUserFromReq from '../../../../lib/getUserFromReq';
import { canViewLoad } from '../../../../lib/permissions';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const { loadId, uploadedByEmail, mime, checksum, fileData } = body;
    if (!loadId) return NextResponse.json({ error: 'missing_load' }, { status: 400 });

    const load = await prisma.load.findUnique({ where: { id: loadId } });
    if (!load) return NextResponse.json({ error: 'load_not_found' }, { status: 404 });

  const user = await getUserFromReq(req);
  const uploader = uploadedByEmail ? await prisma.user.findUnique({ where: { email: uploadedByEmail } }) : user ?? null;

  const actor = uploader ?? user;
  if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const canView = await canViewLoad(actor, load);
  if (!canView) return NextResponse.json({ error: 'forbidden', message: 'uploader not allowed to add POD for this load' }, { status: 403 });

    let s3Key = `pods/${load.externalRef ?? load.id}/${Date.now()}.pdf`;
    let savedPath = null;
    if (fileData) {
      const data = (fileData as string).startsWith('data:') ? (fileData as string).split(',')[1] : (fileData as string);
      const buffer = Buffer.from(data, 'base64');
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'pods', load.externalRef ?? load.id);
      fs.mkdirSync(uploadsDir, { recursive: true });
      const filename = `${Date.now()}.pdf`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, buffer);
      savedPath = `/uploads/pods/${load.externalRef ?? load.id}/${filename}`;
      s3Key = savedPath;
    }

    const pod = await prisma.pod.create({ data: { loadId: load.id, uploadedBy: uploader?.id ?? (uploadedByEmail ?? 'unknown'), s3Key, mime: mime ?? 'application/pdf', checksum: checksum ?? null, submittedAt: new Date(), status: 'SUBMITTED' } });

    // If a rate confirmation file was provided, create a RateConfirmation record too
    let rateConfirmation: any = null;
    if (body.rateFileData) {
      let rcKey = `rate_confirmations/${load.externalRef ?? load.id}/${Date.now()}.pdf`;
      let rcSavedPath = null;
      try {
        const data = (body.rateFileData as string).startsWith('data:') ? (body.rateFileData as string).split(',')[1] : (body.rateFileData as string);
        const buffer = Buffer.from(data, 'base64');
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'rate_confirmations', load.externalRef ?? load.id);
        fs.mkdirSync(uploadsDir, { recursive: true });
        const filename = `${Date.now()}.pdf`;
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, buffer);
        rcSavedPath = `/uploads/rate_confirmations/${load.externalRef ?? load.id}/${filename}`;
        rcKey = rcSavedPath;

        rateConfirmation = await (prisma as any).rateConfirmation.create({ data: {
          loadId: load.id,
          uploadedBy: uploader?.id ?? (uploadedByEmail ?? 'unknown'),
          s3Key: rcKey,
          mime: body.rateMime ?? 'application/pdf',
          checksum: body.rateChecksum ?? null,
        } });
      } catch (e) {
        await prisma.auditLog.create({ data: { actorId: user?.id ?? (uploader?.id ?? null), actionType: 'RATE_CONFIRMATION_UPLOAD_FAILED', targetType: 'Load', targetId: load.id, payload: JSON.stringify({ error: (e as Error).message }) } }).catch(()=>null);
      }
    }

    await prisma.auditLog.create({ data: { actorId: user?.id ?? (uploader?.id ?? null), actionType: 'POD_UPLOAD', targetType: 'POD', targetId: pod.id, payload: JSON.stringify({ loadId: load.id, s3Key, rateConfirmationId: rateConfirmation?.id ?? null }) } });

    if (rateConfirmation) {
      await prisma.auditLog.create({ data: { actorId: user?.id ?? (uploader?.id ?? null), actionType: 'RATE_CONFIRMATION_UPLOAD', targetType: 'RateConfirmation', targetId: rateConfirmation.id, payload: JSON.stringify({ loadId: load.id, s3Key: rateConfirmation.s3Key }) } }).catch(()=>null);
    }

    const uploadUrl = savedPath ?? `https://example.local/mock-upload/${encodeURIComponent(s3Key)}`;
    return NextResponse.json({ data: { pod, rateConfirmation, uploadUrl } }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_create_pod', message }, { status: 500 });
  }
}
