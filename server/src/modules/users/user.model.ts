import { model, Schema } from "mongoose";
import { IUser } from "./user.types";

const userSchema = new Schema<IUser>(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        avatar: {
            type: String,
            default: "",
        },

        bio: {
            type: String,
            default: "",
            maxlength: 200,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["online", "offline", "away"],
            default: "offline",
        },

        lastSeen: {
            type: Date,
            default: null,
        },

        refreshToken: {
            type: String,
            default: null,
        },

        verificationToken: {
            type: String,
            default: null,
        },

        verificationTokenExpiresAt: {
            type: Date,
            default: null,
        },

        passwordResetToken: {
            type: String,
            default: null,
        },

        passwordResetExpiresAt: {
            type: Date,
            default: null,
        },

        blockedUsers: {
            type: [Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },

        mutedUsers: {
            type: [Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Index for search
userSchema.index({ fullName: "text", username: "text" });

export const User = model<IUser>("User", userSchema);
