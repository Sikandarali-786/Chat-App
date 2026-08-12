import { z } from "zod";

export const initiateCallSchema = z.object({
    receiverId: z.string().min(1, "Receiver ID is required"),
    conversationId: z.string().min(1, "Conversation ID is required"),
    type: z.enum(["audio", "video"] as const),
});

export const callHistoryQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    type: z.enum(["audio", "video"] as const).optional(),
});
