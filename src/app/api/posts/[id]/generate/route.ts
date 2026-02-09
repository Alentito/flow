import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import {
  PostBlocksSchema,
  blocksToPlainText,
  makeExcerptFromBlocks,
  type PostBlock,
} from "@/lib/postBlocks";

const GenerateSchema = z.object({
  rough: z.string().trim().min(10).max(20_000),
});

async function canEdit(postAuthorId: string, session: any) {
  const role = session?.user?.role;
  const userId = session?.user?.id;
  if (!userId) return false;
  if (role === "ADMIN") return true;
  return userId === postAuthorId && role === "MEMBER";
}

function roughToBlocks(rough: string): PostBlock[] {
  const text = rough.replace(/\r\n/g, "\n").trim();
  if (!text) return [{ type: "paragraph", text: "" }];

  const lines = text.split("\n");
  const blocks: PostBlock[] = [];

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i] ?? "";
    const line = raw.trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (line.toLowerCase().startsWith("title:")) {
      i += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "heading", level: 2, text: line.slice(3).trim() });
      i += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      // Treat # as a section heading (post title is managed separately)
      blocks.push({ type: "heading", level: 2, text: line.slice(2).trim() });
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const l = (lines[i] ?? "").trim();
        if (!l) break;
        if (/^[-*]\s+/.test(l)) {
          items.push(l.replace(/^[-*]\s+/, "").trim());
          i += 1;
          continue;
        }
        if (/^\d+\.\s+/.test(l)) {
          items.push(l.replace(/^\d+\.\s+/, "").trim());
          i += 1;
          continue;
        }
        break;
      }
      blocks.push({ type: "bullets", items: items.filter(Boolean) });
      continue;
    }

    // Paragraph: collect until blank line / next heading / bullet
    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const lRaw = lines[i] ?? "";
      const l = lRaw.trim();
      if (!l) break;
      if (l.toLowerCase().startsWith("title:")) break;
      if (l.startsWith("## ") || l.startsWith("# ")) break;
      if (/^[-*]\s+/.test(l) || /^\d+\.\s+/.test(l)) break;
      paragraphLines.push(lRaw);
      i += 1;
    }
    const paragraph = paragraphLines.join("\n").trim();
    if (paragraph) blocks.push({ type: "paragraph", text: paragraph });
  }

  if (blocks.length === 0) return [{ type: "paragraph", text }];
  return blocks;
}

function extractTitle(rough: string): string | null {
  const lines = rough.replace(/\r\n/g, "\n").split("\n");
  for (const l of lines) {
    const line = l.trim();
    if (!line) continue;
    if (line.toLowerCase().startsWith("title:")) {
      const t = line.slice("title:".length).trim();
      return t || null;
    }
    if (line.startsWith("# ")) {
      const t = line.slice(2).trim();
      return t || null;
    }
    break;
  }
  return null;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.post.findUnique({
    where: { id },
    select: { authorId: true },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!(await canEdit(post.authorId, session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = GenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const rough = parsed.data.rough;
  const title = extractTitle(rough);
  const blocks = roughToBlocks(rough);
  const blocksParsed = PostBlocksSchema.safeParse(blocks);
  const safeBlocks = blocksParsed.success
    ? blocksParsed.data
    : ([{ type: "paragraph", text: rough.trim() }] as PostBlock[]);

  return NextResponse.json({
    ok: true,
    title,
    excerpt: makeExcerptFromBlocks(safeBlocks),
    blocks: safeBlocks,
    plainText: blocksToPlainText(safeBlocks),
  });
}
