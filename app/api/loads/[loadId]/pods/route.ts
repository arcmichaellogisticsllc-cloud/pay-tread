import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import getUserFromReq from '../../../../../lib/getUserFromReq';

import fs from 'fs';
import path from 'path';

export async function POST(req: Request, { params }: { params: { loadId: string } }) {
  try {
    const { loadId } = params;
    if (!loadId) return NextResponse.json({ error: 'missing_load' }, { status: 400 });

    const body = await req.json().catch(() => ({} as any));
    const { uploadedByEmail, mime, checksum } = body;

    const load = await prisma.load.findUnique({ where: { id: loadId } });
    if (!load) return NextResponse.json({ error: 'load_not_found' }, { status: 404 });

  // resolve actor if possible (dev header or ?email)
  const user = await getUserFromReq(req);
  const uploader = uploadedByEmail ? await prisma.user.findUnique({ where: { email: uploadedByEmail } }) : user ?? null;

    // In dev accept direct base64 upload in body.fileData (data: URL or raw base64)
    let s3Key = `pods/${load.externalRef ?? load.id}/${Date.now()}.pdf`;
    let savedPath = null;
    if (body.fileData) {
      // Accept either data URL or raw base64
      const data = (body.fileData as string).startsWith('data:') ? (body.fileData as string).split(',')[1] : (body.fileData as string);
      const buffer = Buffer.from(data, 'base64');
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'pods', load.externalRef ?? load.id);
      fs.mkdirSync(uploadsDir, { recursive: true });
      const filename = `${Date.now()}.pdf`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, buffer);
      savedPath = `/uploads/pods/${load.externalRef ?? load.id}/${filename}`;
      s3Key = savedPath;
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

    // audit who uploaded the POD
    await prisma.auditLog.create({ data: { actorId: user?.id ?? (uploader?.id ?? null), actionType: 'POD_UPLOAD', targetType: 'POD', targetId: pod.id, payload: JSON.stringify({ loadId: load.id, s3Key }) } });

    const uploadUrl = savedPath ?? `https://example.local/mock-upload/${encodeURIComponent(s3Key)}`;
    return NextResponse.json({ data: { pod, uploadUrl } }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed_create_pod', message }, { status: 500 });
  }
}
