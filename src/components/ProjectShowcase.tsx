"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { Project } from "@/lib/projects";
import { ProjectSectionNav } from "@/components/ProjectSectionNav";

type Props = {
  project: Project;
};

function toYouTubeEmbedUrl(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    // youtu.be/<id>
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      // /watch?v=<id>
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      // /embed/<id>
      if (u.pathname.startsWith("/embed/")) {
        const id = u.pathname.split("/").filter(Boolean)[1];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      // /shorts/<id>
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/").filter(Boolean)[1];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

function renderMediaItem(projectTitle: string, m: any, index: number) {
  const kind = m?.kind as string | undefined;
  const src = m?.src as string | undefined;
  const caption = typeof m?.caption === "string" ? m.caption : "";
  const poster = typeof m?.poster === "string" ? m.poster : undefined;

  if (!kind || !src) return null;

  if (kind === "youtube") {
    const embed = toYouTubeEmbedUrl(src);
    if (!embed) {
      return (
        <a
          key={`yt-${index}`}
          href={src}
          target="_blank"
          rel="noreferrer"
          className="block rounded-lg border p-4 text-sm text-primary hover:underline"
        >
          Open YouTube
        </a>
      );
    }
    const id = new URL(embed).pathname.split("/").pop();
    return (
      <div key={`yt-${index}`} className="rounded-lg border overflow-hidden">
        <div className="relative w-full aspect-video">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`${embed}?autoplay=0&mute=0&loop=0&controls=1&modestbranding=1&playsinline=1${id ? `&playlist=${id}` : ""}`}
            title={`${projectTitle} section video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        {caption ? (
          <div className="px-4 py-3 text-xs text-text-muted-light dark:text-text-muted-dark">
            {caption}
          </div>
        ) : null}
      </div>
    );
  }

  if (kind === "video") {
    return (
      <div key={`vid-${index}`} className="rounded-lg border overflow-hidden">
        <video className="w-full" controls playsInline preload="metadata" poster={poster}>
          <source src={src} />
        </video>
        {caption ? (
          <div className="px-4 py-3 text-xs text-text-muted-light dark:text-text-muted-dark">
            {caption}
          </div>
        ) : null}
      </div>
    );
  }

  if (kind === "image" || kind === "gif") {
    return (
      <figure key={`${kind}-${index}`} className="rounded-lg border overflow-hidden">
        <img
          src={src}
          alt={caption || `${projectTitle} media`}
          className="w-full h-auto"
          loading="lazy"
        />
        {caption ? (
          <figcaption className="px-4 py-3 text-xs text-text-muted-light dark:text-text-muted-dark">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return null;
}

export function ProjectShowcase({ project }: Props) {
  const heroSrc = project.heroVideo?.src;
  const youtubeEmbed = heroSrc ? toYouTubeEmbedUrl(heroSrc) : null;
  const headerRef = useRef<HTMLElement | null>(null);
  const [passedHero, setPassedHero] = useState(false);
  const [scrollingDown, setScrollingDown] = useState(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Consider the hero "passed" once the header is fully out of view.
        setPassedHero(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
      },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    let raf = 0;

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const delta = y - lastY;
        if (Math.abs(delta) > 2) {
          setScrollingDown(delta > 0);
          lastY = y;
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const showStickyNav = passedHero && scrollingDown;

  return (
    <main>
      {project.sections?.length ? (
        <div
          className={
            "fixed top-16 left-0 right-0 z-40 transition-all duration-300 ease-out " +
            (showStickyNav
              ? "translate-y-0 opacity-100"
              : "-translate-y-2 opacity-0 pointer-events-none")
          }
        >
          <div className="border-b bg-white/70 dark:bg-black/40 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 py-2">
              <ProjectSectionNav sections={project.sections} offsetPx={112} />
            </div>
          </div>
        </div>
      ) : null}

      <header ref={headerRef} className="relative overflow-hidden border-b">
        <div className="relative h-[520px] sm:h-[620px]">
          {youtubeEmbed ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`${youtubeEmbed}?autoplay=1&mute=1&loop=1&playlist=${new URL(youtubeEmbed).pathname.split("/").pop()}&controls=0&modestbranding=1&playsinline=1`}
              title={`${project.title} hero video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : heroSrc ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={project.heroVideo?.poster}
            >
              <source src={heroSrc} />
            </video>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent" />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/10" />

          <div className="relative mx-auto h-full max-w-6xl px-4 py-12">
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
          </div>
        </div>
      </header>

      {project.sections?.length ? (
        <div className="border-b bg-white/80 dark:bg-black/40 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-2">
            <ProjectSectionNav sections={project.sections} offsetPx={112} />
          </div>
        </div>
      ) : null}

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

              {(s.media ?? []).length ? (
                <div className="mt-6 grid gap-4">
                  {(s.media ?? []).map((m, i) => renderMediaItem(project.title, m, i))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
