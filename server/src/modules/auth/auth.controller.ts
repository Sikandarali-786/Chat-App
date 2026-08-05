import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler";
import { successResponse } from "../../shared/responses/success.response";
import { AppError } from "../../shared/errors/AppError";
import { MESSAGES } from "../../shared/constants";
import { authService } from "./auth.service";

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.register(req.body);
    return successResponse(res, MESSAGES.USER_CREATED, user, 201);
});

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { accessToken, refreshToken, user } = await authService.login(req.body);

    // Set refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env["NODE_ENV"] === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(res, MESSAGES.LOGIN_SUCCESS, { accessToken, refreshToken, user });
});

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    await authService.logout(userId);

    res.clearCookie("refreshToken");
    return successResponse(res, MESSAGES.LOGOUT_SUCCESS);
});

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    // Token comes from cookie or body
    const token: string =
        req.cookies?.refreshToken || (req.body as { refreshToken?: string }).refreshToken;

    if (!token) {
        throw new AppError(MESSAGES.TOKEN_REQUIRED, 401);
    }

    const { accessToken } = await authService.refreshToken(token);
    return successResponse(res, MESSAGES.TOKEN_REFRESHED, { accessToken });
});

// ─── Verify Email ─────────────────────────────────────────────────────────────
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const token = req.params["token"] as string;
    await authService.verifyEmail(token);
    return successResponse(res, MESSAGES.EMAIL_VERIFIED);
});

// ─── Resend Verification Email ────────────────────────────────────────────────
export const resendVerificationEmail = asyncHandler(
    async (req: Request, res: Response) => {
        const { email } = req.body as { email: string };
        const result = await authService.resendVerificationEmail(email);
        return successResponse(res, MESSAGES.VERIFICATION_EMAIL_SENT, result);
    }
);

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPassword = asyncHandler(
    async (req: Request, res: Response) => {
        const result = await authService.forgotPassword(req.body);
        return successResponse(res, MESSAGES.PASSWORD_RESET_EMAIL_SENT, result);
    }
);

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = asyncHandler(
    async (req: Request, res: Response) => {
        await authService.resetPassword(req.body);
        return successResponse(res, MESSAGES.PASSWORD_RESET_SUCCESS);
    }
);

// ─── Get Me (current user) ────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req: Request, res: Response) => {
    return successResponse(res, "User fetched", req.user);
});

// ─── Update Profile ───────────────────────────────────────────────────────────
export const updateProfile = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const updated = await authService.updateProfile(userId, req.body);
        return successResponse(res, MESSAGES.PROFILE_UPDATED, updated);
    }
);

// ─── Upload Avatar ────────────────────────────────────────────────────────────
export const uploadAvatar = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.file) {
            throw new AppError(MESSAGES.NO_FILE_UPLOADED, 400);
        }

        const userId = req.user!.userId;
        const updated = await authService.uploadAvatar(userId, req.file.path);
        return successResponse(res, MESSAGES.AVATAR_UPDATED, updated);
    }
);
