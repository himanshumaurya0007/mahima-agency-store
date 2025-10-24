// utils/core/ApiError.js
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import logger from "./logger.js";

/**
 * Centralized API error class for consistent exception handling.
 * Logs structured data for debugging and can safely format client responses.
 */
class ApiError extends Error {
    constructor(
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
        message = ReasonPhrases.INTERNAL_SERVER_ERROR,
        errors = [],
        details = {},
        stack = ""
    ) {
        super(message);

        this.statusCode = statusCode;
        this.success = false;
        this.message = message;
        this.errors = Array.isArray(errors) ? errors : [errors];
        this.details = details || {};
        this.timestamp = new Date().toISOString();

        // Capture stack trace for debugging
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }

        // Log detailed error server-side
        logger.error(`[ApiError] ${message}`, {
            statusCode,
            errors,
            details,
            stack: this.stack,
        });
    }

    /**
     * Format for API response (safely hides stack & internals in production).
     */
    formatResponse() {
        const isDev = process.env.NODE_ENV !== "production";

        const response = {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            errors: this.errors,
            timestamp: this.timestamp,
        };

        if (isDev && Object.keys(this.details).length) response.details = this.details;
        if (isDev) response.stack = this.stack;

        return response;
    }

    /**
     * Converts unknown errors into structured ApiError instances.
     */
    static fromUnknown(error, context = {}) {
        if (error instanceof ApiError) return error;

        return new ApiError(
            error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
            [error.message || "Unexpected error occurred"],
            { ...context, origin: error.name || "UnknownError" },
            error.stack
        );
    }
}

export { ApiError };
