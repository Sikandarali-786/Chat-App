import { z } from "zod";

export const registerSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(3, "Full name must be at least 3 characters")
        .max(100),

    email: z
        .string()
        .email("Invalid email address")
        .transform((email) => email.toLowerCase().trim()),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100),
});

export const loginSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .transform((email) => email.toLowerCase().trim()),

    password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .transform((email) => email.toLowerCase().trim()),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100),
});

export const updateProfileSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(3, "Full name must be at least 3 characters")
        .max(100)
        .optional(),

    bio: z
        .string()
        .trim()
        .max(200, "Bio must be at most 200 characters")
        .optional(),
});
