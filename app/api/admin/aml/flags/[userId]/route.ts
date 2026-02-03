import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import requireAdmin from '@/lib/adminAuth';
import type { UserFlag } from '@prisma/client';

type RouteContext = { params?: Record<string, unknown> | Promise<Record<string, unknown>> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json({ error: auth.message || 'unauthorized' }, { status: auth.status || 401 });
    const maybeParams = context && context.params;
    const params = maybeParams && typeof (maybeParams as Promise<Record<string, unknown>>).then === 'function' ? await (maybeParams as Promise<Record<string, unknown>>) : (maybeParams as Record<string, unknown> | undefined);
    const userId = params?.userId as string | undefined;
    if (!userId) return NextResponse.json({ error: 'missing_userId' }, { status: 400 });

    const flags = await prisma.userFlag.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }) as UserFlag[];
    return NextResponse.json({ data: flags });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed', message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json({ error: auth.message || 'unauthorized' }, { status: auth.status || 401 });
    const maybeParams = context && context.params;
    const params = maybeParams && typeof (maybeParams as Promise<Record<string, unknown>>).then === 'function' ? await (maybeParams as Promise<Record<string, unknown>>) : (maybeParams as Record<string, unknown> | undefined);
    const userId = params?.userId as string | undefined;
    if (!userId) return NextResponse.json({ error: 'missing_userId' }, { status: 400 });
    const body = (await req.json().catch(() => ({}))) as { type?: string; reason?: string };
    if (!body.type) return NextResponse.json({ error: 'missing_type' }, { status: 400 });
    const created = await prisma.userFlag.create({ data: { userId, type: body.type, reason: body.reason ?? null, createdBy: null } });
    await prisma.auditLog.create({ data: { actorId: null, actionType: 'ADMIN_FLAG_ADD', targetType: 'UserFlag', targetId: created.id, payload: JSON.stringify({ userId, type: body.type, reason: body.reason }) } });
    return NextResponse.json({ data: created });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed', message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json({ error: auth.message || 'unauthorized' }, { status: auth.status || 401 });
    const maybeParams = context && context.params;
    const params = maybeParams && typeof (maybeParams as Promise<Record<string, unknown>>).then === 'function' ? await (maybeParams as Promise<Record<string, unknown>>) : (maybeParams as Record<string, unknown> | undefined);
    const userId = params?.userId as string | undefined;
    const flagId = String(new URL(req.url).searchParams.get('flagId') || '');
    if (!userId || !flagId) return NextResponse.json({ error: 'missing_params' }, { status: 400 });

    await prisma.userFlag.delete({ where: { id: flagId } });
    await prisma.auditLog.create({ data: { actorId: null, actionType: 'ADMIN_FLAG_REMOVE', targetType: 'UserFlag', targetId: flagId, payload: JSON.stringify({ userId, flagId }) } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed', message }, { status: 500 });
  }
}
