import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import {
  PostBlocksSchema,
  blocksToPlainText,
  makeExcerptFromBlocks,
} from "@/lib/postBlocks";

const UpdatePostSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().optional(),
  contentJson: PostBlocksSchema.optional().nullable(),
  excerpt: z.string().trim().max(400).optional().nullable(),
  slug: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z
      .string()
      .trim()
      .min(3)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
  ),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

async function canEdit(postAuthorId: string, session: any) {
  const role = session?.user?.role;
  const userId = session?.user?.id;
  if (!userId) return false;
  if (role === "ADMIN") return true;
  return userId === postAuthorId && role === "MEMBER";
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const session = await getServerSession(authOptions);

  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: { name: true, id: true } } },
  });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (post.status === "PUBLISHED") {
    return NextResponse.json({ post });
  }

  // Draft: only author/admin can view
  if (!(await canEdit(post.authorId, session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ post });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.post.findUnique({
    where: { id },
    select: { authorId: true, slug: true, status: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!(await canEdit(existing.authorId, session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = UpdatePostSchema.safeParse(body);
  if (!parsed.success) {
    console.error("PATCH /api/posts/[id] invalid input", parsed.error.flatten());
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // publish/unpublish bookkeeping
  const next: any = { ...data };

  if (data.contentJson !== undefined) {
    if (data.contentJson === null) {
      next.contentJson = null;
    } else {
      next.content = blocksToPlainText(data.contentJson);
      if (next.excerpt === undefined) {
        next.excerpt = makeExcerptFromBlocks(data.contentJson);
      }
    }
  }

  if (data.content !== undefined && data.contentJson === undefined) {
    next.content = data.content ?? "";
  }
  if (data.status === "PUBLISHED") {
    next.publishedAt = new Date();
  }
  if (data.status === "DRAFT") {
    next.publishedAt = null;
  }

  try {
    const post = await prisma.post.update({
      where: { id },
      data: next,
    });

    // Ensure public pages reflect updates immediately in production.
    // This is safe even if pages are forced-dynamic.
    revalidatePath("/");
    revalidatePath("/blog");
    if (existing.slug) revalidatePath(`/blog/${existing.slug}`);
    if (post.slug && post.slug !== existing.slug) revalidatePath(`/blog/${post.slug}`);

    return NextResponse.json({ ok: true, post });
  } catch (err) {
    console.error("PATCH /api/posts/[id] update failed", err);
    const code = (err as any)?.code;
    if (code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.post.findUnique({
    where: { id },
    select: { authorId: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!(await canEdit(existing.authorId, session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
