import mongoose, { Schema } from "mongoose";
import { StatusCodes } from "http-status-codes";

import {
    FIELDS,
    REGEX,
    MESSAGES,
    ENUMS,
    ApiError,
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
                message: MESSAGES.CUSTOMER_STATUS_INVALID,
            },
            required: [true, MESSAGES.REQUIRED(FIELDS.CUSTOMER_STATUS)],
            default: "TEMPORARY",
        },
        temporaryCustomerId: {
            type: String,
            trim: true,
            sparse: true,
            unique: true,
            validate: {
                validator: function (value) {
                    if (!value || value === "") return true;
                    return REGEX.TEMPORARY_CUSTOMER_ID.test(value);
                },
                message: MESSAGES.TEMPORARY_CUSTOMER_ID_INVALID
            }
        },
        havmorPlatformCustomerId: {
            type: String,
            trim: true,
            sparse: true,
            unique: true,
            validate: {
                validator: function (value) {
                    if (!value || value === "") return true;
                    return REGEX.HAVMOR_PLATFORM_CUSTOMER_ID.test(value);
                },
                message: MESSAGES.HAVMOR_PLATFORM_CUSTOMER_ID_INVALID
            }
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
                    validator: (value) => !value || value === "" || value.length >= 2,
                    message: MESSAGES.MIN_LENGTH(FIELDS.FIRST_NAME, 2),
                },
                {
                    validator: (value) => !value || value === "" || value.length <= 50,
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
                    validator: (value) => !value || value === "" || value.length >= 2,
                    message: MESSAGES.MIN_LENGTH(FIELDS.LAST_NAME, 2),
                },
                {
                    validator: (value) => !value || value === "" || value.length <= 50,
                    message: MESSAGES.MAX_LENGTH(FIELDS.LAST_NAME, 50),
                },
            ],
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            validate: {
                validator: function (value) {
                    if (!value || value === "") return true;
                    return REGEX.EMAIL.test(value);
                },
                message: MESSAGES.EMAIL_INVALID
            }
        },
        phone: {
            type: String,
            required: [true, MESSAGES.REQUIRED(FIELDS.PHONE)],
            trim: true,
            set: (value) => {
                const digits = value?.startsWith("+91") ? value.slice(3) : value;

                if (!REGEX.PHONE.test(digits)) {
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
            validate: {
                validator: function (value) {
                    if (!value || value === "") return true;
                    return REGEX.PAN_CARD.test(value);
                },
                message: MESSAGES.PAN_CARD_INVALID,
            }
        },
        gstinNumber: {
            type: String,
            trim: true,
            uppercase: true,
            validate: {
                validator: function (value) {
                    if (!value || value === "") return true;
                    return REGEX.GSTIN_NUMBER.test(value);
                },
                message: MESSAGES.GSTIN_NUMBER_INVALID,
            }
        },
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
            match: [REGEX.CITY, MESSAGES.CITY_INVALID],
        },
        state: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.ADDRESS_INDIAN_STATE)],
        },
        stateCode: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, MESSAGES.REQUIRED(FIELDS.ADDRESS_INDIAN_STATE_CODE)],
            match: [REGEX.STATE_CODE, MESSAGES.STATE_CODE_INVALID],
        },
        pinCode: {
            type: String,
            required: [true, MESSAGES.REQUIRED(FIELDS.PIN_CODE)],
            trim: true,
            match: [REGEX.PIN_CODE, MESSAGES.PINCODE_INVALID],
        },
    },
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

// Indexes
customerSchema.index({ userId: 1, temporaryCustomerId: 1 });
customerSchema.index({ userId: 1, havmorPlatformCustomerId: 1 });

// Pre-Save Middleware
customerSchema.pre("save", async function (next) {
    try {
        // Auto-generate temporaryCustomerId only for TEMPORARY customers
        if (
            this.customerStatus === "TEMPORARY" &&
            (!this.temporaryCustomerId || this.isModified("temporaryCustomerId"))
        ) {
            let newId;
            let exists = true;

            while (exists) {
                newId = Math.floor(10000000 + Math.random() * 90000000).toString();

                const duplicate = await mongoose.models.Customer.findOne({
                    $or: [
                        { temporaryCustomerId: newId },
                        { havmorPlatformCustomerId: newId },
                    ],
                });

                exists = !!duplicate || this.havmorPlatformCustomerId === newId;
            }

            this.temporaryCustomerId = newId;
        }

        next();
    } catch (err) {
        next(err);
    }
});

export const Customer = mongoose.model("Customer", customerSchema);
