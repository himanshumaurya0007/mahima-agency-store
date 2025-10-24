// utils/core/asyncHandler.js
import { ApiError } from "./ApiError.js";
import logger from "./logger.js";

/**
 * Wraps async Express handlers to automatically catch and pass errors.
 * Enriches with request context for enhanced debugging in dev mode.
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
