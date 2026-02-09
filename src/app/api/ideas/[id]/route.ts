import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { isAdmin, isMemberSession, requireMember } from "@/lib/rbac";
import {
  PostBlocksSchema,
  blocksToPlainText,
} from "@/lib/postBlocks";

const UpdateIdeaSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  contentJson: PostBlocksSchema.optional().nullable(),
});

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = await getServerSession(authOptions);
  const access = requireMember(session);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  if (!isMemberSession(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const idea = await prisma.brainstormIdea.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      contentJson: true,
      createdAt: true,
      updatedAt: true,
      roomId: true,
      author: { select: { id: true, name: true } },
    },
  });

  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ idea });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = await getServerSession(authOptions);
  const access = requireMember(session);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  if (!isMemberSession(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.brainstormIdea.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canEdit = isAdmin(session) || existing.authorId === session.user.id;
  if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = UpdateIdeaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const next: any = { ...parsed.data };
  if (parsed.data.contentJson !== undefined) {
    if (parsed.data.contentJson === null) {
      next.contentJson = undefined;
      next.content = "";
    } else {
      next.content = blocksToPlainText(parsed.data.contentJson);
      // BrainstormIdea doesn't have an excerpt column; keep plain text in `content`.
    }
  }

  const idea = await prisma.brainstormIdea.update({
    where: { id },
    data: next,
    select: {
      id: true,
      title: true,
      content: true,
      contentJson: true,
      updatedAt: true,
      roomId: true,
    },
  });

  return NextResponse.json({ ok: true, idea });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = await getServerSession(authOptions);
  const access = requireMember(session);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  if (!isMemberSession(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.brainstormIdea.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canDelete = isAdmin(session) || existing.authorId === session.user.id;
  if (!canDelete) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.brainstormIdea.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
