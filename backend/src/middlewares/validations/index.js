// backend/src/middlewares/validations/index.js
import { StatusCodes } from "http-status-codes";
import {
    ApiError,
    logger
} from "../../utils/index.js";

/**
 * Base reusable validation middleware generator.
 * @param {Joi.Schema} schema - Joi validation schema.
 * @param {string} context - Context name for better logging.
 * @param {"body" | "query" | "params"} [source="body"] - The request data source.
 * @param {object} [options] - Optional Joi validation options.
 */
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
            stripUnknown: true, // remove extra fields (recommended)
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

        // assign sanitized data back
        req[source] = value;

        logger.info(`${context} validation passed`);
        next();
    };
};
