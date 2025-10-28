import { StatusCodes } from "http-status-codes";

import {
    ApiError,
    logger
} from "../../utils/index.js";

import { customerValidationSchema } from "../../validations/customer.validation.js";

/**
 * Generic validator middleware (reused for Customer)
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} context - Context string for logging
 * @param {"body" | "query" | "params"} source - Request data source
 */
const validate = (schema, context = "Request", source = "body") => {
    return (req, res, next) => {
        const data = req[source];

        const { error } = schema.validate(data, { abortEarly: false });

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

        logger.info(`${context} validation passed`);
        next();
    };
};

// Specific validator for customer
const validateCustomer = validate(customerValidationSchema, "Customer");

export { validateCustomer };
