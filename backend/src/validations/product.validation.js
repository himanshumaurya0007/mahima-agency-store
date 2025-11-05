import Joi from "joi";

import {
    FIELDS,
    REGEX,
    MESSAGES
} from "../utils/index.js";

const productValidationSchema = Joi.object({
    categoryName: Joi.string()
        .trim()
        .uppercase()
        .min(2)
        .max(40)
        .required()
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.PRODUCT_CATEGORY, 2),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.PRODUCT_CATEGORY, 40),
        }),

    categoryCode: Joi.string()
        .trim()
        .uppercase()
        .min(2)
        .max(20)
        .required()
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY_CODE),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.PRODUCT_CATEGORY_CODE, 2),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.PRODUCT_CATEGORY_CODE, 20),
        }),

    productName: Joi.string()
        .trim()
        .uppercase()
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.PRODUCT_NAME),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.PRODUCT_NAME, 2),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.PRODUCT_NAME, 50),
        }),

    volumeMagnitude: Joi.string()
        .trim()
        .required()
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.VOLUME_MAGNITUDE),
        }),

    volumeUnit: Joi.string()
        .trim()
        .uppercase()
        .min(1)
        .max(20)
        .required()
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.VOLUME_UNIT),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.VOLUME_UNIT, 1),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.VOLUME_UNIT, 20),
        }),

    packSize: Joi.string()
        .trim()
        .min(2)
        .max(20)
        .required()
        .messages({
            "string.empty": MESSAGES.REQUIRED(FIELDS.PACK_SIZE),
            "string.min": MESSAGES.MIN_LENGTH(FIELDS.PACK_SIZE, 2),
            "string.max": MESSAGES.MAX_LENGTH(FIELDS.PACK_SIZE, 20),
        }),

    materialCode: Joi.string()
        .trim()
        .regex(REGEX.MATERIAL_CODE)
        .required()
        .messages({
            "string.pattern.base": MESSAGES.PATTERN_MISMATCH(FIELDS.MATERIAL_CODE),
            "string.empty": MESSAGES.REQUIRED(FIELDS.MATERIAL_CODE),
        }),

    mrp: Joi.number()
        .min(0)
        .required()
        .messages({
            "number.base": MESSAGES.NUMBER_BASE(FIELDS.MRP),
            "number.empty": MESSAGES.REQUIRED(FIELDS.MRP),
            "number.min": MESSAGES.MIN_LENGTH(FIELDS.MRP, 0),
        }),

    rate: Joi.number()
        .min(0)
        .required()
        .messages({
            "number.base": MESSAGES.NUMBER_BASE(FIELDS.RATE),
            "number.empty": MESSAGES.REQUIRED(FIELDS.RATE),
            "number.min": MESSAGES.MIN_LENGTH(FIELDS.RATE, 0),
        }),

    stock: Joi.number()
        .min(0)
        .required()
        .messages({
            "number.base": MESSAGES.NUMBER_BASE(FIELDS.STOCK),
            "number.empty": MESSAGES.REQUIRED(FIELDS.STOCK),
            "number.min": MESSAGES.MIN_LENGTH(FIELDS.STOCK, 0),
        }),

    hsnCode: Joi.string()
        .trim()
        .regex(REGEX.HSN_CODE)
        .required()
        .default("21050000")
        .messages({
            "string.pattern.base": MESSAGES.PATTERN_MISMATCH(FIELDS.HSN_CODE),
            "string.empty": MESSAGES.REQUIRED(FIELDS.HSN_CODE),
        }),
});

export { productValidationSchema };