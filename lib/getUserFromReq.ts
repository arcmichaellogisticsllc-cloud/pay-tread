import prisma from './prisma';

// Accept either the standard Request or Next.js's NextRequest to be flexible
export default async function getUserFromReq(req: Request | import('next/server').NextRequest) {
  try {
    const url = new URL(req.url);
    const email = req.headers.get('x-user-email') || url.searchParams.get('email') || null;
    if (!email) return null;
    const user = await prisma.user.findUnique({ where: { email } });
    return user;
  } catch (err) {
    return null;
  }
}
