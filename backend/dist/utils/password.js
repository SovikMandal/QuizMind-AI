"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../config/env");
function hashPassword(plain) {
    return bcryptjs_1.default.hash(plain, env_1.env.BCRYPT_ROUNDS);
}
function verifyPassword(plain, hash) {
    return bcryptjs_1.default.compare(plain, hash);
}
//# sourceMappingURL=password.js.map