import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { hasRole } from "@/lib/auth/requireRole";

export async function GET() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const allowed: Role[] = ["ADMIN"];
  if (!hasRole(sessionUser.role, allowed)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Success: prove we can read enriched fields (from Task 2)
  return NextResponse.json({
    ok: true,
    user: {
      userId: sessionUser.userId,
      email: sessionUser.email,
      role: sessionUser.role,
      organizationId: sessionUser.organizationId,
      firstName: sessionUser.firstName,
      lastName: sessionUser.lastName,
    },
  });
}
