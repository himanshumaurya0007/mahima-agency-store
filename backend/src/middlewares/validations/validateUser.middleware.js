import { StatusCodes } from "http-status-codes";

import {
    ApiError,
    logger
} from "../../utils/index.js";

import {
    registerValidationSchema,
    loginValidationSchema,
    securityQuestionValidationSchema,
    securityAnswerValidationSchema,
    resetPasswordValidationSchema
} from "../../validations/user.validation.js";

/**
 * Generic validator middleware
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} context - Context string for logging
 * @param {"body" | "query" | "params"} source - Request data source
 */
const validate = (schema, context = "Request", source = "body") => {
    return (req, res, next) => {
        const data = req[source]; // pick correct source

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


// Specific validators
const validateRegister = validate(registerValidationSchema, "Register");
const validateLogin = validate(loginValidationSchema, "Login");
const validateSecurityQuestion = validate(securityQuestionValidationSchema, "Security Question", "query");
const validateSecurityAnswer = validate(securityAnswerValidationSchema, "Security Answer");
const validateResetPassword = validate(resetPasswordValidationSchema, "Reset Password");

export {
    validateRegister,
    validateLogin,
    validateSecurityQuestion,
    validateSecurityAnswer,
    validateResetPassword
};