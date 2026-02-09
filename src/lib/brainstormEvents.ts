export type BrainstormEvent =
  | {
      type: "hello";
      now: string;
    }
  | {
      type: "presence";
      roomId: string;
      connections: number;
    }
  | {
      type: "message.created";
      roomId: string;
      message: {
        id: string;
        content: string;
        createdAt: string;
        author: { id: string; name: string | null };
      };
    };

type Listener = (event: BrainstormEvent) => void;

type RoomState = {
  connections: number;
  listeners: Set<Listener>;
};

function getState(): Map<string, RoomState> {
  const g = globalThis as unknown as { __flowBrainstormBus?: Map<string, RoomState> };
  if (!g.__flowBrainstormBus) g.__flowBrainstormBus = new Map();
  return g.__flowBrainstormBus;
}

function ensureRoom(roomId: string): RoomState {
  const state = getState();
  const existing = state.get(roomId);
  if (existing) return existing;
  const created: RoomState = { connections: 0, listeners: new Set() };
  state.set(roomId, created);
  return created;
}

export const brainstormBus = {
  connect(roomId: string, listener: Listener) {
    const room = ensureRoom(roomId);
    room.connections += 1;
    room.listeners.add(listener);

    const presence: BrainstormEvent = {
      type: "presence",
      roomId,
      connections: room.connections,
    };
    for (const l of room.listeners) l(presence);

    return () => {
      const r = ensureRoom(roomId);
      r.listeners.delete(listener);
      r.connections = Math.max(0, r.connections - 1);
      const p: BrainstormEvent = {
        type: "presence",
        roomId,
        connections: r.connections,
      };
      for (const l of r.listeners) l(p);

      if (r.connections === 0) {
        getState().delete(roomId);
      }
    };
  },

  publish(roomId: string, event: BrainstormEvent) {
    const room = ensureRoom(roomId);
    for (const listener of room.listeners) listener(event);
  },
};
