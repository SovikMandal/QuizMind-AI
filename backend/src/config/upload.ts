import multer from "multer";
import { Request } from "express";
import { ApiError } from "../utils/ApiError";

// Memory storage: the buffer is streamed to Cloudinary, not written to disk.
export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req: Request, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new ApiError(400, "Only image files are allowed"));
  },
});
