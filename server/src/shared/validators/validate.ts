import { ZodSchema } from "zod";
import { NextFunction, Request, Response } from "express";

// Validate req.body
export const validate =
    (schema: ZodSchema) =>
    async (req: Request, _res: Response, next: NextFunction) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        } catch (error) {
            next(error);
        }
    };

// Validate req.query
export const validateQuery =
    (schema: ZodSchema) =>
    async (req: Request, _res: Response, next: NextFunction) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            req.query = await schema.parseAsync(req.query) as any;
            next();
        } catch (error) {
            next(error);
        }
    };
