
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.ok) {
      router.push("/member");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <main className="max-w-md mx-auto py-20 px-4">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark text-text-main-light dark:text-text-main-dark" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark text-text-main-light dark:text-text-main-dark" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-md transition-colors">Sign In</button>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </form>
      <p className="mt-6 text-center text-sm text-text-muted-light dark:text-text-muted-dark">
        Don&apos;t have an account? <a href="/signup" className="text-primary hover:underline">Sign up</a>
      </p>
    </main>
  );
}
