import express from "express";
import cors from "cors";
import morgan from "morgan";
import logger from "./utils/logger.js";
import { StatusCodes } from "http-status-codes";

import healthCheckRouter from "./routes/healthCheck.route.js";
import userRouter from "./routes/user.route.js";

import { ApiError } from "./utils/ApiError.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
    // Simple, colored logs in dev
    app.use(morgan("dev"));
} else {
    // Forward logs into Winston in production
    app.use(
        morgan("combined", {
            stream: {
                write: (message) => logger.info(message.trim())
            }
        })
    );
}

// Routes
app.use("/api/v1/health-check", healthCheckRouter);
app.use("/api/v1/user", userRouter);

// Handle 404s
app.use((req, res, next) => {
    next(new ApiError(StatusCodes.NOT_FOUND, "Route not found"));
});

// Error middleware
app.use(errorMiddleware);

export { app };