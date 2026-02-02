const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const brokerRole = await prisma.role.upsert({
    where: { name: 'BROKER' },
    update: {},
    create: { name: 'BROKER' },
  });

  const carrierRole = await prisma.role.upsert({
    where: { name: 'CARRIER' },
    update: {},
    create: { name: 'CARRIER' },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const broker = await prisma.user.upsert({
    where: { email: 'broker@example.com' },
    update: {},
    create: {
      email: 'broker@example.com',
      roleId: brokerRole.id,
      // store profile as JSON string in SQLite dev
      profile: JSON.stringify({ company: 'Acme Brokerage' }),
      kycStatus: 'VERIFIED',
    },
  });

  const carrier = await prisma.user.upsert({
    where: { email: 'carrier@example.com' },
    update: {},
    create: {
      email: 'carrier@example.com',
      roleId: carrierRole.id,
      profile: JSON.stringify({ name: "Joe's Trucking" }),
      kycStatus: 'UNVERIFIED',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      roleId: adminRole.id,
      profile: JSON.stringify({ name: 'PayTread Admin' }),
      kycStatus: 'VERIFIED',
    },
  });

  const carrierWallet = await prisma.wallet.upsert({
    where: { id: 'carrier-wallet-1' },
    update: {},
    create: {
      id: 'carrier-wallet-1',
      ownerId: carrier.id,
      balanceCents: 0,
      pendingCents: 0,
      clearedCents: 0,
    },
  });

  // create or find load by externalRef so seed is idempotent
  let load = await prisma.load.findUnique({ where: { externalRef: 'LOAD-1001' } });
  if (!load) {
    load = await prisma.load.create({
      data: {
        externalRef: 'LOAD-1001',
        brokerId: broker.id,
        carrierId: carrier.id,
        grossAmount: 150000,
        currency: 'USD',
        deliveryDatetime: new Date(),
        status: 'POD_SUBMITTED',
        accessorials: JSON.stringify({ fuel: 5000 }),
      },
    });
  }

  // ensure a pod exists for the load
  let pod = await prisma.pod.findFirst({ where: { loadId: load.id, s3Key: 'pods/LOAD-1001/pod.pdf' } });
  if (!pod) {
    pod = await prisma.pod.create({
      data: {
        loadId: load.id,
        uploadedBy: carrier.id,
        s3Key: 'pods/LOAD-1001/pod.pdf',
        mime: 'application/pdf',
        checksum: 'abc123',
        submittedAt: new Date(),
        status: 'SUBMITTED',
      },
    });
  }

  // Create an initial ledger credit to the carrier (simulating POD approval)
  let txn1 = await prisma.walletTransaction.findFirst({ where: { walletId: carrierWallet.id, loadId: load.id, type: 'LOAD_GROSS', amountCents: 150000 } });
  if (!txn1) {
    txn1 = await prisma.walletTransaction.create({
      data: {
        walletId: carrierWallet.id,
        loadId: load.id,
        type: 'LOAD_GROSS',
        amountCents: 150000,
        balanceAfterCents: 150000,
        metadata: JSON.stringify({ note: 'POD approved credit' }),
        createdBy: broker.id,
      },
    });
  }

  // Create a sample partial payout transaction idempotently
  let payoutTxn = await prisma.walletTransaction.findFirst({ where: { walletId: carrierWallet.id, loadId: load.id, type: 'PARTIAL_PAYOUT', amountCents: -50000 } });
  if (!payoutTxn) {
    payoutTxn = await prisma.walletTransaction.create({
      data: {
        walletId: carrierWallet.id,
        loadId: load.id,
        type: 'PARTIAL_PAYOUT',
        amountCents: -50000,
        balanceAfterCents: 100000,
        metadata: JSON.stringify({ payout_method: 'instant_rtp' }),
        createdBy: broker.id,
      },
    });
  }

  // Create payout record idempotently (prefer externalPaymentId, otherwise by walletTransactionId)
  const existingPayout = await prisma.payout.findFirst({ where: { OR: [{ externalPaymentId: 'ext-pay-123' }, { walletTransactionId: payoutTxn.id }] } });
  if (!existingPayout) {
    await prisma.payout.create({
      data: {
        loadId: load.id,
        walletTransactionId: payoutTxn.id,
        amountCents: 50000,
        method: 'instant_rtp',
        status: 'SENT',
        processedAt: new Date(),
        externalPaymentId: 'ext-pay-123',
        requestedBy: broker.id,
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
