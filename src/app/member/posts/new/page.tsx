"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { getTemplate } from "@/lib/postTemplates";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewPostPage() {
  const router = useRouter();
  const [templateId, setTemplateId] = useState<
    "research-update" | "paper" | "release"
  >("research-update");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const template = getTemplate(templateId);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || slugify(title),
          excerpt: excerpt.trim() || undefined,
          contentJson: getTemplate(templateId).blocks,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const details = data?.details?.fieldErrors
          ? Object.entries(data.details.fieldErrors)
              .map(([k, v]: any) => `${k}: ${(v ?? []).join(", ")}`)
              .join(" · ")
          : null;
        setError(details ? `${data?.error ?? "Create failed"} (${details})` : (data?.error ?? "Create failed"));
        return;
      }
      router.push(`/member/posts/${data.post.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold">New post</h1>
      <form className="mt-6 space-y-4" onSubmit={onCreate}>
        <div>
          <label className="block text-sm font-medium mb-1">Template</label>
          <select
            className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
            value={templateId}
            onChange={(e) => {
              const nextId = e.target.value as any;
              setTemplateId(nextId);
              const nextTemplate = getTemplate(nextId);
              setTitle((t) => (t.trim() ? t : nextTemplate.titlePlaceholder));
              setExcerpt((ex) => (ex.trim() ? ex : nextTemplate.excerptPlaceholder));
              setSlug((s) => (s.trim() ? s : slugify(nextTemplate.titlePlaceholder)));
            }}
          >
            <option value="research-update">Research update</option>
            <option value="paper">Paper announcement</option>
            <option value="release">Model release</option>
          </select>
          <p className="text-xs mt-2 text-text-muted-light dark:text-text-muted-dark">
            This seeds a preset structure (headings, sections, placeholders).
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
            value={title}
            onChange={(e) => {
              const next = e.target.value;
              setTitle(next);
              if (!slug) setSlug(slugify(next));
            }}
            required
            placeholder={template.titlePlaceholder}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder="my-post-title"
          />
          <p className="text-xs mt-2 text-text-muted-light dark:text-text-muted-dark">
            Used in URL: `/blog/&lt;slug&gt;`
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Excerpt</label>
          <textarea
            className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
            rows={3}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder={template.excerptPlaceholder}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? "Creating..." : "Create"}
        </button>

        {error && <div className="text-red-500 text-sm">{error}</div>}
      </form>
    </main>
  );
}
