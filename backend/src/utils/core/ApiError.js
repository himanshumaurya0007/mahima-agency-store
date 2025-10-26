// utils/core/ApiError.js
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import logger from "./logger.js";

/**
 * 🚨 ApiError — Centralized structured error class
 * ------------------------------------------------------------------------
 * - Provides uniform error representation across the backend.
 * - Used for all operational, validation, and Mongoose-related exceptions.
 * - Integrates with centralized error middleware and asyncHandler.
 * ------------------------------------------------------------------------
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
        this.errors = Array.isArray(errors)
            ? errors.filter(Boolean)
            : [errors].filter(Boolean);
        this.details = details || {};
        this.timestamp = new Date().toISOString();

        // Capture stack trace safely
        if (stack) this.stack = stack;
        else Error.captureStackTrace(this, this.constructor);
    }

    /**
     * 📦 Format error for API response output
     * - Hides sensitive data in production.
     * - Exposes diagnostic details only in dev mode.
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

        if (isDev && Object.keys(this.details).length) {
            response.details = this.details;
        }
        if (isDev) {
            response.stack = this.stack;
        }

        return response;
    }

    /**
     * 🧩 Convert unknown errors into structured ApiError instances.
     * Ensures every thrown error conforms to a predictable format.
     */
    static fromUnknown(error, context = {}) {
        if (error instanceof ApiError) return error;

        const baseContext = {
            ...context,
            origin: context.origin || error.name || "UnknownError",
        };

        return new ApiError(
            error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
            [error.message || "Unexpected error occurred"],
            baseContext,
            error.stack
        );
    }

    /**
     * 🧠 Type guard — verifies if an error is an ApiError instance.
     * Useful for middlewares and handlers.
     */
    static isApiError(error) {
        return error instanceof ApiError;
    }
}

export { ApiError };
