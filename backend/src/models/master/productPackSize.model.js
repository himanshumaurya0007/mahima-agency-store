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
const productPackSizeSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.PACK_SIZE)],
            unique: true, // Enforce uniqueness at the DB level
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: "product_packsize",
    }
);

/**
 * ------------------------------------------------------------------------
 * Explicit collection name ensures consistent DB naming
 * ------------------------------------------------------------------------
 */
export const ProductPackSize = mongoose.model(
    "ProductPackSize",
    productPackSizeSchema,
    "product_packsize"
);
