import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { emailRegex, phoneRegex, usernameRegex, passwordRegex } from "../utils/regex.js";
import { errorMessages } from "../utils/errorMessages.js";

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: [true, errorMessages.REQUIRED("First name")],
            minlength: [2, errorMessages.MIN_LENGTH("First name", 2)],
            maxlength: [50, errorMessages.MAX_LENGTH("First name", 50)],
            trim: true,
            lowercase: true,
        },
        lastName: {
            type: String,
            required: [true, errorMessages.REQUIRED("Last name")],
            minlength: [2, errorMessages.MIN_LENGTH("Last name", 2)],
            maxlength: [50, errorMessages.MAX_LENGTH("Last name", 50)],
            trim: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: [true, errorMessages.REQUIRED("Email")],
            trim: true,
            lowercase: true,
            validate: {
                validator: (v) => emailRegex.test(v),
                message: errorMessages.EMAIL_INVALID,
            },
        },
        phone: {
            type: String,
            required: [true, errorMessages.REQUIRED("Phone number")],
            trim: true,
            validate: {
                validator: (v) => phoneRegex.test(v),
                message: errorMessages.PHONE_INVALID,
            },
        },
        username: {
            type: String,
            required: [true, errorMessages.REQUIRED("Username")],
            minlength: [3, errorMessages.MIN_LENGTH("Username", 3)],
            maxlength: [30, errorMessages.MAX_LENGTH("Username", 30)],
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
            enum: [
                "What was the name of your first pet?",
                "What city were you born in?",
                "What was the name of your first school?",
                "What is the name of your favorite childhood teacher?",
                "What is the title of your favorite book or movie?",
            ],
            required: [true, "Security question is required"],
        },
        securityAnswer: {
            type: String,
            required: [true, "Security answer is required"],
            minlength: [3, "Security answer must be at least 3 characters"],
            maxlength: [50, "Security answer must not exceed 50 characters"],
        },
        password: {
            type: String,
            required: [true, errorMessages.REQUIRED("Password")],
            minlength: [8, errorMessages.MIN_LENGTH("Password", 8)],
            maxlength: [100, errorMessages.MAX_LENGTH("Password", 100)],
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