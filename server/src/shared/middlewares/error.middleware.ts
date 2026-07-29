import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { logger } from "../logger/logger";
import { MESSAGES } from "../constants";
import { ZodError } from "zod";

export const errorMiddleware = (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    logger.error(error)
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

    return res.status(500).json({
        success: false,
        message: MESSAGES.INTERNAL_SERVER_ERROR
    });
};