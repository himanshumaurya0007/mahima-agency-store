// validations/master/productCategory.validation.js

import Joi from "joi";
import {
    PRODUCT_CATEGORY_NAMES,
    PRODUCT_CATEGORY_CODES,
    ENUMS,
    FIELDS,
    MESSAGES,
} from "../../utils/index.js";

/**
 * Build category → code map for O(1) lookup,
 * mirroring the logic in ProductCategory model.
 */
const CATEGORY_CODE_MAP = ENUMS.PRODUCT_CATEGORIES_WITH_CODES.reduce((acc, item) => {
    acc[item.name.toUpperCase()] = item.code.toUpperCase();
    return acc;
}, {});

/**
 * Joi validation schema for Product Category.
 * Ensures:
 *  - Both fields are required.
 *  - categoryCode auto-mapped from category.
 *  - Strict alignment with ProductCategory model validation.
 */
const productCategoryValidationSchema = Joi.object({
    category: Joi.string()
        .trim()
        .uppercase()
        .valid(...PRODUCT_CATEGORY_NAMES.map(name => name.toUpperCase()))
        .required()
        .messages({
            "string.base": MESSAGES.STRING_BASE(FIELDS.PRODUCT_CATEGORY),
            "any.required": MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY),
            "any.only": MESSAGES.INVALID_VALUE(FIELDS.PRODUCT_CATEGORY),
            "string.empty": MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY),
        }),

    categoryCode: Joi.string()
        .trim()
        .uppercase()
        .valid(...PRODUCT_CATEGORY_CODES.map(code => code.toUpperCase()))
        .required()
        .messages({
            "string.base": MESSAGES.STRING_BASE(FIELDS.PRODUCT_CATEGORY_CODE),
            "any.required": MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY_CODE),
            "any.only": MESSAGES.INVALID_VALUE(FIELDS.PRODUCT_CATEGORY_CODE),
            "string.empty": MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY_CODE),
        }),
})
    .custom((obj, helpers) => {
        const expectedCode = CATEGORY_CODE_MAP[obj.category?.toUpperCase()];

        if (!expectedCode) {
            return helpers.error("any.custom", {
                message: MESSAGES.INVALID_VALUE(FIELDS.PRODUCT_CATEGORY),
            });
        }

        // ✅ Auto-fill or correct categoryCode
        if (!obj.categoryCode || obj.categoryCode !== expectedCode) {
            obj.categoryCode = expectedCode;
        }

        return obj;
    }, "Category → Code mapping consistency");

export { productCategoryValidationSchema };
