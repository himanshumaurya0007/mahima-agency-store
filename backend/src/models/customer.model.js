import mongoose, { Schema } from "mongoose";

import { fields } from "../utils/fields.js";
import { havmorPlatformCustomerIdRegex, emailRegex, phoneRegex, panCardRegex, gstinNumberRegex } from "../utils/regex.js";
import { errorMessages } from "../utils/errorMessages.js";

const customerSchema = new Schema(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User',
            required: [true, errorMessages.REQUIRED(fields.userId)],
            index: true,
        },
        havmorPlatformCustomerId: {
            type: String,
            required: [true, errorMessages.REQUIRED(fields.havmorPlatformCustomerId)],
            trim: true,
            validate: {
                validator: (v) => havmorPlatformCustomerIdRegex.test(v),
                message: errorMessages.CUSTOMER_ID_INVALID,
            },
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
                    validator: function (value) {
                        // Skip validation if empty (null or undefined)
                        if (!value) return true;
                        return value.length >= 2;
                    },
                    message: errorMessages.MIN_LENGTH(fields.firstName, 2),
                },
                {
                    validator: function (value) {
                        if (!value) return true;
                        return value.length <= 50;
                    },
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
                    validator: function (value) {
                        // Skip validation if empty (null or undefined)
                        if (!value) return true;
                        return value.length >= 2;
                    },
                    message: errorMessages.MIN_LENGTH(fields.lastName, 2),
                },
                {
                    validator: function (value) {
                        if (!value) return true;
                        return value.length <= 50;
                    },
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
                    validator: function (value) {
                        // Skip validation if email is empty (null/undefined)
                        if (!value) return true;
                        return emailRegex.test(value);
                    },
                    message: errorMessages.EMAIL_INVALID,
                },
            ],
        },
        phone: {
            type: String,
            required: [true, errorMessages.REQUIRED(fields.phone)],
            trim: true,
            validate: {
                validator: (v) => phoneRegex.test(v),
                message: errorMessages.PHONE_INVALID,
            },
        },
        panCardNumber: {
            type: String,
            trim: true,
            uppercase: true,
            validate: [
                {
                    validator: function (value) {
                        // Skip validation if pan card is empty (null/undefined)
                        if (!value) return true;
                        return panCardRegex.test(value);
                    },
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
                    validator: function (value) {
                        // Skip validation if GSTIN number is empty (null/undefined)
                        if (!value) return true;
                        return gstinNumberRegex.test(value);
                    },
                    message: errorMessages.GSTIN_NUMBER_INVALID,
                },
            ],
        },
        customerAddress: {
            type: Schema.Types.ObjectId,
            ref: 'Address',
            required: [true, errorMessages.REQUIRED(fields.customerAddress)],
        },
    },
    {
        timestamps: true
    }
);

customerSchema.index(
    { userId: 1, havmorPlatformCustomerId: 1 },
    { unique: true }
);

customerSchema.index(
    { userId: 1, phone: 1 },
    { unique: true }
);

customerSchema.pre("save", async function (next) {
    try {
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

        // Normalize phone → always store as +91XXXXXXXXXX
        if (this.isModified("phone")) {
            if (!this.phone.startsWith("+91")) {
                this.phone = `+91${this.phone}`;
            }
        }

        next();
    } catch (err) {
        next(err); // pass error to mongoose
    }
});

export const Customer = mongoose.model("Customer", customerSchema);