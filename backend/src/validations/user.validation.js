import Joi from "joi";

import { emailRegex, phoneRegex, usernameRegex, passwordRegex } from "../utils/regex.js";

export const userValidationSchema = Joi.object({
    firstName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.base": "First name must be a string",
            "string.empty": "First name is required",
            "string.min": "First name must be at least 2 characters",
            "string.max": "First name must not exceed 50 characters",
        }),
        
        lastName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.base": "Last name must be a string",
            "string.empty": "Last name is required",
            "string.min": "Last name must be at least 2 characters",
            "string.max": "Last name must not exceed 50 characters",
        }),

    email: Joi.string()
        .pattern(emailRegex)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.pattern.base": "Email must be a valid email address",
        }),

    phone: Joi.string()
        .pattern(phoneRegex)
        .trim()
        .required()
        .messages({
            "string.pattern.base": "Phone number must be in valid E.164 format",
        }),

    username: Joi.string()
        .min(3)
        .max(30)
        .pattern(usernameRegex)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.pattern.base": "Username may only contain letters, numbers, and underscores",
        }),

    securityQuestion: Joi.string()
        .valid(
            "What is your mother's maiden name?",
            "What was the name of your first pet?",
            "What is your favorite book?"
        )
        .required(),

    securityAnswer: Joi.string()
        .min(3)
        .max(50)
        .required(),

    password: Joi.string()
        .pattern(passwordRegex)
        .min(8)
        .max(100)
        .required()
        .messages({
            "string.pattern.base":
                "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
        }),

    refreshToken: Joi.string().optional(),
});
