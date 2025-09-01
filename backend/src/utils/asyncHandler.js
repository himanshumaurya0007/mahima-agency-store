import logger from "./logger.js";

const asyncHandler = (requestHandler) => (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
        // Log unhandled controller errors
        if (!(err instanceof ApiError)) {
            logger.error("Unhandled error in asyncHandler", {
                message: err.message,
                stack: err.stack
            });
        }
        next(err);
    });
};

export { asyncHandler };
