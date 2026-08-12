import { AppError } from "../../shared/errors/AppError";
import { MESSAGES } from "../../shared/constants";
import { notificationRepository } from "./notification.repository";
import { GetNotificationsQuery, INotification } from "./notification.types";
import { emitToUser } from "../../socket/socket";

class NotificationService {
    // ─── Create & Emit Notification ────────────────────────────────────────────
    async createAndEmit(data: Partial<INotification>) {
        const notification = await notificationRepository.create(data);

        // Emit to user in real-time via Socket.io
        if (data.userId) {
            emitToUser(data.userId.toString(), "notification:new", notification);
        }

        return notification;
    }

    // ─── Get Notifications ─────────────────────────────────────────────────────
    async getNotifications(userId: string, query: GetNotificationsQuery) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const unreadOnly = query.unreadOnly ?? false;

        const result = await notificationRepository.findByUser(
            userId,
            page,
            limit,
            unreadOnly
        );

        return {
            notifications: result.notifications,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit),
            },
        };
    }

    // ─── Get Unread Count ──────────────────────────────────────────────────────
    async getUnreadCount(userId: string) {
        const count = await notificationRepository.getUnreadCount(userId);
        return { unreadCount: count };
    }

    // ─── Mark as Read ──────────────────────────────────────────────────────────
    async markAsRead(notificationId: string, userId: string) {
        const notification = await notificationRepository.markAsRead(
            notificationId
        );

        if (!notification) {
            throw new AppError("Notification not found", 404);
        }

        // Check ownership
        if (notification.userId.toString() !== userId) {
            throw new AppError(MESSAGES.UNAUTHORIZED, 403);
        }

        return notification;
    }

    // ─── Mark All as Read ──────────────────────────────────────────────────────
    async markAllAsRead(userId: string) {
        await notificationRepository.markAllAsRead(userId);
    }

    // ─── Delete Notification ───────────────────────────────────────────────────
    async deleteNotification(notificationId: string, userId: string) {
        const notification = await notificationRepository.deleteById(
            notificationId
        );

        if (!notification) {
            throw new AppError("Notification not found", 404);
        }

        if (notification.userId.toString() !== userId) {
            throw new AppError(MESSAGES.UNAUTHORIZED, 403);
        }
    }

    // ─── Delete All ────────────────────────────────────────────────────────────
    async deleteAllNotifications(userId: string) {
        await notificationRepository.deleteAllForUser(userId);
    }
}

export const notificationService = new NotificationService();
