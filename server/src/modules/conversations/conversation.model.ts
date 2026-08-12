import { model, Schema } from "mongoose";
import { IConversation } from "./conversation.types";

const conversationSchema = new Schema<IConversation>(
    {
        type: {
            type: String,
            enum: ["one-to-one", "group"],
            default: "one-to-one",
        },

        participants: {
            type: [Schema.Types.ObjectId],
            ref: "User",
            required: true,
        },

        // Group fields
        name: {
            type: String,
            trim: true,
        },

        avatar: {
            type: String,
        },

        admin: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        // Last message tracking
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },

        lastMessageAt: {
            type: Date,
            default: null,
        },

        pinnedBy: {
            type: [Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Index for finding conversations by participant
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export const Conversation = model<IConversation>(
    "Conversation",
    conversationSchema
);
