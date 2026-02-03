const { PrismaClient } = require('@prisma/client');
(async () => {
  const db = new PrismaClient();
  try {
    const u = await db.user.findMany({ where: { email: { in: ['carrier@example.com','broker@example.com','shipper@example.com','receiver@example.com','dispatcher@example.com'] } }, select: { email: true, kycStatus: true, id: true, carrierType: true } });
    console.log(JSON.stringify(u, null, 2));
  } catch (e) { console.error(e); process.exit(1); } finally { await db.$disconnect(); }
})();

