import mongoose, { Schema } from "mongoose";

import {
    FIELDS,
    MESSAGES
} from "../../utils/index.js";

const productCategorySchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY)],
            unique: true,
        },
        code: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY_CODE)],
            unique: true,
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

export const ProductCategory = mongoose.model(
    "ProductCategory",
    productCategorySchema,
    "product_categories"
);
