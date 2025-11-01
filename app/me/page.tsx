import React from "react";
import { getSessionUser } from "@/lib/auth/getSessionUser";

export default async function MePage() {
  const me = await getSessionUser();
  if (!me) return <div>401 unauthorized</div>;

  return (
    <main className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-4">My Profile</h1>
      <pre className="text-sm bg-gray-100 p-3 rounded border">
        {JSON.stringify(me, null, 2)}
      </pre>
      <p className="mt-4 text-sm opacity-70">
        (For full data with organization name, hit <code>/api/me</code>.)
      </p>
    </main>
  );
}
