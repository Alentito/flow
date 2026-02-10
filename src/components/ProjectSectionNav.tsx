"use client";

import { useEffect, useMemo, useState } from "react";

import type { ProjectSection } from "@/lib/projects";

type Props = {
  sections: ProjectSection[];
  offsetPx?: number;
};

function scrollToId(id: string, offsetPx: number) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - offsetPx;
  window.history.replaceState(null, "", `#${id}`);
  window.scrollTo({ top: y, behavior: "smooth" });
}

export function ProjectSectionNav({ sections, offsetPx = 96 }: Props) {
  const ids = useMemo(() => sections.map((s) => s.id), [sections]);
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    if (ids.length === 0) return;

    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the top-most visible section.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0));
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      {
        root: null,
        // Trigger slightly after passing the sticky header/nav area.
        rootMargin: `-${offsetPx}px 0px -70% 0px`,
        threshold: 0.01,
      },
    );

    for (const el of els) observer.observe(el);
    return () => observer.disconnect();
  }, [ids, offsetPx]);

  return (
    <nav className="flex gap-2 overflow-x-auto no-scrollbar py-2">
      {sections.map((s) => {
        const isActive = s.id === active;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollToId(s.id, offsetPx)}
            className={
              "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition " +
              (isActive
                ? "bg-primary text-white border-primary"
                : "bg-white/60 dark:bg-black/30 hover:bg-white/80 dark:hover:bg-black/40")
            }
            aria-current={isActive ? "true" : "false"}
          >
            {s.label}
          </button>
        );
      })}
    </nav>
  );
}
