import { AppError } from "../../shared/errors/AppError";
import { MESSAGES } from "../../shared/constants";
import { userRepository } from "../users";
import { conversationRepository } from "../conversations/conversation.repository";
import { messageRepository } from "./message.repository";
import {
    SendMessageDTO,
    EditMessageDTO,
    ForwardMessageDTO,
    GetMessagesQuery,
} from "./message.types";
import { emitToUser } from "../../socket/socket";

class MessageService {
    // ─── Send Message ──────────────────────────────────────────────────────────
    async sendMessage(userId: string, data: SendMessageDTO) {
        // Validate conversation
        const conversation = await conversationRepository.findById(
            data.conversationId
        );
        if (!conversation) {
            throw new AppError(MESSAGES.CONVERSATION_NOT_FOUND, 404);
        }

        // Check if user is participant
        const isParticipant = conversation.participants.some(
            (p: any) => p._id.toString() === userId
        );
        if (!isParticipant) {
            throw new AppError(MESSAGES.NOT_CONVERSATION_PARTICIPANT, 403);
        }

        // Check block status (for one-to-one)
        if (conversation.type === "one-to-one") {
            const otherUserId = conversation.participants.find(
                (p: any) => p._id.toString() !== userId
            );
            if (otherUserId) {
                const [isBlockedByMe, isBlockedByThem] = await Promise.all([
                    userRepository.isBlocked(userId, otherUserId._id.toString()),
                    userRepository.isBlocked(otherUserId._id.toString(), userId),
                ]);

                if (isBlockedByMe || isBlockedByThem) {
                    throw new AppError(MESSAGES.CANNOT_MESSAGE_BLOCKED_USER, 403);
                }
            }
        }

        // Validate replyTo if provided
        if (data.replyTo) {
            const replyMessage = await messageRepository.findById(data.replyTo);
            if (
                !replyMessage ||
                replyMessage.conversationId.toString() !== data.conversationId
            ) {
                throw new AppError(MESSAGES.MESSAGE_NOT_FOUND, 404);
            }
        }

        // Create message
        const message = await messageRepository.create({
            conversationId: data.conversationId as any,
            senderId: userId as any,
            content: data.content,
            type: data.type ?? "text",
            replyTo: (data.replyTo ?? null) as any,
            mentions: (data.mentions ?? []) as any,
        });

        // Update conversation lastMessage
        await conversationRepository.updateLastMessage(
            data.conversationId,
            message._id.toString()
        );

        // Populate message
        const populatedMessage = await messageRepository.findById(
            message._id.toString()
        );

        // Emit to other participants via Socket.io
        conversation.participants.forEach((participant: any) => {
            if (participant._id.toString() !== userId) {
                emitToUser(participant._id.toString(), "message:new", {
                    conversationId: data.conversationId,
                    message: populatedMessage,
                });
            }
        });

        return populatedMessage;
    }

