import { StatusCodes, ReasonPhrases } from "http-status-codes";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";

const registerUser = asyncHandler(async (req, res) => {

    const { firstName, lastName, email, phone, username, securityQuestion, securityAnswer, password } = req.body;

    if (
        [firstName, lastName, email, phone, username, securityQuestion, securityAnswer, password]
        .some((field) => field.trim() === "")
    ) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required.");
    }
    
    const serviceStatus = { status: ReasonPhrases.OK };

    // Success response
    const response = new ApiResponse(
        StatusCodes.OK,
        serviceStatus,
        "Resgister successful :)"
    );

    logger.info("register passed");

    res.status(response.statusCode).json(response);
});

export { registerUser };