import { ZodObject, ZodError } from "zod";
import { NextFunction, Request, Response } from "express";

export const validate =
    (schema: ZodObject) =>
        async (req: Request, _res: Response, next: NextFunction) => {
            try {
                req.body = await schema.parseAsync(req.body);
                next();
            } catch (error) {
                next(error);
            }
        };