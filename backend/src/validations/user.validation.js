import Joi from "joi";

import {
    ENUMS,
    FIELDS,
    REGEX,
    MESSAGES
} from "../utils/index.js";

/* ============================================================
   SHARED FIELD SCHEMAS (reusable across all validations)
============================================================ */

const firstNameSchema = Joi.string()
    .min(2)
    .max(50)
    .trim()
    .lowercase()
    .required()
    .messages({
        "string.empty": MESSAGES.REQUIRED(FIELDS.FIRST_NAME),
        "string.min": MESSAGES.MIN_LENGTH(FIELDS.FIRST_NAME, 2),
        "string.max": MESSAGES.MAX_LENGTH(FIELDS.FIRST_NAME, 50),
        "string.base": MESSAGES.STRING_BASE(FIELDS.FIRST_NAME)
    });

const lastNameSchema = Joi.string()
    .min(2)
    .max(50)
    .trim()
    .lowercase()
    .required()
    .messages({
        "string.empty": MESSAGES.REQUIRED(FIELDS.LAST_NAME),
        "string.min": MESSAGES.MIN_LENGTH(FIELDS.LAST_NAME, 2),
        "string.max": MESSAGES.MAX_LENGTH(FIELDS.LAST_NAME, 50),
        "string.base": MESSAGES.STRING_BASE(FIELDS.LAST_NAME)
    });

const emailSchema = Joi.string()
    .trim()
    .lowercase()
    .pattern(REGEX.EMAIL)
    .required()
    .messages({
        "string.empty": MESSAGES.REQUIRED(FIELDS.EMAIL),
        "string.pattern.base": MESSAGES.EMAIL_INVALID
    });

const phoneSchema = Joi.string()
    .trim()
    .pattern(REGEX.PHONE)
    .required()
    .messages({
        "string.empty": MESSAGES.REQUIRED(FIELDS.PHONE),
        "string.pattern.base": MESSAGES.PHONE_INVALID
    });

const usernameSchema = Joi.string()
    .trim()
    .lowercase()
    .min(3)
    .max(30)
    .pattern(REGEX.USERNAME)
    .required()
    .messages({
        "string.empty": MESSAGES.REQUIRED(FIELDS.USERNAME),
        "string.pattern.base": MESSAGES.USERNAME_INVALID,
        "string.min": MESSAGES.MIN_LENGTH(FIELDS.USERNAME, 3),
        "string.max": MESSAGES.MAX_LENGTH(FIELDS.USERNAME, 30)
    });

const placeSchema = Joi.string()
    .trim()
    .lowercase()
    .min(3)
    .max(50)
    .required()
    .messages({
        "string.empty": MESSAGES.REQUIRED(FIELDS.PLACE),
        "string.min": MESSAGES.MIN_LENGTH(FIELDS.PLACE, 3),
        "string.max": MESSAGES.MAX_LENGTH(FIELDS.PLACE, 50)
    });

const citySchema = Joi.string()
    .trim()
    .lowercase()
    .min(2)
    .max(50)
    .pattern(REGEX.CITY)
    .required()
    .messages({
        "string.empty": MESSAGES.REQUIRED(FIELDS.CITY),
        "string.min": MESSAGES.MIN_LENGTH(FIELDS.CITY, 2),
        "string.max": MESSAGES.MAX_LENGTH(FIELDS.CITY, 50),
        "string.pattern.base": MESSAGES.CITY_INVALID
    });

const stateSchema = Joi.string()
    .trim()
    .uppercase()
    .required()
    .messages({
        "string.empty": MESSAGES.REQUIRED(FIELDS.ADDRESS_INDIAN_STATE)
    });

const stateCodeSchema = Joi.string()
    .trim()
    .uppercase()
    .pattern(REGEX.STATE_CODE)
    .required()
    .messages({
        "string.empty": MESSAGES.REQUIRED(FIELDS.ADDRESS_INDIAN_STATE_CODE),
        "string.pattern.base": MESSAGES.STATE_CODE_INVALID
    });

const pinCodeSchema = Joi.string()
    .trim()
    .pattern(REGEX.PIN_CODE)
    .required()
    .messages({
        "string.empty": MESSAGES.REQUIRED(FIELDS.PIN_CODE),
        "string.pattern.base": MESSAGES.PINCODE_INVALID
    });

const securityQuestionSchema = Joi.string()
    .valid(...ENUMS.SECURITY_QUESTIONS)
    .required()
    .messages({
        "string.empty": MESSAGES.REQUIRED(FIELDS.SECURITY_QUESTION),
        "any.only": MESSAGES.ENUM_BASE(FIELDS.SECURITY_QUESTION, ENUMS.SECURITY_QUESTIONS)
    });

const securityAnswerSchema = Joi.string()
    .trim()
    .min(3)
    .max(50)
    .required()
    .messages({
        "string.empty": MESSAGES.REQUIRED(FIELDS.SECURITY_ANSWER),
        "string.min": MESSAGES.MIN_LENGTH(FIELDS.SECURITY_ANSWER, 3),
        "string.max": MESSAGES.MAX_LENGTH(FIELDS.SECURITY_ANSWER, 50)
    });

const passwordSchema = Joi.string()
    .trim()
    .min(8)
    .max(100)
    .pattern(REGEX.PASSWORD)
    .required()
    .messages({
        "string.empty": MESSAGES.REQUIRED(FIELDS.PASSWORD),
        "string.min": MESSAGES.MIN_LENGTH(FIELDS.PASSWORD, 8),
        "string.max": MESSAGES.MAX_LENGTH(FIELDS.PASSWORD, 100),
        "string.pattern.base": MESSAGES.PASSWORD_INVALID
    });

const registerValidationSchema = Joi.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: emailSchema,
    phone: phoneSchema,
    username: usernameSchema,
    place: placeSchema,
    city: citySchema,
    state: stateSchema,
    stateCode: stateCodeSchema,
    pinCode: pinCodeSchema,
    securityQuestion: securityQuestionSchema,
    securityAnswer: securityAnswerSchema,
    password: passwordSchema,
    refreshToken: Joi.string().optional()
});

const loginValidationSchema = Joi.object({
    email: emailSchema.optional(),
    username: usernameSchema.optional(),
    password: passwordSchema
}).xor("email", "username");

const securityQuestionValidationSchema = Joi.object({
    email: emailSchema.optional(),
    username: usernameSchema.optional(),
}).xor("email", "username");

const securityAnswerValidationSchema = Joi.object({
    email: emailSchema.optional(),
    username: usernameSchema.optional(),
    securityAnswer: securityAnswerSchema
}).xor("email", "username");

const resetPasswordValidationSchema = Joi.object({
    email: emailSchema.optional(),
    username: usernameSchema.optional(),
    newPassword: passwordSchema
}).xor("email", "username");

export {
    registerValidationSchema,
    loginValidationSchema,
    securityQuestionValidationSchema,
    securityAnswerValidationSchema,
    resetPasswordValidationSchema
};