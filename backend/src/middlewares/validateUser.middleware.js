import { StatusCodes } from "http-status-codes";
import { registerValidationSchema, loginValidationSchema } from "../validations/user.validation.js";
import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";

const validateRegister = (req, res, next) => {
    const { error } = registerValidationSchema.validate(req.body, { abortEarly: false });

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

const validateLogin = (req, res, next) => {
    const { error } = loginValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        logger.warn("User login validation failed", { errors: error.details });

        return next(
            new ApiError(
                StatusCodes.BAD_REQUEST,
                "Validation failed",
                error.details.map((detail) => detail.message)
            )
        );
    }

    logger.info("User login validation passed");
    next();
};

export { validateRegister, validateLogin };