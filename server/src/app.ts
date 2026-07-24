import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

const app = express();

// Security
app.use(helmet());

// CORS
app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Compression
app.use(compression());

// Health Check Route
app.get("/api/v1/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running 🚀",
        timestamp: new Date().toISOString(),
    });
});

export default app;