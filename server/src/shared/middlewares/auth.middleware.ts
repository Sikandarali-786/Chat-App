import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../config/jwt";
import { userRepository } from "../../modules/users";
import { AppError } from "../errors/AppError";
import { MESSAGES } from "../constants";

// Extend Express Request to carry authenticated user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
            };
        }
    }
}

export const protect = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        // 1. Get token from Authorization header or cookie
        let token: string | undefined;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken as string;
        }

        if (!token) {
            throw new AppError(MESSAGES.TOKEN_REQUIRED, 401);
        }

        // 2. Verify token
        let payload: { userId: string; email: string };
        try {
            payload = verifyAccessToken(token);
        } catch {
            throw new AppError(MESSAGES.INVALID_TOKEN, 401);
        }

        // 3. Check user still exists
        const user = await userRepository.findById(payload.userId);
        if (!user) {
            throw new AppError(MESSAGES.UNAUTHORIZED, 401);
        }

        // 4. Attach to request
        req.user = { userId: payload.userId, email: payload.email };

        next();
    } catch (error) {
        next(error);
    }
};
