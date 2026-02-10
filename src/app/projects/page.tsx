import Link from "next/link";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      description: true,
    },
  });

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">Projects</h1>
      <p className="text-lg text-text-muted-light dark:text-text-muted-dark mb-8">
        Explore research projects and models from the community.
      </p>

      {projects.length === 0 ? (
        <div className="border rounded-lg p-6 text-center text-gray-400 dark:text-gray-500">
          No projects yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <article key={p.slug} className="border rounded-xl p-6">
              <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                /projects/{p.slug}
              </div>
              <h2 className="mt-2 text-xl font-semibold">
                <Link href={`/projects/${p.slug}`} className="hover:underline">
                  {p.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">
                {p.description}
              </p>
              <div className="mt-4">
                <Link
                  href={`/projects/${p.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  View project
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
