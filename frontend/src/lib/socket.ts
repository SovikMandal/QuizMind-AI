import { io, Socket } from "socket.io-client";
import { tokenStore } from "./api";

export function connectQuizSocket(): Socket {
  return io(`${import.meta.env.VITE_SOCKET_URL}/quiz`, {
    auth: { token: tokenStore.get() },
    transports: ["websocket"],
  });
}
