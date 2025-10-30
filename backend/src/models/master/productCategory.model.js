import mongoose, { Schema } from "mongoose";

import {
    FIELDS,
    MESSAGES
} from "../../utils/index.js";

/**
 * ------------------------------------------------------------------------
 * PRODUCT CATEGORY SCHEMA
 * ------------------------------------------------------------------------
 */
const productCategorySchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY)],
            unique: true, // Enforce uniqueness at the DB level
        },
        code: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY_CODE)],
        },
        isActive: {
            type: Boolean,
            default: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.IS_ACTIVE)],
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: "product_categories",
    }
);

/**
 * ------------------------------------------------------------------------
 * Explicit collection name ensures consistent DB naming
 * ------------------------------------------------------------------------
 */
export const ProductCategory = mongoose.model(
    "ProductCategory",
    productCategorySchema,
    "product_categories"
);
