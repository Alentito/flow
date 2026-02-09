/* eslint-disable @next/next/no-img-element */
import type { PostBlock } from "@/lib/postBlocks";

export function PostRenderer({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className="mt-8 space-y-6">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "heading": {
            if (!block.text.trim()) return null;
            if (block.level === 1) {
              return (
                <h1 key={idx} className="text-3xl font-bold">
                  {block.text}
                </h1>
              );
            }
            if (block.level === 2) {
              return (
                <h2 key={idx} className="text-2xl font-bold">
                  {block.text}
                </h2>
              );
            }
            if (block.level === 3) {
              return (
                <h3 key={idx} className="text-xl font-semibold">
                  {block.text}
                </h3>
              );
            }
            return (
              <h4 key={idx} className="text-lg font-semibold">
                {block.text}
              </h4>
            );
          }
          case "paragraph":
            if (!block.text.trim()) return null;
            return (
              <p key={idx} className="leading-7 text-text-muted-light dark:text-text-muted-dark whitespace-pre-wrap">
                {block.text}
              </p>
            );
          case "bullets":
            if (block.items.map((s) => s.trim()).filter(Boolean).length === 0) return null;
            return (
              <ul key={idx} className="list-disc pl-6 space-y-2">
                {block.items
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((it, i) => (
                  <li key={i} className="text-text-muted-light dark:text-text-muted-dark">
                    {it}
                  </li>
                ))}
              </ul>
            );
          case "callout": {
            if (!block.text.trim()) return null;
            const tone = block.tone;
            const color =
              tone === "success"
                ? "border-green-500/30 bg-green-500/10"
                : tone === "warning"
                  ? "border-yellow-500/30 bg-yellow-500/10"
                  : tone === "danger"
                    ? "border-red-500/30 bg-red-500/10"
                    : "border-blue-500/30 bg-blue-500/10";
            return (
              <div key={idx} className={`rounded-lg border p-4 ${color}`}>
                <p className="text-sm leading-6">{block.text}</p>
              </div>
            );
          }
          case "image":
            if (!block.url.trim()) return null;
            return (
              <figure key={idx} className="space-y-2">
                <img
                  src={block.url}
                  alt={block.caption ?? ""}
                  className="w-full rounded-lg border"
                />
                {block.caption ? (
                  <figcaption className="text-xs text-text-muted-light dark:text-text-muted-dark">
                    {block.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          case "video":
            if (!block.url.trim()) return null;
            return (
              <figure key={idx} className="space-y-2">
                <div className="aspect-video w-full overflow-hidden rounded-lg border">
                  <iframe
                    className="h-full w-full"
                    src={block.url}
                    title={block.caption ?? "video"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {block.caption ? (
                  <figcaption className="text-xs text-text-muted-light dark:text-text-muted-dark">
                    {block.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          default: {
            const _exhaustive: never = block;
            return _exhaustive;
          }
        }
      })}
    </div>
  );
}
