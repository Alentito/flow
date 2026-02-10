import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ProjectShowcase } from "@/components/ProjectShowcase";
import type { Project as ProjectView } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const record = await prisma.project.findUnique({
    where: { slug },
    select: {
      slug: true,
      title: true,
      description: true,
      githubUrl: true,
      heroVideoSrc: true,
      heroVideoPoster: true,
      sections: true,
      status: true,
    },
  });

  if (!record || record.status !== "PUBLISHED") notFound();

  const project: ProjectView = {
    slug: record.slug,
    title: record.title,
    description: record.description,
    githubUrl: record.githubUrl ?? undefined,
    heroVideo: record.heroVideoSrc
      ? { src: record.heroVideoSrc, poster: record.heroVideoPoster ?? undefined }
      : undefined,
    sections: record.sections as any,
  };

  return <ProjectShowcase project={project} />;
}
