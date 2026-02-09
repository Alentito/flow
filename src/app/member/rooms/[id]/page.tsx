import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoomChat } from "@/components/RoomChat";
import { RoomIdeas } from "@/components/RoomIdeas";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "MEMBER" && session.user.role !== "ADMIN") redirect("/member");

  const { id } = await params;

  const room = await prisma.brainstormRoom.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      createdBy: { select: { id: true, name: true } },
    },
  });

  if (!room) {
    return (
      <main className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold">Room not found</h1>
        <div className="mt-6">
          <Link href="/member/rooms" className="text-primary hover:underline">
            Back to rooms
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/member/rooms" className="text-sm text-primary hover:underline">
            ← Rooms
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{room.name}</h1>
          <div className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">
            Created by {room.createdBy?.name ?? "Member"} · Updated {room.updatedAt.toDateString()}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div>
          <RoomIdeas roomId={room.id} />
        </div>
        <div>
          <RoomChat roomId={room.id} />
        </div>
      </div>
    </main>
  );
}
