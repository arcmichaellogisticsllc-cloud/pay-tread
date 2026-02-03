import prisma from './prisma';

export async function logAccess(actorId: string | null, actionType: string, payload: Record<string, unknown> = {}) {
  try {
    await prisma.auditLog.create({ data: { actorId: actorId ?? null, actionType, targetType: 'ACCESS_LOG', targetId: null, payload: JSON.stringify(payload) } });
  } catch (e) {
    // best-effort logging; swallow errors in dev
    // console.warn('accessLog failed', e);
  }
}

export default logAccess;
