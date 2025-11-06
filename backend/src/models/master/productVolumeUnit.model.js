import mongoose, { Schema } from "mongoose";

import {
    FIELDS,
    MESSAGES
} from "../../utils/index.js";

const productVolumeUnitSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.PRODUCT_VOLUME_UNIT)],
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
        collection: "product_volumeunits",
    }
);

export const ProductVolumeUnit = mongoose.model(
    "productVolumeUnit",
    productVolumeUnitSchema,
    "product_volumeunits"
);
