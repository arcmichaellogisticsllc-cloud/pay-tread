const { PrismaClient } = require('@prisma/client');
(async () => {
  const db = new PrismaClient();
  try {
    const p = await db.payout.findMany({ where: { loadId: '6d9c7c8e-eb7d-4ce1-a932-20d15dcaad93' } });
    console.log(JSON.stringify(p, null, 2));
  } catch (e) { console.error(e); process.exit(1); } finally { await db.$disconnect(); }
})();
