import { Router } from "express";
import { protect } from "../../shared/middlewares/auth.middleware";
import { validate } from "../../shared/validators";
import { createConversationSchema } from "./conversation.validation";

import {
    createConversation,
    getConversations,
    getConversation,
    pinConversation,
    unpinConversation,
    deleteConversation,
} from "./conversation.controller";

const router = Router();

// All routes are protected
router.use(protect);

router.post("/", validate(createConversationSchema), createConversation);
router.get("/", getConversations);
router.get("/:conversationId", getConversation);
router.post("/:conversationId/pin", pinConversation);
router.delete("/:conversationId/pin", unpinConversation);
router.delete("/:conversationId", deleteConversation);

export default router;
