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
