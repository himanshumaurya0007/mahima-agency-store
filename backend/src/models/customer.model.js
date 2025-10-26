import mongoose, { Schema } from "mongoose";
import { StatusCodes } from "http-status-codes";

import {
    FIELDS,
    REGEX,
    MESSAGES,
    ENUMS,
    ApiError
} from "../utils/index.js";

const customerSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, MESSAGES.REQUIRED(FIELDS.USER_ID)],
            index: true,
        },
        customerStatus: {
            type: String,
            trim: true,
            uppercase: true,
            enum: {
                values: ENUMS.CUSTOMER_STATUS,
                message: `Invalid ${FIELDS.CUSTOMER_STATUS}`,
            },
            required: [true, MESSAGES.REQUIRED(FIELDS.CUSTOMER_STATUS)],
            default: "TEMPORARY",
        },
        temporaryCustomerId: {
            type: String,
            trim: true,
            validate: {
                validator: (value) => !value || REGEX.TEMPORARY_CUSTOMER_ID.test(value),
                message: MESSAGES.TEMPORARY_CUSTOMER_ID_INVALID,
            },
            sparse: true,
            unique: true,
        },
        havmorPlatformCustomerId: {
            type: String,
            trim: true,
            validate: [
                {
                    validator: (value) => !value || REGEX.HAVMOR_PLATFORM_CUSTOMER_ID.test(value),
                    message: MESSAGES.CUSTOMER_ID_INVALID,
                },
            ],
            sparse: true,
            unique: true,
        },
        shopName: {
            type: String,
            required: [true, MESSAGES.REQUIRED(FIELDS.SHOP_NAME)],
            minlength: [2, MESSAGES.MIN_LENGTH(FIELDS.SHOP_NAME, 2)],
            maxlength: [100, MESSAGES.MAX_LENGTH(FIELDS.SHOP_NAME, 100)],
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
                    message: MESSAGES.MIN_LENGTH(FIELDS.FIRST_NAME, 2),
                },
                {
                    validator: (value) => !value || value.length <= 50,
                    message: MESSAGES.MAX_LENGTH(FIELDS.FIRST_NAME, 50),
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
                    message: MESSAGES.MIN_LENGTH(FIELDS.LAST_NAME, 2),
                },
                {
                    validator: (value) => !value || value.length <= 50,
                    message: MESSAGES.MAX_LENGTH(FIELDS.LAST_NAME, 50),
                },
            ],
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            validate: [
                {
                    validator: (value) => !value || REGEX.EMAIL.test(value),
                    message: MESSAGES.EMAIL_INVALID,
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
            required: [true, MESSAGES.REQUIRED(FIELDS.PHONE)],
            trim: true,
            set: (value) => {
                // Normalize value to 10 digits
                const digits = value?.startsWith("+91") ? value.slice(3) : value;

                // Validate using regex
                if (!REGEX.PHONE.test(digits)) {
                    // Instead of plain Error, throw ApiError
                    throw new ApiError(
                        StatusCodes.BAD_REQUEST,
                        MESSAGES.PHONE_INVALID
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
                    validator: (value) => !value || REGEX.PAN_CARD.test(value),
                    message: MESSAGES.PAN_CARD_INVALID,
                },
            ],
        },
        gstinNumber: {
            type: String,
            trim: true,
            uppercase: true,
            validate: [
                {
                    validator: (value) => !value || REGEX.GSTIN_NUMBER.test(value),
                    message: MESSAGES.GSTIN_NUMBER_INVALID,
                },
            ],
        },
        customerAddress: {
            type: Schema.Types.ObjectId,
            ref: "Address",
            required: [true, MESSAGES.REQUIRED(FIELDS.CUSTOMER_ADDRESS)],
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