    // ─── Get Messages ──────────────────────────────────────────────────────────
    async getMessages(
        conversationId: string,
        userId: string,
        query: GetMessagesQuery
    ) {
        // Validate conversation and participant
        const conversation = await conversationRepository.findById(conversationId);
        if (!conversation) {
            throw new AppError(MESSAGES.CONVERSATION_NOT_FOUND, 404);
        }

        const isParticipant = conversation.participants.some(
            (p: any) => p._id.toString() === userId
        );
        if (!isParticipant) {
            throw new AppError(MESSAGES.NOT_CONVERSATION_PARTICIPANT, 403);
        }

        const page = query.page ?? 1;
        const limit = query.limit ?? 50;

        const result = await messageRepository.findByConversation(
            conversationId,
            userId,
            page,
            limit
        );

        return {
            messages: result.messages,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit),
            },
        };
    }

    // ─── Edit Message ──────────────────────────────────────────────────────────
    async editMessage(messageId: string, userId: string, data: EditMessageDTO) {
        const message = await messageRepository.findById(messageId);
        if (!message) {
            throw new AppError(MESSAGES.MESSAGE_NOT_FOUND, 404);
        }

        // Only sender can edit
        if (message.senderId._id.toString() !== userId) {
            throw new AppError(MESSAGES.CANNOT_EDIT_MESSAGE, 403);
        }

        // Can only edit within 15 minutes
        const fifteenMinutes = 15 * 60 * 1000;
        const messageAge = Date.now() - new Date(message.createdAt).getTime();
        if (messageAge > fifteenMinutes) {
            throw new AppError(MESSAGES.MESSAGE_TOO_OLD_TO_EDIT, 400);
        }

        const updated = await messageRepository.updateContent(
            messageId,
            data.content
        );

        // Emit to conversation participants
        const conversation = await conversationRepository.findById(
            message.conversationId.toString()
        );
        conversation?.participants.forEach((participant: any) => {
            if (participant._id.toString() !== userId) {
                emitToUser(participant._id.toString(), "message:edited", {
                    conversationId: message.conversationId.toString(),
                    message: updated,
                });
            }
        });

        return updated;
    }

    // ─── Delete Message ────────────────────────────────────────────────────────
    async deleteMessage(
        messageId: string,
        userId: string,
        forEveryone: boolean
    ) {
        const message = await messageRepository.findById(messageId);
        if (!message) {
            throw new AppError(MESSAGES.MESSAGE_NOT_FOUND, 404);
        }

        // Delete for everyone — only sender can do this
        if (forEveryone) {
            if (message.senderId._id.toString() !== userId) {
                throw new AppError(MESSAGES.CANNOT_DELETE_MESSAGE, 403);
            }

            await messageRepository.deleteForEveryone(messageId);

            // Emit to conversation participants
            const conversation = await conversationRepository.findById(
                message.conversationId.toString()
            );
            conversation?.participants.forEach((participant: any) => {
                emitToUser(participant._id.toString(), "message:deleted", {
                    conversationId: message.conversationId.toString(),
                    messageId,
                });
            });
        } else {
            // Delete for self only
            await messageRepository.deleteForUser(messageId, userId);
        }
    }

    // ─── Forward Message ───────────────────────────────────────────────────────
    async forwardMessage(
        messageId: string,
        userId: string,
        data: ForwardMessageDTO
    ) {
        // Get original message
        const originalMessage = await messageRepository.findById(messageId);
        if (!originalMessage) {
            throw new AppError(MESSAGES.MESSAGE_NOT_FOUND, 404);
        }

        // Send as new message in target conversation
        return await this.sendMessage(userId, {
            conversationId: data.conversationId,
            content: originalMessage.content,
            type: originalMessage.type,
        });
    }

    // ─── Star Message ──────────────────────────────────────────────────────────
    async starMessage(messageId: string, userId: string) {
        const message = await messageRepository.findById(messageId);
        if (!message) {
            throw new AppError(MESSAGES.MESSAGE_NOT_FOUND, 404);
        }

        const isStarred = await messageRepository.isStarred(messageId, userId);
        if (isStarred) {
            return message;
        }

        await messageRepository.starMessage(messageId, userId);
    }

    // ─── Unstar Message ────────────────────────────────────────────────────────
    async unstarMessage(messageId: string, userId: string) {
        const message = await messageRepository.findById(messageId);
        if (!message) {
            throw new AppError(MESSAGES.MESSAGE_NOT_FOUND, 404);
        }

        const isStarred = await messageRepository.isStarred(messageId, userId);
        if (!isStarred) {
            return message;
        }

        await messageRepository.unstarMessage(messageId, userId);
    }

    // ─── Get Starred Messages ──────────────────────────────────────────────────
    async getStarredMessages(userId: string, query: GetMessagesQuery) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 50;

        const result = await messageRepository.getStarredMessages(
            userId,
            page,
            limit
        );

        return {
            messages: result.messages,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit),
            },
        };
    }

    // ─── Mark as Delivered ─────────────────────────────────────────────────────
    async markAsDelivered(conversationId: string, userId: string) {
        await messageRepository.markConversationMessagesAsDelivered(
            conversationId,
            userId
        );
    }

    // ─── Mark as Seen ──────────────────────────────────────────────────────────
    async markAsSeen(conversationId: string, userId: string) {
        await messageRepository.markConversationMessagesAsSeen(
            conversationId,
            userId
        );

        // Emit to sender
        const messages = await messageRepository.findByConversation(
            conversationId,
            userId,
            1,
            100
        );

        messages.messages.forEach((msg: any) => {
            if (msg.senderId._id.toString() !== userId) {
                emitToUser(msg.senderId._id.toString(), "message:seen", {
                    conversationId,
                    userId,
                });
            }
        });
    }
}

export const messageService = new MessageService();
