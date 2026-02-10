import Link from "next/link";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type LatestPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: Date | null;
  author: { name: string | null } | null;
};

export default async function Home() {
  const latestPosts: LatestPost[] = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 3,
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
    <main className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <section className="relative overflow-hidden rounded-3xl border bg-white/60 dark:bg-black/30 p-8 sm:p-10">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-28 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Flow</h1>
            <p className="mt-4 text-lg text-text-muted-light dark:text-text-muted-dark">
              Research updates, announcements, and releases — built for members and the public.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-white font-semibold hover:bg-primary-hover"
              >
                Read updates
              </Link>
              <Link
                href="/member"
                className="inline-flex items-center justify-center rounded-md border px-5 py-3 font-semibold"
              >
                Member access
              </Link>
            </div>

            <div className="mt-6 text-sm text-text-muted-light dark:text-text-muted-dark">
              Members can draft posts, collaborate, and publish to the public site.
            </div>
          </div>

          <div className="rounded-2xl border bg-white/70 dark:bg-black/20 p-6 sm:p-8">
            <div className="text-sm font-semibold text-text-muted-light dark:text-text-muted-dark">
              What you can do here
            </div>
            <ul className="mt-4 space-y-3">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>Public research updates and announcements</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>Member-only dashboard for model access/downloads</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>Editorial workflow: draft → publish</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link href="/member/posts" className="text-primary hover:underline text-sm">
                Go to post editor
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-bold">Latest</h2>
          <Link href="/blog" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {latestPosts.length === 0 ? (
            <div className="md:col-span-3 border rounded-lg p-6 text-center text-gray-400 dark:text-gray-500">
              No published posts yet. Create one in the member editor.
            </div>
          ) : (
            latestPosts.map((post) => (
              <article key={post.id} className="border rounded-lg p-6">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-lg font-semibold hover:underline"
                >
                  {post.title}
                </Link>
                <div className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">
                  {post.author?.name ? `By ${post.author.name}` : ""}
                  {post.publishedAt ? ` · ${post.publishedAt.toDateString()}` : ""}
                </div>
                {post.excerpt ? (
                  <p className="mt-3 text-sm text-text-muted-light dark:text-text-muted-dark">
                    {post.excerpt}
                  </p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
