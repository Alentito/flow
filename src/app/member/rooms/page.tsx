import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RoomListItem = {
  id: string;
  name: string;
  updatedAt: Date;
  createdBy: { name: string | null } | null;
  _count: { ideas: number; messages: number };
};

export default async function RoomsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "MEMBER" && session.user.role !== "ADMIN") {
    return (
      <main className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold">Brainstorm rooms</h1>
        <p className="mt-3 text-text-muted-light dark:text-text-muted-dark">
          Ask an admin to promote you to <b>MEMBER</b>.
        </p>
      </main>
    );
  }

  const rooms = (await prisma.brainstormRoom.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      updatedAt: true,
      createdBy: { select: { name: true } },
      _count: { select: { ideas: true, messages: true } },
    },
  })) as RoomListItem[];

  return (
    <main className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Brainstorm rooms</h1>
          <p className="mt-2 text-text-muted-light dark:text-text-muted-dark">
            Notion-like idea collection + room chat.
          </p>
        </div>
        <Link
          href="/member/rooms/new"
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-hover"
        >
          New room
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {rooms.length === 0 ? (
          <div className="md:col-span-2 border rounded-lg p-6 text-center text-gray-400 dark:text-gray-500">
            No rooms yet.
          </div>
        ) : (
          rooms.map((r: RoomListItem) => (
            <Link
              key={r.id}
              href={`/member/rooms/${r.id}`}
              className="border rounded-lg p-6 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="text-lg font-semibold">{r.name}</div>
              <div className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">
                Updated {r.updatedAt.toDateString()} · by {r.createdBy?.name ?? "Member"}
              </div>
              <div className="mt-3 text-sm text-text-muted-light dark:text-text-muted-dark">
                {r._count.ideas} ideas · {r._count.messages} messages
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
