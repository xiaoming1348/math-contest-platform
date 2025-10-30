import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) return null;

  const user = session.user as Record<string, unknown>;

  return {
    userId: (user["userId"] as string) ?? null,
    email: (user["email"] as string) ?? null,
    role: (user["role"] as string) ?? null,
    organizationId: (user["organizationId"] as string) ?? null,
    firstName: (user["firstName"] as string) ?? null,
    lastName: (user["lastName"] as string) ?? null,
  };
}

export default getSessionUser;
