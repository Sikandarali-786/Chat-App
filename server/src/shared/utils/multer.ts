import multer from "multer";
import path from "path";
import { AppError } from "../errors/AppError";

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "/tmp");
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

// ─── Avatar Upload (images only) ───────────────────────────────────────────────

const avatarFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError("Only JPEG, PNG, and WebP images are allowed", 400));
    }
};

export const upload = multer({
    storage,
    fileFilter: avatarFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

// ─── Media Upload (images, videos, audio, documents) ───────────────────────────

const mediaFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    const allowed = [
        // Images
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
        // Videos
        "video/mp4",
        "video/mpeg",
        "video/webm",
        "video/quicktime",
        // Audio
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/webm",
        "audio/ogg",
        // Documents
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
        "application/zip",
        "application/x-rar-compressed",
    ];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new AppError(
                "File type not supported. Allowed: images, videos, audio, documents",
                400
            )
        );
    }
};

export const mediaUpload = multer({
    storage,
    fileFilter: mediaFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
    },
});
