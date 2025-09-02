import Joi from "joi";

import { fields } from "../utils/fields.js";
import { emailRegex, phoneRegex, usernameRegex, passwordRegex } from "../utils/regex.js";
import { errorMessages } from "../utils/errorMessages.js";
import { SECURITY_QUESTIONS } from "../constants.js"

const registerValidationSchema = Joi.object({
    firstName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.base": errorMessages.STRING_BASE(fields.firstName),
            "string.empty": errorMessages.REQUIRED(fields.firstName),
            "string.min": errorMessages.MIN_LENGTH(fields.firstName, 2),
            "string.max": errorMessages.MAX_LENGTH(fields.firstName, 50),
        }),

    lastName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.base": errorMessages.STRING_BASE(fields.lastName),
            "string.empty": errorMessages.REQUIRED(fields.lastName),
            "string.min": errorMessages.MIN_LENGTH(fields.lastName, 2),
            "string.max": errorMessages.MAX_LENGTH(fields.lastName, 50),
        }),

    email: Joi.string()
        .pattern(emailRegex)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.pattern.base": errorMessages.EMAIL_INVALID,
            "string.empty": errorMessages.REQUIRED(fields.email),
        }),

    phone: Joi.string()
        .pattern(phoneRegex)
        .trim()
        .required()
        .messages({
            "string.pattern.base": errorMessages.PHONE_INVALID,
            "string.empty": errorMessages.REQUIRED(fields.phone),
        }),

    username: Joi.string()
        .min(3)
        .max(30)
        .pattern(usernameRegex)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.pattern.base": errorMessages.USERNAME_INVALID,
            "string.empty": errorMessages.REQUIRED(fields.username),
            "string.min": errorMessages.MIN_LENGTH(fields.username, 3),
            "string.max": errorMessages.MAX_LENGTH(fields.username, 30),
        }),

    securityQuestion: Joi.string()
        .valid(...SECURITY_QUESTIONS)
        .required()
        .messages({
            "any.only": "Invalid security question",
            "string.empty": errorMessages.REQUIRED(fields.securityQuestion),
        }),

    securityAnswer: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.empty": errorMessages.REQUIRED(fields.securityAnswer),
            "string.min": errorMessages.MIN_LENGTH(fields.securityAnswer, 3),
            "string.max": errorMessages.MAX_LENGTH(fields.securityAnswer, 50),
        }),

    password: Joi.string()
        .pattern(passwordRegex)
        .min(8)
        .max(100)
        .required()
        .messages({
            "string.pattern.base": errorMessages.PASSWORD_INVALID,
            "string.empty": errorMessages.REQUIRED(fields.password),
            "string.min": errorMessages.MIN_LENGTH(fields.password, 8),
            "string.max": errorMessages.MAX_LENGTH(fields.password, 100),
        }),

    refreshToken: Joi.string().optional(),
});

const loginValidationSchema = Joi.object({
    email: Joi.string()
        .pattern(emailRegex)
        .trim()
        .lowercase()
        .messages({
            "string.pattern.base": errorMessages.EMAIL_INVALID,
            "string.empty": errorMessages.REQUIRED(fields.email),
        }),

    username: Joi.string()
        .min(3)
        .max(30)
        .pattern(usernameRegex)
        .trim()
        .lowercase()
        .messages({
            "string.pattern.base": errorMessages.USERNAME_INVALID,
            "string.empty": errorMessages.REQUIRED(fields.username),
            "string.min": errorMessages.MIN_LENGTH(fields.username, 3),
            "string.max": errorMessages.MAX_LENGTH(fields.username, 30),
        }),

    password: Joi.string()
        .pattern(passwordRegex)
        .min(8)
        .max(100)
        .required()
        .messages({
            "string.pattern.base": errorMessages.PASSWORD_INVALID,
            "string.empty": errorMessages.REQUIRED(fields.password),
            "string.min": errorMessages.MIN_LENGTH(fields.password, 8),
            "string.max": errorMessages.MAX_LENGTH(fields.password, 100),
        }),
}).xor("username", "email");  // Ensure user provides either username OR email

export { registerValidationSchema, loginValidationSchema };