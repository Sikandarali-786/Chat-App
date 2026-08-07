import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler";
import { successResponse } from "../../shared/responses/success.response";
import { MESSAGES } from "../../shared/constants";
import { userService } from "./user.service";

// ─── Search Users ──────────────────────────────────────────────────────────────
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
    const { q, page, limit } = req.query as { q: string; page?: string; limit?: string; };

    const result = await userService.searchUsers(
        {
            q,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        },
        req.user!.userId
    );

    return successResponse(res, MESSAGES.USERS_FETCHED, result);
});

// ─── Get User Profile ──────────────────────────────────────────────────────────
export const getUserProfile = asyncHandler(
    async (req: Request, res: Response) => {
        const targetUserId = req.params["userId"] as string;

        const user = await userService.getUserProfile(
            targetUserId,
            req.user!.userId
        );

        return successResponse(res, MESSAGES.USER_FETCHED, user);
    }
);

// ─── Update Status ─────────────────────────────────────────────────────────────
export const updateStatus = asyncHandler(
    async (req: Request, res: Response) => {
        const result = await userService.updateStatus(
            req.user!.userId,
            req.body
        );
        return successResponse(res, MESSAGES.STATUS_UPDATED, result);
    }
);

// ─── Block User ────────────────────────────────────────────────────────────────
export const blockUser = asyncHandler(async (req: Request, res: Response) => {
    const targetId = req.params["userId"] as string;
    await userService.blockUser(req.user!.userId, targetId);
    return successResponse(res, MESSAGES.USER_BLOCKED);
});

// ─── Unblock User ──────────────────────────────────────────────────────────────
export const unblockUser = asyncHandler(async (req: Request, res: Response) => {
    const targetId = req.params["userId"] as string;
    await userService.unblockUser(req.user!.userId, targetId);
    return successResponse(res, MESSAGES.USER_UNBLOCKED);
});

// ─── Get Blocked Users ─────────────────────────────────────────────────────────
export const getBlockedUsers = asyncHandler(
    async (req: Request, res: Response) => {
        const users = await userService.getBlockedUsers(req.user!.userId);
        return successResponse(res, MESSAGES.BLOCKED_USERS_FETCHED, users);
    }
);

// ─── Mute User ─────────────────────────────────────────────────────────────────
export const muteUser = asyncHandler(async (req: Request, res: Response) => {
    const targetId = req.params["userId"] as string;
    await userService.muteUser(req.user!.userId, targetId);
    return successResponse(res, MESSAGES.USER_MUTED);
});

// ─── Unmute User ───────────────────────────────────────────────────────────────
export const unmuteUser = asyncHandler(async (req: Request, res: Response) => {
    const targetId = req.params["userId"] as string;
    await userService.unmuteUser(req.user!.userId, targetId);
    return successResponse(res, MESSAGES.USER_UNMUTED);
});

// ─── Get Muted Users ───────────────────────────────────────────────────────────
export const getMutedUsers = asyncHandler(
    async (req: Request, res: Response) => {
        const users = await userService.getMutedUsers(req.user!.userId);
        return successResponse(res, MESSAGES.MUTED_USERS_FETCHED, users);
    }
);
