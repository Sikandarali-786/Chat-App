import { z } from "zod";

export const createConversationSchema = z.object({
    participantId: z.string().min(1, "Participant ID is required"),
});

export const createGroupSchema = z.object({
    name: z.string().trim().min(1, "Group name is required").max(100),
    participantIds: z
        .array(z.string())
        .min(2, "At least 2 members required to create a group"),
    avatar: z.string().url().optional(),
});

export const addMembersSchema = z.object({
    memberIds: z.array(z.string()).min(1, "At least one member ID required"),
});

export const removeMemberSchema = z.object({
    memberId: z.string().min(1, "Member ID is required"),
});

export const promoteAdminSchema = z.object({
    memberId: z.string().min(1, "Member ID is required"),
});

export const updateGroupNameSchema = z.object({
    name: z.string().trim().min(1, "Group name is required").max(100),
});

export const updateGroupAvatarSchema = z.object({
    avatar: z.string().url("Invalid avatar URL"),
});

export const getConversationsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});
