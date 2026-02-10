import { notFound } from "next/navigation";

import { getProjectBySlug } from "@/lib/projects";
import { ProjectShowcase } from "@/components/ProjectShowcase";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return <ProjectShowcase project={project} />;
}
