import Joi from "joi";

import {
    FIELDS,
    MESSAGES
} from "../../utils/index.js";

const productPackSizeValidationSchema = Joi.object({
    name: Joi.string()
        .trim()
        .uppercase()
        .required()
        .messages({
            "string.base": MESSAGES.STRING_BASE(FIELDS.PACK_SIZE),
            "any.required": MESSAGES.REQUIRED(FIELDS.PACK_SIZE),
            "string.empty": MESSAGES.REQUIRED(FIELDS.PACK_SIZE),
        }),

    isActive: Joi.boolean()
        .required()
        .messages({
            "boolean.base": MESSAGES.BOOLEAN_BASE(FIELDS.IS_ACTIVE),
            "any.required": MESSAGES.REQUIRED(FIELDS.IS_ACTIVE),
        }),
});

export { productPackSizeValidationSchema };