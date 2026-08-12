import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler";
import { successResponse } from "../../shared/responses/success.response";
import { MESSAGES } from "../../shared/constants";
import { conversationService } from "./conversation.service";

// ─── Create Conversation ───────────────────────────────────────────────────────
export const createConversation = asyncHandler(
    async (req: Request, res: Response) => {
        const conversation = await conversationService.createConversation(
            req.user!.userId,
            req.body
        );
        return successResponse(res, MESSAGES.CONVERSATION_CREATED, conversation, 201);
    }
);

// ─── Create Group ──────────────────────────────────────────────────────────────
export const createGroup = asyncHandler(async (req: Request, res: Response) => {
    const group = await conversationService.createGroup(req.user!.userId, req.body);
    return successResponse(res, MESSAGES.GROUP_CREATED, group, 201);
});

// ─── Get Conversations ─────────────────────────────────────────────────────────
export const getConversations = asyncHandler(
    async (req: Request, res: Response) => {
        const result = await conversationService.getConversations(
            req.user!.userId,
            req.query as any
        );
        return successResponse(res, MESSAGES.CONVERSATIONS_FETCHED, result);
    }
);

// ─── Get Single Conversation ───────────────────────────────────────────────────
export const getConversation = asyncHandler(
    async (req: Request, res: Response) => {
        const conversation = await conversationService.getConversation(
            req.params["conversationId"] as string,
            req.user!.userId
        );
        return successResponse(res, MESSAGES.CONVERSATION_FETCHED, conversation);
    }
);

// ─── Pin Conversation ──────────────────────────────────────────────────────────
export const pinConversation = asyncHandler(
    async (req: Request, res: Response) => {
        await conversationService.pinConversation(
            req.params["conversationId"] as string,
            req.user!.userId
        );
        return successResponse(res, MESSAGES.CONVERSATION_PINNED);
    }
);

// ─── Unpin Conversation ────────────────────────────────────────────────────────
export const unpinConversation = asyncHandler(
    async (req: Request, res: Response) => {
        await conversationService.unpinConversation(
            req.params["conversationId"] as string,
            req.user!.userId
        );
        return successResponse(res, MESSAGES.CONVERSATION_UNPINNED);
    }
);

// ─── Delete Conversation ───────────────────────────────────────────────────────
export const deleteConversation = asyncHandler(
    async (req: Request, res: Response) => {
        await conversationService.deleteConversation(
            req.params["conversationId"] as string,
            req.user!.userId
        );
        return successResponse(res, MESSAGES.CONVERSATION_DELETED);
    }
);

// ─── Add Members ──────────────────────────────────────────────────────────────
export const addMembers = asyncHandler(async (req: Request, res: Response) => {
    const group = await conversationService.addMembers(
        req.params["conversationId"] as string,
        req.user!.userId,
        req.body
    );
    return successResponse(res, MESSAGES.MEMBERS_ADDED, group);
});

// ─── Remove Member ─────────────────────────────────────────────────────────────
export const removeMember = asyncHandler(async (req: Request, res: Response) => {
    const group = await conversationService.removeMember(
        req.params["conversationId"] as string,
        req.user!.userId,
        { memberId: req.params["memberId"] as string }
    );
    return successResponse(res, MESSAGES.MEMBER_REMOVED, group);
});

// ─── Leave Group ───────────────────────────────────────────────────────────────
export const leaveGroup = asyncHandler(async (req: Request, res: Response) => {
    await conversationService.leaveGroup(
        req.params["conversationId"] as string,
        req.user!.userId
    );
    return successResponse(res, MESSAGES.LEFT_GROUP);
});

// ─── Promote Admin ─────────────────────────────────────────────────────────────
export const promoteAdmin = asyncHandler(async (req: Request, res: Response) => {
    const group = await conversationService.promoteAdmin(
        req.params["conversationId"] as string,
        req.user!.userId,
        req.body
    );
    return successResponse(res, MESSAGES.ADMIN_PROMOTED, group);
});

// ─── Update Group Name ─────────────────────────────────────────────────────────
export const updateGroupName = asyncHandler(
    async (req: Request, res: Response) => {
        const group = await conversationService.updateGroupName(
            req.params["conversationId"] as string,
            req.user!.userId,
            req.body
        );
        return successResponse(res, MESSAGES.GROUP_NAME_UPDATED, group);
    }
);

// ─── Update Group Avatar ───────────────────────────────────────────────────────
export const updateGroupAvatar = asyncHandler(
    async (req: Request, res: Response) => {
        const group = await conversationService.updateGroupAvatar(
            req.params["conversationId"] as string,
            req.user!.userId,
            req.body
        );
        return successResponse(res, MESSAGES.GROUP_AVATAR_UPDATED, group);
    }
);
