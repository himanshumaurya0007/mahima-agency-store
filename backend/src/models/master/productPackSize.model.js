import mongoose, { Schema } from "mongoose";

import {
    FIELDS,
    MESSAGES
} from "../../utils/index.js";

const productPackSizeSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.PACK_SIZE)],
            unique: true, // Enforce uniqueness at the DB level
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
        collection: "product_packsizes",
    }
);

export const ProductPackSize = mongoose.model(
    "ProductPackSize",
    productPackSizeSchema,
    "product_packsizes"
);
