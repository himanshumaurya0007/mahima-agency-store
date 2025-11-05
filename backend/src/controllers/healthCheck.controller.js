import { StatusCodes, ReasonPhrases } from "http-status-codes";

import {
    asyncHandler,
    ApiResponse,
    ApiError,
    logger
} from "../utils/index.js";

const healthCheck = asyncHandler(async (req, res) => {
    try {
        // Simulate service check (DB, cache, etc.)
        const serviceStatus = { status: ReasonPhrases.OK };

        // If some condition fails, throw ApiError
        if (!serviceStatus) {
            throw new ApiError(
                StatusCodes.SERVICE_UNAVAILABLE,
                "Health check failed",
                ["Dependent service unavailable"]
            );
        }

        // Success response
        const response = new ApiResponse(
            StatusCodes.OK,
            serviceStatus,
            "Health check successful"
        );

        logger.info("Health check passed");
        res.status(response.statusCode).json(response);

    } catch (error) {
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
            [],
            error.stack
        );
    }
});

export { healthCheck };
