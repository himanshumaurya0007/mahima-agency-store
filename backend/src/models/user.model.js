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
            validate: {
                validator: (v) => REGEX.EMAIL.test(v),
                message: MESSAGES.EMAIL_INVALID,
            },
        },
        phone: {
            type: String,
            required: [true, MESSAGES.REQUIRED(FIELDS.PHONE)],
            trim: true,
            validate: {
                validator: (v) => REGEX.PHONE.test(v),
                message: MESSAGES.PHONE_INVALID,
            },
        },
        username: {
            type: String,
            required: [true, MESSAGES.REQUIRED(FIELDS.USERNAME)],
            minlength: [3, MESSAGES.MIN_LENGTH(FIELDS.USERNAME, 3)],
            maxlength: [30, MESSAGES.MAX_LENGTH(FIELDS.USERNAME, 30)],
            trim: true,
            lowercase: true,
            unique: true,
            validate: {
                validator: (v) => REGEX.USERNAME.test(v),
                message: MESSAGES.USERNAME_INVALID,
            },
        },
        securityQuestion: {
            type: String,
            enum: {
                values: ENUMS.SECURITY_QUESTIONS,
                message: `Invalid ${FIELDS.SECURITY_QUESTION}`,
            },
            required: [true, MESSAGES.REQUIRED(FIELDS.SECURITY_QUESTION)],
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
            validate: {
                validator: (v) => REGEX.PASSWORD.test(v),
                message: MESSAGES.PASSWORD_INVALID,
            },
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {
    try {
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

        // Normalize phone → always store as +91XXXXXXXXXX
        if (this.isModified("phone")) {
            if (!this.phone.startsWith("+91")) {
                this.phone = `+91${this.phone}`;
            }
        }

        // Hash password if modified
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, saltRounds);
        }

        // Hash security answer if modified
        if (this.isModified("securityAnswer")) {
            this.securityAnswer = await bcrypt.hash(this.securityAnswer, saltRounds);
        }

        next();
    } catch (err) {
        next(err); // pass error to mongoose
    }
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.compareSecurityAnswer = async function (answer) {
    return await bcrypt.compare(answer, this.securityAnswer);
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
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"
        }
    )
}

export const User = mongoose.model("User", userSchema);