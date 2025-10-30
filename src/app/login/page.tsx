"use client";

import { FormEvent, useState } from "react";
import { signIn, type SignInResponse } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@berkeley-math.org");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setMessage(null);

    const res = (await signIn("credentials", {
      redirect: false,
      email,
      password,
    })) as SignInResponse | undefined;

    if (res?.error) {
      setMessage("Login failed: " + res.error);
    } else {
      setMessage("Login success");
    }
  }

  return (
    <div className="max-w-sm mx-auto py-16 px-4">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-black text-white p-2 rounded" type="submit">
          Sign in
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
