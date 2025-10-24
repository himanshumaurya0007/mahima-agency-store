// src/middlewares/error.middleware.js
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { ApiError, ApiResponse, mongooseErrorHandler, logger } from "../utils/core/index.js";

/**
 * Global centralized error-handling middleware.
 * - Handles all thrown/rejected errors
 * - Interprets Mongoose errors
 * - Normalizes unknown exceptions into ApiError
 * - Logs structured diagnostic data
 */
export const errorMiddleware = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    // -----------------------------
    // 1️⃣ Attempt to interpret known Mongoose errors
    // -----------------------------
    const mongooseInterpreted = mongooseErrorHandler(err);
    if (mongooseInterpreted) err = mongooseInterpreted;

    // -----------------------------
    // 2️⃣ Normalize to ApiError (if not already)
    // -----------------------------
    const normalizedError = err instanceof ApiError
        ? err
        : ApiError.fromUnknown(err, {
            route: req.originalUrl,
            method: req.method,
            body: req.body,
            params: req.params,
            query: req.query,
        });

    const { statusCode, message, errors, stack } = normalizedError;

    // -----------------------------
    // 3️⃣ Structured logging
    // -----------------------------
    logger.error(`[GlobalErrorMiddleware] ${message}`, {
        statusCode,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        referrer: req.headers.referer || "N/A",
        body: req.body,
        params: req.params,
        query: req.query,
        errors,
        stack,
    });

    // -----------------------------
    // 4️⃣ Build standardized ApiResponse
    // -----------------------------
    const response = new ApiResponse(
        statusCode,
        null,
        message || ReasonPhrases.INTERNAL_SERVER_ERROR
    );

    // Attach additional metadata for debugging
    if (errors?.length) response.errors = errors;

    if (process.env.NODE_ENV === "development") {
        response.stack = stack;
        response.context = {
            route: req.originalUrl,
            method: req.method,
        };
    }

    // -----------------------------
    // 5️⃣ Return safe response
    // -----------------------------
    return res.status(statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(response);
};
