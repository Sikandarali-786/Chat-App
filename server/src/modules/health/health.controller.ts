import { Request, Response } from "express";
import { successResponse } from "../../shared/responses/success.response";

export const getHealth = (_req: Request, res: Response) => {
    return successResponse(res, "Server is running", {
        timestamp: new Date().toISOString(),
    });
};