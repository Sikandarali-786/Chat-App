import { Router } from "express";
import { protect } from "../../shared/middlewares/auth.middleware";
import { validate } from "../../shared/validators";
import { searchUsersSchema, updateStatusSchema } from "./user.validation";

import {
    searchUsers,
    getUserProfile,
    updateStatus,
    blockUser,
    unblockUser,
    getBlockedUsers,
    muteUser,
    unmuteUser,
    getMutedUsers,
} from "./user.controller";

const router = Router();

// All user routes are protected
router.use(protect);

// Search & Profile
router.get("/search", searchUsers);
router.get("/blocked", getBlockedUsers);
router.get("/muted", getMutedUsers);
router.get("/:userId", getUserProfile);

// Status
router.patch("/status", validate(updateStatusSchema), updateStatus);

// Block
router.post("/:userId/block", blockUser);
router.delete("/:userId/block", unblockUser);

// Mute
router.post("/:userId/mute", muteUser);
router.delete("/:userId/mute", unmuteUser);

export default router;
