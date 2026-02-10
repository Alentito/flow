import Link from "next/link";

import type { Project } from "@/lib/projects";
import { ProjectSectionNav } from "@/components/ProjectSectionNav";

type Props = {
  project: Project;
};

export function ProjectShowcase({ project }: Props) {
  return (
    <main>
      <header className="relative overflow-hidden border-b">
        <div className="relative h-[520px] sm:h-[620px]">
          {project.heroVideo?.src ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={project.heroVideo.poster}
            >
              <source src={project.heroVideo.src} />
            </video>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent" />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/10" />

          <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-between px-4 py-12">
            <div className="max-w-xl">
              <div className="text-sm text-white/70">
                <Link href="/projects" className="hover:underline">
                  Projects
                </Link>
              </div>
              <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-white">
                {project.title}
              </h1>
              <p className="mt-4 text-lg text-white/80">{project.description}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                {project.githubUrl ? (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/15"
                  >
                    View GitHub
                  </a>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
              <ProjectSectionNav sections={project.sections} offsetPx={96} />
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-12">
          {project.sections.map((s) => (
            <article
              key={s.id}
              id={s.id}
              className="scroll-mt-28"
            >
              <h2 className="text-2xl font-bold">{s.title}</h2>
              <p className="mt-3 text-text-muted-light dark:text-text-muted-dark leading-7 whitespace-pre-wrap">
                {s.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
