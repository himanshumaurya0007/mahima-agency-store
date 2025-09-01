import Joi from "joi";

import { emailRegex, phoneRegex, usernameRegex, passwordRegex } from "../utils/regex.js";
import { errorMessages } from "../utils/errorMessages.js";
import { SECURITY_QUESTIONS } from "../constants.js"

export const userValidationSchema = Joi.object({
    firstName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.base": errorMessages.STRING_BASE("First name"),
            "string.empty": errorMessages.REQUIRED("First name"),
            "string.min": errorMessages.MIN_LENGTH("First name", 2),
            "string.max": errorMessages.MAX_LENGTH("First name", 50),
        }),

    lastName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.base": errorMessages.STRING_BASE("Last name"),
            "string.empty": errorMessages.REQUIRED("Last name"),
            "string.min": errorMessages.MIN_LENGTH("Last name", 2),
            "string.max": errorMessages.MAX_LENGTH("Last name", 50),
        }),

    email: Joi.string()
        .pattern(emailRegex)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.pattern.base": errorMessages.EMAIL_INVALID,
            "string.empty": errorMessages.REQUIRED("Email"),
        }),

    phone: Joi.string()
        .pattern(phoneRegex)
        .trim()
        .required()
        .messages({
            "string.pattern.base": errorMessages.PHONE_INVALID,
            "string.empty": errorMessages.REQUIRED("Phone number"),
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
            "string.empty": errorMessages.REQUIRED("Username"),
            "string.min": errorMessages.MIN_LENGTH("Username", 3),
            "string.max": errorMessages.MAX_LENGTH("Username", 30),
        }),

    securityQuestion: Joi.string()
        .valid(...SECURITY_QUESTIONS)
        .required()
        .messages({
            "any.only": "Invalid security question",
            "string.empty": errorMessages.REQUIRED("Security question"),
        }),

    securityAnswer: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.empty": errorMessages.REQUIRED("Security answer"),
            "string.min": errorMessages.MIN_LENGTH("Security answer", 3),
            "string.max": errorMessages.MAX_LENGTH("Security answer", 50),
        }),

    password: Joi.string()
        .pattern(passwordRegex)
        .min(8)
        .max(100)
        .required()
        .messages({
            "string.pattern.base": errorMessages.PASSWORD_INVALID,
            "string.empty": errorMessages.REQUIRED("Password"),
            "string.min": errorMessages.MIN_LENGTH("Password", 8),
            "string.max": errorMessages.MAX_LENGTH("Password", 100),
        }),

    refreshToken: Joi.string().optional(),
});
