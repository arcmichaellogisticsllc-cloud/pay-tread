import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const brokerRole = await prisma.role.upsert({
    where: { name: "BROKER" },
    update: {},
    create: { name: "BROKER" },
  });

  const carrierRole = await prisma.role.upsert({
    where: { name: "CARRIER" },
    update: {},
    create: { name: "CARRIER" },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  // Additional roles requested: DISPATCHER, SHIPPER, RECEIVER
  const dispatcherRole = await prisma.role.upsert({
    where: { name: "DISPATCHER" },
    update: {},
    create: { name: "DISPATCHER" },
  });

  const shipperRole = await prisma.role.upsert({
    where: { name: "SHIPPER" },
    update: {},
    create: { name: "SHIPPER" },
  });

  const receiverRole = await prisma.role.upsert({
    where: { name: "RECEIVER" },
    update: {},
    create: { name: "RECEIVER" },
  });

  const broker = await prisma.user.upsert({
    where: { email: "broker@example.com" },
    update: {},
    create: {
      email: "broker@example.com",
      roleId: brokerRole.id,
      profile: JSON.stringify({ company: "Acme Brokerage" }),
    },
  });
  // ensure KYC status is set (use update to avoid TypeScript generated types mismatch)
  await prisma.user.update({ where: { email: "broker@example.com" }, data: ({ kycStatus: 'VERIFIED' } as any) }).catch(() => null as any);

  const carrier = await prisma.user.upsert({
    where: { email: "carrier@example.com" },
    update: {},
    create: ({
      email: "carrier@example.com",
      roleId: carrierRole.id,
      profile: JSON.stringify({ name: "Joe's Trucking" }),
      carrierType: 'FLEET',
    } as any),
  });
  // default KYC for carrier
  await prisma.user.update({ where: { email: "carrier@example.com" }, data: ({ kycStatus: 'VERIFIED', carrierType: 'FLEET' } as any) }).catch(() => null as any);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      roleId: adminRole.id,
      profile: JSON.stringify({ name: "PayTread Admin" }),
    },
  });
  await prisma.user.update({ where: { email: "admin@example.com" }, data: ({ kycStatus: 'VERIFIED' } as any) }).catch(() => null as any);

  const carrierWallet = await prisma.wallet.upsert({
    where: { id: "carrier-wallet-1" },
    update: {},
    create: {
      id: "carrier-wallet-1",
      ownerId: carrier.id,
      balanceCents: 0,
      pendingCents: 0,
      clearedCents: 0,
    },
  });

  const load = await prisma.load.upsert({
    where: { externalRef: "LOAD-1001" },
    update: {
      brokerId: broker.id,
      carrierId: carrier.id,
      grossAmount: 150000,
      currency: "USD",
      deliveredAt: new Date(),
      status: "POD_SUBMITTED",
      accessorials: JSON.stringify({ fuel: 5000 }),
    },
    create: {
      externalRef: "LOAD-1001",
      brokerId: broker.id,
      carrierId: carrier.id,
      grossAmount: 150000,
      currency: "USD",
      deliveredAt: new Date(),
      status: "POD_SUBMITTED",
      accessorials: JSON.stringify({ fuel: 5000 }),
    },
  });

  let pod = await prisma.pod.findFirst({ where: { s3Key: "pods/LOAD-1001/pod.pdf" } });
  if (!pod) {
    pod = await prisma.pod.create({
      data: {
        loadId: load.id,
        uploadedBy: carrier.id,
        s3Key: "pods/LOAD-1001/pod.pdf",
        mime: "application/pdf",
        checksum: "abc123",
        submittedAt: new Date(),
        status: "SUBMITTED",
      },
    });
  }

  // Create an initial ledger credit to the carrier (simulating POD approval)
  const txn1 = await prisma.walletTransaction.create({
    data: {
      walletId: carrierWallet.id,
      loadId: load.id,
      type: "LOAD_GROSS",
      amountCents: 150000,
      balanceAfterCents: 150000,
      metadata: JSON.stringify({ note: "POD approved credit" }),
      createdBy: broker.id,
    },
  });

  // Create a sample partial payout (idempotent)
  const existingPayout = await prisma.payout.findUnique({ where: { externalPaymentId: "ext-pay-123" } }).catch(() => null as any);
  if (!existingPayout) {
    const payoutTxn = await prisma.walletTransaction.create({
      data: {
        walletId: carrierWallet.id,
        loadId: load.id,
        type: "PARTIAL_PAYOUT",
        amountCents: -50000,
        balanceAfterCents: 100000,
        metadata: JSON.stringify({ payout_method: "instant_rtp" }),
        createdBy: broker.id,
      },
    });

    await prisma.payout.create({
      data: {
        loadId: load.id,
        walletTransactionId: payoutTxn.id,
        amountCents: 50000,
        method: "instant_rtp",
        status: "SENT",
        processedAt: new Date(),
        externalPaymentId: "ext-pay-123",
        requestedBy: broker.id,
      },
    });
  }

  // Create sample users for new roles: dispatcher, shipper, receiver
  const dispatcher = await prisma.user.upsert({
    where: { email: 'dispatcher@example.com' },
    update: {},
    create: { email: 'dispatcher@example.com', roleId: dispatcherRole.id, profile: JSON.stringify({ name: 'Local Dispatcher' }) },
  });
  await prisma.user.update({ where: { email: 'dispatcher@example.com' }, data: ({ kycStatus: 'VERIFIED' } as any) }).catch(() => null as any);

  const shipper = await prisma.user.upsert({
    where: { email: 'shipper@example.com' },
    update: {},
    create: { email: 'shipper@example.com', roleId: shipperRole.id, profile: JSON.stringify({ name: 'Acme Shipper' }) },
  });
  await prisma.user.update({ where: { email: 'shipper@example.com' }, data: ({ kycStatus: 'VERIFIED' } as any) }).catch(() => null as any);

  const receiver = await prisma.user.upsert({
    where: { email: 'receiver@example.com' },
    update: {},
    create: { email: 'receiver@example.com', roleId: receiverRole.id, profile: JSON.stringify({ name: 'Warehouse Receiver' }) },
  });
  await prisma.user.update({ where: { email: 'receiver@example.com' }, data: ({ kycStatus: 'VERIFIED' } as any) }).catch(() => null as any);

  // Upsert wallets for these sample users
  await prisma.wallet.upsert({ where: { id: 'dispatcher-wallet-1' }, update: {}, create: { id: 'dispatcher-wallet-1', ownerId: dispatcher.id, balanceCents: 0, pendingCents: 0, clearedCents: 0 } });
  await prisma.wallet.upsert({ where: { id: 'shipper-wallet-1' }, update: {}, create: { id: 'shipper-wallet-1', ownerId: shipper.id, balanceCents: 0, pendingCents: 0, clearedCents: 0 } });
  await prisma.wallet.upsert({ where: { id: 'receiver-wallet-1' }, update: {}, create: { id: 'receiver-wallet-1', ownerId: receiver.id, balanceCents: 0, pendingCents: 0, clearedCents: 0 } });

  // Create a sample load that demonstrates the shipper -> carrier -> receiver workflow
  // Idempotent: only create if the externalRef doesn't already exist
  let shipLoad = await prisma.load.findUnique({ where: { externalRef: 'LOAD-SHIP-2001' } }).catch(() => null as any);
  if (!shipLoad) {
    shipLoad = await prisma.load.create({
      data: ({
        externalRef: 'LOAD-SHIP-2001',
        grossAmount: 200000,
        currency: 'USD',
        pickupAddress: '100 Origin St, Springfield, OR',
        pickupDatetime: new Date(Date.now() - 1000 * 60 * 60 * 24),
        deliveryAddress: '200 Destination Ave, Warehouse City, RC',
        // not delivered yet; shipment is en route
        status: 'ENROUTE',
        acceptedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        accessorials: JSON.stringify({ liftgate: true }),
        notes: 'Sample shipper-created load assigned to carrier and en route',
        shipper: { connect: { id: shipper.id } },
        receiver: { connect: { id: receiver.id } },
        assignedCarrier: { connect: { id: carrier.id } },
        // connect broker as well
        broker: { connect: { id: broker.id } },
      } as any),
    });

    // Audit: shipper created the load
    await prisma.auditLog.create({
      data: {
        actorId: shipper.id,
        actionType: 'LOAD_CREATED',
        targetType: 'LOAD',
        targetId: shipLoad.id,
        payload: JSON.stringify({ externalRef: shipLoad.externalRef, grossAmount: shipLoad.grossAmount }),
      },
    });

    // Audit: carrier accepted the load
    await prisma.auditLog.create({
      data: {
        actorId: carrier.id,
        actionType: 'LOAD_ACCEPTED',
        targetType: 'LOAD',
        targetId: shipLoad.id,
        payload: JSON.stringify({ acceptedAt: shipLoad.acceptedAt }),
      },
    });

    // Notify receiver that shipment is en route
    const recvMsg = `Shipment ${shipLoad.externalRef} is en route to ${shipLoad.deliveryAddress}`;
    const existingRecvNotif = await prisma.notification.findFirst({ where: { forUserId: receiver.id, message: recvMsg } }).catch(() => null as any);
    if (!existingRecvNotif) {
      await prisma.notification.create({
        data: {
          forUserId: receiver.id,
          message: recvMsg,
          link: `/loads/${shipLoad.id}`,
        },
      });
    }

    // Notify shipper that carrier accepted and shipment is in route
    const shipMsg = `Carrier accepted ${shipLoad.externalRef}; shipment is in route.`;
    const existingShipperNotif = await prisma.notification.findFirst({ where: { forUserId: shipper.id, message: shipMsg } }).catch(() => null as any);
    if (!existingShipperNotif) {
      await prisma.notification.create({
        data: {
          forUserId: shipper.id,
          message: shipMsg,
          link: `/loads/${shipLoad.id}`,
        },
      });
    }

    // Notify dispatcher (if exists) that assignment occurred
    const dispMsg = `Load ${shipLoad.externalRef} assigned to ${carrier.email}`;
    const existingDispNotif = await prisma.notification.findFirst({ where: { forUserId: dispatcher.id, message: dispMsg } }).catch(() => null as any);
    if (!existingDispNotif) {
      await prisma.notification.create({ data: { forUserId: dispatcher.id, message: dispMsg, link: `/loads/${shipLoad.id}` } });
    }
  }
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
