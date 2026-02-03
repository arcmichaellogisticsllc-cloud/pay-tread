import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import requireAdmin from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return NextResponse.json({ error: auth.message || 'unauthorized' }, { status: auth.status || 401 });

    // Disputes are represented by Ratings with issueReported=true or Loads with notes containing 'DISPUTE'
    const ratings = await prisma.rating.findMany({ where: { issueReported: true }, include: { load: true, rater: true, ratee: true } });

    const loadsWithDisputeNote = await prisma.load.findMany({ where: { notes: { contains: 'DISPUTE' } } });

    return NextResponse.json({ data: { ratings, loadsWithDisputeNote } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'failed', message }, { status: 500 });
  }
}
