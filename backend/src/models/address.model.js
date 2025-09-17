import mongoose, { Schema } from "mongoose";

import { fields } from "../utils/fields.js";
import { pinCodeRegex } from "../utils/regex.js";
import { errorMessages } from "../utils/errorMessages.js";
import { INDIAN_STATE_NAMES, INDIAN_STATE_CODES } from "../constants.js";

const addressSchema = new Schema(
    {
        place: {
            type: String,
            required: [true, errorMessages.REQUIRED(fields.place)],
            minlength: [3, errorMessages.MIN_LENGTH(fields.place, 3)],
            maxlength: [50, errorMessages.MAX_LENGTH(fields.place, 50)],
            trim: true,
            lowercase: true,
        },
        city: {
            type: String,
            required: [true, errorMessages.REQUIRED(fields.city)],
            minlength: [2, errorMessages.MIN_LENGTH(fields.city, 2)],
            maxlength: [50, errorMessages.MAX_LENGTH(fields.city, 50)],
            trim: true,
            lowercase: true,
        },
        state: {
            type: String,
            trim: true,
            uppercase: true,
            enum: {
                values: INDIAN_STATE_NAMES,
                message: `Invalid ${fields.indianState}`,
            },
            required: [true, errorMessages.REQUIRED(fields.indianState)],
        },
        stateCode: {
            type: String,
            trim: true,
            uppercase: true,
            enum: {
                values: INDIAN_STATE_CODES,
                message: `Invalid ${fields.indianStateCode}`,
            },
            required: [true, errorMessages.REQUIRED(fields.indianStateCode)],
        },
        pinCode: {
            type: String,
            required: [true, errorMessages.REQUIRED(fields.pincode)],
            trim: true,
            validate: {
                validator: (v) => pinCodeRegex.test(v),
                message: errorMessages.PINCODE_INVALID,
            },
        },
    },
    {
        timestamps: true // automatically adds createdAt & updatedAt
    }
);

export const Address = mongoose.model("Address", addressSchema);