import { StatusCodes } from "http-status-codes";

import {
    ApiError,
    logger
} from "../../utils/index.js";

export const createValidator = (
    schema,
    context = "Request",
    source = "body",
    options = {}
) => {
    return (req, res, next) => {
        const data = req[source];

        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
            ...options,
        });

        if (error) {
            logger.warn(`${context} validation failed`, { errors: error.details });
            return next(
                new ApiError(
                    StatusCodes.BAD_REQUEST,
                    "Validation failed",
                    error.details.map((detail) => detail.message)
                )
            );
        }

        // Do NOT mutate req[source]
        // Store sanitized data safely instead
        switch (source) {
            case "body":
                req.validatedBody = value;
                break;
            case "query":
                req.validatedQuery = value;
                break;
            case "params":
                req.validatedParams = value;
                break;
        }

        logger.info(`${context} validation passed`);
        next();
    };
};
