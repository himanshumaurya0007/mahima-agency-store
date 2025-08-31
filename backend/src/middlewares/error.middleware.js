import { ApiError } from "../utils/ApiError.js";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import logger from "../utils/logger.js";

export const errorMiddleware = (err, req, res, next) => {
    // Log the error
    logger.error("Error caught by middleware", {
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    });

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        });
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
