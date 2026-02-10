export type ProjectHeroVideo = {
  src: string;
  poster?: string;
};

export type ProjectMediaKind = "image" | "gif" | "video" | "youtube";

export type ProjectMedia = {
  kind: ProjectMediaKind;
  src: string;
  caption?: string;
  poster?: string;
};

export type ProjectSection = {
  id: string;
  label: string;
  title: string;
  body: string;
  media?: ProjectMedia[];
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  githubUrl?: string;
  heroVideo?: ProjectHeroVideo;
  sections: ProjectSection[];
};

export function defaultProjectSections(): ProjectSection[] {
  return [
    {
      id: "overview",
      label: "Overview",
      title: "Overview",
      body: "Describe what this project is and why it matters.",
    },
    {
      id: "performance",
      label: "Performance",
      title: "Performance",
      body: "Add metrics, benchmarks, and evaluation notes.",
    },
    {
      id: "applications",
      label: "Applications",
      title: "Applications",
      body: "Explain real-world uses and deployment contexts.",
    },
    {
      id: "approach",
      label: "Approach",
      title: "Approach",
      body: "Summarize the method/architecture/training recipe.",
    },
  ];
}
