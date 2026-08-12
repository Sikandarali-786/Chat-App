import { z } from "zod";

export const sendMessageSchema = z.object({
    conversationId: z.string().min(1, "Conversation ID is required"),
    content: z.string().trim().min(1, "Message content is required"),
    type: z.enum(["text", "image", "video", "audio", "file"]).default("text"),
    replyTo: z.string().optional(),
    mentions: z.array(z.string()).optional(),
});

export const editMessageSchema = z.object({
    content: z.string().trim().min(1, "Message content is required"),
});

export const forwardMessageSchema = z.object({
    conversationId: z.string().min(1, "Target conversation ID is required"),
});

export const getMessagesSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const deleteMessageSchema = z.object({
    forEveryone: z.coerce.boolean().default(false),
});
