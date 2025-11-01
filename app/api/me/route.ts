import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import sanitizeUser from "@/lib/users/sanitize";
import { updateMeSchema } from "@/lib/validation/meSchemas";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.userId },
    include: { organization: { select: { id: true, name: true } } },
  });

  if (!user) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const safeUser = sanitizeUser(user as any);

  return NextResponse.json({
    ok: true,
    user: safeUser,
    organization: user.organization,
  });
}

export async function PATCH(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = updateMeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { firstName, lastName } = parsed.data;
  const data: Record<string, string> = {};
  if (typeof firstName === "string" && firstName.trim().length > 0)
    data.firstName = firstName.trim();
  if (typeof lastName === "string" && lastName.trim().length > 0)
    data.lastName = lastName.trim();

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: sessionUser.userId },
    data,
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      organizationId: true,
      createdByUserId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ ok: true, user: updated });
}
