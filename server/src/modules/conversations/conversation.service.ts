import { AppError } from "../../shared/errors/AppError";
import { MESSAGES } from "../../shared/constants";
import { userRepository } from "../users";
import { conversationRepository } from "./conversation.repository";
import {
    CreateConversationDTO,
    GetConversationsQuery,
    CreateGroupDTO,
    AddMembersDTO,
    RemoveMemberDTO,
    PromoteAdminDTO,
    UpdateGroupNameDTO,
    UpdateGroupAvatarDTO,
} from "./conversation.types";

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

    // ─── Create Group ──────────────────────────────────────────────────────────
    async createGroup(userId: string, data: CreateGroupDTO) {
        // Validate all members exist
        const members = await Promise.all(
            data.participantIds.map((id) => userRepository.findById(id))
        );

        const notFound = data.participantIds.find(
            (id, i) => !members[i]
        );
        if (notFound) {
            throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
        }

        // Minimum 2 members + creator = 3 total
        if (data.participantIds.length < 2) {
            throw new AppError(MESSAGES.MINIMUM_GROUP_MEMBERS, 400);
        }

        // Create group
        const groupData: any = {
            type: "group",
            name: data.name,
            participants: [userId, ...data.participantIds],
            admin: userId,
        };
        
        if (data.avatar) {
            groupData.avatar = data.avatar;
        }

        const group = await conversationRepository.create(groupData);

        return await conversationRepository.findById(group._id.toString());
    }

    // ─── Add Members ───────────────────────────────────────────────────────────
    async addMembers(conversationId: string, userId: string, data: AddMembersDTO) {
        const conversation = await this.getConversation(conversationId, userId);

        // Only groups
        if (conversation.type !== "group") {
            throw new AppError("Cannot add members to one-to-one chat", 400);
        }

        // Only admin
        if (conversation.admin?.toString() !== userId) {
            throw new AppError(MESSAGES.NOT_GROUP_ADMIN, 403);
        }

        // Validate members
        const members = await Promise.all(
            data.memberIds.map((id) => userRepository.findById(id))
        );

        const notFound = data.memberIds.find((id, i) => !members[i]);
        if (notFound) {
            throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
        }

        // Check already members
        const existingIds = conversation.participants.map((p: any) =>
            p._id.toString()
        );
        const duplicates = data.memberIds.filter((id) =>
            existingIds.includes(id)
        );
        if (duplicates.length > 0) {
            throw new AppError(MESSAGES.ALREADY_GROUP_MEMBER, 409);
        }

        return await conversationRepository.addMembers(
            conversationId,
            data.memberIds
        );
    }

    // ─── Remove Member ─────────────────────────────────────────────────────────
    async removeMember(
        conversationId: string,
        userId: string,
        data: RemoveMemberDTO
    ) {
        const conversation = await this.getConversation(conversationId, userId);

        if (conversation.type !== "group") {
            throw new AppError("Cannot remove members from one-to-one chat", 400);
        }

        // Only admin
        if (conversation.admin?.toString() !== userId) {
            throw new AppError(MESSAGES.NOT_GROUP_ADMIN, 403);
        }

        // Cannot remove admin
        if (data.memberId === conversation.admin?.toString()) {
            throw new AppError(MESSAGES.CANNOT_REMOVE_ADMIN, 400);
        }

        // Check if member exists
        const isMember = conversation.participants.some(
            (p: any) => p._id.toString() === data.memberId
        );
        if (!isMember) {
            throw new AppError(MESSAGES.MEMBER_NOT_IN_GROUP, 404);
        }

        return await conversationRepository.removeMember(
            conversationId,
            data.memberId
        );
    }

    // ─── Leave Group ───────────────────────────────────────────────────────────
    async leaveGroup(conversationId: string, userId: string) {
        const conversation = await this.getConversation(conversationId, userId);

        if (conversation.type !== "group") {
            throw new AppError("Cannot leave one-to-one chat", 400);
        }

        // If admin leaves, promote someone else or delete group
        if (conversation.admin?.toString() === userId) {
            const otherMember = conversation.participants.find(
                (p: any) => p._id.toString() !== userId
            );

            if (otherMember) {
                await conversationRepository.promoteAdmin(
                    conversationId,
                    otherMember._id.toString()
                );
            }
        }

        await conversationRepository.removeMember(conversationId, userId);
    }

    // ─── Promote Admin ─────────────────────────────────────────────────────────
    async promoteAdmin(
        conversationId: string,
        userId: string,
        data: PromoteAdminDTO
    ) {
        const conversation = await this.getConversation(conversationId, userId);

        if (conversation.type !== "group") {
            throw new AppError("Cannot promote admin in one-to-one chat", 400);
        }

        // Only current admin
        if (conversation.admin?.toString() !== userId) {
            throw new AppError(MESSAGES.NOT_GROUP_ADMIN, 403);
        }

        // Check if member exists
        const isMember = conversation.participants.some(
            (p: any) => p._id.toString() === data.memberId
        );
        if (!isMember) {
            throw new AppError(MESSAGES.MEMBER_NOT_IN_GROUP, 404);
        }

        return await conversationRepository.promoteAdmin(
            conversationId,
            data.memberId
        );
    }

    // ─── Update Group Name ─────────────────────────────────────────────────────
    async updateGroupName(
        conversationId: string,
        userId: string,
        data: UpdateGroupNameDTO
    ) {
        const conversation = await this.getConversation(conversationId, userId);

        if (conversation.type !== "group") {
            throw new AppError("Cannot update name of one-to-one chat", 400);
        }

        // Only admin
        if (conversation.admin?.toString() !== userId) {
            throw new AppError(MESSAGES.NOT_GROUP_ADMIN, 403);
        }

        return await conversationRepository.updateGroupName(
            conversationId,
            data.name
        );
    }

    // ─── Update Group Avatar ───────────────────────────────────────────────────
    async updateGroupAvatar(
        conversationId: string,
        userId: string,
        data: UpdateGroupAvatarDTO
    ) {
        const conversation = await this.getConversation(conversationId, userId);

        if (conversation.type !== "group") {
            throw new AppError("Cannot update avatar of one-to-one chat", 400);
        }

        // Only admin
        if (conversation.admin?.toString() !== userId) {
            throw new AppError(MESSAGES.NOT_GROUP_ADMIN, 403);
        }

        return await conversationRepository.updateGroupAvatar(
            conversationId,
            data.avatar
        );
    }
}

export const conversationService = new ConversationService();
