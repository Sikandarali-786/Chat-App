import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler";
import { successResponse } from "../../shared/responses/success.response";
import { MESSAGES } from "../../shared/constants";
import { AppError } from "../../shared/errors/AppError";
import { messageService } from "./message.service";

// ─── Send Message ──────────────────────────────────────────────────────────────
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const message = await messageService.sendMessage(req.user!.userId, req.body);
    return successResponse(res, MESSAGES.MESSAGE_SENT, message, 201);
});

// ─── Send Media ────────────────────────────────────────────────────────────────
export const sendMedia = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        throw new AppError(MESSAGES.NO_FILE_UPLOADED, 400);
    }

    const { conversationId, replyTo } = req.body as {
        conversationId: string;
        replyTo?: string;
    };

    const message = await messageService.sendMediaMessage(
        req.user!.userId,
        conversationId,
        req.file,
        replyTo
    );

    return successResponse(res, MESSAGES.MESSAGE_SENT, message, 201);
});

// ─── Send Location ─────────────────────────────────────────────────────────────
export const sendLocation = asyncHandler(async (req: Request, res: Response) => {
    const message = await messageService.sendLocation(req.user!.userId, req.body);
    return successResponse(res, MESSAGES.MESSAGE_SENT, message, 201);
});

// ─── Get Messages ──────────────────────────────────────────────────────────────
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
    const result = await messageService.getMessages(
        req.params["conversationId"] as string,
        req.user!.userId,
        req.query as any
    );
    return successResponse(res, MESSAGES.MESSAGES_FETCHED, result);
});

// ─── Edit Message ──────────────────────────────────────────────────────────────
export const editMessage = asyncHandler(async (req: Request, res: Response) => {
    const message = await messageService.editMessage(
        req.params["messageId"] as string,
        req.user!.userId,
        req.body
    );
    return successResponse(res, MESSAGES.MESSAGE_EDITED, message);
});

// ─── Delete Message ────────────────────────────────────────────────────────────
export const deleteMessage = asyncHandler(
    async (req: Request, res: Response) => {
        const forEveryone = req.query["forEveryone"] === "true";
        await messageService.deleteMessage(
            req.params["messageId"] as string,
            req.user!.userId,
            forEveryone
        );
        return successResponse(res, MESSAGES.MESSAGE_DELETED);
    }
);

// ─── Forward Message ───────────────────────────────────────────────────────────
export const forwardMessage = asyncHandler(
    async (req: Request, res: Response) => {
        const message = await messageService.forwardMessage(
            req.params["messageId"] as string,
            req.user!.userId,
            req.body
        );
        return successResponse(res, MESSAGES.MESSAGE_FORWARDED, message, 201);
    }
);

// ─── Star Message ──────────────────────────────────────────────────────────────
export const starMessage = asyncHandler(async (req: Request, res: Response) => {
    await messageService.starMessage(
        req.params["messageId"] as string,
        req.user!.userId
    );
    return successResponse(res, MESSAGES.MESSAGE_STARRED);
});

// ─── Unstar Message ────────────────────────────────────────────────────────────
export const unstarMessage = asyncHandler(
    async (req: Request, res: Response) => {
        await messageService.unstarMessage(
            req.params["messageId"] as string,
            req.user!.userId
        );
        return successResponse(res, MESSAGES.MESSAGE_UNSTARRED);
    }
);

// ─── Get Starred Messages ──────────────────────────────────────────────────────
export const getStarredMessages = asyncHandler(
    async (req: Request, res: Response) => {
        const result = await messageService.getStarredMessages(
            req.user!.userId,
            req.query as any
        );
        return successResponse(res, MESSAGES.STARRED_MESSAGES_FETCHED, result);
    }
);

// ─── Mark as Delivered ─────────────────────────────────────────────────────────
export const markAsDelivered = asyncHandler(
    async (req: Request, res: Response) => {
        await messageService.markAsDelivered(
            req.params["conversationId"] as string,
            req.user!.userId
        );
        return successResponse(res, "Messages marked as delivered");
    }
);

// ─── Mark as Seen ──────────────────────────────────────────────────────────────
export const markAsSeen = asyncHandler(async (req: Request, res: Response) => {
    await messageService.markAsSeen(
        req.params["conversationId"] as string,
        req.user!.userId
    );
    return successResponse(res, "Messages marked as seen");
});
