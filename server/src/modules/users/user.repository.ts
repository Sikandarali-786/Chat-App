import { Types } from "mongoose";
import { IUser, UserStatus } from "./user.types";
import { User } from "./user.model";

// Fields to exclude from public responses
const PRIVATE_FIELDS = {
    password: 0,
    refreshToken: 0,
    verificationToken: 0,
    verificationTokenExpiresAt: 0,
    passwordResetToken: 0,
    passwordResetExpiresAt: 0,
};

class UserRepository {
    // ─── Core ──────────────────────────────────────────────────────────────────

    async create(userData: Partial<IUser>) {
        return await User.create(userData);
    }

    async findById(id: string) {
        return await User.findById(id);
    }

    async findPublicById(id: string) {
        return await User.findById(id, PRIVATE_FIELDS);
    }

    async findByEmail(email: string) {
        return await User.findOne({ email });
    }

    async findByUsername(username: string) {
        return await User.findOne({ username });
    }

    async findByVerificationToken(token: string) {
        return await User.findOne({
            verificationToken: token,
            verificationTokenExpiresAt: { $gt: new Date() },
        });
    }

    async findByPasswordResetToken(token: string) {
        return await User.findOne({
            passwordResetToken: token,
            passwordResetExpiresAt: { $gt: new Date() },
        });
    }

    // ─── Auth ──────────────────────────────────────────────────────────────────

    async updateRefreshToken(userId: string, refreshToken: string | null) {
        return await User.findByIdAndUpdate(
            userId,
            { refreshToken },
            { new: true }
        );
    }

    async verifyEmail(userId: string) {
        return await User.findByIdAndUpdate(
            userId,
            {
                isVerified: true,
                verificationToken: null,
                verificationTokenExpiresAt: null,
            },
            { new: true }
        );
    }

    async setVerificationToken(userId: string, token: string, expiresAt: Date) {
        return await User.findByIdAndUpdate(
            userId,
            { verificationToken: token, verificationTokenExpiresAt: expiresAt },
            { new: true }
        );
    }

    async setPasswordResetToken(userId: string, token: string, expiresAt: Date) {
        return await User.findByIdAndUpdate(
            userId,
            { passwordResetToken: token, passwordResetExpiresAt: expiresAt },
            { new: true }
        );
    }

    async resetPassword(userId: string, hashedPassword: string) {
        return await User.findByIdAndUpdate(
            userId,
            {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpiresAt: null,
            },
            { new: true }
        );
    }

    // ─── Profile ───────────────────────────────────────────────────────────────

    async updateProfile(userId: string, data: Partial<IUser>) {
        return await User.findByIdAndUpdate(userId, data, { new: true });
    }

    // ─── Status ────────────────────────────────────────────────────────────────

    async updateStatus(userId: string, status: UserStatus) {
        return await User.findByIdAndUpdate(
            userId,
            { status, lastSeen: new Date() },
            { new: true }
        );
    }

    // ─── Search ────────────────────────────────────────────────────────────────

    async searchUsers(
        query: string,
        currentUserId: string,
        page: number,
        limit: number
    ) {
        const skip = (page - 1) * limit;

        const filter = {
            $or: [
                { fullName: { $regex: query, $options: "i" } },
                { username: { $regex: query, $options: "i" } },
            ],
            _id: { $ne: new Types.ObjectId(currentUserId) },
            isVerified: true,
            // Exclude users who blocked the current user
            blockedUsers: { $nin: [new Types.ObjectId(currentUserId)] },
        };

        const [users, total] = await Promise.all([
            User.find(filter, PRIVATE_FIELDS).skip(skip).limit(limit).lean(),
            User.countDocuments(filter),
        ]);

        return { users, total, page, limit };
    }

    // ─── Block / Unblock ───────────────────────────────────────────────────────

    async blockUser(userId: string, targetId: string) {
        return await User.findByIdAndUpdate(
            userId,
            { $addToSet: { blockedUsers: new Types.ObjectId(targetId) } },
            { new: true }
        );
    }

    async unblockUser(userId: string, targetId: string) {
        return await User.findByIdAndUpdate(
            userId,
            { $pull: { blockedUsers: new Types.ObjectId(targetId) } },
            { new: true }
        );
    }

    async isBlocked(userId: string, targetId: string): Promise<boolean> {
        const user = await User.findOne({
            _id: userId,
            blockedUsers: new Types.ObjectId(targetId),
        });
        return !!user;
    }

    async getBlockedUsers(userId: string) {
        const user = await User.findById(userId)
            .populate("blockedUsers", PRIVATE_FIELDS)
            .lean();
        return user?.blockedUsers ?? [];
    }

    // ─── Mute / Unmute ─────────────────────────────────────────────────────────

    async muteUser(userId: string, targetId: string) {
        return await User.findByIdAndUpdate(
            userId,
            { $addToSet: { mutedUsers: new Types.ObjectId(targetId) } },
            { new: true }
        );
    }

    async unmuteUser(userId: string, targetId: string) {
        return await User.findByIdAndUpdate(
            userId,
            { $pull: { mutedUsers: new Types.ObjectId(targetId) } },
            { new: true }
        );
    }

    async isMuted(userId: string, targetId: string): Promise<boolean> {
        const user = await User.findOne({
            _id: userId,
            mutedUsers: new Types.ObjectId(targetId),
        });
        return !!user;
    }

    async getMutedUsers(userId: string) {
        const user = await User.findById(userId)
            .populate("mutedUsers", PRIVATE_FIELDS)
            .lean();
        return user?.mutedUsers ?? [];
    }
}

export const userRepository = new UserRepository();
