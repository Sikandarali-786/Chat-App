import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { notFoundMiddleware } from "./shared/middlewares/notFound.middleware";
import { errorMiddleware } from "./shared/middlewares/error.middleware";
import routes from "./routes";
import { authRoutes } from "./modules/auth";

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

app.use("/api/v1", routes);
app.use("/api/v1/auth", authRoutes);

// Compression
app.use(compression());
// Middleware 
// 404 Middleware
app.use(notFoundMiddleware);
// Error Middleware
app.use(errorMiddleware);

export default app;