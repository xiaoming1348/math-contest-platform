🛡️ Milestone 1 / Task 7 — Org Isolation Hardening

Context (do not change):

Next.js 16 App Router + TypeScript

Prisma v6 + Postgres

Auth & sessions working (Task 2 ✅)

RBAC helpers working (Task 3 ✅)

Admin creates users working (Task 4 ✅)

“Me” profile working (Task 5 ✅)

Role dashboards working (Task 6 ✅)

Prisma client at @/lib/db/prisma

Session helper @/lib/auth/getSessionUser

Role helper @/lib/auth/requireRole (hasRole)

App root: app/... (not src/app)

Goal of Task 7:

Add small org guard helpers and apply them to new read/list endpoints so Admins can view only their own org’s users.

Ensure no endpoint ever trusts a client-provided organizationId.

PART A — Add tiny org guard helpers

Create: src/lib/auth/orgGuards.ts (update if file exists)

import type { PrismaClient } from "@prisma/client";

/\*_ Return true if the two org ids match (string compare). _/
export function sameOrg(userOrgId: string, targetOrgId: string) {
return userOrgId === targetOrgId;
}

/\*_ Fetch a user by id and ensure they belong to the same org. Returns null if not in same org. _/
export async function getUserInOrg(prisma: PrismaClient, userId: string, orgId: string) {
return prisma.user.findFirst({
where: { id: userId, organizationId: orgId },
select: {
id: true, email: true, firstName: true, lastName: true,
role: true, organizationId: true, createdByUserId: true,
createdAt: true, updatedAt: true,
}
});
}

PART B — Admin-only users list (org-scoped)

Create: app/api/users/route.ts (GET handler)
(Keep your existing POST; add GET below it.)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { hasRole } from "@/lib/auth/requireRole";
import type { Role } from "@prisma/client";

// EXISTING: export async function POST(...) { ... } ← keep your create-user code here

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
id: true, email: true, firstName: true, lastName: true,
role: true, organizationId: true, createdByUserId: true,
createdAt: true, updatedAt: true,
},
orderBy: [{ role: "asc" }, { createdAt: "desc" }]
});

return NextResponse.json({ ok: true, users });
}

PART C — Admin-only user detail (org-scoped)

Create: app/api/users/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { hasRole } from "@/lib/auth/requireRole";
import type { Role } from "@prisma/client";
import { getUserInOrg } from "@/lib/auth/orgGuards";

type Params = { params: { id: string } };

export async function GET(\_req: Request, { params }: Params) {
const sessionUser = await getSessionUser();
if (!sessionUser) {
return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
const allowed: Role[] = ["ADMIN"];
if (!hasRole(sessionUser.role, allowed)) {
return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

const user = await getUserInOrg(prisma, params.id, sessionUser.organizationId);
if (!user) {
// Either not found or not in this org
return NextResponse.json({ error: "not_found" }, { status: 404 });
}

return NextResponse.json({ ok: true, user });
}

PART D — Hardening notes (no code unless you see issues)

Do not accept organizationId from clients anywhere. For create/update, always use sessionUser.organizationId.

If any existing schema allows organizationId in a POST/PATCH body, ignore it (or explicitly strip it) on the server.

Keep responses sanitized (no hashedPassword).

PART E — Output for me

After implementing A–C, stop and print:

The exact paths you created/updated.

Confirm that /api/users now supports GET (org-scoped, admin-only).

Confirm that /api/users/[id] GET is org-scoped, admin-only.

Do not run the dev server or hit endpoints in this prompt.

PART F — I will verify manually
pnpm dev

As Admin (logged in):

GET /api/users → 200 with only users from your org

GET /api/users/<teacherId> → 200 with that teacher’s data

GET /api/users/<randomNonexistentId> → 404

As Teacher (incognito, teacher1):

GET /api/users → 403

GET /api/users/<teacherId> → 403

Logged out (incognito no cookies):

GET /api/users → 401

(Cross-org tests come in later milestones when you add a second org; the code is ready for it.)

Constraints for Copilot

Keep changes minimal and surgical.

Don’t touch existing auth/session logic or DB schema.

Use @/ alias.

Use only the app/... root.

Implement Parts A–E only, then stop.
