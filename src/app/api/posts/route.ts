import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import {
  PostBlocksSchema,
  blocksToPlainText,
  makeExcerptFromBlocks,
} from "@/lib/postBlocks";

const CreatePostSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().optional(),
  contentJson: PostBlocksSchema.optional(),
  excerpt: z.string().trim().max(400).optional(),
  slug: z.string().trim().max(200).optional(),
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeSafeSlug(title: string, requested?: string) {
  const base = slugify(requested?.trim() ? requested : title);
  const ok = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(base);
  if (ok && base.length >= 1) return base;
  return slugify(title) || `post-${Date.now().toString(36)}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mine = url.searchParams.get("mine") === "1";

  if (mine) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ posts });
  }

  // Public: only published posts
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

  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "MEMBER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CreatePostSchema.safeParse(body);
  if (!parsed.success) {
    console.error("POST /api/posts invalid input", parsed.error.flatten());
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const title = parsed.data.title.trim() || "Untitled";
  const { content, excerpt } = parsed.data;
  const slug = makeSafeSlug(title, parsed.data.slug);

  if (!slug || slug.length < 1 || slug.length > 200) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json(
      { error: "Invalid slug format (use lowercase letters, numbers, and dashes)" },
      { status: 400 },
    );
  }

  const contentJson = parsed.data.contentJson;
  const plain = contentJson ? blocksToPlainText(contentJson) : (content ?? "");
  const nextExcerpt =
    excerpt ?? (contentJson ? makeExcerptFromBlocks(contentJson) : undefined);

  if (!plain.trim() && !contentJson) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 },
    );
  }

  // Try to avoid collisions for auto-generated slugs.
  for (let attempt = 0; attempt < 2; attempt++) {
    const slugAttempt =
      attempt === 0
        ? slug
        : `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      const post = await prisma.post.create({
        data: {
          title,
          content: plain,
          contentJson,
          excerpt: nextExcerpt,
          slug: slugAttempt,
          authorId: session.user.id,
          status: "DRAFT",
        },
        select: { id: true, slug: true },
      });
      return NextResponse.json({ ok: true, post }, { status: 201 });
    } catch {
      // fallthrough
    }
  }

  return NextResponse.json(
    { error: "Slug already exists" },
    { status: 409 },
  );
}
