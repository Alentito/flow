import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PostListItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: Date;
  publishedAt: Date | null;
};

export default async function MemberPostsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  if (session.user.role !== "MEMBER" && session.user.role !== "ADMIN") {
    return (
      <main className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold">Posts</h1>
        <p className="mt-3 text-text-muted-light dark:text-text-muted-dark">
          Your account role is <b>{session.user.role}</b>. Ask an admin to promote you to
          <b> MEMBER</b> to write posts.
        </p>
      </main>
    );
  }

  const posts: PostListItem[] = await prisma.post.findMany({
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
        <h1 className="text-2xl font-bold">Your posts</h1>
        <Link
          href="/member/posts/new"
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-hover"
        >
          New post
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {posts.length === 0 ? (
          <div className="border rounded-lg p-6 text-center text-gray-400 dark:text-gray-500">
            No posts yet.
          </div>
        ) : (
          posts.map((p) => (
            <div key={p.id} className="border rounded-lg p-4 flex justify-between gap-4">
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                  {p.status} · /blog/{p.slug}
                </div>
              </div>
              <Link href={`/member/posts/${p.id}`} className="text-primary hover:underline">
                Edit
              </Link>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
