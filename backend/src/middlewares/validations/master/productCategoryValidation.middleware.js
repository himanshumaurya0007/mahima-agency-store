// middlewares/master/productCategoryValidation.middleware.js

import { StatusCodes } from "http-status-codes";
import { ApiError, logger } from "../../../utils/index.js";
import { productCategoryValidationSchema } from "../../../validations/master/productCategory.validation.js";

/**
 * Generic validator factory (already used for Customer)
 */
const validate = (schema, context = "Request", source = "body") => {
    return (req, res, next) => {
        const data = req[source];
        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true, // optional but recommended
        });

        if (error) {
            logger.warn(`${context} validation failed`, { errors: error.details });
            return next(
                new ApiError(
                    StatusCodes.BAD_REQUEST,
                    "Validation failed",
                    error.details.map(detail => detail.message)
                )
            );
        }

        // Optionally assign sanitized data back to req[source]
        req[source] = value;

        logger.info(`${context} validation passed`);
        next();
    };
};

// Specific validator for Product Category
const validateProductCategory = validate(productCategoryValidationSchema, "Product Category");

export { validateProductCategory };
