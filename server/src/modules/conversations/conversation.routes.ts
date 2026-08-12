import { Router } from "express";
import { protect } from "../../shared/middlewares/auth.middleware";
import { validate } from "../../shared/validators";
import {
    createConversationSchema,
    createGroupSchema,
    addMembersSchema,
    promoteAdminSchema,
    updateGroupNameSchema,
    updateGroupAvatarSchema,
} from "./conversation.validation";

import {
    createConversation,
    createGroup,
    getConversations,
    getConversation,
    pinConversation,
    unpinConversation,
    deleteConversation,
    addMembers,
    removeMember,
    leaveGroup,
    promoteAdmin,
    updateGroupName,
    updateGroupAvatar,
} from "./conversation.controller";

const router = Router();

// All routes protected
router.use(protect);

// One-to-One
router.post("/", validate(createConversationSchema), createConversation);

// Group
router.post("/group", validate(createGroupSchema), createGroup);

// Common
router.get("/", getConversations);
router.get("/:conversationId", getConversation);
router.post("/:conversationId/pin", pinConversation);
router.delete("/:conversationId/pin", unpinConversation);
router.delete("/:conversationId", deleteConversation);

// Group Management
router.post("/:conversationId/members", validate(addMembersSchema), addMembers);
router.delete("/:conversationId/members/:memberId", removeMember);
router.post("/:conversationId/leave", leaveGroup);
router.patch("/:conversationId/admin", validate(promoteAdminSchema), promoteAdmin);
router.patch("/:conversationId/name", validate(updateGroupNameSchema), updateGroupName);
router.patch("/:conversationId/avatar", validate(updateGroupAvatarSchema), updateGroupAvatar);

export default router;
