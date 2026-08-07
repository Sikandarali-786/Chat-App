import { AppError } from "../../shared/errors/AppError";
import { MESSAGES } from "../../shared/constants";
import { userRepository } from "./user.repository";
import { SearchUsersQuery, UpdateStatusDTO } from "./user.types";

class UserService {
    // ─── Search Users ──────────────────────────────────────────────────────────
    async searchUsers(query: SearchUsersQuery, currentUserId: string) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;

        const result = await userRepository.searchUsers(
            query.q,
            currentUserId,
            page,
            limit
        );

        return {
            users: result.users,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit),
            },
        };
    }

    // ─── Get User Profile ──────────────────────────────────────────────────────
    async getUserProfile(targetUserId: string, currentUserId: string) {
        // Check if current user is blocked by target
        const isBlockedByTarget = await userRepository.isBlocked(
            targetUserId,
            currentUserId
        );
        if (isBlockedByTarget) {
            throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
        }

        const user = await userRepository.findPublicById(targetUserId);
        if (!user) {
            throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
        }

        // Check if current user has blocked target
        const hasBlocked = await userRepository.isBlocked(
            currentUserId,
            targetUserId
        );

        // Check if current user has muted target
        const hasMuted = await userRepository.isMuted(
            currentUserId,
            targetUserId
        );

        return { ...user.toObject(), hasBlocked, hasMuted };
    }

    // ─── Update Status ─────────────────────────────────────────────────────────
    async updateStatus(userId: string, data: UpdateStatusDTO) {
        const user = await userRepository.updateStatus(userId, data.status);
        if (!user) {
            throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
        }
        return { status: user.status, lastSeen: user.lastSeen };
    }

    // ─── Block User ────────────────────────────────────────────────────────────
    async blockUser(userId: string, targetId: string) {
        if (userId === targetId) {
            throw new AppError(MESSAGES.CANNOT_BLOCK_SELF, 400);
        }

        const target = await userRepository.findById(targetId);
        if (!target) {
            throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
        }

        const alreadyBlocked = await userRepository.isBlocked(userId, targetId);
        if (alreadyBlocked) {
            throw new AppError(MESSAGES.USER_ALREADY_BLOCKED, 409);
        }

        await userRepository.blockUser(userId, targetId);
    }

    // ─── Unblock User ──────────────────────────────────────────────────────────
    async unblockUser(userId: string, targetId: string) {
        const isBlocked = await userRepository.isBlocked(userId, targetId);
        if (!isBlocked) {
            throw new AppError(MESSAGES.USER_NOT_BLOCKED, 400);
        }

        await userRepository.unblockUser(userId, targetId);
    }

    // ─── Get Blocked Users ─────────────────────────────────────────────────────
    async getBlockedUsers(userId: string) {
        return await userRepository.getBlockedUsers(userId);
    }

    // ─── Mute User ─────────────────────────────────────────────────────────────
    async muteUser(userId: string, targetId: string) {
        if (userId === targetId) {
            throw new AppError(MESSAGES.CANNOT_MUTE_SELF, 400);
        }

        const target = await userRepository.findById(targetId);
        if (!target) {
            throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
        }

        const alreadyMuted = await userRepository.isMuted(userId, targetId);
        if (alreadyMuted) {
            throw new AppError(MESSAGES.USER_ALREADY_MUTED, 409);
        }

        await userRepository.muteUser(userId, targetId);
    }

    // ─── Unmute User ───────────────────────────────────────────────────────────
    async unmuteUser(userId: string, targetId: string) {
        const isMuted = await userRepository.isMuted(userId, targetId);
        if (!isMuted) {
            throw new AppError(MESSAGES.USER_NOT_MUTED, 400);
        }

        await userRepository.unmuteUser(userId, targetId);
    }

    // ─── Get Muted Users ───────────────────────────────────────────────────────
    async getMutedUsers(userId: string) {
        return await userRepository.getMutedUsers(userId);
    }
}

export const userService = new UserService();
