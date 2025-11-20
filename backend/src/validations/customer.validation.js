import Joi from "joi";

import {
    ENUMS,
    FIELDS,
    REGEX,
    MESSAGES
} from "../utils/index.js";

const customerValidationSchema = Joi.object({
    customerStatus: Joi.string()
        .valid(...ENUMS.CUSTOMER_STATUS)
        .uppercase()
        .required()
        .default("TEMPORARY")
        .messages({
            "any.only": MESSAGES.CUSTOMER_STATUS_INVALID,
            "string.empty": MESSAGES.REQUIRED(FIELDS.CUSTOMER_STATUS),
        }),

    temporaryCustomerId: Joi.string()
        .trim()
        .pattern(REGEX.TEMPORARY_CUSTOMER_ID)
        .optional()
        .allow(null, "")
        .messages({
            "string.pattern.base": MESSAGES.TEMPORARY_CUSTOMER_ID_INVALID,
        }),

    havmorPlatformCustomerId: Joi.string()
        .trim()
        .pattern(REGEX.HAVMOR_PLATFORM_CUSTOMER_ID)
        .optional()
        .allow(null, "")
        .messages({
            "string.pattern.base": MESSAGES.CUSTOMER_ID_INVALID,
        }),

    shopName: Joi.string()
        .trim()
        .lowercase()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.SHOP_NAME),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.SHOP_NAME, 2),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.SHOP_NAME, 100),
        }),

    firstName: Joi.string()
        .trim()
        .lowercase()
        .min(2)
        .max(50)
        .optional()
        .allow(null, "")
        .messages({
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.FIRST_NAME, 2),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.FIRST_NAME, 50),
        }),

    lastName: Joi.string()
        .trim()
        .lowercase()
        .min(2)
        .max(50)
        .optional()
        .allow(null, "")
        .messages({
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.LAST_NAME, 2),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.LAST_NAME, 50),
        }),

    email: Joi.string()
        .trim()
        .lowercase()
        .pattern(REGEX.EMAIL)
        .optional()
        .allow(null, "")
        .messages({
            "string.pattern.base": MESSAGES.EMAIL_INVALID,
        }),

    phone: Joi.string()
        .trim()
        .required()
        .custom((value, helpers) => {
            const digits = value.startsWith("+91") ? value.slice(3) : value;
            if (!REGEX.PHONE.test(digits)) {
                return helpers.error("string.pattern.base");
            }
            return `+91${digits}`;
        })
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.PHONE),
            "string.pattern.base": MESSAGES.PHONE_INVALID,
        }),

    panCardNumber: Joi.string()
        .trim()
        .uppercase()
        .pattern(REGEX.PAN_CARD)
        .optional()
        .allow(null, "")
        .messages({
            "string.pattern.base": MESSAGES.PAN_CARD_INVALID,
        }),

    gstinNumber: Joi.string()
        .trim()
        .uppercase()
        .pattern(REGEX.GSTIN_NUMBER)
        .optional()
        .allow(null, "")
        .messages({
            "string.pattern.base": MESSAGES.GSTIN_NUMBER_INVALID,
        }),

    place: Joi.string()
        .trim()
        .lowercase()
        .required()
        .min(3)
        .max(50)
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.PLACE),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.PLACE, 3),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.PLACE, 50),
        }),

    city: Joi.string()
        .trim()
        .lowercase()
        .required()
        .min(2)
        .max(50)
        .pattern(REGEX.CITY)
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.CITY),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.CITY, 2),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.CITY, 50),
            "string.pattern.base": MESSAGES.CITY_INVALID,
        }),

    state: Joi.string()
        .trim()
        .uppercase()
        .required()
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.ADDRESS_INDIAN_STATE),
        }),

    stateCode: Joi.string()
        .trim()
        .uppercase()
        .pattern(REGEX.STATE_CODE)
        .required()
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.ADDRESS_INDIAN_STATE_CODE),
            "string.pattern.base": MESSAGES.STATE_CODE_INVALID
        }),

    pinCode: Joi.string()
        .trim()
        .required()
        .pattern(REGEX.PIN_CODE)
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.PIN_CODE),
            "string.pattern.base": MESSAGES.PINCODE_INVALID,
        }),

}).custom((obj, helpers) => {
    // If status is PERMANENT → havmorPlatformCustomerId is required
    if (obj.customerStatus === "PERMANENT" && !obj.havmorPlatformCustomerId) {
        return helpers.error("any.custom", {
            message: MESSAGES.REQUIRED(FIELDS.HAVMOR_PLATFORM_CUSTOMER_ID),
        });
    }

    return obj;
}, "Conditional permanent customer validation");

export { customerValidationSchema };