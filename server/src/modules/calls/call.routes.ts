import { Router } from "express";
import { protect } from "../../shared/middlewares/auth.middleware";
import { validate } from "../../shared/validators";
import {
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    getCallHistory,
    getCallById,
} from "./call.controller";
import { initiateCallSchema } from "./call.validation";

const router = Router();

// All call routes require authentication
router.use(protect);

// Initiate a new call
router.post("/initiate", validate(initiateCallSchema), initiateCall);

// Get call history
router.get("/history", getCallHistory);

// Get specific call by callId
router.get("/:callId", getCallById);

// Accept a call
router.patch("/:callId/accept", acceptCall);

// Reject a call
router.patch("/:callId/reject", rejectCall);

// End a call
router.patch("/:callId/end", endCall);

export { router as callRoutes };
