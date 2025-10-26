import mongoose, { Schema } from "mongoose";

import {
    FIELDS,
    REGEX,
    MESSAGES
} from "../utils/index.js";
import { INDIAN_STATE_NAMES, INDIAN_STATE_CODES } from "../utils/constants/enums.js";

const addressSchema = new Schema(
    {
        place: {
            type: String,
            required: [true, MESSAGES.REQUIRED(FIELDS.PLACE)],
            minlength: [3, MESSAGES.MIN_LENGTH(FIELDS.PLACE, 3)],
            maxlength: [50, MESSAGES.MAX_LENGTH(FIELDS.PLACE, 50)],
            trim: true,
            lowercase: true,
        },
        city: {
            type: String,
            required: [true, MESSAGES.REQUIRED(FIELDS.CITY)],
            minlength: [2, MESSAGES.MIN_LENGTH(FIELDS.CITY, 2)],
            maxlength: [50, MESSAGES.MAX_LENGTH(FIELDS.CITY, 50)],
            trim: true,
            lowercase: true,
        },
        state: {
            type: String,
            trim: true,
            uppercase: true,
            enum: {
                values: INDIAN_STATE_NAMES,
                message: `Invalid ${FIELDS.INDIAN_STATE}`,
            },
            required: [true, MESSAGES.REQUIRED(FIELDS.INDIAN_STATE)],
        },
        stateCode: {
            type: String,
            trim: true,
            uppercase: true,
            enum: {
                values: INDIAN_STATE_CODES,
                message: `Invalid ${FIELDS.INDIAN_STATE_CODE}`,
            },
            required: [true, MESSAGES.REQUIRED(FIELDS.INDIAN_STATE_CODE)],
        },
        pinCode: {
            type: String,
            required: [true, MESSAGES.REQUIRED(FIELDS.PIN_CODE)],
            trim: true,
            validate: {
                validator: (v) => REGEX.PIN_CODE.test(v),
                message: MESSAGES.PINCODE_INVALID,
            },
        },
    },
    {
        timestamps: true
    }
);

export const Address = mongoose.model("Address", addressSchema);