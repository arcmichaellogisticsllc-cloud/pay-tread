import { NextResponse, type NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { decryptToBuffer } from '@/lib/crypto';
import prisma from '@/lib/prisma';
import getUserFromReq from '@/lib/getUserFromReq';
import { canViewLoad } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  try {
    const key = String(req.nextUrl.searchParams.get('key') || '');
    if (!key) return NextResponse.json({ error: 'missing_key' }, { status: 400 });

    // expected key format: secure/pods/<loadRef>/<filename>
    const parts = key.split('/');
    if (parts.length < 4 || parts[0] !== 'secure' || parts[1] !== 'pods') return NextResponse.json({ error: 'invalid_key' }, { status: 400 });
    const loadRef = parts[2];
    const filename = parts.slice(3).join('/');

    // find load by externalRef or id
    const load = await prisma.load.findFirst({ where: { OR: [{ externalRef: loadRef }, { id: loadRef }] } });
    if (!load) return NextResponse.json({ error: 'load_not_found' }, { status: 404 });

    const user = await getUserFromReq(req);
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    const canView = await canViewLoad(user, load);
    if (!canView) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const filepath = path.join(process.cwd(), 'data', 'secure', 'pods', loadRef, filename);
    if (!fs.existsSync(filepath)) return NextResponse.json({ error: 'file_not_found' }, { status: 404 });

    const encryptedB64 = fs.readFileSync(filepath, { encoding: 'base64' });
    const buffer = decryptToBuffer(encryptedB64);

    return new NextResponse(buffer, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${filename.replace(/"/g, '')}"` } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed', message }, { status: 500 });
  }
}
