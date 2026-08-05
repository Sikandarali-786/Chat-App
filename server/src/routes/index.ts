import { Router } from "express";
import { healthRoutes } from "../modules/health";
import { authRoutes } from "../modules/auth";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);

export default router;