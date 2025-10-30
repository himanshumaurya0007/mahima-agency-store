// validations/master/productCategory.validation.js

import Joi from "joi";
import {
    FIELDS,
    MESSAGES,
} from "../../utils/index.js";

/**
 * Joi validation schema for Product Category.
 * Ensures:
 *  - Both fields are required.
 *  - categoryCode auto-mapped from category.
 * - Boolean validation for isActive (soft delete / activation flag).
 *  - Strict alignment with ProductCategory model validation.
 */
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

    /**
     * --------------------------------------------------------------------
     * Soft Delete / Activation Flag Validation
     * --------------------------------------------------------------------
     * - true  => active/enabled
     * - false => disabled/soft-deleted
     * --------------------------------------------------------------------
     */
    isActive: Joi.boolean()
        .required()
        .messages({
            "boolean.base": MESSAGES.BOOLEAN_BASE(FIELDS.IS_ACTIVE),
            "any.required": MESSAGES.REQUIRED(FIELDS.IS_ACTIVE),
        }),
});

export { productCategoryValidationSchema };
