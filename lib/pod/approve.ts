import prisma from '../prisma';

type ApproveResult = { txn?: any; alreadyApproved?: boolean };

export async function approvePodCanonical(podId: string, actorId?: string): Promise<ApproveResult> {
  // Idempotent pod approval that credits carrier wallet with LOAD_GROSS if not already done.
  const pod = await prisma.pod.findUnique({ where: { id: podId } });
  if (!pod) throw new Error('pod_not_found');

  const load = await prisma.load.findUnique({ where: { id: pod.loadId } });
  if (!load) throw new Error('load_not_found');

  if (!load.carrierId) throw new Error('no_carrier_assigned');

  // If pod already approved and a LOAD_GROSS txn exists, return it
  if (pod.status === 'APPROVED' || pod.approvedAt) {
    const existing = await prisma.walletTransaction.findFirst({ where: { loadId: load.id, type: 'LOAD_GROSS' }, orderBy: { createdAt: 'desc' } });
    return { txn: existing, alreadyApproved: true };
  }

  // Find or create carrier wallet
  let carrierWallet = await prisma.wallet.findFirst({ where: { ownerId: load.carrierId } });
  if (!carrierWallet) {
    carrierWallet = await prisma.wallet.create({ data: { ownerId: load.carrierId, balanceCents: 0, pendingCents: 0, clearedCents: 0 } });
  }

  const lastTxn = await prisma.walletTransaction.findFirst({ where: { walletId: carrierWallet.id }, orderBy: { createdAt: 'desc' } });
  const previousBalance = lastTxn ? lastTxn.balanceAfterCents : 0;
  const creditAmount = load.grossAmount;
  const newBalance = previousBalance + creditAmount;

  // Create txn and update pod status and carrier wallet in a transaction
  const results = await prisma.$transaction([
    prisma.pod.update({ where: { id: podId }, data: { status: 'APPROVED', approvedAt: new Date(), approvedBy: actorId ?? 'system' } }),
    prisma.wallet.update({ where: { id: carrierWallet.id }, data: { balanceCents: { increment: creditAmount } } }),
    prisma.walletTransaction.create({ data: { walletId: carrierWallet.id, loadId: load.id, type: 'LOAD_GROSS', amountCents: creditAmount, balanceAfterCents: newBalance, metadata: JSON.stringify({ note: `POD ${podId} approved` }), createdBy: actorId ?? 'system' } }),
    prisma.auditLog.create({ data: { actorId: actorId ?? null, actionType: 'POD_APPROVE', targetType: 'POD', targetId: podId, payload: JSON.stringify({ loadId: load.id, podId }), } }),
  ] as any);

  const createdTxn = results[2];
  return { txn: createdTxn, alreadyApproved: false };
}
