import { Response } from "express";

export const errorResponse = (
    res: Response,
    message: string,
    errors: unknown = null,
    statusCode = 500
) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};