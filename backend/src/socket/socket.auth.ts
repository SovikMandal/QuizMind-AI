import { Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt";

/** Verifies the JWT passed in the handshake and attaches userId to the socket. */
export function authenticateSocket(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth?.token as string | undefined;
  if (!token) return next(new Error("Authentication error: no token"));
  try {
    const decoded = verifyAccessToken(token);
    socket.data.userId = decoded.sub;
    next();
  } catch {
    next(new Error("Authentication error: invalid token"));
  }
}
