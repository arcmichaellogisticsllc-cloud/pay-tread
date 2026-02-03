import { NextResponse, type NextRequest } from 'next/server';
import prisma from '../../../../../lib/prisma';
import getUserFromReq from '../../../../../lib/getUserFromReq';

// Admin-protected endpoint: allow access if either x-admin-token matches ADMIN_TOKEN or
// the request's user (x-user-email) has role 'ADMIN' in the DB.
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('x-admin-token') || null;
    const expected = process.env.ADMIN_TOKEN || 'dev-admin-token';
    if (token && token === expected) {
      const rows = await prisma.walletTransaction.findMany({ take: 200, orderBy: { createdAt: 'desc' } });
      return NextResponse.json({ data: rows });
    }

    // fallback to role-based check
    const user = await getUserFromReq(req);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const role = await prisma.role.findUnique({ where: { id: user.roleId } });
    if (!role || role.name !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const rows = await prisma.walletTransaction.findMany({ take: 200, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ data: rows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed', message }, { status: 500 });
  }
}
