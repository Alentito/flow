import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ProjectListItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: Date;
  publishedAt: Date | null;
};

export const dynamic = "force-dynamic";

export default async function MemberProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  if (session.user.role !== "MEMBER" && session.user.role !== "ADMIN") {
    return (
      <main className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="mt-3 text-text-muted-light dark:text-text-muted-dark">
          Your account role is <b>{session.user.role}</b>. Ask an admin to promote you to
          <b> MEMBER</b> to manage projects.
        </p>
      </main>
    );
  }

  const projects: ProjectListItem[] = await prisma.project.findMany({
    where: session.user.role === "ADMIN" ? {} : { authorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      updatedAt: true,
      publishedAt: true,
    },
  });

  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Your projects</h1>
        <Link
          href="/member/projects/new"
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-hover"
        >
          New project
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {projects.length === 0 ? (
          <div className="border rounded-lg p-6 text-center text-gray-400 dark:text-gray-500">
            No projects yet.
          </div>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="border rounded-lg p-4 flex justify-between gap-4">
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                  {p.status} · /projects/{p.slug}
                </div>
              </div>
              <Link href={`/member/projects/${p.id}`} className="text-primary hover:underline">
                Edit
              </Link>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
