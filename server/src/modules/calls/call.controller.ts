import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler";
import { successResponse } from "../../shared/responses/success.response";
import { callService } from "./call.service";
import { InitiateCallDTO, GetCallHistoryQuery } from "./call.types";

// ─── Initiate Call ─────────────────────────────────────────────────────────────
export const initiateCall = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const data = req.body as InitiateCallDTO;

    const call = await callService.initiateCall(userId, data);

    return successResponse(res, "Call initiated", call, 201);
});

// ─── Accept Call ───────────────────────────────────────────────────────────────
export const acceptCall = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const callId = req.params["callId"] as string;

    const call = await callService.acceptCall(callId, userId);

    return successResponse(res, "Call accepted", call);
});

// ─── Reject Call ───────────────────────────────────────────────────────────────
export const rejectCall = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const callId = req.params["callId"] as string;

    const call = await callService.rejectCall(callId, userId);

    return successResponse(res, "Call rejected", call);
});

// ─── End Call ──────────────────────────────────────────────────────────────────
export const endCall = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const callId = req.params["callId"] as string;

    const call = await callService.endCall(callId, userId);

    return successResponse(res, "Call ended", call);
});

// ─── Get Call History ──────────────────────────────────────────────────────────
export const getCallHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const query = req.query as unknown as GetCallHistoryQuery;

    const result = await callService.getCallHistory(userId, query);

    return successResponse(res, "Call history fetched", result);
});

// ─── Get Call by callId ────────────────────────────────────────────────────────
export const getCallById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const callId = req.params["callId"] as string;

    const call = await callService.getCallById(callId, userId);

    return successResponse(res, "Call fetched", call);
});
