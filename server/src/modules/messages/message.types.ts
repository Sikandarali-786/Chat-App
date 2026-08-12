import { Document, Types } from "mongoose";

export type MessageType = "text" | "image" | "video" | "audio" | "file" | "location" | "gif";
export type MessageStatus = "sent" | "delivered" | "seen";

export interface IMessage extends Document {
    _id: Types.ObjectId;

    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;

    type: MessageType;
    content: string; // Text, file URL, or location data (JSON string)

    // File metadata
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number; // For audio/video in seconds

    // Location data (stored as JSON in content)
    // { latitude: number, longitude: number, address?: string }

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
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
}

export interface SendLocationDTO {
    conversationId: string;
    latitude: number;
    longitude: number;
    address?: string;
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
