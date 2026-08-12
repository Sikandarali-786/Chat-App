import { Router } from "express";
import { protect } from "../../shared/middlewares/auth.middleware";
import { validate } from "../../shared/validators";
import { mediaUpload } from "../../shared/utils/multer";
import {
    sendMessageSchema,
    editMessageSchema,
    forwardMessageSchema,
    sendLocationSchema,
} from "./message.validation";

import {
    sendMessage,
    sendMedia,
    sendLocation,
    getMessages,
    editMessage,
    deleteMessage,
    forwardMessage,
    starMessage,
    unstarMessage,
    getStarredMessages,
    markAsDelivered,
    markAsSeen,
} from "./message.controller";

const router = Router();

// All routes protected
router.use(protect);

router.post("/", validate(sendMessageSchema), sendMessage);
router.post("/media", mediaUpload.single("file"), sendMedia);
router.post("/location", validate(sendLocationSchema), sendLocation);
router.get("/starred", getStarredMessages);
router.get("/conversation/:conversationId", getMessages);
router.patch("/:messageId", validate(editMessageSchema), editMessage);
router.delete("/:messageId", deleteMessage);
router.post("/:messageId/forward", validate(forwardMessageSchema), forwardMessage);
router.post("/:messageId/star", starMessage);
router.delete("/:messageId/star", unstarMessage);
router.post("/conversation/:conversationId/delivered", markAsDelivered);
router.post("/conversation/:conversationId/seen", markAsSeen);

export default router;
