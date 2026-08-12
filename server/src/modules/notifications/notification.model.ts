import { model, Schema } from "mongoose";
import { INotification } from "./notification.types";

const notificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: [
                "message",
                "mention",
                "group_invite",
                "member_added",
                "member_removed",
                "admin_promoted",
                "call_invitation",
            ],
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        body: {
            type: String,
            required: true,
        },

        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
        },

        messageId: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },

        callId: {
            type: String,
        },

        callType: {
            type: String,
            enum: ["audio", "video"],
        },

        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = model<INotification>(
    "Notification",
    notificationSchema
);
