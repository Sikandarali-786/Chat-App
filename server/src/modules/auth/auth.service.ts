import crypto from "crypto";

import { AppError } from "../../shared/errors/AppError";
import { generateUsername } from "../../shared/utils/generateUsername";
import { hashPassword, comparePassword } from "../../shared/utils/password";
import {
    sendVerificationEmail,
    sendPasswordResetEmail,
} from "../../shared/utils/email";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../../shared/config/jwt";
import {
    uploadToCloudinary,
    deleteFromCloudinary,
    extractPublicId,
} from "../../shared/config/cloudinary";
import { MESSAGES } from "../../shared/constants";
import { userRepository } from "../users";

import {
    RegisterUserDTO,
    LoginUserDTO,
    ForgotPasswordDTO,
    ResetPasswordDTO,
    UpdateProfileDTO,
} from "./auth.types";

class AuthService {
    // ─── Register ────────────────────────────────────────────────────────────────
    async register(data: RegisterUserDTO) {
        // 1. Check email duplicate
        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new AppError(MESSAGES.EMAIL_ALREADY_EXISTS, 409);
        }

        // 2. Generate & check username
        const username = generateUsername(data.fullName);
        const existingUsername = await userRepository.findByUsername(username);
        if (existingUsername) {
            throw new AppError(MESSAGES.USERNAME_ALREADY_EXISTS, 409);
        }

        // 3. Hash password
        const hashedPassword = await hashPassword(data.password);

        // 4. Generate email verification token (24h expiry)
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpiresAt = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        );

        // 5. Save user
        const user = await userRepository.create({
            fullName: data.fullName,
            email: data.email,
            username,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiresAt,
        });

        // 6. Log token to console (dev only — email disabled temporarily)
        console.log(`\n[DEV] Verification Token: ${verificationToken}\n`);

        // 7. Return safe user + token in response (email disabled temporarily)
        const { password, refreshToken, verificationToken: vt, passwordResetToken, ...safeUser } =
            user.toObject();

        return { ...safeUser, verificationToken };
    }

    // ─── Login ────────────────────────────────────────────────────────────────────
    async login(data: LoginUserDTO) {
        // 1. Find user
        const user = await userRepository.findByEmail(data.email);
        if (!user) {
            throw new AppError(MESSAGES.INVALID_CREDENTIALS, 401);
        }

        // 2. Check password
        const isMatch = await comparePassword(data.password, user.password);
        if (!isMatch) {
            throw new AppError(MESSAGES.INVALID_CREDENTIALS, 401);
        }

        // 3. Check email verified
        if (!user.isVerified) {
            throw new AppError(MESSAGES.EMAIL_NOT_VERIFIED, 403);
        }

        // 4. Generate tokens
        const accessToken = generateAccessToken({
            userId: user._id.toString(),
            email: user.email,
        });

        const refreshToken = generateRefreshToken({
            userId: user._id.toString(),
        });

        // 5. Persist refresh token
        await userRepository.updateRefreshToken(
            user._id.toString(),
            refreshToken
        );

        // 6. Update status to online
        await userRepository.updateStatus(user._id.toString(), "online");

        // 7. Return tokens + safe user
        const {
            password,
            refreshToken: rt,
            verificationToken,
            verificationTokenExpiresAt,
            passwordResetToken,
            passwordResetExpiresAt,
            ...safeUser
        } = user.toObject();

        return { accessToken, refreshToken, user: safeUser };
    }

    // ─── Logout ───────────────────────────────────────────────────────────────────
    async logout(userId: string) {
        // Clear refresh token + set offline
        await Promise.all([
            userRepository.updateRefreshToken(userId, null),
            userRepository.updateStatus(userId, "offline"),
        ]);
    }

    // ─── Refresh Token ────────────────────────────────────────────────────────────
    async refreshToken(token: string) {
        // 1. Verify token signature
        let payload: { userId: string };
        try {
            payload = verifyRefreshToken(token);
        } catch {
            throw new AppError(MESSAGES.INVALID_TOKEN, 401);
        }

        // 2. Find user and check stored token matches
        const user = await userRepository.findById(payload.userId);
        if (!user || user.refreshToken !== token) {
            throw new AppError(MESSAGES.INVALID_TOKEN, 401);
        }

        // 3. Issue new access token
        const accessToken = generateAccessToken({
            userId: user._id.toString(),
            email: user.email,
        });

        return { accessToken };
    }

    // ─── Verify Email ─────────────────────────────────────────────────────────────
    async verifyEmail(token: string) {
        const user = await userRepository.findByVerificationToken(token);
        if (!user) {
            throw new AppError(MESSAGES.INVALID_TOKEN, 400);
        }

        if (user.isVerified) {
            throw new AppError(MESSAGES.EMAIL_ALREADY_VERIFIED, 400);
        }

        await userRepository.verifyEmail(user._id.toString());
    }

    // ─── Resend Verification Email ────────────────────────────────────────────────
    async resendVerificationEmail(email: string) {
        const user = await userRepository.findByEmail(email);
        if (!user) return null;

        if (user.isVerified) {
            throw new AppError(MESSAGES.EMAIL_ALREADY_VERIFIED, 400);
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpiresAt = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        );

        await userRepository.setVerificationToken(
            user._id.toString(),
            verificationToken,
            verificationTokenExpiresAt
        );

        console.log(`\n[DEV] Verification Token: ${verificationToken}\n`);

        return { verificationToken };
    }

    // ─── Forgot Password ──────────────────────────────────────────────────────────
    async forgotPassword(data: ForgotPasswordDTO) {
        const user = await userRepository.findByEmail(data.email);
        if (!user) return null;

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await userRepository.setPasswordResetToken(
            user._id.toString(),
            resetToken,
            resetExpiresAt
        );

        console.log(`\n[DEV] Password Reset Token: ${resetToken}\n`);

        return { resetToken };
    }

    // ─── Reset Password ───────────────────────────────────────────────────────────
    async resetPassword(data: ResetPasswordDTO) {
        const user = await userRepository.findByPasswordResetToken(data.token);
        if (!user) {
            throw new AppError(MESSAGES.INVALID_TOKEN, 400);
        }

        const hashedPassword = await hashPassword(data.password);
        await userRepository.resetPassword(user._id.toString(), hashedPassword);
    }

    // ─── Update Profile ───────────────────────────────────────────────────────────
    async updateProfile(userId: string, data: UpdateProfileDTO) {
        const user = await userRepository.updateProfile(userId, data);
        if (!user) {
            throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
        }

        const { password, refreshToken, verificationToken, passwordResetToken, ...safeUser } =
            user.toObject();

        return safeUser;
    }

    // ─── Upload Avatar ────────────────────────────────────────────────────────────
    async uploadAvatar(userId: string, filePath: string) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
        }

        // Delete old avatar from cloudinary if exists
        if (user.avatar) {
            const publicId = extractPublicId(user.avatar);
            await deleteFromCloudinary(publicId).catch(() => {
                // Non-fatal — old avatar cleanup failure shouldn't block upload
            });
        }

        const avatarUrl = await uploadToCloudinary(filePath, "chat-app/avatars");

        const updated = await userRepository.updateProfile(userId, {
            avatar: avatarUrl.url,
        });

        if (!updated) {
            throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
        }

        const { password, refreshToken, verificationToken, passwordResetToken, ...safeUser } =
            updated.toObject();

        return safeUser;
    }
}

export const authService = new AuthService();