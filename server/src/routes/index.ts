import { Router } from "express";
import { healthRoutes } from "../modules/health";
import { authRoutes } from "../modules/auth";
import { userRoutes } from "../modules/users";
import { conversationRoutes } from "../modules/conversations";
import { messageRoutes } from "../modules/messages";
import { notificationRoutes } from "../modules/notifications";
import { callRoutes } from "../modules/calls";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);
router.use("/notifications", notificationRoutes);
router.use("/calls", callRoutes);

export default router;