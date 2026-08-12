import { AppError } from "../../shared/errors/AppError";
import { MESSAGES } from "../../shared/constants";
import { userRepository } from "../users";
import { conversationRepository } from "./conversation.repository";
import { CreateConversationDTO, GetConversationsQuery } from "./conversation.types";

class ConversationService {
    // ─── Create Conversation ───────────────────────────────────────────────────
    async createConversation(userId: string, data: CreateConversationDTO) {
        // Check if target user exists
        const targetUser = await userRepository.findById(data.participantId);
        if (!targetUser) {
            throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
        }

        // Check if either user has blocked the other
        const [isBlockedByMe, isBlockedByThem] = await Promise.all([
            userRepository.isBlocked(userId, data.participantId),
            userRepository.isBlocked(data.participantId, userId),
        ]);

        if (isBlockedByMe || isBlockedByThem) {
            throw new AppError(MESSAGES.CANNOT_MESSAGE_BLOCKED_USER, 403);
        }

        // Check if conversation already exists
        const existing = await conversationRepository.findOneToOneByParticipants(
            userId,
            data.participantId
        );

        if (existing) {
            throw new AppError(MESSAGES.CONVERSATION_ALREADY_EXISTS, 409);
        }

        // Create new conversation
        const conversation = await conversationRepository.create({
            type: "one-to-one",
            participants: [userId, data.participantId] as any,
        });

        return await conversationRepository.findById(conversation._id.toString());
    }

    // ─── Get Conversations ─────────────────────────────────────────────────────
    async getConversations(userId: string, query: GetConversationsQuery) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;

        const result = await conversationRepository.findByParticipant(
            userId,
            page,
            limit
        );

        return {
            conversations: result.conversations,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit),
            },
        };
    }

    // ─── Get Single Conversation ───────────────────────────────────────────────
    async getConversation(conversationId: string, userId: string) {
        const conversation = await conversationRepository.findById(conversationId);
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

        return conversation;
    }

    // ─── Pin Conversation ──────────────────────────────────────────────────────
    async pinConversation(conversationId: string, userId: string) {
        const conversation = await this.getConversation(conversationId, userId);

        const isPinned = await conversationRepository.isPinned(
            conversationId,
            userId
        );

        if (isPinned) {
            return conversation;
        }

        await conversationRepository.pinConversation(conversationId, userId);
    }

    // ─── Unpin Conversation ────────────────────────────────────────────────────
    async unpinConversation(conversationId: string, userId: string) {
        const conversation = await this.getConversation(conversationId, userId);

        const isPinned = await conversationRepository.isPinned(
            conversationId,
            userId
        );

        if (!isPinned) {
            return conversation;
        }

        await conversationRepository.unpinConversation(conversationId, userId);
    }

    // ─── Delete Conversation ───────────────────────────────────────────────────
    async deleteConversation(conversationId: string, userId: string) {
        await this.getConversation(conversationId, userId);
        await conversationRepository.deleteById(conversationId);
    }
}

export const conversationService = new ConversationService();
