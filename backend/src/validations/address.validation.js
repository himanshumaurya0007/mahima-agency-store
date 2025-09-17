import Joi from "joi";

import { fields } from "../utils/fields.js";
import { pinCodeRegex } from "../utils/regex.js";
import { errorMessages } from "../utils/errorMessages.js";
import { INDIAN_STATE_NAMES, INDIAN_STATE_CODES } from "../constants.js";

const addressValidationSchema = Joi.object({
    place: Joi.string()
        .min(3)
        .max(50)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.empty": errorMessages.REQUIRED(fields.place),
            "string.min": errorMessages.MIN_LENGTH(fields.place, 3),
            "string.max": errorMessages.MAX_LENGTH(fields.place, 50),
        }),

    city: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.empty": errorMessages.REQUIRED(fields.city),
            "string.min": errorMessages.MIN_LENGTH(fields.city, 2),
            "string.max": errorMessages.MAX_LENGTH(fields.city, 50),
        }),

    state: Joi.string()
        .valid(...INDIAN_STATE_NAMES)
        .uppercase()
        .trim()
        .required()
        .messages({
            "any.only": `Invalid ${fields.indianState}`,
            "string.empty": errorMessages.REQUIRED(fields.indianState),
        }),

    stateCode: Joi.string()
        .valid(...INDIAN_STATE_CODES)
        .uppercase()
        .trim()
        .required()
        .messages({
            "any.only": `Invalid ${fields.indianStateCode}`,
            "string.empty": errorMessages.REQUIRED(fields.indianStateCode),
        }),

    pinCode: Joi.string()
        .pattern(pinCodeRegex)
        .trim()
        .required()
        .messages({
            "string.pattern.base": errorMessages.PINCODE_INVALID,
            "string.empty": errorMessages.REQUIRED(fields.pincode),
        }),
});

export { addressValidationSchema, };