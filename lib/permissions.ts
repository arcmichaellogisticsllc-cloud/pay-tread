import prisma from './prisma';

type UserLike = { id?: string; roleId?: number; role?: { name?: string } } | null;

export async function getRoleNameForUser(user: UserLike) {
  if (!user) return null;
  if (user.role && user.role.name) return user.role.name;
  if (user.roleId !== undefined && user.roleId !== null) {
    const r = await prisma.role.findUnique({ where: { id: user.roleId } });
    return r?.name ?? null;
  }
  return null;
}

export async function canViewLoad(user: UserLike, load: { shipperId?: string; carrierId?: string; receiverId?: string; brokerId?: string } | null) {
  // Admins can see everything
  const role = await getRoleNameForUser(user);
  if (role === 'ADMIN') return true;

  // owners/participants may see loads where they are involved
  if (!user) return false;
  const id = user.id;
  if (!id) return false;
  if (!load) return false;
  if (load.shipperId === id) return true;
  if (load.carrierId === id) return true;
  if (load.receiverId === id) return true;
  if (load.brokerId === id) return true;
  // otherwise deny
  return false;
}

export async function canApprovePodViaUi(user: UserLike) {
  // Only Admins and Brokers may approve PODs via the explicit approve endpoint.
  const role = await getRoleNameForUser(user);
  return role === 'ADMIN' || role === 'BROKER';
}

export async function isDispatcher(user: UserLike) {
  const role = await getRoleNameForUser(user);
  return role === 'DISPATCHER';
}
