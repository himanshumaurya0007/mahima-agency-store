import Joi from "joi";
import mongoose from "mongoose";

import {
    ENUMS,
    FIELDS,
    REGEX,
    MESSAGES
} from "../utils/index.js";

import { addressValidationSchema } from "./address.validation.js";

const customerValidationSchema = Joi.object({
    customerStatus: Joi.string()
        .valid(...ENUMS.CUSTOMER_STATUS)
        .uppercase()
        .default("TEMPORARY")
        .messages({
            "any.only": `Invalid ${FIELDS.CUSTOMER_STATUS}`,
        }),

    temporaryCustomerId: Joi.string()
        .pattern(REGEX.TEMPORARY_CUSTOMER_ID)
        .trim()
        .optional()
        .allow(null, "")
        .messages({
            "string.pattern.base": MESSAGES.TEMPORARY_CUSTOMER_ID_INVALID,
        }),

    havmorPlatformCustomerId: Joi.string()
        .pattern(REGEX.HAVMOR_PLATFORM_CUSTOMER_ID)
        .trim()
        .optional() // Optional — required only for permanent customers
        .allow(null, "")
        .messages({
            "string.pattern.base": MESSAGES.CUSTOMER_ID_INVALID,
        }),

    shopName: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.SHOP_NAME),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.SHOP_NAME, 2),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.SHOP_NAME, 100),
        }),

    firstName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .lowercase()
        .optional()
        .allow(null, "")
        .messages({
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.FIRST_NAME, 2),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.FIRST_NAME, 50),
        }),

    lastName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .lowercase()
        .optional()
        .allow(null, "")
        .messages({
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.LAST_NAME, 2),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.LAST_NAME, 50),
        }),

    email: Joi.string()
        .pattern(REGEX.EMAIL)
        .trim()
        .lowercase()
        .optional()
        .allow(null, "")
        .messages({
            "string.pattern.base": MESSAGES.EMAIL_INVALID,
        }),

    phone: Joi.string()
        .pattern(REGEX.PHONE)
        .trim()
        .required()
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.PHONE),
            "string.pattern.base": MESSAGES.PHONE_INVALID,
        }),

    panCardNumber: Joi.string()
        .pattern(REGEX.PAN_CARD)
        .trim()
        .uppercase()
        .optional()
        .allow(null, "")
        .messages({
            "string.pattern.base": MESSAGES.PAN_CARD_INVALID,
        }),

    gstinNumber: Joi.string()
        .pattern(REGEX.GSTIN_NUMBER)
        .trim()
        .uppercase()
        .optional()
        .allow(null, "")
        .messages({
            "string.pattern.base": MESSAGES.GSTIN_NUMBER_INVALID,
        }),

    customerAddress: addressValidationSchema.required().messages({
        "any.required": MESSAGES.REQUIRED(FIELDS.CUSTOMER_ADDRESS),
        "any.invalid": `${FIELDS.CUSTOMER_ADDRESS} must be a valid ObjectId`,
    }),
}).custom((obj, helpers) => {
    // Conditional validation: havmorPlatformCustomerId required if status is PERMANENT
    if (obj.customerStatus === "PERMANENT" && !obj.havmorPlatformCustomerId) {
        return helpers.error("any.custom", {
            message: MESSAGES.REQUIRED(FIELDS.HAVMOR_PLATFORM_CUSTOMER_ID),
        });
    }
    return obj;
}, "Conditional validation for havmorPlatformCustomerId");

export { customerValidationSchema };
