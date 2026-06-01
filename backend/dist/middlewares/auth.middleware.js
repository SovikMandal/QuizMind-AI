"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const ApiError_1 = require("../utils/ApiError");
const authenticate = (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        throw ApiError_1.ApiError.unauthorized("No token provided");
    }
    try {
        const decoded = (0, jwt_1.verifyAccessToken)(header.slice(7));
        req.user = { id: decoded.sub };
        next();
    }
    catch {
        throw ApiError_1.ApiError.unauthorized("Invalid or expired token");
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.middleware.js.map