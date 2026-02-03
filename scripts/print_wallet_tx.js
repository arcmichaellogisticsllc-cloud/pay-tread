const { PrismaClient } = require('@prisma/client');
(async () => {
  const db = new PrismaClient();
  try {
    const txs = await db.walletTransaction.findMany({ where: { walletId: 'carrier-wallet-1' }, orderBy: { createdAt: 'asc' } });
    console.log(JSON.stringify(txs, null, 2));
  } catch (e) { console.error(e); process.exit(1); } finally { await db.$disconnect(); }
})();
