import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger.js";

const healthCheck = asyncHandler(async (req, res) => {
    const response = new ApiResponse(
        StatusCodes.OK,
        { status: "OK" },
        "Health check successful"
    );

    logger.info("Health check passed");

    res.status(response.statusCode).json(response);
});

export { healthCheck };
