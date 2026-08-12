import { Types } from "mongoose";
import { Conversation } from "./conversation.model";
import { IConversation } from "./conversation.types";

class ConversationRepository {
    // ─── Create ────────────────────────────────────────────────────────────────

    async create(data: Partial<IConversation>) {
        return await Conversation.create(data);
    }

    // ─── Find ──────────────────────────────────────────────────────────────────

    async findById(id: string) {
        return await Conversation.findById(id)
            .populate("participants", "fullName username avatar status lastSeen")
            .populate({
                path: "lastMessage",
                populate: { path: "senderId", select: "fullName username avatar" },
            });
    }

    async findOneToOneByParticipants(userId1: string, userId2: string) {
        return await Conversation.findOne({
            type: "one-to-one",
            participants: {
                $all: [new Types.ObjectId(userId1), new Types.ObjectId(userId2)],
            },
        });
    }

    async findByParticipant(userId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [conversations, total] = await Promise.all([
            Conversation.find({
                participants: new Types.ObjectId(userId),
            })
                .populate("participants", "fullName username avatar status lastSeen")
                .populate({
                    path: "lastMessage",
                    populate: {
                        path: "senderId",
                        select: "fullName username avatar",
                    },
                })
                .sort({ lastMessageAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Conversation.countDocuments({
                participants: new Types.ObjectId(userId),
            }),
        ]);

        return { conversations, total, page, limit };
    }

    // ─── Update ────────────────────────────────────────────────────────────────

    async updateLastMessage(conversationId: string, messageId: string) {
        return await Conversation.findByIdAndUpdate(
            conversationId,
            {
                lastMessage: new Types.ObjectId(messageId),
                lastMessageAt: new Date(),
            },
            { returnDocument: "after" }
        );
    }

    async pinConversation(conversationId: string, userId: string) {
        return await Conversation.findByIdAndUpdate(
            conversationId,
            { $addToSet: { pinnedBy: new Types.ObjectId(userId) } },
            { returnDocument: "after" }
        );
    }

    async unpinConversation(conversationId: string, userId: string) {
        return await Conversation.findByIdAndUpdate(
            conversationId,
            { $pull: { pinnedBy: new Types.ObjectId(userId) } },
            { returnDocument: "after" }
        );
    }

    async isPinned(conversationId: string, userId: string): Promise<boolean> {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            pinnedBy: new Types.ObjectId(userId),
        });
        return !!conversation;
    }

    // ─── Delete ────────────────────────────────────────────────────────────────

    async deleteById(id: string) {
        return await Conversation.findByIdAndDelete(id);
    }

    // ─── Group Management ──────────────────────────────────────────────────────

    async addMembers(conversationId: string, memberIds: string[]) {
        return await Conversation.findByIdAndUpdate(
            conversationId,
            {
                $addToSet: {
                    participants: {
                        $each: memberIds.map((id) => new Types.ObjectId(id)),
                    },
                },
            },
            { returnDocument: "after" }
        ).populate("participants", "fullName username avatar status lastSeen");
    }

    async removeMember(conversationId: string, memberId: string) {
        return await Conversation.findByIdAndUpdate(
            conversationId,
            { $pull: { participants: new Types.ObjectId(memberId) } },
            { returnDocument: "after" }
        ).populate("participants", "fullName username avatar status lastSeen");
    }

    async updateGroupName(conversationId: string, name: string) {
        return await Conversation.findByIdAndUpdate(
            conversationId,
            { name },
            { returnDocument: "after" }
        );
    }

    async updateGroupAvatar(conversationId: string, avatar: string) {
        return await Conversation.findByIdAndUpdate(
            conversationId,
            { avatar },
            { returnDocument: "after" }
        );
    }

    async promoteAdmin(conversationId: string, memberId: string) {
        return await Conversation.findByIdAndUpdate(
            conversationId,
            { admin: new Types.ObjectId(memberId) },
            { returnDocument: "after" }
        );
    }
}

export const conversationRepository = new ConversationRepository();
