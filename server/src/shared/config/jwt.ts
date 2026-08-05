import jwt from "jsonwebtoken";
import { env } from "./env";

export interface JwtAccessPayload {
    userId: string;
    email: string;
}

export interface JwtRefreshPayload {
    userId: string;
}

export const generateAccessToken = (payload: JwtAccessPayload): string => {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"] & string,
    });
};

export const generateRefreshToken = (payload: JwtRefreshPayload): string => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"] & string,
    });
};

export const verifyAccessToken = (token: string): JwtAccessPayload => {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
};

export const verifyRefreshToken = (token: string): JwtRefreshPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtRefreshPayload;
};
