import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { PostRenderer } from "@/components/PostRenderer";
import { PostBlocksSchema } from "@/lib/postBlocks";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) {
    notFound();
  }

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  const blocksParsed = PostBlocksSchema.safeParse(post.contentJson);
  const blocks = blocksParsed.success ? blocksParsed.data : null;

  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <div className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">
        {post.author?.name ? `By ${post.author.name}` : ""}
        {post.publishedAt ? ` · ${post.publishedAt.toDateString()}` : ""}
      </div>
      {post.excerpt ? (
        <p className="mt-6 text-lg text-text-muted-light dark:text-text-muted-dark">
          {post.excerpt}
        </p>
      ) : null}
      {blocks ? (
        <PostRenderer blocks={blocks} />
      ) : (
        <div className="mt-8 whitespace-pre-wrap leading-7">{post.content}</div>
      )}
    </main>
  );
}
