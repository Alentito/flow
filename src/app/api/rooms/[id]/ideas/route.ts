import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { isMemberSession, requireMember } from "@/lib/rbac";
import {
  PostBlocksSchema,
  blocksToPlainText,
  makeExcerptFromBlocks,
  type PostBlock,
} from "@/lib/postBlocks";

const CreateIdeaSchema = z.object({
  title: z.string().trim().min(1).max(200),
  contentJson: PostBlocksSchema.optional().nullable(),
});

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: roomId } = await ctx.params;
  const session = await getServerSession(authOptions);
  const access = requireMember(session);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  if (!isMemberSession(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ideas = await prisma.brainstormIdea.findMany({
    where: { roomId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ ideas });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: roomId } = await ctx.params;
  const session = await getServerSession(authOptions);
  const access = requireMember(session);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  if (!isMemberSession(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CreateIdeaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const room = await prisma.brainstormRoom.findUnique({
    where: { id: roomId },
    select: { id: true },
  });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const blocks: PostBlock[] | null | undefined = parsed.data.contentJson;
  const plain = blocks ? blocksToPlainText(blocks) : "";
  const excerpt = blocks ? makeExcerptFromBlocks(blocks) : undefined;

  const idea = await prisma.brainstormIdea.create({
    data: {
      roomId,
      authorId: session.user.id,
      title: parsed.data.title,
      contentJson: blocks ?? undefined,
      content: plain,
    },
    select: { id: true, title: true, updatedAt: true },
  });

  return NextResponse.json({ ok: true, idea, excerpt }, { status: 201 });
}
