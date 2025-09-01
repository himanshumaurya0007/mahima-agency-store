import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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
                validator: (v) =>
                    /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v),
                message: (props) => `${props.value} is not a valid email address!`,
            },
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            validate: {
                validator: (v) => /^\+?[1-9]\d{1,14}$/.test(v),
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
                validator: (v) => /^[a-zA-Z0-9_]+$/.test(v),
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
            select: false, // Never return in queries
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            maxlength: [100, "Password must not exceed 100 characters"],
            select: false, // Never return in queries
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
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, process.env.BCRYPT_SALT_ROUNDS);
    next();
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

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