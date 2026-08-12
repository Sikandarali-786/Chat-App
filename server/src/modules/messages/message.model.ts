import { model, Schema } from "mongoose";
import { IMessage } from "./message.types";

const messageSchema = new Schema<IMessage>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },

        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: ["text", "image", "video", "audio", "file", "location", "gif"],
            default: "text",
        },

        content: {
            type: String,
            required: true,
        },

        fileName: {
            type: String,
            default: null,
        },

        fileSize: {
            type: Number,
            default: null,
        },

        mimeType: {
            type: String,
            default: null,
        },

        duration: {
            type: Number,
            default: null,
        },

        mentions: {
            type: [Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },

        replyTo: {
            type: Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },

        status: {
            type: String,
            enum: ["sent", "delivered", "seen"],
            default: "sent",
        },

        deliveredTo: {
            type: [Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },

        seenBy: {
            type: [Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },

        starredBy: {
            type: [Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },

        deletedFor: {
            type: [Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },

        isEdited: {
            type: Boolean,
            default: false,
        },

        editedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

export const Message = model<IMessage>("Message", messageSchema);
