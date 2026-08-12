import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { verifyAccessToken } from "../shared/config/jwt";
import { userRepository } from "../modules/users";
import { env } from "../shared/config/env";
import { logger } from "../shared/logger/logger";

// Map userId → Set of socketIds (user can have multiple tabs/devices)
const onlineUsers = new Map<string, Set<string>>();

export let io: SocketServer;

export const initSocket = (httpServer: HttpServer): SocketServer => {
    io = new SocketServer(httpServer, {
        cors: {
            origin: env.CLIENT_URL,
            credentials: true,
        },
    });

    // ─── Auth Middleware ────────────────────────────────────────────────────────
    io.use((socket, next) => {
        const authHeader = socket.handshake.headers["authorization"] as string | undefined;
        const token: string | undefined =
            (socket.handshake.auth["token"] as string | undefined) ??
            authHeader?.split(" ")[1];

        if (!token) {
            return next(new Error("Authentication token required"));
        }

        try {
            const payload = verifyAccessToken(token);
            socket.data["userId"] = payload.userId;
            socket.data["email"] = payload.email;
            next();
        } catch {
            next(new Error("Invalid or expired token"));
        }
    });

    // ─── Connection ─────────────────────────────────────────────────────────────
    io.on("connection", async (socket: Socket) => {
        const userId = socket.data["userId"] as string;
        logger.info(`Socket connected: ${socket.id} (user: ${userId})`);

        // Track socket
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId)!.add(socket.id);

        // Mark user online in DB
        await userRepository.updateStatus(userId, "online");

        // Broadcast online status to all connected clients
        socket.broadcast.emit("user:online", { userId });

        // ─── Typing Indicators ──────────────────────────────────────────────────

        socket.on(
            "typing:start",
            (data: { conversationId: string; receiverId: string }) => {
                // Emit to specific user only
                emitToUser(data.receiverId, "typing:start", {
                    userId,
                    conversationId: data.conversationId,
                });
            }
        );

        socket.on(
            "typing:stop",
            (data: { conversationId: string; receiverId: string }) => {
                emitToUser(data.receiverId, "typing:stop", {
                    userId,
                    conversationId: data.conversationId,
                });
            }
        );

        // ─── Message Status ─────────────────────────────────────────────────────

        socket.on(
            "message:delivered",
            async (data: { conversationId: string }) => {
                const { messageRepository } = await import(
                    "../modules/messages/message.repository.js"
                );
                await messageRepository.markConversationMessagesAsDelivered(
                    data.conversationId,
                    userId
                );
            }
        );

        socket.on("message:seen", async (data: { conversationId: string }) => {
            const { messageRepository } = await import(
                "../modules/messages/message.repository.js"
            );
            await messageRepository.markConversationMessagesAsSeen(
                data.conversationId,
                userId
            );

            // Broadcast to conversation participants
            socket.to(data.conversationId).emit("message:seen", {
                conversationId: data.conversationId,
                userId,
            });
        });

        // ─── Get Online Users ───────────────────────────────────────────────────

        socket.on("users:online", () => {
            const onlineUserIds = Array.from(onlineUsers.keys());
            socket.emit("users:online", { onlineUsers: onlineUserIds });
        });

        // ─── Call Invitation ────────────────────────────────────────────────────

        socket.on(
            "call:invite",
            async (data: {
                receiverId: string;
                callId: string;
                callType: "audio" | "video";
                conversationId: string;
            }) => {
                // Emit to receiver
                emitToUser(data.receiverId, "call:invitation", {
                    callId: data.callId,
                    callType: data.callType,
                    senderId: userId,
                    conversationId: data.conversationId,
                });

                // Create notification
                const { notificationService } = await import(
                    "../modules/notifications/notification.service.js"
                );
                const { userRepository } = await import(
                    "../modules/users/user.repository.js"
                );

                const sender = await userRepository.findById(userId);
                if (sender) {
                    await notificationService.createAndEmit({
                        userId: data.receiverId as any,
                        type: "call_invitation",
                        title: `${data.callType === "video" ? "Video" : "Audio"} Call`,
                        body: `${sender.fullName} is calling you`,
                        senderId: userId as any,
                        conversationId: data.conversationId as any,
                        callId: data.callId,
                        callType: data.callType,
                    });
                }
            }
        );

        socket.on(
            "call:accept",
            (data: { callId: string; receiverId: string }) => {
                emitToUser(data.receiverId, "call:accepted", {
                    callId: data.callId,
                    userId,
                });
            }
        );

        socket.on(
            "call:reject",
            (data: { callId: string; receiverId: string }) => {
                emitToUser(data.receiverId, "call:rejected", {
                    callId: data.callId,
                    userId,
                });
            }
        );

        socket.on("call:end", (data: { callId: string; receiverId: string }) => {
            emitToUser(data.receiverId, "call:ended", {
                callId: data.callId,
                userId,
            });
        });

        // WebRTC signaling
        socket.on(
            "call:offer",
            (data: { receiverId: string; offer: any; callId: string }) => {
                emitToUser(data.receiverId, "call:offer", {
                    offer: data.offer,
                    callId: data.callId,
                    senderId: userId,
                });
            }
        );

        socket.on(
            "call:answer",
            (data: { receiverId: string; answer: any; callId: string }) => {
                emitToUser(data.receiverId, "call:answer", {
                    answer: data.answer,
                    callId: data.callId,
                    senderId: userId,
                });
            }
        );

        socket.on(
            "call:ice-candidate",
            (data: { receiverId: string; candidate: any; callId: string }) => {
                emitToUser(data.receiverId, "call:ice-candidate", {
                    candidate: data.candidate,
                    callId: data.callId,
                    senderId: userId,
                });
            }
        );

        // ─── Disconnect ─────────────────────────────────────────────────────────

        socket.on("disconnect", async () => {
            logger.info(`Socket disconnected: ${socket.id} (user: ${userId})`);

            const userSockets = onlineUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socket.id);

                // Only mark offline if no more active sockets for this user
                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);
                    await userRepository.updateStatus(userId, "offline");

                    // Broadcast offline status
                    socket.broadcast.emit("user:offline", {
                        userId,
                        lastSeen: new Date(),
                    });
                }
            }
        });
    });

    return io;
};

// ─── Helper — emit to all sockets of a user ───────────────────────────────────
export const emitToUser = (
    userId: string,
    event: string,
    data: unknown
): void => {
    const socketIds = onlineUsers.get(userId);
    if (!socketIds) return;

    for (const socketId of socketIds) {
        io.to(socketId).emit(event, data);
    }
};

export const isUserOnline = (userId: string): boolean => {
    return onlineUsers.has(userId);
};

export const getOnlineUsers = (): string[] => {
    return Array.from(onlineUsers.keys());
};
