import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { fields } from "../utils/fields.js";
import { emailRegex, phoneRegex, usernameRegex, passwordRegex } from "../utils/regex.js";
import { errorMessages } from "../utils/errorMessages.js";
import { SECURITY_QUESTIONS } from "../constants.js";

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: [true, errorMessages.REQUIRED(fields.firstName)],
            minlength: [2, errorMessages.MIN_LENGTH(fields.firstName, 2)],
            maxlength: [50, errorMessages.MAX_LENGTH(fields.firstName, 50)],
            trim: true,
            lowercase: true,
        },
        lastName: {
            type: String,
            required: [true, errorMessages.REQUIRED(fields.lastName)],
            minlength: [2, errorMessages.MIN_LENGTH(fields.lastName, 2)],
            maxlength: [50, errorMessages.MAX_LENGTH(fields.lastName, 50)],
            trim: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: [true, errorMessages.REQUIRED(fields.email)],
            trim: true,
            lowercase: true,
            validate: {
                validator: (v) => emailRegex.test(v),
                message: errorMessages.EMAIL_INVALID,
            },
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
        username: {
            type: String,
            required: [true, errorMessages.REQUIRED(fields.username)],
            minlength: [3, errorMessages.MIN_LENGTH(fields.username, 3)],
            maxlength: [30, errorMessages.MAX_LENGTH(fields.username, 30)],
            trim: true,
            lowercase: true,
            unique: true,
            validate: {
                validator: (v) => usernameRegex.test(v),
                message: errorMessages.USERNAME_INVALID,
            },
        },
        securityQuestion: {
            type: String,
            enum: {
                values: SECURITY_QUESTIONS,
            },
            required: [true, errorMessages.REQUIRED(fields.securityQuestion)],
        },
        securityAnswer: {
            type: String,
            required: [true, errorMessages.REQUIRED(fields.securityAnswer)],
            minlength: [3, errorMessages.MIN_LENGTH(fields.securityAnswer, 3)],
            maxlength: [50, errorMessages.MAX_LENGTH(fields.securityAnswer, 50)],
        },
        password: {
            type: String,
            required: [true, errorMessages.REQUIRED(fields.password)],
            minlength: [8, errorMessages.MIN_LENGTH(fields.password, 8)],
            maxlength: [100, errorMessages.MAX_LENGTH(fields.password, 100)],
            validate: {
                validator: (v) => passwordRegex.test(v),
                message: errorMessages.PASSWORD_INVALID,
            },
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    try {
        // Hash password if modified
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(
                this.password,
                Number(process.env.BCRYPT_SALT_ROUNDS)
            );
        }

        // Hash security answer if modified
        if (this.isModified("securityAnswer")) {
            this.securityAnswer = await bcrypt.hash(
                this.securityAnswer,
                Number(process.env.BCRYPT_SALT_ROUNDS)
            );
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
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
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
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
        }
    )
}

export const User = mongoose.model("User", userSchema);