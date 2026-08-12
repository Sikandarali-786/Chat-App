import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler";
import { successResponse } from "../../shared/responses/success.response";
import { notificationService } from "./notification.service";

// ─── Get Notifications ─────────────────────────────────────────────────────────
export const getNotifications = asyncHandler(
    async (req: Request, res: Response) => {
        const result = await notificationService.getNotifications(
            req.user!.userId,
            req.query as any
        );
        return successResponse(res, "Notifications fetched", result);
    }
);

// ─── Get Unread Count ──────────────────────────────────────────────────────────
export const getUnreadCount = asyncHandler(
    async (req: Request, res: Response) => {
        const result = await notificationService.getUnreadCount(req.user!.userId);
        return successResponse(res, "Unread count fetched", result);
    }
);

// ─── Mark as Read ──────────────────────────────────────────────────────────────
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.markAsRead(
        req.params["notificationId"] as string,
        req.user!.userId
    );
    return successResponse(res, "Notification marked as read", notification);
});

// ─── Mark All as Read ──────────────────────────────────────────────────────────
export const markAllAsRead = asyncHandler(
    async (req: Request, res: Response) => {
        await notificationService.markAllAsRead(req.user!.userId);
        return successResponse(res, "All notifications marked as read");
    }
);

// ─── Delete Notification ───────────────────────────────────────────────────────
export const deleteNotification = asyncHandler(
    async (req: Request, res: Response) => {
        await notificationService.deleteNotification(
            req.params["notificationId"] as string,
            req.user!.userId
        );
        return successResponse(res, "Notification deleted");
    }
);

// ─── Delete All ────────────────────────────────────────────────────────────────
export const deleteAllNotifications = asyncHandler(
    async (req: Request, res: Response) => {
        await notificationService.deleteAllNotifications(req.user!.userId);
        return successResponse(res, "All notifications deleted");
    }
);
