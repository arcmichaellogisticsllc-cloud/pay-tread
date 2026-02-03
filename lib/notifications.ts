import prisma from './prisma';
import fs from 'fs';
import path from 'path';

export async function sendNotification(userId: string | null, type: string, message: string, link?: string) {
  if (!userId) return;
  try {
    await prisma.notification.create({ data: { forUserId: userId, type, message, link: link ?? null } });
  } catch (e) {
    console.error('Failed to create notification', e);
  }
}

export async function sendPayoutReceipt(payoutId: string) {
  try {
    const payout = await prisma.payout.findUnique({ where: { id: payoutId }, include: { load: true } });
    if (!payout) return;

    // Build receipt
    // payout may be a loose typed object in this workspace; access fields defensively
    const amountCents = (payout as unknown as { amountCents?: number })?.amountCents ?? 0;
    const feeCents = (payout as unknown as { feeCents?: number })?.feeCents ?? 0;
    const receipt = {
      id: `receipt-${payout.id}`,
      payoutId: payout.id,
      loadId: payout.loadId,
      amountCents,
      feeCents,
      netCents: (amountCents - feeCents),
      method: (payout as unknown as { method?: string })?.method ?? null,
      processedAt: ((payout as unknown as { processedAt?: Date | string })?.processedAt ?? new Date()).toString(),
      externalPaymentId: (payout as unknown as { externalPaymentId?: string })?.externalPaymentId ?? null,
    };

    // Store receipt JSON in tmp for dev and create a notification for the requesting user
    const receiptsDir = path.join(process.cwd(), 'tmp', 'receipts');
    try { fs.mkdirSync(receiptsDir, { recursive: true }); } catch (e) {
      // ignore
    }
    const filePath = path.join(receiptsDir, `${receipt.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(receipt, null, 2));

    // create in-app notification for whoever requested the payout
  const targetUserId = (payout as unknown as { requestedBy?: string | null })?.requestedBy ?? null;
    if (targetUserId) {
      await prisma.notification.create({ data: { forUserId: targetUserId, type: 'PAYOUT_RECEIPT', message: `Payout ${payout.id} sent`, link: `/receipts/${receipt.id}`, } });
    }

    // Log to console (dev email hook)
    console.log('Payout receipt written to', filePath);
    return { receipt, filePath };
  } catch (e) {
    console.error('Failed to send payout receipt', e);
    return null;
  }
}
