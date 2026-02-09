import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { isMemberSession, requireMember } from "@/lib/rbac";

const CreateRoomSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  const access = requireMember(session);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  if (!isMemberSession(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rooms = await prisma.brainstormRoom.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      updatedAt: true,
      createdAt: true,
      createdBy: { select: { id: true, name: true } },
      _count: { select: { ideas: true, messages: true } },
    },
  });

  return NextResponse.json({ rooms });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const access = requireMember(session);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  if (!isMemberSession(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CreateRoomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const room = await prisma.brainstormRoom.create({
    data: {
      name: parsed.data.name,
      createdById: session.user.id,
    },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ ok: true, room }, { status: 201 });
}
