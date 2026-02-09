"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

import { BlockEditor } from "@/components/BlockEditor";
import { PostRenderer } from "@/components/PostRenderer";
import type { PostBlock } from "@/lib/postBlocks";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  contentJson: PostBlock[] | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
};

type PostPatch = {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  contentJson?: PostBlock[] | null;
  status?: "DRAFT" | "PUBLISHED";
};

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;
  const postId = Array.isArray(idParam) ? idParam[0] : idParam;
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [rough, setRough] = useState("");
  const [generating, setGenerating] = useState(false);
  const [panel, setPanel] = useState<"edit" | "preview">("edit");

  const publishLabel = useMemo(() => {
    if (!post) return "";
    return post.status === "PUBLISHED" ? "Unpublish" : "Publish";
  }, [post]);

  useEffect(() => {
    if (!postId) return;
    const load = async () => {
      setError(null);
      const res = await fetch(`/api/posts/${postId}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed to load");
        return;
      }

      const fallbackBlocks: PostBlock[] | null =
        data.post.contentJson ?? (data.post.content ? [{ type: "paragraph", text: data.post.content }] : null);

      setPost({
        id: data.post.id,
        title: data.post.title,
        slug: data.post.slug,
        excerpt: data.post.excerpt ?? null,
        content: data.post.content,
        contentJson: fallbackBlocks,
        status: data.post.status,
        publishedAt: data.post.publishedAt ?? null,
      });
    };
    load();
  }, [postId]);

  const save = async (patch: PostPatch) => {
    if (!post) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const details = data?.details?.fieldErrors
          ? Object.entries(data.details.fieldErrors)
              .map(([k, v]: any) => `${k}: ${(v ?? []).join(", ")}`)
              .join(" · ")
          : null;
        setError(
          details
            ? `${data?.error ?? "Save failed"} (${details})`
            : (data?.error ?? "Save failed"),
        );
        return;
      }

      const fallbackBlocks: PostBlock[] | null =
        data.post.contentJson ?? (data.post.content ? [{ type: "paragraph", text: data.post.content }] : null);

      setPost({
        id: data.post.id,
        title: data.post.title,
        slug: data.post.slug,
        excerpt: data.post.excerpt ?? null,
        content: data.post.content,
        contentJson: fallbackBlocks,
        status: data.post.status,
        publishedAt: data.post.publishedAt ?? null,
      });
    } finally {
      setSaving(false);
    }
  };

  const generateFromRough = async () => {
    if (!postId || !rough.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${postId}/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rough }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Generate failed");
        return;
      }
      setPost((p) =>
        p
          ? {
              ...p,
              title: data.title ?? p.title,
              excerpt: data.excerpt ?? p.excerpt,
              contentJson: data.blocks ?? p.contentJson,
            }
          : p,
      );
    } finally {
      setGenerating(false);
    }
  };

  const togglePublish = async () => {
    if (!post) return;
    const nextStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await save({ status: nextStatus });
  };

  const onDelete = async () => {
    if (!post) return;
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/member/posts");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Delete failed");
    }
  };

  if (!post) {
    return (
      <main className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold">Edit post</h1>
        {error ? (
          <div className="mt-4 text-red-500 text-sm">{error}</div>
        ) : (
          <div className="mt-4 text-text-muted-light dark:text-text-muted-dark">Loading...</div>
        )}
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Edit post</h1>
          <div className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">
            Status: <b>{post.status}</b> · Public URL: /blog/{post.slug}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded-md border"
            onClick={togglePublish}
            disabled={saving}
          >
            {publishLabel}
          </button>
          <button className="px-3 py-2 rounded-md border" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-2 md:hidden">
        <button
          type="button"
          className={`px-3 py-2 rounded-md border text-sm ${panel === "edit" ? "bg-black/5 dark:bg-white/10" : ""}`}
          onClick={() => setPanel("edit")}
        >
          Edit
        </button>
        <button
          type="button"
          className={`px-3 py-2 rounded-md border text-sm ${panel === "preview" ? "bg-black/5 dark:bg-white/10" : ""}`}
          onClick={() => setPanel("preview")}
        >
          Preview
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={panel === "preview" ? "hidden md:block" : "block"}>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save({
                title: post.title,
                slug: post.slug.trim() ? post.slug : undefined,
                excerpt: post.excerpt,
                contentJson: post.contentJson,
              });
            }}
          >
            <div className="rounded-lg border p-4">
              <div className="font-medium">AI-assisted draft (stub)</div>
              <p className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">
                Paste rough notes; later you can swap the API to call your pretrained LLM.
              </p>
              <textarea
                className="mt-3 w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                rows={5}
                value={rough}
                onChange={(e) => setRough(e.target.value)}
                placeholder="Rough notes / bullet points / abstract…"
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="px-3 py-2 rounded-md border"
                  disabled={generating || !rough.trim()}
                  onClick={generateFromRough}
                >
                  {generating ? "Generating…" : "Generate sections"}
                </button>
                <button
                  type="button"
                  className="px-3 py-2 rounded-md border"
                  onClick={() => setRough("")}
                >
                  Clear
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                value={post.slug}
                onChange={(e) => setPost({ ...post, slug: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Excerpt</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                rows={3}
                value={post.excerpt ?? ""}
                onChange={(e) =>
                  setPost({ ...post, excerpt: e.target.value ? e.target.value : null })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sections</label>
              <BlockEditor
                blocks={post.contentJson ?? []}
                onChange={(blocks) => setPost({ ...post, contentJson: blocks })}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md border md:hidden"
                onClick={() => setPanel("preview")}
              >
                Preview
              </button>
              {error && <div className="text-red-500 text-sm">{error}</div>}
            </div>
          </form>
        </div>

        <div className={panel === "edit" ? "hidden md:block" : "block"}>
          <div className="md:sticky md:top-6 rounded-lg border p-4 bg-surface-light dark:bg-surface-dark">
            <div className="flex items-center justify-between">
              <div className="font-medium">Live preview</div>
              <button
                type="button"
                className="px-3 py-2 rounded-md border text-sm md:hidden"
                onClick={() => setPanel("edit")}
              >
                Back to edit
              </button>
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-bold">{post.title || "Untitled"}</h2>
              <div className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">
                {post.excerpt ? post.excerpt : ""}
              </div>
              <PostRenderer blocks={post.contentJson ?? []} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
