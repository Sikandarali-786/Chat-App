import { Document, Types } from "mongoose";

export type NotificationType =
    | "message"
    | "mention"
    | "group_invite"
    | "member_added"
    | "member_removed"
    | "admin_promoted"
    | "call_invitation";

export interface INotification extends Document {
    _id: Types.ObjectId;

    userId: Types.ObjectId; // Recipient
    type: NotificationType;

    title: string;
    body: string;

    // Reference to related entities
    senderId?: Types.ObjectId;
    conversationId?: Types.ObjectId;
    messageId?: Types.ObjectId;

    // Call specific
    callId?: string;
    callType?: "audio" | "video";

    isRead: boolean;

    createdAt: Date;
    updatedAt: Date;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface GetNotificationsQuery {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
}
