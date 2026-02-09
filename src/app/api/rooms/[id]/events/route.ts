import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { requireMember } from "@/lib/rbac";
import { brainstormBus, type BrainstormEvent } from "@/lib/brainstormEvents";

function encodeSse(event: BrainstormEvent) {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

export async function GET(
  _req: Request,
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

      controller.enqueue(
        encoder.encode(
          encodeSse({ type: "hello", now: new Date().toISOString() }),
        ),
      );

      const unsubscribe = brainstormBus.connect(roomId, (event) => {
        controller.enqueue(encoder.encode(encodeSse(event)));
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(
          encoder.encode(
            `event: ping\ndata: ${JSON.stringify({ t: Date.now() })}\n\n`,
          ),
        );
      }, 25_000);

      // @ts-expect-error Next runtime supports cancel on ReadableStream
      controller.signal?.addEventListener?.("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
      });

      return () => {
        clearInterval(heartbeat);
        unsubscribe();
      };
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
