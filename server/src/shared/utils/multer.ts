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

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError("Only JPEG, PNG, and WebP images are allowed", 400));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
