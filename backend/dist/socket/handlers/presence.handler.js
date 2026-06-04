"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPresenceHandlers = registerPresenceHandlers;
const db_1 = require("../../config/db");
const room = (sessionId) => `presence:${sessionId}`;
/** Broadcasts the set of unique users currently in a session's presence room. */
async function emitPresence(nsp, sessionId, excludeSocketId) {
    const sockets = await nsp.in(room(sessionId)).fetchSockets();
    const users = [];
    const seen = new Set();
    for (const s of sockets) {
        if (s.id === excludeSocketId)
            continue;
        const p = s.data.presence;
        if (p && !seen.has(p.userId)) {
            seen.add(p.userId);
            users.push(p);
        }
    }
    nsp.to(room(sessionId)).emit("presence_update", { count: users.length, users });
}
/** Tracks who is currently on a quiz's take page ("currently attempting" presence). */
function registerPresenceHandlers(nsp, socket) {
    socket.on("presence_join", async ({ sessionId }) => {
        if (!sessionId)
            return;
        const user = await db_1.prisma.user.findUnique({
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
        const sessionId = socket.data.presenceSession;
        if (sessionId)
            void emitPresence(nsp, sessionId, socket.id);
    });
}
//# sourceMappingURL=presence.handler.js.map