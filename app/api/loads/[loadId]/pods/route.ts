import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import getUserFromReq from '../../../../../lib/getUserFromReq';
import { canViewLoad } from '../../../../../lib/permissions';

import fs from 'fs';
import path from 'path';
import { encryptBuffer } from '@/lib/crypto';
import { logAccess } from '@/lib/accessLog';
import type { Load } from '@prisma/client';

type RouteContext = { params?: Record<string, unknown> | Promise<Record<string, unknown>> };

export async function POST(req: Request, context: RouteContext) {
  try {
     const maybeParams = context && context.params;
    const params = maybeParams && typeof (maybeParams as any).then === 'function' ? await (maybeParams as Promise<Record<string, unknown>>) : (maybeParams as Record<string, unknown> | undefined);
    const loadId = params?.loadId as string | undefined;
    if (!loadId) return NextResponse.json({ error: 'missing_load' }, { status: 400 });

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const uploadedByEmail = body.uploadedByEmail as string | undefined;
    const mime = body.mime as string | undefined;
    const checksum = body.checksum as string | undefined;

    const load = await prisma.load.findUnique({ where: { id: loadId } }) as Load | null;
    if (!load) return NextResponse.json({ error: 'load_not_found' }, { status: 404 });

  // resolve actor if possible (dev header or ?email)
  const user = await getUserFromReq(req);
  const uploader = uploadedByEmail ? await prisma.user.findUnique({ where: { email: uploadedByEmail } }) : user ?? null;

  const actor = uploader ?? user;
  if (!actor) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    const canView = await canViewLoad(actor, {
      shipperId: load.shipperId ?? undefined,
      carrierId: load.carrierId ?? undefined,
      brokerId: load.brokerId ?? undefined,
      receiverId: (load as unknown as { receiverId?: string | null }).receiverId ?? undefined,
    });
  if (!canView) return NextResponse.json({ error: 'forbidden', message: 'uploader not allowed to add POD for this load' }, { status: 403 });

    // In dev accept direct base64 upload in body.fileData (data: URL or raw base64)
    let s3Key = `secure/pods/${load.externalRef ?? load.id}/${Date.now()}.pdf.enc`;
    let savedPath: string | null = null;
    const fileData = body.fileData as string | undefined;
    if (fileData) {
      // Accept either data URL or raw base64
      const data = fileData.startsWith('data:') ? fileData.split(',')[1] : fileData;
      const buffer = Buffer.from(data, 'base64');
      // Encrypt before saving to disk (dev secure storage)
      const encryptedB64 = encryptBuffer(buffer);
      const uploadsDir = path.join(process.cwd(), 'data', 'secure', 'pods', load.externalRef ?? load.id);
      fs.mkdirSync(uploadsDir, { recursive: true });
      const filename = `${Date.now()}.pdf.enc`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, encryptedB64, { encoding: 'base64' });
      savedPath = `/api/secure/pods?key=${encodeURIComponent(s3Key)}`;
      s3Key = `secure/pods/${load.externalRef ?? load.id}/${filename}`;
      // access log for upload
      await logAccess(actor?.id ?? null, 'POD_UPLOAD_SECURE_STORE', { loadId: load.id, s3Key });
    }

    const pod = await prisma.pod.create({ data: {
      loadId: load.id,
      uploadedBy: uploader?.id ?? (uploadedByEmail ?? 'unknown'),
      s3Key,
      mime: mime ?? 'application/pdf',
      checksum: checksum ?? null,
      submittedAt: new Date(),
      status: 'SUBMITTED'
    } });

    // If a rate confirmation file was provided, save it to disk (dev) — do not require DB model to exist
    let rateConfirmation: { s3Key?: string; id?: string } | null = null;
    const rateFileData = body.rateFileData as string | undefined;
    if (rateFileData) {
      let rcKey = `rate_confirmations/${load.externalRef ?? load.id}/${Date.now()}.pdf`;
      let rcSavedPath: string | null = null;
      try {
        const data = rateFileData.startsWith('data:') ? rateFileData.split(',')[1] : rateFileData;
        const buffer = Buffer.from(data, 'base64');
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'rate_confirmations', load.externalRef ?? load.id);
        fs.mkdirSync(uploadsDir, { recursive: true });
        const filename = `${Date.now()}.pdf`;
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, buffer);
        rcSavedPath = `/uploads/rate_confirmations/${load.externalRef ?? load.id}/${filename}`;
        rcKey = rcSavedPath;

        // We avoid creating a DB record if the model isn't present in the Prisma client — keep a lightweight object
        rateConfirmation = { s3Key: rcKey };
      } catch (e) {
        // ignore file save error in dev mode but log audit
        await prisma.auditLog.create({ data: { actorId: user?.id ?? (uploader?.id ?? null), actionType: 'RATE_CONFIRMATION_UPLOAD_FAILED', targetType: 'Load', targetId: load.id, payload: JSON.stringify({ error: (e as Error).message }) } }).catch(()=>null);
      }
    }

    // audit who uploaded the POD and RC (if any)
    await prisma.auditLog.create({ data: { actorId: user?.id ?? (uploader?.id ?? null), actionType: 'POD_UPLOAD', targetType: 'POD', targetId: pod.id, payload: JSON.stringify({ loadId: load.id, s3Key, rateConfirmationId: rateConfirmation?.id ?? null }) } });

    if (rateConfirmation) {
      await prisma.auditLog.create({ data: { actorId: user?.id ?? (uploader?.id ?? null), actionType: 'RATE_CONFIRMATION_UPLOAD', targetType: 'RateConfirmation', targetId: rateConfirmation.id ?? '', payload: JSON.stringify({ loadId: load.id, s3Key: rateConfirmation.s3Key }) } }).catch(()=>null);
    }

    // Send in-app notifications for POD submission
    try {
      const { sendNotification } = await Promise.resolve(require('../../../../../lib/notifications'));
      // notify broker and carrier when available
      if (load.brokerId) await sendNotification(load.brokerId, 'POD_SUBMITTED', `POD submitted for load ${load.reference ?? load.externalRef}`, `/loads/${load.id}`);
      if (load.carrierId) await sendNotification(load.carrierId, 'POD_SUBMITTED', `POD submitted for load ${load.reference ?? load.externalRef}`, `/loads/${load.id}`);
    } catch (e) {
      // ignore notification errors
    }

  const uploadUrl = savedPath ?? `https://example.local/mock-upload/${encodeURIComponent(s3Key)}`;
    return NextResponse.json({ data: { pod, rateConfirmation, uploadUrl } }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_create_pod', message }, { status: 500 });
  }
}
