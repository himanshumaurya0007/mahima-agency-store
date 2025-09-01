import { StatusCodes } from "http-status-codes";
import { userValidationSchema } from "../validations/user.validation.js";
import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";

export const validateUser = (req, res, next) => {
    const { error } = userValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        logger.warn("User validation failed", { errors: error.details });

        // Use ApiError to forward to error middleware
        return next(
            new ApiError(
                StatusCodes.BAD_REQUEST,
                "Validation failed",
                error.details.map((detail) => detail.message)
            )
        );
    }

    logger.info("User validation passed");
    next();
};