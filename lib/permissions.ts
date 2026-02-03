import prisma from './prisma';

export async function getRoleNameForUser(user: any) {
  if (!user) return null;
  if ((user as any).role && (user as any).role.name) return (user as any).role.name;
  if (user.roleId) {
    const r = await prisma.role.findUnique({ where: { id: user.roleId } });
    return r?.name ?? null;
  }
  return null;
}

export async function canViewLoad(user: any, load: any) {
  // Admins can see everything
  const role = await getRoleNameForUser(user);
  if (role === 'ADMIN') return true;

  // owners/participants may see loads where they are involved
  if (!user) return false;
  const id = user.id;
  if (!id) return false;
  if (load.shipperId === id) return true;
  if (load.carrierId === id) return true;
  if (load.receiverId === id) return true;
  if (load.brokerId === id) return true;
  // otherwise deny
  return false;
}

export async function canApprovePodViaUi(user: any, load: any) {
  // Only Admins and Brokers may approve PODs via the explicit approve endpoint.
  const role = await getRoleNameForUser(user);
  return role === 'ADMIN' || role === 'BROKER';
}

export async function isDispatcher(user: any) {
  const role = await getRoleNameForUser(user);
  return role === 'DISPATCHER';
}
