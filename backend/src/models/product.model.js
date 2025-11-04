import mongoose, { Schema } from "mongoose";

import {
    FIELDS,
    REGEX,
    MESSAGES
} from "../utils/index.js";

const ProductSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, MESSAGES.REQUIRED(FIELDS.USER_ID)],
            index: true,
        },
        categoryName: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY)],
            minlength: [2, MESSAGES.MIN_LENGTH(FIELDS.PRODUCT_CATEGORY, 2)],
            maxlength: [40, MESSAGES.MAX_LENGTH(FIELDS.PRODUCT_CATEGORY, 40)],
        },
        categoryCode: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.PRODUCT_CATEGORY_CODE)],
            minlength: [2, MESSAGES.MIN_LENGTH(FIELDS.PRODUCT_CATEGORY_CODE, 2)],
            maxlength: [20, MESSAGES.MAX_LENGTH(FIELDS.PRODUCT_CATEGORY_CODE, 20)],
        },
        productName: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.PRODUCT_NAME)],
            minlength: [2, MESSAGES.MIN_LENGTH(FIELDS.PRODUCT_NAME, 2)],
            maxlength: [50, MESSAGES.MAX_LENGTH(FIELDS.PRODUCT_NAME, 50)],
        },
        volumeMagnitude: {
            type: String,
            trim: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.VOLUME_MAGNITUDE)],
        },
        volumeUnit: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.VOLUME_UNIT)],
            minlength: [1, MESSAGES.MIN_LENGTH(FIELDS.VOLUME_UNIT, 1)],
            maxlength: [20, MESSAGES.MAX_LENGTH(FIELDS.VOLUME_UNIT, 20)],
        },
        packSize: {
            type: String,
            trim: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.PACK_SIZE)],
            minlength: [2, MESSAGES.MIN_LENGTH(FIELDS.PACK_SIZE, 2)],
            maxlength: [20, MESSAGES.MAX_LENGTH(FIELDS.PACK_SIZE, 20)],
        },
        materialCode: {
            type: String,
            trim: true,
            // unique: true,
            // sparse: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.MATERIAL_CODE)],
            match: [REGEX.MATERIAL_CODE, MESSAGES.PATTERN_MISMATCH(FIELDS.MATERIAL_CODE)],
        },
        mrp: {
            type: Number,
            trim: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.MRP)],
            min: [0, MESSAGES.MIN_LENGTH(FIELDS.MRP, 0)],
            default: 0,
        },
        rate: {
            type: Number,
            trim: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.RATE)],
            min: [0, MESSAGES.MIN_LENGTH(FIELDS.RATE, 0)],
            default: 0,
        },
        stock: {
            type: Number,
            trim: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.STOCK)],
            min: [0, MESSAGES.MIN_LENGTH(FIELDS.STOCK, 0)],
            default: 0,
        },
        hsnCode: {
            type: String,
            trim: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.HSN_CODE)],
            match: [REGEX.HSN_CODE, MESSAGES.PATTERN_MISMATCH(FIELDS.HSN_CODE)],
            default: "21050000",
        },
    },
    {
        timestamps: true,
    }
);

export const Product = mongoose.model("Product", ProductSchema);
