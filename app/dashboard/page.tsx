import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/getSessionUser";

export default async function DashboardIndex() {
  const user = await getSessionUser();
  if (!user) {
    // not logged in — send to login
    redirect("/login");
  }

  switch (user.role) {
    case "ADMIN":
      redirect("/dashboard/admin");
    case "TEACHER":
      redirect("/dashboard/teacher");
    case "STUDENT":
      redirect("/dashboard/student");
    default:
      // Unknown role — be safe
      return <div>403 forbidden</div>;
  }
}
