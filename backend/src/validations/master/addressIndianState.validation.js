import Joi from "joi";

import {
    FIELDS,
    MESSAGES,
} from "../../utils/index.js";

const addressindianStateValidationSchema = Joi.object({
    name: Joi.string()
        .trim()
        .uppercase()
        .required()
        .messages({
            "string.base": MESSAGES.STRING_BASE(FIELDS.ADDRESS_INDIAN_STATE),
            "any.required": MESSAGES.REQUIRED(FIELDS.ADDRESS_INDIAN_STATE),
            "any.only": MESSAGES.INVALID_VALUE(FIELDS.ADDRESS_INDIAN_STATE),
            "string.empty": MESSAGES.REQUIRED(FIELDS.ADDRESS_INDIAN_STATE),
        }),

    code: Joi.string()
        .trim()
        .uppercase()
        .required()
        .messages({
            "string.base": MESSAGES.STRING_BASE(FIELDS.ADDRESS_INDIAN_STATE_CODE),
            "any.required": MESSAGES.REQUIRED(FIELDS.ADDRESS_INDIAN_STATE_CODE),
            "any.only": MESSAGES.INVALID_VALUE(FIELDS.ADDRESS_INDIAN_STATE_CODE),
            "string.empty": MESSAGES.REQUIRED(FIELDS.ADDRESS_INDIAN_STATE_CODE),
        }),

    isActive: Joi.boolean()
        .required()
        .messages({
            "boolean.base": MESSAGES.BOOLEAN_BASE(FIELDS.IS_ACTIVE),
            "any.required": MESSAGES.REQUIRED(FIELDS.IS_ACTIVE),
        }),
});

export { addressindianStateValidationSchema };
