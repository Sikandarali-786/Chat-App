import { Router } from "express";
import { healthRoutes } from "../modules/health";
import { authRoutes } from "../modules/auth";
import { userRoutes } from "../modules/users";
import { conversationRoutes } from "../modules/conversations";
import { messageRoutes } from "../modules/messages";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);

export default router;