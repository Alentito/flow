"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { ProjectShowcase } from "@/components/ProjectShowcase";
import type { ProjectSection, Project } from "@/lib/projects";

type ProjectRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;
  githubUrl: string | null;
  heroVideoSrc: string | null;
  heroVideoPoster: string | null;
  sections: ProjectSection[];
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
};

type ProjectPatch = {
  title?: string;
  slug?: string;
  description?: string;
  githubUrl?: string | null;
  heroVideoSrc?: string | null;
  heroVideoPoster?: string | null;
  sections?: ProjectSection[];
  status?: "DRAFT" | "PUBLISHED";
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;
  const projectId = Array.isArray(idParam) ? idParam[0] : idParam;

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [panel, setPanel] = useState<"edit" | "preview">("edit");

  const publishLabel = useMemo(() => {
    if (!project) return "";
    return project.status === "PUBLISHED" ? "Unpublish" : "Publish";
  }, [project]);

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      setError(null);
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed to load");
        return;
      }
      setProject({
        id: data.project.id,
        slug: data.project.slug,
        title: data.project.title,
        description: data.project.description ?? "",
        githubUrl: data.project.githubUrl ?? null,
        heroVideoSrc: data.project.heroVideoSrc ?? null,
        heroVideoPoster: data.project.heroVideoPoster ?? null,
        sections: (data.project.sections ?? []) as ProjectSection[],
        status: data.project.status,
        publishedAt: data.project.publishedAt ?? null,
      });
    };
    load();
  }, [projectId]);

  const save = async (patch: ProjectPatch) => {
    if (!project) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
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
        setError(details ? `${data?.error ?? "Save failed"} (${details})` : (data?.error ?? "Save failed"));
        return;
      }

      setProject({
        id: data.project.id,
        slug: data.project.slug,
        title: data.project.title,
        description: data.project.description ?? "",
        githubUrl: data.project.githubUrl ?? null,
        heroVideoSrc: data.project.heroVideoSrc ?? null,
        heroVideoPoster: data.project.heroVideoPoster ?? null,
        sections: (data.project.sections ?? []) as ProjectSection[],
        status: data.project.status,
        publishedAt: data.project.publishedAt ?? null,
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (!project) return;
    const nextStatus = project.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await save({ status: nextStatus });
  };

  const onDelete = async () => {
    if (!project) return;
    if (!confirm("Delete this project?")) return;
    const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/member/projects");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Delete failed");
    }
  };

  const previewProject: Project | null = useMemo(() => {
    if (!project) return null;
    return {
      slug: project.slug,
      title: project.title,
      description: project.description,
      githubUrl: project.githubUrl ?? undefined,
      heroVideo: project.heroVideoSrc
        ? { src: project.heroVideoSrc, poster: project.heroVideoPoster ?? undefined }
        : undefined,
      sections: project.sections,
    };
  }, [project]);

  if (!project) {
    return (
      <main className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold">Edit project</h1>
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
          <h1 className="text-2xl font-bold">Edit project</h1>
          <div className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">
            Status: <b>{project.status}</b> · Public URL: /projects/{project.slug}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-md border" onClick={togglePublish} disabled={saving}>
            {publishLabel}
          </button>
          <button className="px-3 py-2 rounded-md border" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-2 lg:hidden">
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

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={panel === "preview" ? "hidden lg:block" : "block"}>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save({
                title: project.title,
                slug: project.slug.trim() ? slugify(project.slug) : undefined,
                description: project.description,
                githubUrl: project.githubUrl,
                heroVideoSrc: project.heroVideoSrc,
                heroVideoPoster: project.heroVideoPoster,
                sections: project.sections,
              });
            }}
          >
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                value={project.title}
                onChange={(e) => setProject((p) => (p ? { ...p, title: e.target.value } : p))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                value={project.slug}
                onChange={(e) => setProject((p) => (p ? { ...p, slug: slugify(e.target.value) } : p))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                rows={3}
                value={project.description}
                onChange={(e) => setProject((p) => (p ? { ...p, description: e.target.value } : p))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">GitHub URL</label>
              <input
                className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                value={project.githubUrl ?? ""}
                onChange={(e) => setProject((p) => (p ? { ...p, githubUrl: e.target.value || null } : p))}
                placeholder="https://github.com/user/repo"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Hero Video Src</label>
                <input
                  className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                  value={project.heroVideoSrc ?? ""}
                  onChange={(e) => setProject((p) => (p ? { ...p, heroVideoSrc: e.target.value || null } : p))}
                  placeholder="/videos/hero.mp4 or https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hero Video Poster</label>
                <input
                  className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                  value={project.heroVideoPoster ?? ""}
                  onChange={(e) => setProject((p) => (p ? { ...p, heroVideoPoster: e.target.value || null } : p))}
                  placeholder="/images/poster.jpg or https://..."
                />
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">Sections</div>
                <button
                  type="button"
                  className="px-3 py-2 rounded-md border"
                  onClick={() =>
                    setProject((p) =>
                      p
                        ? {
                            ...p,
                            sections: [
                              ...p.sections,
                              {
                                id: `section-${p.sections.length + 1}`,
                                label: "New",
                                title: "New section",
                                body: "Write something…",
                              },
                            ],
                          }
                        : p,
                    )
                  }
                >
                  Add
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {project.sections.map((s, idx) => (
                  <div key={`${s.id}-${idx}`} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                        {idx + 1}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-2 py-1 rounded border text-sm"
                          onClick={() =>
                            setProject((p) => {
                              if (!p) return p;
                              if (idx === 0) return p;
                              const copy = [...p.sections];
                              const tmp = copy[idx - 1];
                              copy[idx - 1] = copy[idx];
                              copy[idx] = tmp;
                              return { ...p, sections: copy };
                            })
                          }
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 rounded border text-sm"
                          onClick={() =>
                            setProject((p) => {
                              if (!p) return p;
                              if (idx === p.sections.length - 1) return p;
                              const copy = [...p.sections];
                              const tmp = copy[idx + 1];
                              copy[idx + 1] = copy[idx];
                              copy[idx] = tmp;
                              return { ...p, sections: copy };
                            })
                          }
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 rounded border text-sm"
                          disabled={project.sections.length <= 1}
                          onClick={() =>
                            setProject((p) =>
                              p ? { ...p, sections: p.sections.filter((_, i) => i !== idx) } : p,
                            )
                          }
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
                            setProject((p) => {
                              if (!p) return p;
                              const copy = [...p.sections];
                              copy[idx] = { ...copy[idx], id: nextId };
                              return { ...p, sections: copy };
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">label</label>
                        <input
                          className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                          value={s.label}
                          onChange={(e) =>
                            setProject((p) => {
                              if (!p) return p;
                              const copy = [...p.sections];
                              copy[idx] = { ...copy[idx], label: e.target.value };
                              return { ...p, sections: copy };
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">title</label>
                        <input
                          className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                          value={s.title}
                          onChange={(e) =>
                            setProject((p) => {
                              if (!p) return p;
                              const copy = [...p.sections];
                              copy[idx] = { ...copy[idx], title: e.target.value };
                              return { ...p, sections: copy };
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs font-medium mb-1">body</label>
                      <textarea
                        className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                        rows={4}
                        value={s.body}
                        onChange={(e) =>
                          setProject((p) => {
                            if (!p) return p;
                            const copy = [...p.sections];
                            copy[idx] = { ...copy[idx], body: e.target.value };
                            return { ...p, sections: copy };
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md border"
                onClick={() => router.push(`/projects/${project.slug}`)}
              >
                Open public
              </button>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}
          </form>
        </div>

        <div className={panel === "edit" ? "hidden lg:block" : "block"}>
          <div className="rounded-xl border overflow-hidden">
            {previewProject ? <ProjectShowcase project={previewProject} /> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
