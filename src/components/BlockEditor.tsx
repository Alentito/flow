"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { PostBlock } from "@/lib/postBlocks";

type Props = {
  blocks: PostBlock[];
  onChange: (blocks: PostBlock[]) => void;
};

function uid() {
  // Works in modern browsers; fallback keeps hydration safe.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function useStableIds(count: number) {
  const [ids, setIds] = useState<string[]>(() => Array.from({ length: count }, () => uid()));

  useEffect(() => {
    setIds((prev) => {
      if (prev.length === count) return prev;
      if (prev.length > count) return prev.slice(0, count);
      return [...prev, ...Array.from({ length: count - prev.length }, () => uid())];
    });
  }, [count]);

  return [ids, setIds] as const;
}

function SortableBlockItem({
  id,
  children,
}: {
  id: string;
  children: (args: {
    setActivatorNodeRef: (element: HTMLElement | null) => void;
    handleProps: {
      attributes: Record<string, any>;
      listeners?: Record<string, any>;
    };
  }) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, setActivatorNodeRef, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children({
        setActivatorNodeRef,
        handleProps: { attributes, listeners },
      })}
    </div>
  );
}

function AddMenu({
  onPick,
  onClose,
}: {
  onPick: (block: PostBlock) => void;
  onClose: () => void;
}) {
  return (
    <div className="mt-2 w-full rounded-lg border bg-surface-light dark:bg-surface-dark p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="px-3 py-2 rounded-md border text-sm"
          onClick={() => {
            onPick({ type: "heading", level: 2, text: "" });
            onClose();
          }}
        >
          Heading
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-md border text-sm"
          onClick={() => {
            onPick({ type: "paragraph", text: "" });
            onClose();
          }}
        >
          Paragraph
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-md border text-sm"
          onClick={() => {
            onPick({ type: "bullets", items: [] });
            onClose();
          }}
        >
          Bullets
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-md border text-sm"
          onClick={() => {
            onPick({ type: "callout", tone: "info", text: "" });
            onClose();
          }}
        >
          Callout
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-md border text-sm"
          onClick={() => {
            onPick({ type: "image", url: "", caption: "" });
            onClose();
          }}
        >
          Image
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-md border text-sm"
          onClick={() => {
            onPick({ type: "video", url: "", caption: "" });
            onClose();
          }}
        >
          Video
        </button>
      </div>
      <div className="mt-2 flex justify-end">
        <button type="button" className="px-3 py-2 rounded-md border text-sm" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function Inserter({
  label,
  open,
  onToggle,
  onPick,
  onClose,
}: {
  label?: string;
  open: boolean;
  onToggle: () => void;
  onPick: (block: PostBlock) => void;
  onClose: () => void;
}) {
  return (
    <div className="py-2">
      <button
        type="button"
        className="w-full rounded-lg border border-dashed px-3 py-2 text-sm text-text-muted-light dark:text-text-muted-dark hover:bg-black/5 dark:hover:bg-white/5"
        onClick={onToggle}
      >
        + {label ?? "Add section"}
      </button>
      {open ? <AddMenu onPick={onPick} onClose={onClose} /> : null}
    </div>
  );
}

export function BlockEditor({ blocks, onChange }: Props) {
  const [ids, setIds] = useStableIds(blocks.length);
  const [openInserterAt, setOpenInserterAt] = useState<number | null>(null);

  // When `blocks` length changes, React can render once before `ids` state catches up.
  // Ensure we never render with missing/undefined keys.
  const safeIds = useMemo(() => {
    if (ids.length === blocks.length) return ids;
    if (ids.length > blocks.length) return ids.slice(0, blocks.length);
    return [...ids, ...Array.from({ length: blocks.length - ids.length }, () => uid())];
  }, [ids, blocks.length]);

  useEffect(() => {
    if (safeIds.length !== ids.length) setIds(safeIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIds.join("|")]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const update = (idx: number, patch: Partial<PostBlock>) => {
    const next = blocks.map((b, i) => (i === idx ? ({ ...b, ...patch } as PostBlock) : b));
    onChange(next);
  };

  const remove = (idx: number) => {
    onChange(blocks.filter((_, i) => i !== idx));
    setIds((prev) => prev.filter((_, i) => i !== idx));
  };

  const add = (block: PostBlock) => {
    onChange([...blocks, block]);
    setIds((prev) => [...prev, uid()]);
  };

  const insertAt = (idx: number, block: PostBlock) => {
    const clamped = Math.max(0, Math.min(idx, blocks.length));
    onChange([...blocks.slice(0, clamped), block, ...blocks.slice(clamped)]);
    setIds((prev) => [...prev.slice(0, clamped), uid(), ...prev.slice(clamped)]);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    setIds((prev) => arrayMove(prev, oldIndex, newIndex));
    onChange(arrayMove(blocks, oldIndex, newIndex));
  };

  const sortableItems = useMemo(() => safeIds, [safeIds]);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="px-3 py-2 rounded-md border text-sm"
          onClick={() => add({ type: "heading", level: 2, text: "" })}
        >
          + Heading
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-md border text-sm"
          onClick={() => add({ type: "paragraph", text: "" })}
        >
          + Paragraph
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-md border text-sm"
          onClick={() => add({ type: "bullets", items: [] })}
        >
          + Bullets
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-md border text-sm"
          onClick={() => add({ type: "image", url: "", caption: "" })}
        >
          + Image
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-md border text-sm"
          onClick={() => add({ type: "video", url: "", caption: "" })}
        >
          + Video
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded-md border text-sm"
          onClick={() => add({ type: "callout", tone: "info", text: "" })}
        >
          + Callout
        </button>
      </div>

      {blocks.length === 0 ? (
        <div className="border rounded-lg p-6 text-center text-gray-400 dark:text-gray-500">
          No sections yet. Add one above.
        </div>
      ) : null}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {blocks.map((block, idx) => (
              <div key={safeIds[idx] ?? `block-${idx}`}>
                <Inserter
                  label="Insert section"
                  open={openInserterAt === idx}
                  onToggle={() => setOpenInserterAt((cur) => (cur === idx ? null : idx))}
                  onPick={(b) => insertAt(idx, b)}
                  onClose={() => setOpenInserterAt(null)}
                />

                <SortableBlockItem id={safeIds[idx] ?? `block-${idx}`}>
                  {({ setActivatorNodeRef, handleProps }) => (
                    <div className="border rounded-lg p-4 bg-surface-light dark:bg-surface-dark">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          ref={setActivatorNodeRef as any}
                          {...handleProps.attributes}
                          {...handleProps.listeners}
                          className="cursor-grab active:cursor-grabbing px-2 py-1 rounded border text-xs"
                          aria-label="Drag to reorder"
                          title="Drag to reorder"
                        >
                          ⠿
                        </button>
                        <div className="text-xs uppercase tracking-wide text-text-muted-light dark:text-text-muted-dark">
                          {block.type}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-2 py-1 rounded border text-xs"
                          onClick={() => remove(idx)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-3">
                      {block.type === "heading" ? (
                        <>
                          <div>
                            <label className="block text-xs font-medium mb-1">Text</label>
                            <input
                              className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                              value={block.text}
                              onChange={(e) => update(idx, { text: e.target.value })}
                              placeholder="Heading"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Level</label>
                            <select
                              className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                              value={block.level}
                              onChange={(e) => update(idx, { level: Number(e.target.value) as any })}
                            >
                              <option value={1}>H1</option>
                              <option value={2}>H2</option>
                              <option value={3}>H3</option>
                              <option value={4}>H4</option>
                            </select>
                          </div>
                        </>
                      ) : null}

                      {block.type === "paragraph" ? (
                        <div>
                          <label className="block text-xs font-medium mb-1">Text</label>
                          <textarea
                            className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                            rows={6}
                            value={block.text}
                            onChange={(e) => update(idx, { text: e.target.value })}
                            placeholder="Write your paragraph…"
                          />
                        </div>
                      ) : null}

                      {block.type === "bullets" ? (
                        <div>
                          <label className="block text-xs font-medium mb-1">Items (one per line)</label>
                          <textarea
                            className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                            rows={5}
                            value={block.items.join("\n")}
                            onChange={(e) =>
                              update(idx, {
                                items: e.target.value
                                  .split(/\r?\n/)
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              } as any)
                            }
                            placeholder="- Bullet 1\n- Bullet 2"
                          />
                        </div>
                      ) : null}

                      {block.type === "callout" ? (
                        <>
                          <div>
                            <label className="block text-xs font-medium mb-1">Tone</label>
                            <select
                              className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                              value={block.tone}
                              onChange={(e) => update(idx, { tone: e.target.value as any })}
                            >
                              <option value="info">Info</option>
                              <option value="success">Success</option>
                              <option value="warning">Warning</option>
                              <option value="danger">Danger</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Text</label>
                            <textarea
                              className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                              rows={4}
                              value={block.text}
                              onChange={(e) => update(idx, { text: e.target.value })}
                              placeholder="Callout text…"
                            />
                          </div>
                        </>
                      ) : null}

                      {block.type === "image" || block.type === "video" ? (
                        <>
                          <div>
                            <label className="block text-xs font-medium mb-1">URL</label>
                            <input
                              className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                              value={block.url}
                              onChange={(e) => update(idx, { url: e.target.value })}
                              placeholder={block.type === "image" ? "https://…/image.png" : "https://www.youtube.com/embed/..."}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Caption</label>
                            <input
                              className="w-full px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
                              value={block.caption ?? ""}
                              onChange={(e) => update(idx, { caption: e.target.value })}
                              placeholder="Optional"
                            />
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                  )}
                </SortableBlockItem>
              </div>
            ))}

            <Inserter
              open={openInserterAt === blocks.length}
              onToggle={() => setOpenInserterAt((cur) => (cur === blocks.length ? null : blocks.length))}
              onPick={(b) => insertAt(blocks.length, b)}
              onClose={() => setOpenInserterAt(null)}
            />
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
