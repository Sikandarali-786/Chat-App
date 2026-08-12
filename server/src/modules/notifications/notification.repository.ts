import { Notification } from "./notification.model";
import { INotification } from "./notification.types";

class NotificationRepository {
    async create(data: Partial<INotification>) {
        return await Notification.create(data);
    }

    async findByUser(
        userId: string,
        page: number,
        limit: number,
        unreadOnly: boolean
    ) {
        const skip = (page - 1) * limit;

        const filter: any = { userId };
        if (unreadOnly) {
            filter.isRead = false;
        }

        const [notifications, total] = await Promise.all([
            Notification.find(filter)
                .populate("senderId", "fullName username avatar")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Notification.countDocuments(filter),
        ]);

        return { notifications, total, page, limit };
    }

    async getUnreadCount(userId: string): Promise<number> {
        return await Notification.countDocuments({ userId, isRead: false });
    }

    async markAsRead(notificationId: string) {
        return await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );
    }

    async markAllAsRead(userId: string) {
        await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    }

    async deleteById(notificationId: string) {
        return await Notification.findByIdAndDelete(notificationId);
    }

    async deleteAllForUser(userId: string) {
        await Notification.deleteMany({ userId });
    }
}

export const notificationRepository = new NotificationRepository();
