import { Namespace, Socket } from "socket.io";
import { prisma } from "../../config/db";

const room = (sessionId: string) => `presence:${sessionId}`;

interface Presence {
  userId: string;
  name: string;
  avatarUrl: string | null;
}

/** Broadcasts the set of unique users currently in a session's presence room. */
async function emitPresence(nsp: Namespace, sessionId: string, excludeSocketId?: string) {
  const sockets = await nsp.in(room(sessionId)).fetchSockets();
  const users: Presence[] = [];
  const seen = new Set<string>();
  for (const s of sockets) {
    if (s.id === excludeSocketId) continue;
    const p = s.data.presence as Presence | undefined;
    if (p && !seen.has(p.userId)) {
      seen.add(p.userId);
      users.push(p);
    }
  }
  nsp.to(room(sessionId)).emit("presence_update", { count: users.length, users });
}

/** Tracks who is currently on a quiz's take page ("currently attempting" presence). */
export function registerPresenceHandlers(nsp: Namespace, socket: Socket) {
  socket.on("presence_join", async ({ sessionId }: { sessionId?: string }) => {
    if (!sessionId) return;
    const user = await prisma.user.findUnique({
      where: { id: socket.data.userId },
      select: { username: true, displayName: true, avatarUrl: true },
    });
    socket.data.presence = {
      userId: socket.data.userId,
      name: user?.displayName ?? user?.username ?? "Player",
      avatarUrl: user?.avatarUrl ?? null,
    };
    socket.data.presenceSession = sessionId;
    await socket.join(room(sessionId));
    await emitPresence(nsp, sessionId);
  });

  socket.on("disconnecting", () => {
    const sessionId = socket.data.presenceSession as string | undefined;
    if (sessionId) void emitPresence(nsp, sessionId, socket.id);
  });
}
