import Joi from "joi";

import {
    ENUMS,
    FIELDS,
    REGEX,
    MESSAGES
} from "../utils/index.js";

const registerValidationSchema = Joi.object({
    firstName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.base": MESSAGES.STRING_BASE(FIELDS.FIRST_NAME),
            "string.empty": MESSAGES.REQUIRED(FIELDS.FIRST_NAME),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.FIRST_NAME, 2),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.FIRST_NAME, 50),
        }),

    lastName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.base": MESSAGES.STRING_BASE(FIELDS.LAST_NAME),
            "string.empty": MESSAGES.REQUIRED(FIELDS.LAST_NAME),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.LAST_NAME, 2),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.LAST_NAME, 50),
        }),

    email: Joi.string()
        .pattern(REGEX.EMAIL)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.pattern.base": MESSAGES.EMAIL_INVALID,
            "string.empty": MESSAGES.REQUIRED(FIELDS.EMAIL),
        }),

    phone: Joi.string()
        .pattern(REGEX.PHONE)
        .trim()
        .required()
        .messages({
            "string.pattern.base": MESSAGES.PHONE_INVALID,
            "string.empty": MESSAGES.REQUIRED(FIELDS.PHONE),
        }),

    username: Joi.string()
        .min(3)
        .max(30)
        .pattern(REGEX.USERNAME)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.pattern.base": MESSAGES.USERNAME_INVALID,
            "string.empty": MESSAGES.REQUIRED(FIELDS.USERNAME),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.USERNAME, 3),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.USERNAME, 30),
        }),

    securityQuestion: Joi.string()
        .valid(...ENUMS.SECURITY_QUESTIONS)
        .required()
        .messages({
            "any.only": "Invalid security question",
            "string.empty": MESSAGES.REQUIRED(FIELDS.SECURITY_QUESTION),
        }),

    securityAnswer: Joi.string()
        .min(3)
        .max(50)
        .trim()
        .required()
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.SECURITY_ANSWER),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.SECURITY_ANSWER, 3),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.SECURITY_ANSWER, 50),
        }),

    password: Joi.string()
        .pattern(REGEX.PASSWORD)
        .min(8)
        .max(100)
        .trim()
        .required()
        .messages({
            "string.pattern.base": MESSAGES.PASSWORD_INVALID,
            "string.empty": MESSAGES.REQUIRED(FIELDS.PASSWORD),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.PASSWORD, 8),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.PASSWORD, 100),
        }),

    refreshToken: Joi.string().optional(),
});

const loginValidationSchema = Joi.object({
    email: Joi.string()
        .pattern(REGEX.EMAIL)
        .trim()
        .lowercase()
        .messages({
            "string.pattern.base": MESSAGES.EMAIL_INVALID,
            "string.empty": MESSAGES.REQUIRED(FIELDS.EMAIL),
        }),

    username: Joi.string()
        .min(3)
        .max(30)
        .pattern(REGEX.USERNAME)
        .trim()
        .lowercase()
        .messages({
            "string.pattern.base": MESSAGES.USERNAME_INVALID,
            "string.empty": MESSAGES.REQUIRED(FIELDS.USERNAME),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.USERNAME, 3),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.USERNAME, 30),
        }),

    password: Joi.string()
        .pattern(REGEX.PASSWORD)
        .min(8)
        .max(100)
        .trim()
        .required()
        .messages({
            "string.pattern.base": MESSAGES.PASSWORD_INVALID,
            "string.empty": MESSAGES.REQUIRED(FIELDS.PASSWORD),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.PASSWORD, 8),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.PASSWORD, 100),
        }),
}).xor("username", "email");  // Ensure user provides either username OR email

const securityQuestionValidationSchema = Joi.object({
    email: Joi.string()
        .pattern(REGEX.EMAIL)
        .trim()
        .lowercase()
        .messages({
            "string.pattern.base": MESSAGES.EMAIL_INVALID,
            "string.empty": MESSAGES.REQUIRED(FIELDS.EMAIL),
        }),

    username: Joi.string()
        .min(3)
        .max(30)
        .pattern(REGEX.USERNAME)
        .trim()
        .lowercase()
        .messages({
            "string.pattern.base": MESSAGES.USERNAME_INVALID,
            "string.empty": MESSAGES.REQUIRED(FIELDS.USERNAME),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.USERNAME, 3),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.USERNAME, 30),
        }),
}).xor("email", "username"); // Require either email OR username

const securityAnswerValidationSchema = Joi.object({
    email: Joi.string()
        .pattern(REGEX.EMAIL)
        .trim()
        .lowercase()
        .messages({
            "string.pattern.base": MESSAGES.EMAIL_INVALID,
            "string.empty": MESSAGES.REQUIRED(FIELDS.EMAIL),
        }),

    username: Joi.string()
        .min(3)
        .max(30)
        .pattern(REGEX.USERNAME)
        .trim()
        .lowercase()
        .messages({
            "string.pattern.base": MESSAGES.USERNAME_INVALID,
            "string.empty": MESSAGES.REQUIRED(FIELDS.USERNAME),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.USERNAME, 3),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.USERNAME, 30),
        }),

    securityAnswer: Joi.string()
        .min(3)
        .max(50)
        .trim()
        .required()
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.SECURITY_ANSWER),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.SECURITY_ANSWER, 3),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.SECURITY_ANSWER, 50),
        }),
}).xor("email", "username"); // Require either email OR username

const resetPasswordValidationSchema = Joi.object({
    email: Joi.string()
        .pattern(REGEX.EMAIL)
        .trim()
        .lowercase()
        .messages({
            "string.pattern.base": MESSAGES.EMAIL_INVALID,
            "string.empty": MESSAGES.REQUIRED(FIELDS.EMAIL),
        }),

    username: Joi.string()
        .min(3)
        .max(30)
        .pattern(REGEX.USERNAME)
        .trim()
        .lowercase()
        .messages({
            "string.pattern.base": MESSAGES.USERNAME_INVALID,
            "string.empty": MESSAGES.REQUIRED(FIELDS.USERNAME),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.USERNAME, 3),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.USERNAME, 30),
        }),

    newPassword: Joi.string()
        .pattern(REGEX.PASSWORD)
        .min(8)
        .max(100)
        .trim()
        .required()
        .messages({
            "string.pattern.base": MESSAGES.PASSWORD_INVALID,
            "string.empty": MESSAGES.REQUIRED(FIELDS.PASSWORD),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.PASSWORD, 8),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.PASSWORD, 100),
        }),
}).xor("email", "username"); // Require either email OR username

export {
    registerValidationSchema,
    loginValidationSchema,
    securityQuestionValidationSchema,
    securityAnswerValidationSchema,
    resetPasswordValidationSchema
};