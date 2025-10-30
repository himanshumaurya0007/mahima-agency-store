// utils/core/ApiResponse.js
import { StatusCodes } from "http-status-codes";

/**
 * ✅ Standardized API success response wrapper.
 * Ensures consistency across all endpoints and environments.
 */
class ApiResponse {
    constructor(
        statusCode = StatusCodes.OK,
        data = null,
        message = "Request successful",
        errors = []
    ) {
        this.statusCode = statusCode;
        this.success =
            statusCode >= StatusCodes.OK && statusCode < StatusCodes.BAD_REQUEST;
        this.message = message;
        this.data = data;
        this.timestamp = new Date().toISOString();

        // Optional: unify schema for both success and error paths
        if (errors.length) this.errors = errors;

        // Optional: debugging or metadata (set externally)
        this.debug = undefined;
        this.stack = undefined;
    }
}

export { ApiResponse };