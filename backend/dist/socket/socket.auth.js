"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateSocket = authenticateSocket;
const jwt_1 = require("../utils/jwt");
/** Verifies the JWT passed in the handshake and attaches userId to the socket. */
function authenticateSocket(socket, next) {
    const token = socket.handshake.auth?.token;
    if (!token)
        return next(new Error("Authentication error: no token"));
    try {
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        socket.data.userId = decoded.sub;
        next();
    }
    catch {
        next(new Error("Authentication error: invalid token"));
    }
}
//# sourceMappingURL=socket.auth.js.map