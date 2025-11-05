import Joi from "joi";

import {
    FIELDS,
    REGEX,
    MESSAGES
} from "../utils/index.js";
import { INDIAN_STATE_NAMES, INDIAN_STATE_CODES } from "../utils/constants/enums.js";

const addressValidationSchema = Joi.object({
    place: Joi.string()
        .min(3)
        .max(50)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.PLACE),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.PLACE, 3),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.PLACE, 50),
        }),

    city: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.CITY),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.CITY, 2),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.CITY, 50),
        }),

    state: Joi.string()
        .valid(...INDIAN_STATE_NAMES)
        .uppercase()
        .trim()
        .required()
        .messages({
            "any.only": `Invalid ${FIELDS.INDIAN_STATE}`,
            "string.empty": MESSAGES.REQUIRED(FIELDS.INDIAN_STATE),
        }),

    stateCode: Joi.string()
        .valid(...INDIAN_STATE_CODES)
        .uppercase()
        .trim()
        .required()
        .messages({
            "any.only": `Invalid ${FIELDS.INDIAN_STATE_CODE}`,
            "string.empty": MESSAGES.REQUIRED(FIELDS.INDIAN_STATE_CODE),
        }),

    pinCode: Joi.string()
        .pattern(REGEX.PIN_CODE)
        .trim()
        .required()
        .messages({
            "string.pattern.base": MESSAGES.PINCODE_INVALID,
            "string.empty": MESSAGES.REQUIRED(FIELDS.PIN_CODE),
        }),
});

export { addressValidationSchema, };