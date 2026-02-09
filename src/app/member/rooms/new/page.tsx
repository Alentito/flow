"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewRoomPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Create failed");
        return;
      }
      router.push(`/member/rooms/${data.room.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold">New brainstorm room</h1>
      <form className="mt-6 space-y-4" onSubmit={create}>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Q1 Research Ideas"
            required
            maxLength={80}
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-60"
          disabled={saving || !name.trim()}
        >
          {saving ? "Creating…" : "Create room"}
        </button>

        {error ? <div className="text-sm text-red-500">{error}</div> : null}
      </form>
    </main>
  );
}
