import { Router } from "express";
import { validate } from "../../shared/validators";
import { protect } from "../../shared/middlewares/auth.middleware";
import { upload } from "../../shared/utils/multer";

import { register,
    login,
    logout,
    refreshToken,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    getMe,
    updateProfile,
    uploadAvatar,
} from "./auth.controller";

import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateProfileSchema,
} from "./auth.validation";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh-token", refreshToken);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

// Protected routes (require access token)
router.use(protect);
router.get("/me", getMe);
router.patch("/profile", validate(updateProfileSchema), updateProfile);
router.post("/avatar", upload.single("avatar"), uploadAvatar);
router.post("/logout", logout);

export default router;