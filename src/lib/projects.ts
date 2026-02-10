export type ProjectHeroVideo = {
  src: string;
  poster?: string;
};

export type ProjectSection = {
  id: string;
  label: string;
  title: string;
  body: string;
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  githubUrl?: string;
  heroVideo?: ProjectHeroVideo;
  sections: ProjectSection[];
};

export const projects: Project[] = [
  {
    slug: "flow",
    title: "Flow",
    description:
      "A research hub for publishing updates, collaborating, and showcasing models.",
    githubUrl: "https://github.com/",
    heroVideo: {
      // Put your MP4 in public/videos and reference it like this.
      // Example: public/videos/flow-hero.mp4
      src: "/videos/flow-hero.mp4",
    },
    sections: [
      {
        id: "overview",
        label: "Overview",
        title: "Overview",
        body:
          "Flow is a lightweight research website with member editing and public publishing.",
      },
      {
        id: "performance",
        label: "Performance",
        title: "Performance",
        body:
          "Add benchmarks, latency numbers, or evaluation notes here.",
      },
      {
        id: "applications",
        label: "Applications",
        title: "Applications",
        body:
          "Describe what this project enables and where it’s used.",
      },
      {
        id: "approach",
        label: "Approach",
        title: "Approach",
        body:
          "Explain architecture, training recipe, data pipeline, or methodology.",
      },
    ],
  },
];

export function getAllProjects() {
  return projects;
}

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug) ?? null;
}
