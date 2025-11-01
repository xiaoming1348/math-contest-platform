import { getSessionUser } from "@/lib/auth/getSessionUser";
import { hasRole } from "@/lib/auth/requireRole";
import type { Role } from "@prisma/client";

export default async function StudentDashboardPage() {
  const user = await getSessionUser();
  if (!user) return <div>401 unauthorized</div>;

  const allowed: Role[] = ["STUDENT"];
  if (!hasRole(user.role, allowed)) return <div>403 forbidden</div>;

  return (
    <main className="max-w-xl mx-auto py-10 space-y-3">
      <h1 className="text-2xl font-semibold">Student Dashboard</h1>
      <p className="text-sm opacity-70">
        Welcome, {user.firstName ?? "Student"}.
      </p>
      <ul className="list-disc pl-5 text-sm">
        <li>Your org: {user.organizationId}</li>
        <li>Role: {user.role}</li>
      </ul>
      <p className="text-sm mt-2 opacity-70">
        (Placeholder only — classes/assignments come in later milestones.)
      </p>
    </main>
  );
}
