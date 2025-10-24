// utils/core/mongooseErrorHandler.js
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { ApiError } from "./ApiError.js";
import logger from "./logger.js";

/**
 * Interprets and normalizes common Mongoose errors into developer-friendly messages.
 * Returns consistent ApiError instances for validation, duplicate, and cast issues.
 */
const mongooseErrorHandler = (error) => {
    if (!error || !error.name) return null;

    let statusCode = StatusCodes.BAD_REQUEST;
    let message = ReasonPhrases.BAD_REQUEST;
    let errors = [];
    const details = {};

    switch (error.name) {
        case "ValidationError":
            message = "Validation failed for one or more fields.";
            errors = Object.values(error.errors).map((e) => e.message);
            details.fields = Object.keys(error.errors);
            break;

        case "CastError":
            message = `Invalid ${error.path}: ${error.value}`;
            errors = [`Field '${error.path}' received invalid value '${error.value}'`];
            details.field = error.path;
            break;

        case "MongoServerError":
            if (error.code === 11000) {
                message = "Duplicate key error.";
                errors = Object.keys(error.keyPattern).map(
                    (key) => `Duplicate value for field '${key}'`
                );
                details.duplicates = error.keyValue;
                statusCode = StatusCodes.CONFLICT;
            }
            break;

        default:
            // Generic fallback for unhandled mongoose errors
            statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
            message = error.message || ReasonPhrases.INTERNAL_SERVER_ERROR;
            errors = [message];
            break;
    }

    logger.warn(`[MongooseErrorHandler] ${message}`, {
        name: error.name,
        errors,
        details,
    });

    return new ApiError(statusCode, message, errors, details, error.stack);
};

export { mongooseErrorHandler };
