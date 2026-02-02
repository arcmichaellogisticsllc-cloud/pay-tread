import prisma from './prisma';

export default async function getUserFromReq(req: Request) {
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
