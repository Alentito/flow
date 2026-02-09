"use client";

import { useEffect, useMemo, useState } from "react";

import { BlockEditor } from "@/components/BlockEditor";
import { PostRenderer } from "@/components/PostRenderer";
import type { PostBlock } from "@/lib/postBlocks";

type IdeaListItem = {
  id: string;
  title: string;
  updatedAt: string;
  author: { id: string; name: string | null };
};

type Idea = {
  id: string;
  title: string;
  content: string;
  contentJson: PostBlock[] | null;
  updatedAt: string;
};

type Props = {
  roomId: string;
};

export function RoomIdeas({ roomId }: Props) {
  const [ideas, setIdeas] = useState<IdeaListItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeIdea, setActiveIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(true);

  const active = useMemo(
    () => ideas.find((i) => i.id === activeId) ?? null,
    [ideas, activeId],
  );

  const loadIdeas = async () => {
    setError(null);
    const res = await fetch(`/api/rooms/${roomId}/ideas`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error ?? "Failed to load ideas");
      return;
    }
    setIdeas(data.ideas ?? []);
    if (!activeId && (data.ideas?.[0]?.id as string | undefined)) {
      setActiveId(data.ideas[0].id);
    }
  };

  useEffect(() => {
    void loadIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    let alive = true;
    const loadActive = async () => {
      if (!activeId) {
        setActiveIdea(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/ideas/${activeId}`);
        const data = await res.json().catch(() => ({}));
        if (!alive) return;
        if (!res.ok) {
          setError(data?.error ?? "Failed to load idea");
          return;
        }
        const i = data.idea;
        setActiveIdea({
          id: i.id,
          title: i.title,
          content: i.content ?? "",
          contentJson: i.contentJson ?? null,
          updatedAt: i.updatedAt,
        });
      } finally {
        if (alive) setLoading(false);
      }
    };
    void loadActive();
    return () => {
      alive = false;
    };
  }, [activeId]);

  const createIdea = async () => {
    setError(null);
    const res = await fetch(`/api/rooms/${roomId}/ideas`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: `New idea ${ideas.length + 1}`,
        contentJson: [{ type: "paragraph", text: "" }],
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error ?? "Create failed");
      return;
    }
    await loadIdeas();
    setActiveId(data.idea.id);
  };

  const saveIdea = async (patch: Partial<Pick<Idea, "title" | "contentJson">>) => {
    if (!activeIdea) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/ideas/${activeIdea.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Save failed");
        return;
      }
      setActiveIdea((prev) => (prev ? { ...prev, ...data.idea } : prev));
      await loadIdeas();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      <aside className="rounded-xl border bg-white/60 dark:bg-black/20 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="font-medium">Ideas</div>
          <button
            type="button"
            className="px-3 py-2 rounded-md border text-sm"
            onClick={() => void createIdea()}
          >
            + New
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {ideas.length === 0 ? (
            <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
              No ideas yet.
            </div>
          ) : null}
          {ideas.map((i) => (
            <button
              key={i.id}
              type="button"
              className={`w-full text-left rounded-lg border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 ${
                i.id === activeId ? "bg-black/5 dark:bg-white/10" : "bg-transparent"
              }`}
              onClick={() => setActiveId(i.id)}
            >
              <div className="font-medium truncate">{i.title}</div>
              <div className="mt-1 text-xs text-text-muted-light dark:text-text-muted-dark truncate">
                {i.author?.name ?? "Member"} · {new Date(i.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-xl border bg-white/60 dark:bg-black/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-medium">Editor</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded-md border text-sm"
              onClick={() => setPreview((p) => !p)}
            >
              {preview ? "Hide preview" : "Show preview"}
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-60 text-sm"
              onClick={() => void saveIdea({ title: activeIdea?.title, contentJson: activeIdea?.contentJson ?? [] })}
              disabled={saving || !activeIdea}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {error ? <div className="mt-3 text-sm text-red-500">{error}</div> : null}
        {loading ? (
          <div className="mt-4 text-sm text-text-muted-light dark:text-text-muted-dark">Loading…</div>
        ) : null}

        {!activeIdea && !loading ? (
          <div className="mt-4 text-sm text-text-muted-light dark:text-text-muted-dark">
            Select an idea.
          </div>
        ) : null}

        {activeIdea ? (
          <div className={`mt-4 grid gap-6 ${preview ? "xl:grid-cols-2" : "grid-cols-1"}`}>
            <div>
              <label className="block text-sm font-medium">Title</label>
              <input
                className="mt-2 w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                value={activeIdea.title}
                onChange={(e) => setActiveIdea({ ...activeIdea, title: e.target.value })}
                onBlur={() => void saveIdea({ title: activeIdea.title })}
              />

              <div className="mt-4">
                <label className="block text-sm font-medium">Blocks</label>
                <BlockEditor
                  blocks={activeIdea.contentJson ?? []}
                  onChange={(blocks) => setActiveIdea({ ...activeIdea, contentJson: blocks })}
                />
              </div>
            </div>

            {preview ? (
              <div className="rounded-lg border p-4 bg-surface-light dark:bg-surface-dark">
                <div className="font-medium">Preview</div>
                <div className="mt-3">
                  <h2 className="text-2xl font-bold">{activeIdea.title || "Untitled"}</h2>
                  <PostRenderer blocks={activeIdea.contentJson ?? []} />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
