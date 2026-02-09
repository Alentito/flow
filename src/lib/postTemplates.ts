import type { PostBlock } from "@/lib/postBlocks";

export type PostTemplateId = "research-update" | "paper" | "release";

export function getTemplate(id: PostTemplateId): {
  titlePlaceholder: string;
  excerptPlaceholder: string;
  blocks: PostBlock[];
} {
  switch (id) {
    case "research-update":
      return {
        titlePlaceholder: "Weekly research update — <date>",
        excerptPlaceholder: "A quick summary of this week’s progress.",
        blocks: [
          { type: "heading", level: 2, text: "Summary" },
          { type: "paragraph", text: "(Write 3–5 sentences summarizing the update.)" },
          {
            type: "bullets",
            items: [
              "What we shipped",
              "What we learned",
              "Next steps",
            ],
          },
          { type: "heading", level: 2, text: "Highlights" },
          { type: "paragraph", text: "(Add a short highlight paragraph.)" },
          { type: "callout", tone: "info", text: "Add links to code, paper drafts, or demos." },
        ],
      };

    case "paper":
      return {
        titlePlaceholder: "New paper: <title>",
        excerptPlaceholder: "We introduce … and show …",
        blocks: [
          { type: "heading", level: 2, text: "Abstract" },
          { type: "paragraph", text: "(Paste or summarize the abstract.)" },
          { type: "heading", level: 2, text: "Key contributions" },
          { type: "bullets", items: ["Contribution #1", "Contribution #2", "Contribution #3"] },
          { type: "heading", level: 2, text: "Links" },
          { type: "bullets", items: ["Paper: <url>", "Code: <url>", "Project page: <url>"] },
          { type: "image", url: "https://placehold.co/1200x630", caption: "Figure / teaser (replace URL)" },
        ],
      };

    case "release":
      return {
        titlePlaceholder: "Model release: Flow <version>",
        excerptPlaceholder: "What’s new in this release and how to use it.",
        blocks: [
          { type: "heading", level: 2, text: "What’s new" },
          { type: "bullets", items: ["Improvement #1", "Improvement #2", "Improvement #3"] },
          { type: "heading", level: 2, text: "Download" },
          { type: "callout", tone: "warning", text: "(Members-only) Add the gated download link here." },
          { type: "heading", level: 2, text: "Usage" },
          { type: "paragraph", text: "(Add install and inference instructions.)" },
          { type: "heading", level: 2, text: "Demo" },
          { type: "video", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", caption: "Demo video (replace URL)" },
        ],
      };
  }
}
