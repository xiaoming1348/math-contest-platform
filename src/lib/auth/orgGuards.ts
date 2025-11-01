import type { PrismaClient } from "@prisma/client";

// Return true if the two org ids match (string compare).
export function sameOrg(userOrgId: string, targetOrgId: string) {
  return userOrgId === targetOrgId;
}

// Fetch a user by id and ensure they belong to the same org. Returns null if not in same org.
export async function getUserInOrg(
  prisma: PrismaClient,
  userId: string,
  orgId: string
) {
  return prisma.user.findFirst({
    where: { id: userId, organizationId: orgId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      organizationId: true,
      createdByUserId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
