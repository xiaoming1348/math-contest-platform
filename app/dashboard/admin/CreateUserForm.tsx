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
        <input
          className="border p-2 rounded w-1/2"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          className="border p-2 rounded w-1/2"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <input
        className="border p-2 rounded w-full"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <select
        className="border p-2 rounded w-full"
        value={role}
        onChange={(e) => setRole(e.target.value as "TEACHER" | "STUDENT")}
      >
        <option value="TEACHER">TEACHER</option>
        <option value="STUDENT">STUDENT</option>
      </select>
      <input
        className="border p-2 rounded w-full"
        placeholder="Temp password"
        type="password"
        value={tempPassword}
        onChange={(e) => setTempPassword(e.target.value)}
      />
      <button className="bg-black text-white p-2 rounded" type="submit">
        Create User
      </button>
      {result && <p className="text-sm mt-2">{result}</p>}
    </form>
  );
}
