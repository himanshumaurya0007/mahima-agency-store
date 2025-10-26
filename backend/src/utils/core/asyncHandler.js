// utils/core/asyncHandler.js
import { ApiError } from "./ApiError.js";
import logger from "./logger.js";

/**
 * 🧠 asyncHandler
 * Wraps async Express route handlers to auto-catch and forward errors.
 * Adds contextual request info for richer debugging.
 */
const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        try {
            await Promise.resolve(requestHandler(req, res, next));
        } catch (error) {
            const context = {
                route: req.originalUrl,
                method: req.method,
                body: req.body,
                params: req.params,
                query: req.query,
                ip: req.ip,
                userAgent: req.headers["user-agent"],
            };

            const enrichedError = ApiError.fromUnknown(error, context);

            logger.error(`[AsyncHandler] ${enrichedError.message}`, {
                ...context,
                statusCode: enrichedError.statusCode,
                stack: enrichedError.stack,
            });

            next(enrichedError);
        }
    };
};

export { asyncHandler };
