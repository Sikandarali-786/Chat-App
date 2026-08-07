import "dotenv/config";
import http from "http";
import app from "./app";
import { env } from "./shared/config/env";
import { connectDatabase } from "./shared/config/database";
import { initSocket } from "./socket/socket";
import { logger } from "./shared/logger/logger";

const startServer = async (): Promise<void> => {
    try {
        // Connect Database
        await connectDatabase();

        // Create HTTP server (required for Socket.io)
        const httpServer = http.createServer(app);

        // Initialize Socket.io
        initSocket(httpServer);

        // Start server
        httpServer.listen(env.PORT, () => {
            logger.info(`
====================================
🚀 Server running successfully
🌐 URL  : http://localhost:${env.PORT}
📦 ENV  : ${env.NODE_ENV}
🔌 WS   : Socket.io ready
====================================
            `);
        });
    } catch (error) {
        logger.error("❌ Failed to start server");
        logger.error(error);
        process.exit(1);
    }
};

startServer();
