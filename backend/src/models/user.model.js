import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { emailRegex, phoneRegex, usernameRegex, passwordRegex } from "../utils/regex.js";

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            lowercase: true,
            trim: true,
            minlength: [2, "First name must be at least 2 characters"],
            maxlength: [50, "First name must not exceed 50 characters"],
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            lowercase: true,
            trim: true,
            minlength: [2, "Last name must be at least 2 characters"],
            maxlength: [50, "Last name must not exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            validate: {
                validator: (v) => emailRegex.test(v),
                message: (props) => `${props.value} is not a valid email address!`,
            },
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            validate: {
                validator: (v) => phoneRegex.test(v),
                message: (props) => `${props.value} is not a valid phone number!`,
            },
        },
        username: {
            type: String,
            required: [true, "Username is required"],
            lowercase: true,
            trim: true,
            unique: true,
            minlength: [3, "Username must be at least 3 characters"],
            maxlength: [30, "Username must not exceed 30 characters"],
            validate: {
                validator: (v) => usernameRegex.test(v),
                message: (props) => `${props.value} is not a valid username!`,
            },
        },
        securityQuestion: {
            type: String,
            enum: [
                "What is your mother's maiden name?",
                "What was the name of your first pet?",
                "What is your favorite book?",
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
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            maxlength: [100, "Password must not exceed 100 characters"],
            validate: {
                validator: (v) => passwordRegex.test(v),
                message:
                    "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
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