import Joi from "joi";
import mongoose from "mongoose";

import { fields } from "../utils/fields.js";
import { temporaryCustomerIdRegex, havmorPlatformCustomerIdRegex, emailRegex, phoneRegex, panCardRegex, gstinNumberRegex, } from "../utils/regex.js";
import { errorMessages } from "../utils/errorMessages.js";
import { CUSTOMER_STATUS } from "../constants.js";

import { addressValidationSchema } from "./address.validation.js";

const customerValidationSchema = Joi.object({
    customerStatus: Joi.string()
        .valid(...CUSTOMER_STATUS)
        .uppercase()
        .default("TEMPORARY")
        .messages({
            "any.only": `Invalid ${fields.customerStatus}`,
        }),

    temporaryCustomerId: Joi.string()
        .pattern(temporaryCustomerIdRegex)
        .trim()
        .optional()
        .allow(null, "")
        .messages({
            "string.pattern.base": errorMessages.TEMPORARY_CUSTOMER_ID_INVALID,
        }),

    havmorPlatformCustomerId: Joi.string()
        .pattern(havmorPlatformCustomerIdRegex)
        .trim()
        .optional() // Optional — required only for permanent customers
        .allow(null, "")
        .messages({
            "string.pattern.base": errorMessages.CUSTOMER_ID_INVALID,
        }),

    shopName: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.empty": errorMessages.REQUIRED(fields.shopName),
            "string.min": errorMessages.MIN_LENGTH(fields.shopName, 2),
            "string.max": errorMessages.MAX_LENGTH(fields.shopName, 100),
        }),

    firstName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .lowercase()
        .optional()
        .allow(null, "")
        .messages({
            "string.min": errorMessages.MIN_LENGTH(fields.firstName, 2),
            "string.max": errorMessages.MAX_LENGTH(fields.firstName, 50),
        }),

    lastName: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .lowercase()
        .optional()
        .allow(null, "")
        .messages({
            "string.min": errorMessages.MIN_LENGTH(fields.lastName, 2),
            "string.max": errorMessages.MAX_LENGTH(fields.lastName, 50),
        }),

    email: Joi.string()
        .pattern(emailRegex)
        .trim()
        .lowercase()
        .optional()
        .allow(null, "")
        .messages({
            "string.pattern.base": errorMessages.EMAIL_INVALID,
        }),

    phone: Joi.string()
        .pattern(phoneRegex)
        .trim()
        .required()
        .messages({
            "string.empty": errorMessages.REQUIRED(fields.phone),
            "string.pattern.base": errorMessages.PHONE_INVALID,
        }),

    panCardNumber: Joi.string()
        .pattern(panCardRegex)
        .trim()
        .uppercase()
        .optional()
        .allow(null, "")
        .messages({
            "string.pattern.base": errorMessages.PAN_CARD_INVALID,
        }),

    gstinNumber: Joi.string()
        .pattern(gstinNumberRegex)
        .trim()
        .uppercase()
        .optional()
        .allow(null, "")
        .messages({
            "string.pattern.base": errorMessages.GSTIN_NUMBER_INVALID,
        }),

    customerAddress: addressValidationSchema.required().messages({
        "any.required": errorMessages.REQUIRED(fields.customerAddress),
        "any.invalid": `${fields.customerAddress} must be a valid ObjectId`,
    }),
}).custom((obj, helpers) => {
    // Conditional validation: havmorPlatformCustomerId required if status is PERMANENT
    if (obj.customerStatus === "PERMANENT" && !obj.havmorPlatformCustomerId) {
        return helpers.error("any.custom", {
            message: errorMessages.REQUIRED(fields.havmorPlatformCustomerId),
        });
    }
    return obj;
}, "Conditional validation for havmorPlatformCustomerId");

export { customerValidationSchema };
