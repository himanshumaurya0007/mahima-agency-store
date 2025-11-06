import Joi from "joi";

import {
    FIELDS,
    MESSAGES
} from "../../utils/index.js";

const productVolumeUnitValidationSchema = Joi.object({
    name: Joi.string()
        .trim()
        .uppercase()
        .required()
        .messages({
            "string.base": MESSAGES.STRING_BASE(FIELDS.PRODUCT_VOLUME_UNIT),
            "any.required": MESSAGES.REQUIRED(FIELDS.PRODUCT_VOLUME_UNIT),
            "string.empty": MESSAGES.REQUIRED(FIELDS.PRODUCT_VOLUME_UNIT),
        }),

    isActive: Joi.boolean()
        .required()
        .messages({
            "boolean.base": MESSAGES.BOOLEAN_BASE(FIELDS.IS_ACTIVE),
            "any.required": MESSAGES.REQUIRED(FIELDS.IS_ACTIVE),
        }),
});

export { productVolumeUnitValidationSchema };