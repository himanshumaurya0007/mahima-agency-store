import { StatusCodes, ReasonPhrases } from "http-status-codes";

import { ApiError, logger } from "./index.js";
import { FIELDS, MESSAGES } from "../constants/index.js";

/**
 * Unified Mongoose error handler aligned with project constants.
 * Converts raw MongoDB/Mongoose errors into standardized, developer-friendly ApiError objects.
 */
const mongooseErrorHandler = (error) => {
    if (!error || !error.name) return null;

    let statusCode = StatusCodes.BAD_REQUEST;
    let message = ReasonPhrases.BAD_REQUEST;
    let errors = [];
    const details = {};

    switch (error.name) {
        // 🧩 Mongoose ValidationError (schema validation)
        case "ValidationError":
            message = "Validation failed for one or more fields.";
            errors = Object.values(error.errors).map((e) => e.message);
            details.fields = Object.keys(error.errors);
            break;

        // 🎯 Mongoose CastError (invalid ObjectId, enum, type cast)
        case "CastError":
            message = `Invalid ${error.path}: ${error.value}`;
            errors = [
                `Field '${error.path}' received invalid value '${error.value}'`,
            ];
            details.field = error.path;
            break;

        // ⚙️ MongoServerError (e.g., duplicate key)
        case "MongoServerError":
            if (error.code === 11000) {
                statusCode = StatusCodes.CONFLICT;

                // Extract duplicate fields and values
                const duplicateFields = Object.keys(error?.keyPattern || {});
                const duplicateValues = error.keyValue || {};

                // Map duplicate fields to standard messages from MESSAGES.js
                const fieldMessageMap = {
                    phone: MESSAGES.PHONE_EXISTS,
                    email: MESSAGES.EMAIL_EXISTS,
                    username: MESSAGES.USERNAME_EXISTS,
                    temporaryCustomerId: MESSAGES.DUPLICATE_VALUE(
                        FIELDS.TEMPORARY_CUSTOMER_ID
                    ),
                    havmorPlatformCustomerId: MESSAGES.DUPLICATE_VALUE(
                        FIELDS.HAVMOR_PLATFORM_CUSTOMER_ID
                    ),
                    gstinNumber: MESSAGES.DUPLICATE_VALUE(FIELDS.GSTIN_NUMBER),
                    panCardNumber: MESSAGES.DUPLICATE_VALUE(FIELDS.PAN_CARD_NUMBER),
                };

                // Build detailed error messages
                errors = duplicateFields.map((field) => {
                    const friendlyMsg =
                        fieldMessageMap[field] ||
                        MESSAGES.DUPLICATE_VALUE(
                            FIELDS[field.toUpperCase()] || field
                        );
                    return `${friendlyMsg} (value: '${duplicateValues[field]}')`;
                });

                // Construct a clear and consistent message
                message =
                    duplicateFields.length > 1
                        ? `Duplicate combination for fields: ${duplicateFields.join(", ")}`
                        : errors[0];

                // Provide rich diagnostic context
                details.collection =
                    error?.collection?.collectionName || "Unknown collection";
                details.index = error?.index || "Unknown index";
                details.fields = duplicateFields;
                details.duplicates = duplicateValues;

                break;
            }

            // Other MongoServerError types (unhandled)
            statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
            message = error.message || ReasonPhrases.INTERNAL_SERVER_ERROR;
            errors = [message];
            break;

        // 🧱 Default fallback for unrecognized errors
        default:
            statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
            message = error.message || ReasonPhrases.INTERNAL_SERVER_ERROR;
            errors = [message];
            details.raw = error;
            break;
    }

    // Log with context
    logger.warn(`[MongooseErrorHandler] ${message}`, {
        name: error.name,
        code: error.code,
        errors,
        details,
    });

    // Return a structured ApiError for global middleware
    return new ApiError(statusCode, message, errors, details, error.stack);
};

export { mongooseErrorHandler };
