import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { notFoundMiddleware } from "./shared/middlewares/notFound.middleware";
import { errorMiddleware } from "./shared/middlewares/error.middleware";
import { requestLogger } from "./shared/middlewares/requestLogger.middleware";
import { env } from "./shared/config/env";
import routes from "./routes";

const app = express();

// Security
app.use(helmet());

// CORS
app.use(
    cors({
        origin: env.CLIENT_URL,
        credentials: true,
    })
);

// Request Logger
app.use(requestLogger);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Compression
app.use(compression());

// Routes
app.use(env.API_PREFIX, routes);

// 404 Handler
app.use(notFoundMiddleware);

// Global Error Handler
app.use(errorMiddleware);

export default app;
