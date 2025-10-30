// src/middlewares/error.middleware.js
import { StatusCodes, ReasonPhrases } from "http-status-codes";

import {
    ApiError,
    ApiResponse,
    mongooseErrorHandler,
    logger
} from "../utils/index.js";

/**
 * 🌐 Global centralized error-handling middleware.
 * ------------------------------------------------------------------------
 * Responsibilities:
 * - Normalize all thrown/rejected errors.
 * - Delegate Mongoose/MongoDB errors to mongooseErrorHandler.
 * - Convert unknown errors into structured ApiError instances.
 * - Log comprehensive, contextual diagnostics.
 * - Send safe and standardized ApiResponse to the client.
 * ------------------------------------------------------------------------
 */
export const errorMiddleware = (err, req, res, next) => {
    // Defensive: if headers already sent, delegate to Express default handler
    if (res.headersSent) return next(err);

    // Short alias
    const isDev = process.env.NODE_ENV === "development";

    // Step 1️⃣ → Mongoose/MongoDB specific error normalization
    const mongooseHandledError = mongooseErrorHandler(err);
    const normalizedError =
        mongooseHandledError ||
        (ApiError.isApiError?.(err)
            ? err
            : ApiError.fromUnknown(err, {
                route: req.originalUrl,
                method: req.method,
                body: req.body,
                params: req.params,
                query: req.query,
            }));

    const {
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
        message = ReasonPhrases.INTERNAL_SERVER_ERROR,
        errors = [],
        stack,
        details,
    } = normalizedError;

    // Step 2️⃣ → Structured diagnostic logging
    logger.error(`[GlobalErrorMiddleware] ${message}`, {
        statusCode,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        referrer: req.headers.referer || "N/A",
        errors,
        details,
        body: req.body,
        params: req.params,
        query: req.query,
        stack,
    });

    // Step 3️⃣ → Build standardized API response
    const response = new ApiResponse(statusCode, null, message);

    // Always include error list if present
    if (errors.length) response.errors = errors;

    // Attach diagnostic info only in development mode
    if (isDev) {
        response.debug = {
            route: req.originalUrl,
            method: req.method,
            ip: req.ip,
            details,
        };
        response.stack = stack;
    }

    // Step 4️⃣ → Send response
    return res
        .status(statusCode)
        .json(response);
};
