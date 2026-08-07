import { Document, Types } from "mongoose";

export type UserStatus = "online" | "offline" | "away";

export interface IUser extends Document {
    _id: Types.ObjectId;

    fullName: string;
    username: string;
    email: string;
    password: string;

    avatar?: string;
    bio?: string;

    isVerified: boolean;
    status: UserStatus;
    lastSeen?: Date | null;

    refreshToken?: string | null;

    verificationToken?: string | null;
    verificationTokenExpiresAt?: Date | null;

    passwordResetToken?: string | null;
    passwordResetExpiresAt?: Date | null;

    blockedUsers: Types.ObjectId[];
    mutedUsers: Types.ObjectId[];

    createdAt: Date;
    updatedAt: Date;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface SearchUsersQuery {
    q: string;
    page?: number;
    limit?: number;
}

export interface UpdateStatusDTO {
    status: UserStatus;
}
