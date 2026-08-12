import { Document, Types } from "mongoose";

export type ConversationType = "one-to-one" | "group";

export interface IConversation extends Document {
    _id: Types.ObjectId;

    type: ConversationType;

    // One-to-One: 2 participants, Group: multiple
    participants: Types.ObjectId[];

    // Group specific
    name?: string;
    avatar?: string;
    admin?: Types.ObjectId;

    // Last message reference
    lastMessage?: Types.ObjectId | null;
    lastMessageAt?: Date | null;

    // Pinned by users (array of userIds who pinned this conversation)
    pinnedBy: Types.ObjectId[];

    createdAt: Date;
    updatedAt: Date;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateConversationDTO {
    participantId: string; // For one-to-one
}

export interface GetConversationsQuery {
    page?: number;
    limit?: number;
}
