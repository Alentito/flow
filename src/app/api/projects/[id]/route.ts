import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { isAdmin, requireMember } from "@/lib/rbac";

const SectionSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  label: z.string().trim().min(1).max(40),
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(5000),
});

const UpdateProjectSchema = z.object({
  title: z.string().trim().min(1).max(140).optional(),
  slug: z
    .preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z
        .string()
        .trim()
        .min(3)
        .max(200)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .optional(),
    )
    .optional(),
  description: z.string().trim().max(400).optional(),
  githubUrl: z.string().trim().url().optional().nullable(),
  heroVideoSrc: z.string().trim().max(500).optional().nullable(),
  heroVideoPoster: z.string().trim().max(500).optional().nullable(),
  sections: z.array(SectionSchema).min(1).max(12).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

async function canEdit(projectAuthorId: string, session: any) {
  const member = requireMember(session);
  if (!member.ok) return false;
  if (isAdmin(session)) return true;
  return (session.user.id as string) === projectAuthorId;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const session = await getServerSession(authOptions);

  const project = await prisma.project.findUnique({
    where: { id },
    include: { author: { select: { name: true, id: true } } },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (project.status === "PUBLISHED") {
    return NextResponse.json({ project });
  }

  if (!(await canEdit(project.authorId, session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ project });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const session = await getServerSession(authOptions);
  const member = requireMember(session);
  if (!member.ok) {
    return NextResponse.json({ error: member.error }, { status: member.status });
  }

  const existing = await prisma.project.findUnique({
    where: { id },
    select: { authorId: true, slug: true, status: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!(await canEdit(existing.authorId, session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = UpdateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const next: any = { ...data };

  if (data.githubUrl === null) next.githubUrl = null;
  if (data.heroVideoSrc === null) next.heroVideoSrc = null;
  if (data.heroVideoPoster === null) next.heroVideoPoster = null;

  if (data.status === "PUBLISHED") next.publishedAt = new Date();
  if (data.status === "DRAFT") next.publishedAt = null;

  try {
    const project = await prisma.project.update({
      where: { id },
      data: next,
    });

    revalidatePath("/projects");
    if (existing.slug) revalidatePath(`/projects/${existing.slug}`);
    if (project.slug && project.slug !== existing.slug) {
      revalidatePath(`/projects/${project.slug}`);
    }

    return NextResponse.json({ ok: true, project });
  } catch (err) {
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
  const member = requireMember(session);
  if (!member.ok) {
    return NextResponse.json({ error: member.error }, { status: member.status });
  }

  const existing = await prisma.project.findUnique({
    where: { id },
    select: { authorId: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!(await canEdit(existing.authorId, session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.project.delete({ where: { id } });
  revalidatePath("/projects");

  return NextResponse.json({ ok: true });
}
