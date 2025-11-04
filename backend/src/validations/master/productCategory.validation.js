import Joi from "joi";

import {
    FIELDS,
    MESSAGES,
} from "../../utils/index.js";

const productCategoryValidationSchema = Joi.object({
    name: Joi.string()
        .trim()
        .uppercase()
        .required()
        .messages({
            "string.base": MESSAGES.STRING_BASE(FIELDS.PRODUCT_CATEGORY),
            "any.required": MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY),
            "any.only": MESSAGES.INVALID_VALUE(FIELDS.PRODUCT_CATEGORY),
            "string.empty": MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY),
        }),

    code: Joi.string()
        .trim()
        .uppercase()
        .required()
        .messages({
            "string.base": MESSAGES.STRING_BASE(FIELDS.PRODUCT_CATEGORY_CODE),
            "any.required": MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY_CODE),
            "any.only": MESSAGES.INVALID_VALUE(FIELDS.PRODUCT_CATEGORY_CODE),
            "string.empty": MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY_CODE),
        }),

    isActive: Joi.boolean()
        .required()
        .messages({
            "boolean.base": MESSAGES.BOOLEAN_BASE(FIELDS.IS_ACTIVE),
            "any.required": MESSAGES.REQUIRED(FIELDS.IS_ACTIVE),
        }),
});

export { productCategoryValidationSchema };
