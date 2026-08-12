import { Types } from "mongoose";
import { Message } from "./message.model";
import { IMessage, MessageStatus } from "./message.types";

class MessageRepository {
    // ─── Create ────────────────────────────────────────────────────────────────

    async create(data: Partial<IMessage>) {
        return await Message.create(data);
    }

    // ─── Find ──────────────────────────────────────────────────────────────────

    async findById(id: string) {
        return await Message.findById(id)
            .populate("senderId", "fullName username avatar")
            .populate({
                path: "replyTo",
                populate: { path: "senderId", select: "fullName username" },
            });
    }

    async findByConversation(
        conversationId: string,
        userId: string,
        page: number,
        limit: number
    ) {
        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            Message.find({
                conversationId: new Types.ObjectId(conversationId),
                deletedFor: { $nin: [new Types.ObjectId(userId)] }, // Hide deleted
            })
                .populate("senderId", "fullName username avatar")
                .populate({
                    path: "replyTo",
                    populate: { path: "senderId", select: "fullName username" },
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Message.countDocuments({
                conversationId: new Types.ObjectId(conversationId),
                deletedFor: { $nin: [new Types.ObjectId(userId)] },
            }),
        ]);

        return { messages: messages.reverse(), total, page, limit };
    }

    async getStarredMessages(userId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            Message.find({
                starredBy: new Types.ObjectId(userId),
                deletedFor: { $nin: [new Types.ObjectId(userId)] },
            })
                .populate("senderId", "fullName username avatar")
                .populate("conversationId", "participants")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Message.countDocuments({
                starredBy: new Types.ObjectId(userId),
                deletedFor: { $nin: [new Types.ObjectId(userId)] },
            }),
        ]);

        return { messages, total, page, limit };
    }

    // ─── Update ────────────────────────────────────────────────────────────────

    async updateContent(messageId: string, content: string) {
        return await Message.findByIdAndUpdate(
            messageId,
            { content, isEdited: true, editedAt: new Date() },
            { new: true }
        );
    }

    async markAsDelivered(messageId: string, userId: string) {
        return await Message.findByIdAndUpdate(
            messageId,
            {
                status: "delivered",
                $addToSet: { deliveredTo: new Types.ObjectId(userId) },
            },
            { new: true }
        );
    }

    async markAsSeen(messageId: string, userId: string) {
        return await Message.findByIdAndUpdate(
            messageId,
            {
                status: "seen",
                $addToSet: { seenBy: new Types.ObjectId(userId) },
            },
            { new: true }
        );
    }

    async starMessage(messageId: string, userId: string) {
        return await Message.findByIdAndUpdate(
            messageId,
            { $addToSet: { starredBy: new Types.ObjectId(userId) } },
            { new: true }
        );
    }

    async unstarMessage(messageId: string, userId: string) {
        return await Message.findByIdAndUpdate(
            messageId,
            { $pull: { starredBy: new Types.ObjectId(userId) } },
            { new: true }
        );
    }

    async isStarred(messageId: string, userId: string): Promise<boolean> {
        const message = await Message.findOne({
            _id: messageId,
            starredBy: new Types.ObjectId(userId),
        });
        return !!message;
    }

    // ─── Delete ────────────────────────────────────────────────────────────────

    async deleteForUser(messageId: string, userId: string) {
        return await Message.findByIdAndUpdate(
            messageId,
            { $addToSet: { deletedFor: new Types.ObjectId(userId) } },
            { new: true }
        );
    }

    async deleteForEveryone(messageId: string) {
        return await Message.findByIdAndUpdate(
            messageId,
            { isDeleted: true },
            { new: true }
        );
    }

    // ─── Bulk operations ───────────────────────────────────────────────────────

    async markConversationMessagesAsDelivered(
        conversationId: string,
        userId: string
    ) {
        await Message.updateMany(
            {
                conversationId: new Types.ObjectId(conversationId),
                senderId: { $ne: new Types.ObjectId(userId) },
                deliveredTo: { $nin: [new Types.ObjectId(userId)] },
            },
            {
                status: "delivered",
                $addToSet: { deliveredTo: new Types.ObjectId(userId) },
            }
        );
    }

    async markConversationMessagesAsSeen(
        conversationId: string,
        userId: string
    ) {
        await Message.updateMany(
            {
                conversationId: new Types.ObjectId(conversationId),
                senderId: { $ne: new Types.ObjectId(userId) },
                seenBy: { $nin: [new Types.ObjectId(userId)] },
            },
            {
                status: "seen",
                $addToSet: { seenBy: new Types.ObjectId(userId) },
            }
        );
    }
}

export const messageRepository = new MessageRepository();
