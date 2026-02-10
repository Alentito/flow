import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { requireMember } from "@/lib/rbac";
import { brainstormBus, type BrainstormEvent } from "@/lib/brainstormEvents";

function encodeSse(event: BrainstormEvent) {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: roomId } = await ctx.params;

  const session = await getServerSession(authOptions);
  const access = requireMember(session);
  if (!access.ok) {
    return new Response(JSON.stringify({ error: access.error }), {
      status: access.status,
      headers: { "content-type": "application/json" },
    });
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      let closed = false;

      const safeEnqueue = (chunk: Uint8Array) => {
        if (closed) return;
        try {
          controller.enqueue(chunk);
        } catch {
          // Client disconnected / stream closed.
          closed = true;
        }
      };

      safeEnqueue(
        encoder.encode(encodeSse({ type: "hello", now: new Date().toISOString() })),
      );

      const unsubscribe = brainstormBus.connect(roomId, (event) => {
        safeEnqueue(encoder.encode(encodeSse(event)));
      });

      const heartbeat = setInterval(() => {
        safeEnqueue(
          encoder.encode(`event: ping\ndata: ${JSON.stringify({ t: Date.now() })}\n\n`),
        );
      }, 25_000);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
      };

      req.signal.addEventListener("abort", cleanup);

      return cleanup;
    },
    cancel() {
      // handled in start cleanup
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
