import { z } from "zod";

export const createConversationSchema = z.object({
    participantId: z.string().min(1, "Participant ID is required"),
});

export const getConversationsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});
