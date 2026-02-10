"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { ProjectSection } from "@/lib/projects";
import { defaultProjectSections } from "@/lib/projects";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isValidSectionId(id: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
}

export default function NewProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [heroVideoSrc, setHeroVideoSrc] = useState("");
  const [heroVideoPoster, setHeroVideoPoster] = useState("");
  const [sections, setSections] = useState<ProjectSection[]>(() => defaultProjectSections());

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  const addSection = () => {
    setSections((prev) => {
      const base = "section";
      let i = prev.length + 1;
      let id = `${base}-${i}`;
      while (prev.some((s) => s.id === id)) {
        i += 1;
        id = `${base}-${i}`;
      }
      return [
        ...prev,
        {
          id,
          label: "New",
          title: "New section",
          body: "Write something…",
        },
      ];
    });
  };

  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const moveSection = (id: string, dir: -1 | 1) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      const copy = [...prev];
      const tmp = copy[idx];
      copy[idx] = copy[nextIdx];
      copy[nextIdx] = tmp;
      return copy;
    });
  };

  const updateSectionAt = (index: number, patch: Partial<ProjectSection>) => {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit) return;

    // quick client-side validation for ids
    for (const s of sections) {
      if (!isValidSectionId(s.id)) {
        setError(`Invalid section id: ${s.id} (use lowercase letters, numbers, dashes)`);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug.trim() ? slugify(slug) : undefined,
          description: description.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          heroVideoSrc: heroVideoSrc.trim() || undefined,
          heroVideoPoster: heroVideoPoster.trim() || undefined,
          sections,
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

      router.push(`/member/projects/${data.project.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold">New project</h1>

      <form className="mt-6 space-y-4" onSubmit={onCreate}>
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
            placeholder="My project"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder="my-project"
          />
          <p className="text-xs mt-2 text-text-muted-light dark:text-text-muted-dark">
            Used in URL: `/projects/&lt;slug&gt;`
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="One or two sentences..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">GitHub URL (optional)</label>
            <input
              className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hero Video Src (optional)</label>
            <input
              className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
              value={heroVideoSrc}
              onChange={(e) => setHeroVideoSrc(e.target.value)}
              placeholder="/videos/hero.mp4 or https://..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hero Video Poster (optional)</label>
          <input
            className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
            value={heroVideoPoster}
            onChange={(e) => setHeroVideoPoster(e.target.value)}
            placeholder="/images/poster.jpg or https://..."
          />
        </div>

        <div className="rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Sections (nav tabs)</div>
            <button type="button" className="px-3 py-2 rounded-md border" onClick={addSection}>
              Add section
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {sections.map((s, idx) => (
              <div key={s.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                    Section {idx + 1}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="px-2 py-1 rounded border text-sm" onClick={() => moveSection(s.id, -1)}>
                      ↑
                    </button>
                    <button type="button" className="px-2 py-1 rounded border text-sm" onClick={() => moveSection(s.id, 1)}>
                      ↓
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 rounded border text-sm"
                      onClick={() => removeSection(s.id)}
                      disabled={sections.length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">id</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                      value={s.id}
                      onChange={(e) => {
                        const nextId = slugify(e.target.value);
                        // Avoid accidental duplicates.
                        if (sections.some((x, i) => x.id === nextId && i !== idx)) return;
                        updateSectionAt(idx, { id: nextId });
                      }}
                      placeholder="overview"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">label (tab)</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                      value={s.label}
                      onChange={(e) => updateSectionAt(idx, { label: e.target.value })}
                      placeholder="Overview"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">title</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                      value={s.title}
                      onChange={(e) => updateSectionAt(idx, { title: e.target.value })}
                      placeholder="Overview"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium mb-1">body</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                    rows={4}
                    value={s.body}
                    onChange={(e) => updateSectionAt(idx, { body: e.target.value })}
                    placeholder="Write the section content..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !canSubmit}
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? "Creating..." : "Create"}
        </button>

        {error && <div className="text-red-500 text-sm">{error}</div>}
      </form>
    </main>
  );
}
