"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.avatarUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const ApiError_1 = require("../utils/ApiError");
// Memory storage: the buffer is streamed to Cloudinary, not written to disk.
exports.avatarUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith("image/"))
            cb(null, true);
        else
            cb(new ApiError_1.ApiError(400, "Only image files are allowed"));
    },
});
//# sourceMappingURL=upload.js.map