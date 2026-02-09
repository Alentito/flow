"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string | null };
};

type Props = {
  roomId: string;
};

export function RoomChat({ roomId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [connections, setConnections] = useState<number | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const sorted = useMemo(() => messages, [messages]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setError(null);
      const res = await fetch(`/api/rooms/${roomId}/messages?take=80`);
      const data = await res.json().catch(() => ({}));
      if (!active) return;
      if (!res.ok) {
        setError(data?.error ?? "Failed to load messages");
        return;
      }
      setMessages(data.messages ?? []);
    };
    load();
    return () => {
      active = false;
    };
  }, [roomId]);

  useEffect(() => {
    // SSE for message.created + presence updates
    const es = new EventSource(`/api/rooms/${roomId}/events`);

    const onPresence = (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        if (parsed?.type === "presence") setConnections(parsed.connections);
      } catch {
        // ignore
      }
    };

    const onCreated = (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        if (parsed?.type === "message.created" && parsed.message) {
          setMessages((prev) => {
            const next = [...prev, parsed.message as ChatMessage];
            const dedup = new Map(next.map((m) => [m.id, m] as const));
            return Array.from(dedup.values());
          });
        }
      } catch {
        // ignore
      }
    };

    es.addEventListener("presence", onPresence as any);
    es.addEventListener("message.created", onCreated as any);

    es.onerror = () => {
      // Browser will auto-reconnect; we keep it quiet unless user action fails.
    };

    return () => {
      es.close();
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const send = async () => {
    const content = text.trim();
    if (!content) return;

    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Send failed");
        return;
      }
      setText("");
      // optimistic append is handled by SSE; also append immediately if SSE lags
      if (data.message?.id) {
        setMessages((prev) => {
          const next = [...prev, data.message as ChatMessage];
          const dedup = new Map(next.map((m) => [m.id, m] as const));
          return Array.from(dedup.values());
        });
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white/60 dark:bg-black/20 p-4 flex flex-col h-[520px]">
      <div className="flex items-center justify-between gap-3">
        <div className="font-medium">Room chat</div>
        <div className="text-xs text-text-muted-light dark:text-text-muted-dark">
          {connections === null ? "…" : `${connections} online`}
        </div>
      </div>

      <div className="mt-3 flex-1 overflow-auto space-y-3 pr-1">
        {sorted.length === 0 ? (
          <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
            No messages yet.
          </div>
        ) : null}

        {sorted.map((m) => (
          <div key={m.id} className="rounded-lg border p-3 bg-white/50 dark:bg-black/10">
            <div className="text-xs text-text-muted-light dark:text-text-muted-dark">
              {m.author?.name ?? "Member"} · {new Date(m.createdAt).toLocaleString()}
            </div>
            <div className="mt-1 whitespace-pre-wrap text-sm">{m.content}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 border-t pt-3">
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 border rounded-md bg-surface-light dark:bg-surface-dark"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                void send();
              }
            }}
            disabled={sending}
          />
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-60"
            onClick={() => void send()}
            disabled={sending || !text.trim()}
            title="Send (Ctrl/⌘+Enter)"
          >
            Send
          </button>
        </div>
        {error ? <div className="mt-2 text-xs text-red-500">{error}</div> : null}
      </div>
    </div>
  );
}
