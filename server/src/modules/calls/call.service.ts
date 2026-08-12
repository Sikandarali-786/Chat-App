import { randomUUID } from "crypto";
import { AppError } from "../../shared/errors/AppError";
import { callRepository } from "./call.repository";
import { conversationRepository } from "../conversations/conversation.repository";
import { InitiateCallDTO, GetCallHistoryQuery } from "./call.types";
import { emitToUser } from "../../socket/socket";

class CallService {
    // ─── Initiate Call ─────────────────────────────────────────────────────────
    async initiateCall(callerId: string, data: InitiateCallDTO) {
        // Validate conversation
        const conversation = await conversationRepository.findById(
            data.conversationId
        );
        if (!conversation) {
            throw new AppError("Conversation not found", 404);
        }

        // Check if caller is a participant
        const isParticipant = conversation.participants.some(
            (p: any) => p._id.toString() === callerId
        );
        if (!isParticipant) {
            throw new AppError("You are not a participant in this conversation", 403);
        }

        // Check if receiver is a participant
        const isReceiverParticipant = conversation.participants.some(
            (p: any) => p._id.toString() === data.receiverId
        );
        if (!isReceiverParticipant) {
            throw new AppError("Receiver is not a participant in this conversation", 403);
        }

        const callId = randomUUID();

        const call = await callRepository.create({
            callId,
            type: data.type,
            status: "initiated",
            callerId: callerId as any,
            receiverId: data.receiverId as any,
            conversationId: data.conversationId as any,
        });

        // Notify receiver via Socket
        emitToUser(data.receiverId, "call:invitation", {
            callId,
            callType: data.type,
            senderId: callerId,
            conversationId: data.conversationId,
        });

        // Update status to ringing
        await callRepository.updateStatus(callId, "ringing");

        return call;
    }

    // ─── Accept Call ───────────────────────────────────────────────────────────
    async acceptCall(callId: string, userId: string) {
        const call = await callRepository.findByCallId(callId);
        if (!call) {
            throw new AppError("Call not found", 404);
        }

        if (call.receiverId._id.toString() !== userId) {
            throw new AppError("You are not the receiver of this call", 403);
        }

        if (!["initiated", "ringing"].includes(call.status)) {
            throw new AppError("Call cannot be accepted in its current state", 400);
        }

        const updated = await callRepository.updateStatus(callId, "ongoing");

        // Notify caller
        emitToUser(call.callerId._id.toString(), "call:accepted", {
            callId,
            userId,
        });

        return updated;
    }

    // ─── Reject Call ───────────────────────────────────────────────────────────
    async rejectCall(callId: string, userId: string) {
        const call = await callRepository.findByCallId(callId);
        if (!call) {
            throw new AppError("Call not found", 404);
        }

        if (call.receiverId._id.toString() !== userId) {
            throw new AppError("You are not the receiver of this call", 403);
        }

        if (!["initiated", "ringing"].includes(call.status)) {
            throw new AppError("Call cannot be rejected in its current state", 400);
        }

        const updated = await callRepository.updateStatus(callId, "rejected");

        // Notify caller
        emitToUser(call.callerId._id.toString(), "call:rejected", {
            callId,
            userId,
        });

        return updated;
    }

    // ─── End Call ──────────────────────────────────────────────────────────────
    async endCall(callId: string, userId: string) {
        const call = await callRepository.findByCallId(callId);
        if (!call) {
            throw new AppError("Call not found", 404);
        }

        const isParticipant =
            call.callerId._id.toString() === userId ||
            call.receiverId._id.toString() === userId;

        if (!isParticipant) {
            throw new AppError("You are not a participant in this call", 403);
        }

        // If call was ongoing, calculate duration
        let updated;
        if (call.status === "ongoing") {
            updated = await callRepository.updateDuration(callId);
        } else {
            // Missed — never answered
            updated = await callRepository.updateStatus(callId, "missed");
        }

        // Notify the other participant
        const otherUserId =
            call.callerId._id.toString() === userId
                ? call.receiverId._id.toString()
                : call.callerId._id.toString();

        emitToUser(otherUserId, "call:ended", { callId, userId });

        return updated;
    }

    // ─── Get Call History ──────────────────────────────────────────────────────
    async getCallHistory(userId: string, query: GetCallHistoryQuery) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;

        const result = await callRepository.getCallHistory(
            userId,
            page,
            limit,
            query.type
        );

        return {
            calls: result.calls,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit),
            },
        };
    }

    // ─── Get Call by ID ────────────────────────────────────────────────────────
    async getCallById(callId: string, userId: string) {
        const call = await callRepository.findByCallId(callId);
        if (!call) {
            throw new AppError("Call not found", 404);
        }

        const isParticipant =
            call.callerId._id.toString() === userId ||
            call.receiverId._id.toString() === userId;

        if (!isParticipant) {
            throw new AppError("You are not a participant in this call", 403);
        }

        return call;
    }

    // ─── Update Call Features ──────────────────────────────────────────────────
    async updateCallFeatures(
        callId: string,
        userId: string,
        features: {
            wasScreenShared?: boolean;
            wasVideoEnabled?: boolean;
            wasAudioMuted?: boolean;
        }
    ) {
        const call = await callRepository.findByCallId(callId);
        if (!call) {
            throw new AppError("Call not found", 404);
        }

        const isParticipant =
            call.callerId._id.toString() === userId ||
            call.receiverId._id.toString() === userId;

        if (!isParticipant) {
            throw new AppError("You are not a participant in this call", 403);
        }

        return await callRepository.updateFeatures(callId, features);
    }
}

export const callService = new CallService();
