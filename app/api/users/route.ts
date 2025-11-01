import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { hasRole } from "@/lib/auth/requireRole";
import type { Role } from "@prisma/client";
import { createUserSchema } from "@/lib/validation/userSchemas";
import { sanitizeUser } from "@/lib/users/sanitize";
import { hash } from "bcrypt";

export async function POST(req: Request) {
  try {
    // 1) Auth check
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const allowed: Role[] = ["ADMIN"];
    if (!hasRole(sessionUser.role, allowed)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // 2) Parse & validate input
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { firstName, lastName, email, role, tempPassword } = parsed.data;

    // 3) Enforce email uniqueness (global unique index in schema)
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "email_exists" }, { status: 409 });
    }

    // 4) Hash password
    const hashedPassword = await hash(tempPassword, 10);

    // 5) Create user in same org as admin; record creator
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        firstName,
        lastName,
        role, // must be TEACHER or STUDENT due to schema validation
        organizationId: sessionUser.organizationId,
        createdByUserId: sessionUser.userId,
      },
    });

    return NextResponse.json(
      { ok: true, user: sanitizeUser(user) },
      { status: 201 }
    );
  } catch (err) {
    // Basic error guard
    // log the error server-side for diagnostics
    console.error(err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// Admin-only org-scoped users list
export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const allowed: Role[] = ["ADMIN"];
  if (!hasRole(sessionUser.role, allowed)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Org-scoped list (no cross-org)
  const users = await prisma.user.findMany({
    where: { organizationId: sessionUser.organizationId },
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
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ ok: true, users });
}
