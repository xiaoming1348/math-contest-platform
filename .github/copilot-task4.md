👤 Milestone 1 / Task 4 — Admin Creates Users (Teacher/Student)

Context (do not change):

Next.js 16 (App Router) + TypeScript

Prisma v6 + Postgres

NextAuth credentials flow working (Task 2 ✅)

RBAC helpers and /api/admin-only working (Task 3 ✅)

Prisma client at src/lib/db/prisma.ts

Session helper at src/lib/auth/getSessionUser.ts

Role helper at src/lib/auth/requireRole.ts

We are not building classes/assignments. Only “Accounts”.

Goal of Task 4:

Add an Admin-only endpoint to create Teacher/Student users in the same organization.

Validate request body with Zod.

Hash a provided tempPassword with bcrypt.

Return a sanitized user (never return password).

Important routing note:
Use the same app root as /login and /api/admin-only:

If those live under app/..., use app/...

If they live under src/app/..., use src/app/...
Pick one; do not create both.

PART A — Validation & sanitizer

Create: src/lib/validation/userSchemas.ts
Use Zod; import Prisma Role enum for type safety.

import { z } from "zod";
import type { Role } from "@prisma/client";

export const AllowedNewRoles: Readonly<Role[]> = ["TEACHER", "STUDENT"] as const;

export const createUserSchema = z.object({
firstName: z.string().min(1).max(100),
lastName: z.string().min(1).max(100),
email: z.string().email().max(255),
role: z.custom<Role>((val) => typeof val === "string", {
message: "Invalid role",
}).refine((val) => (AllowedNewRoles as readonly string[]).includes(val as string), {
message: "Role must be TEACHER or STUDENT",
}) as z.ZodType<Role>,
tempPassword: z.string().min(8).max(128),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

Create: src/lib/users/sanitize.ts
Sanitize Prisma User to a safe payload.

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

PART B — POST /api/users (Admin-only)

Create one route file in the correct app root:

app/api/users/route.ts or src/app/api/users/route.ts

Contents:

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

    return NextResponse.json({ ok: true, user: sanitizeUser(user) }, { status: 201 });

} catch (err) {
// Basic error guard
return NextResponse.json({ error: "server_error" }, { status: 500 });
}
}

Rules:

Do not allow creating ADMIN here (Zod schema already restricts to TEACHER/STUDENT).

Do not return hashedPassword.

Always scope to sessionUser.organizationId.

PART C — Minimal Admin Dashboard Form (optional but handy)

If no admin dashboard exists yet, create one page as a quick UI to call POST /api/users.

app/dashboard/admin/page.tsx or src/app/dashboard/admin/page.tsx

import { getSessionUser } from "@/lib/auth/getSessionUser";
import { hasRole } from "@/lib/auth/requireRole";
import type { Role } from "@prisma/client";
import CreateUserForm from "./CreateUserForm";

export default async function AdminDashboardPage() {
const sessionUser = await getSessionUser();
if (!sessionUser) return <div>401 unauthorized</div>;

const allowed: Role[] = ["ADMIN"];
if (!hasRole(sessionUser.role, allowed)) return <div>403 forbidden</div>;

return (
<main className="max-w-xl mx-auto py-10">
<h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
<CreateUserForm />
</main>
);
}

Create a client form component next to it:

app/dashboard/admin/CreateUserForm.tsx or src/app/dashboard/admin/CreateUserForm.tsx

"use client";

import { useState } from "react";

export default function CreateUserForm() {
const [firstName, setFirstName] = useState("Test");
const [lastName, setLastName] = useState("Teacher");
const [email, setEmail] = useState("teacher1@berkeley-math.org");
const [role, setRole] = useState<"TEACHER" | "STUDENT">("TEACHER");
const [tempPassword, setTempPassword] = useState("teacher123");
const [result, setResult] = useState<string | null>(null);

async function onSubmit(e: React.FormEvent) {
e.preventDefault();
setResult(null);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, role, tempPassword }),
    });

    const json = await res.json();
    if (!res.ok) {
      setResult(`Error: ${json.error || res.status}`);
      return;
    }
    setResult(`Created: ${json.user.email} (${json.user.role})`);

}

return (
<form onSubmit={onSubmit} className="space-y-3">
<div className="flex gap-2">
<input className="border p-2 rounded w-1/2" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} />
<input className="border p-2 rounded w-1/2" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} />
</div>
<input className="border p-2 rounded w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
<select className="border p-2 rounded w-full" value={role} onChange={e => setRole(e.target.value as any)}>
<option value="TEACHER">TEACHER</option>
<option value="STUDENT">STUDENT</option>
</select>
<input className="border p-2 rounded w-full" placeholder="Temp password" type="password" value={tempPassword} onChange={e => setTempPassword(e.target.value)} />
<button className="bg-black text-white p-2 rounded" type="submit">Create User</button>
{result && <p className="text-sm mt-2">{result}</p>}
</form>
);
}

PART D — Output for me

After implementing Parts A–C, stop and print:

Files created/updated (exact absolute paths), including which app root you used.

Any import aliases adjusted.

Do not run dev server or send HTTP requests in this prompt.

PART E — I will verify manually

I’ll do these steps locally:

pnpm dev

As ADMIN, open:
http://localhost:3000/dashboard/admin

Use the form to create a Teacher:

Email: teacher1@berkeley-math.org

Temp password: teacher123

Expect: UI says Created: teacher1@berkeley-math.org (TEACHER) and server returns 201.

Incognito window, login as the new Teacher:

http://localhost:3000/login

Email: teacher1@berkeley-math.org

Password: teacher123

Expect: “Login success”.

Hit the admin-only route as Teacher:

http://localhost:3000/api/admin-only

Expect: 403 { "error": "forbidden" }

Logged out (private window, no cookies):

http://localhost:3000/api/users (POST without body just to see guard)

Expect: 401.

If all pass: Task 4 is complete ✅.

Constraints for Copilot

Keep changes minimal and surgical.

Do not modify existing auth/session logic.

Do not add new dependencies beyond Zod if missing (pnpm add zod).

Use existing alias @/ (paths already fixed in tsconfig.json).

Use one app root only (app/... or src/app/...).

Implement Parts A–D only, then stop.
