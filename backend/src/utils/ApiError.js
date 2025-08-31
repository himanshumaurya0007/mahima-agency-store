import { StatusCodes, ReasonPhrases } from "http-status-codes";
import logger from "./logger.js";

class ApiError extends Error {
    constructor(
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
        message = ReasonPhrases.INTERNAL_SERVER_ERROR,
        errors = [],
        stack = ""
    ) {
        super(message);

        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;

        // Capture stack trace
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }

        // Log the error immediately
        logger.error(`ApiError: ${message}`, {
            statusCode: this.statusCode,
            errors: this.errors,
            stack: this.stack
        });
    }
}

export { ApiError };
