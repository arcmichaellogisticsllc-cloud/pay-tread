import { type NextRequest } from 'next/server';
import prisma from './prisma';
import getUserFromReq from './getUserFromReq';

export async function requireAdmin(req: NextRequest) {
  const token = req.headers.get('x-admin-token') || null;
  const expected = process.env.ADMIN_TOKEN || 'dev-admin-token';
  if (token && token === expected) return { ok: true, via: 'token' };

  const user = await getUserFromReq(req);
  if (!user) return { ok: false, status: 401, message: 'unauthenticated' };
  const role = await prisma.role.findUnique({ where: { id: user.roleId } });
  if (!role || role.name !== 'ADMIN') return { ok: false, status: 403, message: 'forbidden' };
  return { ok: true, via: 'role', user };
}

export default requireAdmin;
