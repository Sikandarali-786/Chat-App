import { IUser } from "./user.types";
import { User } from "./user.model";

class UserRepository {
    async create(userData: Partial<IUser>) {
        return await User.create(userData);
    }

    async findById(id: string) {
        return await User.findById(id);
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

    async setVerificationToken(
        userId: string,
        token: string,
        expiresAt: Date
    ) {
        return await User.findByIdAndUpdate(
            userId,
            {
                verificationToken: token,
                verificationTokenExpiresAt: expiresAt,
            },
            { new: true }
        );
    }

    async setPasswordResetToken(
        userId: string,
        token: string,
        expiresAt: Date
    ) {
        return await User.findByIdAndUpdate(
            userId,
            {
                passwordResetToken: token,
                passwordResetExpiresAt: expiresAt,
            },
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

    async updateStatus(userId: string, status: "online" | "offline" | "away") {
        return await User.findByIdAndUpdate(
            userId,
            {
                status,
                lastSeen: new Date(),
            },
            { new: true }
        );
    }

    async updateProfile(userId: string, data: Partial<IUser>) {
        return await User.findByIdAndUpdate(userId, data, { new: true });
    }
}

export const userRepository = new UserRepository();
