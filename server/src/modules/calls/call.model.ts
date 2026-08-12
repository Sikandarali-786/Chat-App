import { model, Schema } from "mongoose";
import { ICall } from "./call.types";

const callSchema = new Schema<ICall>(
    {
        callId: {
            type: String,
            required: true,
            unique: true,
        },

        type: {
            type: String,
            enum: ["audio", "video"],
            required: true,
        },

        status: {
            type: String,
            enum: ["initiated", "ringing", "ongoing", "ended", "missed", "rejected"],
            default: "initiated",
        },

        callerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        receiverId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },

        startedAt: {
            type: Date,
            default: null,
        },

        endedAt: {
            type: Date,
            default: null,
        },

        duration: {
            type: Number,
            default: null,
        },

        wasScreenShared: {
            type: Boolean,
            default: false,
        },

        wasVideoEnabled: {
            type: Boolean,
            default: false,
        },

        wasAudioMuted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
callSchema.index({ callerId: 1, createdAt: -1 });
callSchema.index({ receiverId: 1, createdAt: -1 });
callSchema.index({ callId: 1 });

export const Call = model<ICall>("Call", callSchema);
