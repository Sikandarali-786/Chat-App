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
    lastSeen?: Date;

    refreshToken?: string | null;

    verificationToken?: string | null;
    verificationTokenExpiresAt?: Date | null;

    passwordResetToken?: string | null;
    passwordResetExpiresAt?: Date | null;

    createdAt: Date;
    updatedAt: Date;
}
