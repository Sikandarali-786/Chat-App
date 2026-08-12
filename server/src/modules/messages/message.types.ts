import { Document, Types } from "mongoose";

export type MessageType = "text" | "image" | "video" | "audio" | "file";
export type MessageStatus = "sent" | "delivered" | "seen";

export interface IMessage extends Document {
    _id: Types.ObjectId;

    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;

    type: MessageType;
    content: string; // Text or file URL

    // Mentions
    mentions: Types.ObjectId[];

    // Reply
    replyTo?: Types.ObjectId | null;

    // Status tracking (per-user basis)
    status: MessageStatus;
    deliveredTo: Types.ObjectId[]; // Users who received it
    seenBy: Types.ObjectId[]; // Users who saw it

    // Starred by users
    starredBy: Types.ObjectId[];

    // Soft delete
    isDeleted: boolean;
    deletedFor: Types.ObjectId[]; // Users who deleted it (only for them)

    // Edit tracking
    isEdited: boolean;
    editedAt?: Date | null;

    createdAt: Date;
    updatedAt: Date;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface SendMessageDTO {
    conversationId: string;
    content: string;
    type?: MessageType;
    replyTo?: string;
    mentions?: string[]; // Array of user IDs mentioned
}

export interface EditMessageDTO {
    content: string;
}

export interface ForwardMessageDTO {
    conversationId: string; // Target conversation
}

export interface GetMessagesQuery {
    page?: number;
    limit?: number;
}
