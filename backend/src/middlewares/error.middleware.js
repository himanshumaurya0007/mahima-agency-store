import { StatusCodes, ReasonPhrases } from "http-status-codes";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import logger from "../utils/logger.js";

export const errorMiddleware = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err instanceof ApiError
        ? err.statusCode
        : StatusCodes.INTERNAL_SERVER_ERROR;

    // Final structured error logging
    logger.error("Error caught by middleware", {
        message: err.message,
        stack: err.stack,
        statusCode,
    });

    // Build standardized response
    const response = new ApiResponse(
        statusCode,
        null,
        err instanceof ApiError ? err.message : ReasonPhrases.INTERNAL_SERVER_ERROR
    );

    // Include validation / field errors if present
    if (err instanceof ApiError && err.errors?.length) {
        response.errors = err.errors;
    }

    // Only attach stack in development
    if (process.env.NODE_ENV === "development") {
        response.stack = err.stack;
    }

    return res.status(statusCode).json(response);
};
