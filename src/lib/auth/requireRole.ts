import type { Role } from "@prisma/client";

export function hasRole(userRole: Role | string, allowed: Role[]): boolean {
  // tolerate string in session, but compare as enum values
  return allowed.includes(userRole as Role);
}
