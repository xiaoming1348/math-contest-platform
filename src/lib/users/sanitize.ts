import type { User } from "@prisma/client";

export function sanitizeUser(u: User) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    organizationId: u.organizationId,
    createdByUserId: u.createdByUserId ?? null,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export default sanitizeUser;
