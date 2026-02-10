import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { requireMember } from "@/lib/rbac";

const MediaSchema = z.object({
  kind: z.enum(["image", "gif", "video", "youtube"]),
  src: z.string().trim().min(1).max(1000),
  caption: z.string().trim().max(200).optional(),
  poster: z.string().trim().max(1000).optional(),
});

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
  media: z.array(MediaSchema).max(24).optional(),
});

const CreateProjectSchema = z.object({
  title: z.string().trim().min(1).max(140),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().trim().max(400).optional(),
  githubUrl: z.string().trim().url().optional(),
  heroVideoSrc: z.string().trim().max(500).optional(),
  heroVideoPoster: z.string().trim().max(500).optional(),
  sections: z.array(SectionSchema).min(1).max(12).optional(),
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
  if (ok && base.length >= 3) return base;
  const fallback = slugify(title);
  return fallback.length >= 3 ? fallback : `project-${Date.now().toString(36)}`;
}

const DEFAULT_SECTIONS = [
  {
    id: "overview",
    label: "Overview",
    title: "Overview",
    body: "Describe what this project is and why it matters.",
  },
  {
    id: "performance",
    label: "Performance",
    title: "Performance",
    body: "Add metrics, benchmarks, and evaluation notes.",
  },
  {
    id: "applications",
    label: "Applications",
    title: "Applications",
    body: "Explain real-world uses and deployment contexts.",
  },
  {
    id: "approach",
    label: "Approach",
    title: "Approach",
    body: "Summarize the method/architecture/training recipe.",
  },
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mine = url.searchParams.get("mine") === "1";

  if (mine) {
    const session = await getServerSession(authOptions);
    const member = requireMember(session);
    if (!member.ok) {
      return NextResponse.json({ error: member.error }, { status: member.status });
    }

    const userId = session!.user!.id as string;
    const role = session!.user!.role;

    const posts = await prisma.project.findMany({
      where: role === "ADMIN" ? {} : { authorId: userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ projects: posts });
  }

  const projects = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      description: true,
      githubUrl: true,
      heroVideoSrc: true,
      heroVideoPoster: true,
      sections: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });

  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const member = requireMember(session);
  if (!member.ok) {
    return NextResponse.json({ error: member.error }, { status: member.status });
  }

  const userId = session!.user!.id as string;

  const body = await req.json().catch(() => null);
  const parsed = CreateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const title = parsed.data.title.trim();
  const slug = makeSafeSlug(title, parsed.data.slug);

  const sections = parsed.data.sections ?? DEFAULT_SECTIONS;

  // Try to avoid collisions for auto-generated slugs.
  for (let attempt = 0; attempt < 2; attempt++) {
    const slugAttempt =
      attempt === 0 ? slug : `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    try {
      const project = await prisma.project.create({
        data: {
          title,
          slug: slugAttempt,
          description: parsed.data.description?.trim() ?? "",
          githubUrl: parsed.data.githubUrl,
          heroVideoSrc: parsed.data.heroVideoSrc,
          heroVideoPoster: parsed.data.heroVideoPoster,
          sections,
          status: "DRAFT",
          authorId: userId,
        },
        select: { id: true, slug: true },
      });

      return NextResponse.json({ ok: true, project }, { status: 201 });
    } catch {
      // fallthrough
    }
  }

  return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
}
