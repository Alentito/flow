import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { isAdmin, isMemberSession, requireMember } from "@/lib/rbac";

const UpdateRoomSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
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

  const room = await prisma.brainstormRoom.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      createdBy: { select: { id: true, name: true } },
    },
  });

  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ room });
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

  const room = await prisma.brainstormRoom.findUnique({
    where: { id },
    select: { id: true, createdById: true },
  });
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canEdit = isAdmin(session) || room.createdById === session.user.id;
  if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = UpdateRoomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await prisma.brainstormRoom.update({
    where: { id },
    data: parsed.data,
    select: { id: true, name: true, updatedAt: true },
  });

  return NextResponse.json({ ok: true, room: updated });
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

  const room = await prisma.brainstormRoom.findUnique({
    where: { id },
    select: { id: true, createdById: true },
  });
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canDelete = isAdmin(session) || room.createdById === session.user.id;
  if (!canDelete) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.brainstormRoom.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
