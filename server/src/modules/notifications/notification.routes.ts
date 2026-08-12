import { Router } from "express";
import { protect } from "../../shared/middlewares/auth.middleware";

import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
} from "./notification.controller";

const router = Router();

// All routes protected
router.use(protect);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/:notificationId/read", markAsRead);
router.patch("/read-all", markAllAsRead);
router.delete("/:notificationId", deleteNotification);
router.delete("/", deleteAllNotifications);

export default router;
