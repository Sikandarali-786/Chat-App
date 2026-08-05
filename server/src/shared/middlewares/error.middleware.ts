import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import multer from "multer";
import { AppError } from "../errors/AppError";
import { logger } from "../logger/logger";
import { MESSAGES } from "../constants";

export const errorMiddleware = (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    logger.error(error);

    // Zod validation error
    if (error instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    // Multer error (file upload)
    if (error instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: error.code === "LIMIT_UNEXPECTED_FILE"
                ? `Unexpected field "${error.field}". Use "avatar" as the field name.`
                : error.message,
            errors: null,
        });
    }

    // Operational app error (known, expected)
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            errors: null,
        });
    }

    // Unknown / unexpected error
    return res.status(500).json({
        success: false,
        message: MESSAGES.INTERNAL_SERVER_ERROR,
        errors: null,
    });
};
