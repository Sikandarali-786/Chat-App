import { z } from "zod";

export const searchUsersSchema = z.object({
    q: z.string().trim().min(1, "Search query is required"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const updateStatusSchema = z.object({
    status: z.enum(["online", "offline", "away"]),
});

export const userIdParamSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
});
