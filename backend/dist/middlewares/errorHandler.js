"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const ApiError_1 = require("../utils/ApiError");
const logger_1 = require("../utils/logger");
const notFoundHandler = (req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof ApiError_1.ApiError) {
        res.status(err.statusCode).json({ error: err.message, details: err.details });
        return;
    }
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({ error: "Validation failed", details: err.flatten() });
        return;
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            const target = err.meta?.target?.join(", ") ?? "field";
            res.status(409).json({ error: `${target} already exists` });
            return;
        }
        if (err.code === "P2025") {
            res.status(404).json({ error: "Record not found" });
            return;
        }
    }
    logger_1.logger.error(`Unhandled error: ${err instanceof Error ? err.stack : String(err)}`);
    res.status(500).json({ error: "Internal server error" });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map