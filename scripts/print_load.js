const { PrismaClient } = require('@prisma/client');
(async () => {
  const db = new PrismaClient();
  try {
    const l = await db.load.findUnique({ where: { externalRef: 'LOAD-SHIP-2001' } });
    console.log(JSON.stringify(l, null, 2));
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
})();
