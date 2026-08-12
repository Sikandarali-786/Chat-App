import { Call } from "./call.model";
import { ICall, CallStatus, CallType } from "./call.types";

class CallRepository {
    async create(data: Partial<ICall>) {
        return await Call.create(data);
    }

    async findByCallId(callId: string) {
        return await Call.findOne({ callId })
            .populate("callerId", "fullName username avatar")
            .populate("receiverId", "fullName username avatar");
    }

    async findById(id: string) {
        return await Call.findById(id)
            .populate("callerId", "fullName username avatar")
            .populate("receiverId", "fullName username avatar");
    }

    async getCallHistory(
        userId: string,
        page: number,
        limit: number,
        type?: CallType
    ) {
        const skip = (page - 1) * limit;

        const filter: any = {
            $or: [{ callerId: userId }, { receiverId: userId }],
        };

        if (type) {
            filter.type = type;
        }

        const [calls, total] = await Promise.all([
            Call.find(filter)
                .populate("callerId", "fullName username avatar")
                .populate("receiverId", "fullName username avatar")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Call.countDocuments(filter),
        ]);

        return { calls, total, page, limit };
    }

    async updateStatus(callId: string, status: CallStatus) {
        const update: any = { status };

        if (status === "ongoing") {
            update.startedAt = new Date();
        } else if (["ended", "missed", "rejected"].includes(status)) {
            update.endedAt = new Date();
        }

        return await Call.findOneAndUpdate({ callId }, update, { new: true });
    }

    async updateDuration(callId: string) {
        const call = await Call.findOne({ callId });
        if (!call || !call.startedAt) return null;

        const duration = Math.floor(
            (Date.now() - call.startedAt.getTime()) / 1000
        );

        return await Call.findOneAndUpdate(
            { callId },
            { duration, endedAt: new Date() },
            { new: true }
        );
    }

    async updateFeatures(
        callId: string,
        features: {
            wasScreenShared?: boolean;
            wasVideoEnabled?: boolean;
            wasAudioMuted?: boolean;
        }
    ) {
        return await Call.findOneAndUpdate({ callId }, features, { new: true });
    }
}

export const callRepository = new CallRepository();