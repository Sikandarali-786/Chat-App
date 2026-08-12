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
        return successResponse(
            res,
            MESSAGES.CONVERSATION_CREATED,
            conversation,
            201
        );
    }
);

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
