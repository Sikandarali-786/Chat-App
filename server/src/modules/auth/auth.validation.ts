import { z } from "zod";

export const registerSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(3, "Full name must be at least 3 characters")
        .max(100),

    email: z
        .email("Invalid email address")
        .transform((email) => email.toLowerCase().trim()),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100),
});