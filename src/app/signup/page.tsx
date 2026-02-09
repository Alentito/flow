"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim() || undefined, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Signup failed");
        return;
      }
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto py-20 px-4">
      <h1 className="text-2xl font-bold mb-6">Create account</h1>
      <form className="space-y-6" onSubmit={onSubmit}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark text-text-main-light dark:text-text-main-dark"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark text-text-main-light dark:text-text-main-dark"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark text-text-main-light dark:text-text-main-dark"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs mt-2 text-text-muted-light dark:text-text-muted-dark">
            Use at least 8 characters.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-semibold rounded-md transition-colors"
        >
          {loading ? "Creating..." : "Sign up"}
        </button>

        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </form>

      <p className="mt-6 text-center text-sm text-text-muted-light dark:text-text-muted-dark">
        Already have an account?{" "}
        <a href="/login" className="text-primary hover:underline">
          Sign in
        </a>
      </p>
    </main>
  );
}
