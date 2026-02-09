import { z } from "zod";

const HeadingBlock = z.object({
  type: z.literal("heading"),
  text: z.string().max(200).default(""),
  level: z.number().int().min(1).max(4).default(2),
});

const ParagraphBlock = z.object({
  type: z.literal("paragraph"),
  text: z.string().default(""),
});

const ImageBlock = z.object({
  type: z.literal("image"),
  url: z.string().default(""),
  caption: z.string().max(200).optional(),
});

const VideoBlock = z.object({
  type: z.literal("video"),
  url: z.string().default(""),
  caption: z.string().max(200).optional(),
});

const CalloutBlock = z.object({
  type: z.literal("callout"),
  tone: z.enum(["info", "success", "warning", "danger"]).default("info"),
  text: z.string().default(""),
});

const BulletsBlock = z.object({
  type: z.literal("bullets"),
  items: z.array(z.string()).default([]),
});

export const PostBlockSchema = z.discriminatedUnion("type", [
  HeadingBlock,
  ParagraphBlock,
  ImageBlock,
  VideoBlock,
  CalloutBlock,
  BulletsBlock,
]);

export const PostBlocksSchema = z.array(PostBlockSchema);

export type PostBlock = z.infer<typeof PostBlockSchema>;

export function blocksToPlainText(blocks: PostBlock[]): string {
  const parts: string[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case "heading":
        if (block.text.trim()) parts.push(block.text.trim());
        break;
      case "paragraph":
        if (block.text.trim()) parts.push(block.text.trim());
        break;
      case "bullets":
        if (block.items.length) {
          const cleaned = block.items.map((s) => s.trim()).filter(Boolean);
          if (cleaned.length) parts.push(cleaned.join("\n"));
        }
        break;
      case "callout":
        if (block.text.trim()) parts.push(block.text.trim());
        break;
      case "image":
      case "video":
        if (block.caption?.trim()) parts.push(block.caption.trim());
        break;
      default: {
        const _exhaustive: never = block;
        return _exhaustive;
      }
    }
  }
  return parts.join("\n\n").trim();
}

export function makeExcerptFromBlocks(blocks: PostBlock[]): string | undefined {
  const firstParagraph = blocks.find(
    (b) => b.type === "paragraph" && b.text.trim().length > 0,
  );
  if (!firstParagraph || firstParagraph.type !== "paragraph") return undefined;
  const text = firstParagraph.text.replace(/\s+/g, " ").trim();
  return text.length > 240 ? `${text.slice(0, 240)}…` : text;
}
