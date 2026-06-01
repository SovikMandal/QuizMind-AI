"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPublicUser = toPublicUser;
function toPublicUser(user) {
    const { passwordHash: _omit, ...rest } = user;
    return rest;
}
//# sourceMappingURL=sanitizeUser.js.map