import mongoose, { Schema } from "mongoose";

import {
    FIELDS,
    MESSAGES
} from "../../utils/index.js";

const addressIndianStateSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.ADDRESS_INDIAN_STATE)],
            unique: true,
        },
        code: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.ADDRESS_INDIAN_STATE_CODE)],
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
        collection: "address_indianstates",
    }
);

export const AddressIndianState = mongoose.model(
    "AddressIndianState",
    addressIndianStateSchema,
    "address_indianstates"
);