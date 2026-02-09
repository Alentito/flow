import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { isMemberSession, requireMember } from "@/lib/rbac";
import { brainstormBus, type BrainstormEvent } from "@/lib/brainstormEvents";

const CreateMessageSchema = z.object({
  content: z.string().trim().min(1).max(4000),
});

export async function GET(
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

  const url = new URL(req.url);
  const take = Math.min(200, Math.max(1, Number(url.searchParams.get("take") ?? 50)));

  const messages = await prisma.brainstormMessage.findMany({
    where: { roomId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ messages: messages.reverse() });
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
  const parsed = CreateMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Ensure room exists
  const room = await prisma.brainstormRoom.findUnique({
    where: { id: roomId },
    select: { id: true },
  });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const message = await prisma.brainstormMessage.create({
    data: {
      roomId,
      authorId: session.user.id,
      content: parsed.data.content,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
  });

  const event: BrainstormEvent = {
    type: "message.created",
    roomId,
    message: {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      author: { id: message.author.id, name: message.author.name },
    },
  };
  brainstormBus.publish(roomId, event);

  return NextResponse.json({ ok: true, message }, { status: 201 });
}
