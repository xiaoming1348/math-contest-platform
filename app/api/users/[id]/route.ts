import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { hasRole } from "@/lib/auth/requireRole";
import type { Role } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const resolved = await params;
  console.log("HIT /api/users/[id] (item) GET resolved params =", resolved);
  if (!resolved?.id)
    return NextResponse.json(
      { error: "missing_id_param", params: resolved },
      { status: 400 }
    );
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const allowed: Role[] = ["ADMIN"];
  if (!hasRole(sessionUser.role, allowed)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // TEMP DEBUG: prove we are using the requested id and current role
  console.log("[users/[id]] params (resolved) =", resolved);

  const user = await prisma.user.findFirst({
    where: {
      id: resolved.id,
      organizationId: sessionUser.organizationId, // enforce same org
    },
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

  if (!user) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, user });
}
