"use client";
import { signOut } from "next-auth/react";
export default function LogoutPage() {
  return (
    <main className="max-w-sm mx-auto py-16">
      <button
        className="bg-black text-white p-2 rounded"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Sign out
      </button>
    </main>
  );
}
