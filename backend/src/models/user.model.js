import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import {
    ENUMS,
    FIELDS,
    REGEX,
    MESSAGES
} from "../utils/index.js";

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: [true, MESSAGES.REQUIRED(FIELDS.FIRST_NAME)],
            minlength: [2, MESSAGES.MIN_LENGTH(FIELDS.FIRST_NAME, 2)],
            maxlength: [50, MESSAGES.MAX_LENGTH(FIELDS.FIRST_NAME, 50)],
            trim: true,
            lowercase: true,
        },
        lastName: {
            type: String,
            required: [true, MESSAGES.REQUIRED(FIELDS.LAST_NAME)],
            minlength: [2, MESSAGES.MIN_LENGTH(FIELDS.LAST_NAME, 2)],
            maxlength: [50, MESSAGES.MAX_LENGTH(FIELDS.LAST_NAME, 50)],
            trim: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: [true, MESSAGES.REQUIRED(FIELDS.EMAIL)],
            trim: true,
            lowercase: true,
            unique: true,
            match: [REGEX.EMAIL, MESSAGES.EMAIL_INVALID],
        },
        phone: {
            type: String,
            required: [true, MESSAGES.REQUIRED(FIELDS.PHONE)],
            trim: true,
            match: [REGEX.PHONE, MESSAGES.PHONE_INVALID],
        },
        username: {
            type: String,
            required: [true, MESSAGES.REQUIRED(FIELDS.USERNAME)],
            minlength: [3, MESSAGES.MIN_LENGTH(FIELDS.USERNAME, 3)],
            maxlength: [30, MESSAGES.MAX_LENGTH(FIELDS.USERNAME, 30)],
            trim: true,
            lowercase: true,
            unique: true,
            match: [REGEX.USERNAME, MESSAGES.USERNAME_INVALID],
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
            required: [true, MESSAGES.REQUIRED(FIELDS.ADDRESS_INDIAN_STATE)],
            trim: true,
            uppercase: true,
        },
        stateCode: {
            type: String,
            required: [true, MESSAGES.REQUIRED(FIELDS.ADDRESS_INDIAN_STATE_CODE)],
            trim: true,
            uppercase: true,
            match: [REGEX.STATE_CODE, MESSAGES.STATE_CODE_INVALID],
        },
        pinCode: {
            type: String,
            required: [true, MESSAGES.REQUIRED(FIELDS.PIN_CODE)],
            trim: true,
            match: [REGEX.PIN_CODE, MESSAGES.PINCODE_INVALID],
        },
        securityQuestion: {
            type: String,
            required: [true, MESSAGES.REQUIRED(FIELDS.SECURITY_QUESTION)],
            enum: {
                values: ENUMS.SECURITY_QUESTIONS,
                message: MESSAGES.ENUM_BASE(FIELDS.SECURITY_QUESTION, ENUMS.SECURITY_QUESTIONS),
            },
        },
        securityAnswer: {
            type: String,
            required: [true, MESSAGES.REQUIRED(FIELDS.SECURITY_ANSWER)],
            minlength: [3, MESSAGES.MIN_LENGTH(FIELDS.SECURITY_ANSWER, 3)],
            maxlength: [50, MESSAGES.MAX_LENGTH(FIELDS.SECURITY_ANSWER, 50)],
            trim: true,
        },
        password: {
            type: String,
            required: [true, MESSAGES.REQUIRED(FIELDS.PASSWORD)],
            minlength: [8, MESSAGES.MIN_LENGTH(FIELDS.PASSWORD, 8)],
            maxlength: [100, MESSAGES.MAX_LENGTH(FIELDS.PASSWORD, 100)],
            trim: true,
            match: [REGEX.PASSWORD, MESSAGES.PASSWORD_INVALID],
        },
        refreshToken: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    try {
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

        // Normalize Indian phone → always +91XXXXXXXXXX
        if (this.isModified("phone")) {
            if (!this.phone.startsWith("+91")) {
                this.phone = `+91${this.phone}`;
            }
        }

        // Hash password when updated
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, saltRounds);
        }

        // Hash security answer when updated
        if (this.isModified("securityAnswer")) {
            this.securityAnswer = await bcrypt.hash(this.securityAnswer, saltRounds);
        }

        next();
    } catch (err) {
        next(err);
    }
});

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.compareSecurityAnswer = async function (answer) {
    return bcrypt.compare(answer, this.securityAnswer);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m"
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"
        }
    );
};

export const User = mongoose.model("User", userSchema);