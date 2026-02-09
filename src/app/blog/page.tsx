import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });

  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Blog</h1>
          <p className="text-lg text-text-muted-light dark:text-text-muted-dark">
            Latest articles, research updates, and announcements.
          </p>
        </div>
        <Link
          href="/member/posts"
          className="text-sm text-primary hover:underline"
        >
          Member editor
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {posts.length === 0 ? (
          <div className="border rounded-lg p-6 text-center text-gray-400 dark:text-gray-500">
            No published posts yet.
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="border rounded-lg p-6">
              <Link
                href={`/blog/${post.slug}`}
                className="text-xl font-semibold hover:underline"
              >
                {post.title}
              </Link>
              <div className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">
                {post.author?.name ? `By ${post.author.name}` : ""}
                {post.publishedAt ? ` · ${post.publishedAt.toDateString()}` : ""}
              </div>
              {post.excerpt ? (
                <p className="mt-3 text-text-muted-light dark:text-text-muted-dark">
                  {post.excerpt}
                </p>
              ) : null}
            </article>
          ))
        )}
      </div>
    </main>
  );
}
