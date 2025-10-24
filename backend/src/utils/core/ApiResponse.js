// utils/core/ApiResponse.js
import { StatusCodes } from "http-status-codes";

/**
 * Unified API success response object.
 */
class ApiResponse {
    constructor(
        statusCode = StatusCodes.OK,
        data = null,
        message = "Request successful"
    ) {
        this.statusCode = statusCode;
        this.success = statusCode >= StatusCodes.OK && statusCode < StatusCodes.BAD_REQUEST;
        this.message = message;
        this.data = data;
        this.timestamp = new Date().toISOString();
    }
}

export { ApiResponse };
