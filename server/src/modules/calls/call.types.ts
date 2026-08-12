import { Document, Types } from "mongoose";

export type CallType = "audio" | "video";
export type CallStatus = "initiated" | "ringing" | "ongoing" | "ended" | "missed" | "rejected";

export interface ICall extends Document {
    _id: Types.ObjectId;

    callId: string; // Unique identifier for WebRTC session
    type: CallType;
    status: CallStatus;

    callerId: Types.ObjectId;
    receiverId: Types.ObjectId;
    conversationId: Types.ObjectId;

    // Call metadata
    startedAt?: Date | null;
    endedAt?: Date | null;
    duration?: number; // In seconds

    // Features used during call
    wasScreenShared: boolean;
    wasVideoEnabled: boolean;
    wasAudioMuted: boolean;

    createdAt: Date;
    updatedAt: Date;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface InitiateCallDTO {
    receiverId: string;
    conversationId: string;
    type: CallType;
}

export interface UpdateCallStatusDTO {
    status: CallStatus;
}

export interface GetCallHistoryQuery {
    page?: number;
    limit?: number;
    type?: CallType;
}
