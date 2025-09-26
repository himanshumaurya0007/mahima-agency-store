import mongoose, { Schema } from "mongoose";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

import { fields } from "../utils/fields.js";
import { temporaryCustomerIdRegex, havmorPlatformCustomerIdRegex, emailRegex, phoneRegex, panCardRegex, gstinNumberRegex, } from "../utils/regex.js";
import { errorMessages } from "../utils/errorMessages.js";
import { CUSTOMER_STATUS } from "../constants.js";
import { ApiError } from "../utils/ApiError.js";

const customerSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, errorMessages.REQUIRED(fields.userId)],
            index: true,
        },
        customerStatus: {
            type: String,
            trim: true,
            uppercase: true,
            enum: {
                values: CUSTOMER_STATUS,
                message: `Invalid ${fields.customerStatus}`,
            },
            required: [true, errorMessages.REQUIRED(fields.customerStatus)],
            default: "TEMPORARY",
        },
        temporaryCustomerId: {
            type: String,
            trim: true,
            validate: {
                validator: (value) => !value || temporaryCustomerIdRegex.test(value),
                message: errorMessages.TEMPORARY_CUSTOMER_ID_INVALID,
            },
            sparse: true,
            unique: true,
        },
        havmorPlatformCustomerId: {
            type: String,
            trim: true,
            validate: [
                {
                    validator: (value) => !value || havmorPlatformCustomerIdRegex.test(value),
                    message: errorMessages.CUSTOMER_ID_INVALID,
                },
            ],
            sparse: true,
            unique: true,
        },
        shopName: {
            type: String,
            required: [true, errorMessages.REQUIRED(fields.shopName)],
            minlength: [2, errorMessages.MIN_LENGTH(fields.shopName, 2)],
            maxlength: [100, errorMessages.MAX_LENGTH(fields.shopName, 100)],
            trim: true,
            lowercase: true,
        },
        firstName: {
            type: String,
            trim: true,
            lowercase: true,
            validate: [
                {
                    validator: (value) => !value || value.length >= 2,
                    message: errorMessages.MIN_LENGTH(fields.firstName, 2),
                },
                {
                    validator: (value) => !value || value.length <= 50,
                    message: errorMessages.MAX_LENGTH(fields.firstName, 50),
                },
            ],
        },
        lastName: {
            type: String,
            trim: true,
            lowercase: true,
            validate: [
                {
                    validator: (value) => !value || value.length >= 2,
                    message: errorMessages.MIN_LENGTH(fields.lastName, 2),
                },
                {
                    validator: (value) => !value || value.length <= 50,
                    message: errorMessages.MAX_LENGTH(fields.lastName, 50),
                },
            ],
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            validate: [
                {
                    validator: (value) => !value || emailRegex.test(value),
                    message: errorMessages.EMAIL_INVALID,
                },
            ],
        },
        /**
         * PHONE: Schema-level normalization + validation
         * - Stores with +91 prefix in DB
         * - Returns 10 digits in JSON/Object outputs
         */
        phone: {
            type: String,
            required: [true, errorMessages.REQUIRED(fields.phone)],
            trim: true,
            set: (value) => {
                // Normalize value to 10 digits
                const digits = value?.startsWith("+91") ? value.slice(3) : value;

                // Validate using regex
                if (!phoneRegex.test(digits)) {
                    // Instead of plain Error, throw ApiError
                    throw new ApiError(
                        StatusCodes.BAD_REQUEST,
                        errorMessages.PHONE_INVALID
                    );
                }

                return `+91${digits}`;
            },
            get: (value) => (value?.startsWith("+91") ? value.slice(3) : value),
        },
        panCardNumber: {
            type: String,
            trim: true,
            uppercase: true,
            validate: [
                {
                    validator: (value) => !value || panCardRegex.test(value),
                    message: errorMessages.PAN_CARD_INVALID,
                },
            ],
        },
        gstinNumber: {
            type: String,
            trim: true,
            uppercase: true,
            validate: [
                {
                    validator: (value) => !value || gstinNumberRegex.test(value),
                    message: errorMessages.GSTIN_NUMBER_INVALID,
                },
            ],
        },
        customerAddress: {
            type: Schema.Types.ObjectId,
            ref: "Address",
            required: [true, errorMessages.REQUIRED(fields.customerAddress)],
        },
    },
    {
        timestamps: true,
    }
);

// Enable getters when converting to JSON or plain objects
customerSchema.set("toJSON", { getters: true });
customerSchema.set("toObject", { getters: true });

// Indexes
customerSchema.index({ userId: 1, temporaryCustomerId: 1 });
customerSchema.index({ userId: 1, havmorPlatformCustomerId: 1 });

// Middleware
customerSchema.pre("save", async function (next) {
    try {
        // Handle temporary customers – generate unique temporaryCustomerId only if missing or modified
        if (
            this.customerStatus === "TEMPORARY" &&
            (!this.temporaryCustomerId || this.isModified("temporaryCustomerId"))
        ) {
            let newCode;
            let exists = true;

            do {
                // Generate an 8-digit random number
                newCode = Math.floor(10000000 + Math.random() * 90000000).toString();

                // Check against other customers
                const clash = await mongoose.models.Customer.findOne({
                    $or: [
                        { temporaryCustomerId: newCode },
                        { havmorPlatformCustomerId: newCode },
                    ],
                });

                // Also ensure it’s not equal to this doc’s own havmorPlatformCustomerId
                if (
                    this.havmorPlatformCustomerId === newCode ||
                    this.temporaryCustomerId === newCode
                ) {
                    exists = true;
                } else {
                    exists = !!clash;
                }
            } while (exists);

            // Assign the unique code
            this.temporaryCustomerId = newCode;
        }

        next();
    } catch (err) {
        next(err);
    }
});

export const Customer = mongoose.model("Customer", customerSchema);
