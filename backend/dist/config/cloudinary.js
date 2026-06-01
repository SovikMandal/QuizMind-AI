"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCloudinaryConfigured = void 0;
exports.uploadImage = uploadImage;
const cloudinary_1 = require("cloudinary");
const env_1 = require("./env");
exports.isCloudinaryConfigured = Boolean(env_1.env.CLOUDINARY_CLOUD_NAME && env_1.env.CLOUDINARY_API_KEY && env_1.env.CLOUDINARY_API_SECRET);
if (exports.isCloudinaryConfigured) {
    cloudinary_1.v2.config({
        cloud_name: env_1.env.CLOUDINARY_CLOUD_NAME,
        api_key: env_1.env.CLOUDINARY_API_KEY,
        api_secret: env_1.env.CLOUDINARY_API_SECRET,
    });
}
/** Uploads an image buffer and resolves to its secure URL. */
function uploadImage(buffer, folder = "quizmind/avatars") {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({ folder, resource_type: "image" }, (err, result) => {
            if (err || !result)
                return reject(err ?? new Error("Upload failed"));
            resolve(result.secure_url);
        });
        stream.end(buffer);
    });
}
//# sourceMappingURL=cloudinary.js.map